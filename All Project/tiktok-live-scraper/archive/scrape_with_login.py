#!/usr/bin/env python3
"""
TikTok Live Comment Scraper - WITH AUTO LOGIN
Auto login to TikTok before scraping + CAPTCHA handling
"""

import json
import time
import logging
import argparse
import os
import requests
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Set, Optional
from playwright.sync_api import sync_playwright, Page, BrowserContext

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
CONFIG_FILE = PROJECT_ROOT / "config" / "scraper_config.json"
DATA_DIR = PROJECT_ROOT / "data" / "comments"
LOG_DIR = PROJECT_ROOT / "logs"
ENV_FILE = PROJECT_ROOT / ".env"

# Create directories
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)


def load_env(env_file: Path) -> dict:
    """โหลด .env file"""
    env = {}
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env[key.strip()] = value.strip()
    return env


class TikTokLiveScraper:
    """TikTok Live Comment Scraper with Auto Login + CAPTCHA Handling"""
    
    def __init__(self, config_path: Path = CONFIG_FILE):
        self.config = self._load_config(config_path)
        self.env = load_env(ENV_FILE)
        self.seen_comments: Set[str] = set()
        self.comments: List[Dict] = []
        self.logger = self._setup_logger()
        
    def _load_config(self, config_path: Path) -> dict:
        if not config_path.exists():
            raise FileNotFoundError(f"Config not found: {config_path}")
        
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _setup_logger(self) -> logging.Logger:
        log_level = getattr(logging, self.config['logging']['level'])
        log_file = LOG_DIR / f"scraper_{datetime.now().strftime('%Y-%m-%d')}.log"
        
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s [%(levelname)s] %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        return logging.getLogger(__name__)
    
    def _get_data_file(self) -> Path:
        pattern = self.config['storage']['filename_pattern']
        filename = datetime.now().strftime(pattern)
        return DATA_DIR / filename
    
    def _load_existing_comments(self) -> None:
        data_file = self._get_data_file()
        if data_file.exists():
            try:
                with open(data_file, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        existing = json.loads(content)
                        self.comments = existing
                        for comment in existing:
                            key = f"{comment['username']}:{comment['comment']}"
                            self.seen_comments.add(key)
                        self.logger.info(f"✅ Loaded {len(existing)} existing comments")
            except json.JSONDecodeError:
                self.logger.warning("Empty or invalid JSON file, starting fresh")
            except Exception as e:
                self.logger.warning(f"Could not load existing: {e}")
    
    def _save_comments(self) -> None:
        data_file = self._get_data_file()
        try:
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(self.comments, f, ensure_ascii=False, indent=2)
        except Exception as e:
            self.logger.error(f"Save failed: {e}")
    
    def _send_to_webhook(self, comment_data: Dict) -> Optional[str]:
        """ส่งคอมเมนต์ไปยัง Webhook และรับคำตอบกลับ"""
        
        webhook_url = self.config.get('webhook', {}).get('url', 'http://localhost:3000/webhook')
        webhook_enabled = self.config.get('webhook', {}).get('enabled', False)
        
        if not webhook_enabled:
            return None
        
        try:
            response = requests.post(
                webhook_url,
                json=comment_data,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                reply = result.get('reply', '')
                self.logger.info(f"💬 Webhook reply: {reply}")
                return reply
            else:
                self.logger.warning(f"⚠️  Webhook returned {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            self.logger.warning("⚠️  Webhook timeout")
            return None
        except Exception as e:
            self.logger.error(f"❌ Webhook error: {e}")
            return None
    
    def _wait_for_captcha(self, page: Page, max_wait_seconds: int = 120) -> bool:
        """รอจนกว่า CAPTCHA หายไป"""
        
        captcha_selectors = [
            'iframe[src*="captcha"]',
            '[class*="captcha"]',
            '[id*="captcha"]',
            'div:has-text("Verify")',
            'div:has-text("verification")',
            '[class*="verify"]'
        ]
        
        # เช็คว่ามี CAPTCHA หรือเปล่า
        has_captcha = False
        for selector in captcha_selectors:
            try:
                captcha = page.query_selector(selector)
                if captcha and captcha.is_visible():
                    has_captcha = True
                    break
            except:
                continue
        
        if not has_captcha:
            return True  # ไม่มี CAPTCHA
        
        print(f"   🤖 CAPTCHA detected!")
        print(f"   ⏳ Please solve the CAPTCHA (max {max_wait_seconds}s)...")
        
        # รอจนกว่า CAPTCHA หายไป
        for i in range(max_wait_seconds):
            page.wait_for_timeout(1000)  # รอ 1 วินาที
            
            # เช็คว่า CAPTCHA หายหรือยัง
            captcha_still_visible = False
            for selector in captcha_selectors:
                try:
                    captcha = page.query_selector(selector)
                    if captcha and captcha.is_visible():
                        captcha_still_visible = True
                        break
                except:
                    continue
            
            if not captcha_still_visible:
                # รออีก 2 วินาทีเผื่อหน้าโหลดเสร็จ
                page.wait_for_timeout(2000)
                print(f"   ✅ CAPTCHA completed! (took {i+1}s)")
                return True
        
        print(f"   ⚠️  CAPTCHA timeout after {max_wait_seconds}s")
        return False
    
    def _login_tiktok(self, page: Page) -> bool:
        """Auto login to TikTok (ช้าๆ เหมือนคนจริง)"""
        
        username = self.env.get('TIKTOK_USERNAME')
        password = self.env.get('TIKTOK_PASSWORD')
        
        if not username or not password:
            print("⚠️  No credentials found in .env file")
            print("   Skipping auto login (you may need to login manually)")
            return False
        
        try:
            print("🔑 Auto login enabled...")
            print(f"   Username: {username[:3]}***")
            
            # รอให้หน้าโหลด (นานขึ้น)
            print("   ⏳ Waiting for page to load...")
            page.wait_for_timeout(3000)
            
            # 1. คลิก "Log in" button
            login_selectors = [
                'button:has-text("Log in")',
                'a:has-text("Log in")',
                '[data-e2e="top-login-button"]',
                'button[class*="login"]'
            ]
            
            login_clicked = False
            for selector in login_selectors:
                try:
                    login_btn = page.query_selector(selector)
                    if login_btn and login_btn.is_visible():
                        print("   [1/6] Clicking 'Log in' button...")
                        login_btn.click()
                        login_clicked = True
                        page.wait_for_timeout(3000)  # เพิ่มจาก 2000 เป็น 3000ms
                        break
                except:
                    continue
            
            if not login_clicked:
                print("   ⚠️  Login button not found (already logged in?)")
                return True
            
            # 2. คลิก "Use phone / email / username"
            print("   [2/6] Clicking 'Use phone / email / username'...")
            page.wait_for_timeout(2000)  # delay ก่อนคลิก
            
            phone_email_selectors = [
                'div:has-text("Use phone / email / username")',
                'div:has-text("Use phone or email")',
                'div:has-text("Continue with email")',
                '[class*="login-email"]'
            ]
            
            clicked_phone = False
            for selector in phone_email_selectors:
                try:
                    btn = page.query_selector(selector)
                    if btn and btn.is_visible():
                        btn.click()
                        clicked_phone = True
                        page.wait_for_timeout(3000)
                        break
                except:
                    continue
            
            if not clicked_phone:
                print("   ⚠️  'Use phone/email' not found")
                return False
            
            # 3. คลิก "Use email or username"
            print("   [3/6] Clicking 'Use email or username'...")
            page.wait_for_timeout(2000)
            
            email_username_selectors = [
                'a:has-text("Use email or username")',
                'div:has-text("Use email or username")',
                'a:has-text("Log in with email or username")'
            ]
            
            clicked_email = False
            for selector in email_username_selectors:
                try:
                    btn = page.query_selector(selector)
                    if btn and btn.is_visible():
                        btn.click()
                        clicked_email = True
                        page.wait_for_timeout(3000)
                        break
                except:
                    continue
            
            if not clicked_email:
                print("   ℹ️  Already on email/username form (skipping)")
            
            # 4. กรอก username/email (ช้าๆ)
            print("   [4/6] Filling username/email...")
            page.wait_for_timeout(1500)
            
            username_input = page.query_selector('input[name="username"]') or \
                           page.query_selector('input[placeholder*="email"]') or \
                           page.query_selector('input[placeholder*="Email"]') or \
                           page.query_selector('input[type="text"]')
            
            if username_input and username_input.is_visible():
                username_input.click()
                page.wait_for_timeout(500)
                username_input.fill(username)
                page.wait_for_timeout(1000)
            else:
                print("   ❌ Username input not found")
                return False
            
            # 5. กรอก password (ช้าๆ)
            print("   [5/6] Filling password...")
            page.wait_for_timeout(1500)
            
            password_input = page.query_selector('input[type="password"]') or \
                           page.query_selector('input[placeholder*="assword"]')
            
            if password_input and password_input.is_visible():
                password_input.click()
                page.wait_for_timeout(500)
                password_input.fill(password)
                page.wait_for_timeout(1000)
            else:
                print("   ❌ Password input not found")
                return False
            
            # 6. กดปุ่ม Log in
            print("   [6/6] Clicking 'Log in' button...")
            page.wait_for_timeout(2000)
            
            submit_btn = page.query_selector('button[type="submit"]') or \
                        page.query_selector('button:has-text("Log in")')
            
            if submit_btn and submit_btn.is_visible():
                submit_btn.click()
                print("   ⏳ Waiting for login to complete...")
                page.wait_for_timeout(5000)
                
                # เช็คและรอ CAPTCHA (ถ้ามี)
                captcha_ok = self._wait_for_captcha(page, max_wait_seconds=120)
                
                if not captcha_ok:
                    print("   ⚠️  CAPTCHA timeout")
                    return False
                
                # เช็คว่า login สำเร็จไหม
                current_url = page.url
                if 'login' not in current_url.lower():
                    print("   ✅ Login successful!")
                    return True
                else:
                    print("   ⚠️  Still on login page")
                    return False
            else:
                print("   ❌ Submit button not found")
                return False
                
        except Exception as e:
            print(f"   ❌ Login error: {e}")
            self.logger.error(f"Login failed: {e}", exc_info=True)
            return False
    
    def _extract_comments(self, page: Page) -> List[Dict]:
        """ดึงคอมเมนต์"""
        new_comments = []
        
        js_script = """
        () => {
            const comments = [];
            const commentContainers = document.querySelectorAll('.css-dkahau');
            
            commentContainers.forEach(container => {
                try {
                    const usernameEl = container.querySelector('.text-UIText3.font-600');
                    const username = usernameEl?.innerText?.trim() || '';
                    
                    const commentEl = container.querySelector('.w-full.break-words.align-middle.cursor-pointer');
                    const commentText = commentEl?.innerText?.trim() || '';
                    
                    if (username && commentText) {
                        comments.push({ username, comment: commentText });
                    }
                } catch (e) {}
            });
            
            return comments;
        }
        """
        
        try:
            extracted = page.evaluate(js_script)
            
            for item in extracted:
                key = f"{item['username']}:{item['comment']}"
                if key not in self.seen_comments:
                    self.seen_comments.add(key)
                    
                    comment_data = {
                        "timestamp": datetime.now().isoformat(),
                        "username": item['username'],
                        "comment": item['comment']
                    }
                    
                    self.comments.append(comment_data)
                    new_comments.append(comment_data)
            
            return new_comments
            
        except Exception as e:
            self.logger.error(f"Extract error: {e}")
            return []
    
    def run(self, duration_seconds: int = 120, headless: bool = False, auto_login: bool = True) -> None:
        """เริ่ม scraping"""
        
        url = self.config['tiktok']['url']
        interval = self.config['tiktok']['scrape_interval_seconds']
        
        print("=" * 70)
        print("🔴 TikTok Live Comment Scraper - WITH AUTO LOGIN")
        print(f"📺 URL: {url}")
        print(f"⏱️  Duration: {duration_seconds}s | Interval: {interval}s")
        print(f"🔑 Auto Login: {'Enabled' if auto_login else 'Disabled'}")
        print("=" * 70)
        print()
        
        self._load_existing_comments()
        
        with sync_playwright() as p:
            browser = None
            
            try:
                print("🌐 Launching Chrome...")
                
                browser = p.chromium.launch(
                    headless=headless,
                    args=[
                        '--disable-blink-features=AutomationControlled',
                        '--no-sandbox',
                        '--disable-dev-shm-usage',
                    ]
                )
                
                context = browser.new_context(
                    viewport={'width': 1280, 'height': 720},
                    user_agent=self.config['tiktok']['user_agent']
                )
                
                page = context.new_page()
                
                # ไปที่ TikTok.com ก่อน (สำหรับ login)
                if auto_login:
                    print(f"🔗 Navigating to TikTok.com...")
                    page.goto("https://www.tiktok.com", timeout=60000)
                    
                    # พยายาม login
                    login_success = self._login_tiktok(page)
                    
                    if login_success:
                        print("✅ Login complete! Ready to scrape!")
                    else:
                        print("⚠️  Login may have failed - continuing anyway...")
                        print("   (You can login manually if needed)")
                    
                    print()
                
                # ไปที่ Live URL
                print(f"🔗 Navigating to Live: {url}...")
                page.goto(url, wait_until='domcontentloaded', timeout=60000)
                
                # รอให้หน้าโหลด
                print("⏳ Waiting for page to load...")
                page.wait_for_timeout(5000)
                
                # เช็คและรอ CAPTCHA (สำคัญ! ตรงนี้แหละที่แก้)
                print("🔍 Checking for CAPTCHA on Live page...")
                captcha_ok = self._wait_for_captcha(page, max_wait_seconds=120)
                
                if not captcha_ok:
                    print("⚠️  CAPTCHA timeout - continuing anyway...")
                
                # รอเพิ่มอีกนิดให้คอมเมนต์โหลด
                print("⏳ Waiting for comments to load (5 seconds)...")
                page.wait_for_timeout(5000)
                
                print("✅ Page ready! Starting scraper...")
                print()
                
                start_time = time.time()
                round_num = 0
                
                while (time.time() - start_time) < duration_seconds:
                    round_num += 1
                    elapsed = int(time.time() - start_time)
                    
                    print(f"[Round {round_num:2d} | {elapsed:3d}s] Scraping...", end=' ')
                    
                    new_comments = self._extract_comments(page)
                    
                    if new_comments:
                        print(f"✅ {len(new_comments)} new (total: {len(self.comments)})")
                        for comment in new_comments:
                            username = comment['username']
                            text = comment['comment']
                            display_text = text[:60] + '...' if len(text) > 60 else text
                            print(f"     👤 {username}: {display_text}")
                            
                            # ส่งไปยัง Webhook
                            reply = self._send_to_webhook(comment)
                            if reply:
                                print(f"     💬 Reply: {reply}")
                    else:
                        print(f"⏭️  No new comments")
                    
                    self._save_comments()
                    time.sleep(interval)
                
                print()
                print("=" * 70)
                print("✅ Scraping completed!")
                print(f"📊 Total unique comments: {len(self.comments)}")
                print(f"💾 Saved to: {self._get_data_file()}")
                print("=" * 70)
                
            except Exception as e:
                print()
                print(f"❌ Error: {e}")
                self.logger.error(f"Fatal error: {e}", exc_info=True)
            finally:
                if browser:
                    browser.close()


def main():
    parser = argparse.ArgumentParser(description='TikTok Live Scraper with Auto Login')
    parser.add_argument('--duration', type=int, default=120)
    parser.add_argument('--headless', action='store_true')
    parser.add_argument('--visible', action='store_true')
    parser.add_argument('--no-login', action='store_true',
                        help='Disable auto login')
    
    args = parser.parse_args()
    
    headless = args.headless
    if args.visible:
        headless = False
    
    auto_login = not args.no_login
    
    try:
        scraper = TikTokLiveScraper()
        scraper.run(duration_seconds=args.duration, headless=headless, auto_login=auto_login)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        raise


if __name__ == "__main__":
    main()
