#!/usr/bin/env python3
"""
TikTok Live Auto Reply System - FULL INTEGRATION
Scraper + Webhook + Reply Bot ทำงานร่วมกัน
"""

import json
import time
import logging
import argparse
import requests
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Set, Optional
from playwright.sync_api import sync_playwright, Page, Browser
from comment_filter import CommentFilter, load_filter_config

# Paths
PROJECT_ROOT = Path(__file__).parent
CONFIG_FILE = PROJECT_ROOT / "config" / "scraper_config.json"
DATA_DIR = PROJECT_ROOT / "data" / "comments"
LOG_DIR = PROJECT_ROOT / "logs"

# Create directories
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)


class TikTokAutoReplySystem:
    """TikTok Live Auto Reply System - ครบวงจร"""
    
    def __init__(self, config_path: Path = CONFIG_FILE):
        self.config = self._load_config(config_path)
        self.seen_comments: Set[str] = set()
        self.comments: List[Dict] = []
        self.logger = self._setup_logger()
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        
        # Load comment filter
        try:
            filter_config = load_filter_config("filter_config.json")
            self.comment_filter = CommentFilter(filter_config.get("comment_filter"))
            self.logger.info("✅ Comment Filter loaded")
        except Exception as e:
            self.logger.warning(f"⚠️  Using default filter config: {e}")
            self.comment_filter = CommentFilter()
    
    def _load_config(self, config_path: Path) -> dict:
        if not config_path.exists():
            raise FileNotFoundError(f"Config not found: {config_path}")
        
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _setup_logger(self) -> logging.Logger:
        log_level = getattr(logging, self.config['logging']['level'])
        log_file = LOG_DIR / f"auto_reply_{datetime.now().strftime('%Y-%m-%d')}.log"
        
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
    
    def _find_comment_input(self) -> Optional[any]:
        """หา input box สำหรับพิมพ์คอมเมนต์"""
        
        selectors = [
            'div[contenteditable="plaintext-only"]',
            'div[placeholder*="พิมพ์"]',
            'div[contenteditable="true"]',
        ]
        
        for selector in selectors:
            try:
                input_box = self.page.query_selector(selector)
                if input_box and input_box.is_visible():
                    return input_box
            except:
                continue
        
        return None
    
    def _send_reply(self, message: str) -> bool:
        """ส่งคำตอบกลับใน Live"""
        
        try:
            input_box = self._find_comment_input()
            
            if not input_box:
                self.logger.error("❌ Cannot find comment input box")
                return False
            
            # ใช้ JavaScript force click และ focus
            self.page.evaluate("""(selector) => {
                const el = document.querySelector(selector);
                if (el) {
                    el.click();
                    el.focus();
                }
            }""", 'div[contenteditable="plaintext-only"]')
            
            self.page.wait_for_timeout(300)
            
            # พิมพ์ข้อความ (ใช้ fill แทน type เพื่อความเร็ว)
            input_box.fill(message)
            self.page.wait_for_timeout(300)
            
            # กด Enter ส่ง
            input_box.press('Enter')
            self.page.wait_for_timeout(500)
            
            self.logger.info(f"✅ Sent reply: {message}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to send reply: {e}")
            return False
    
    def _extract_comments(self) -> List[Dict]:
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
            extracted = self.page.evaluate(js_script)
            
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
    
    def run(self, duration_seconds: int = 300, headless: bool = False) -> None:
        """เริ่มระบบ Auto Reply"""
        
        url = self.config['tiktok']['url']
        interval = self.config['tiktok']['scrape_interval_seconds']
        
        print("=" * 70)
        print("🤖 TikTok Live Auto Reply System - FULL INTEGRATION")
        print("=" * 70)
        print(f"📺 Live URL: {url}")
        print(f"⏱️  Duration: {duration_seconds}s | Interval: {interval}s")
        print(f"🔗 Webhook: {self.config.get('webhook', {}).get('url', 'N/A')}")
        print("=" * 70)
        print()
        
        self._load_existing_comments()
        
        playwright = sync_playwright().start()
        
        try:
            self.logger.info("🌐 Launching browser...")
            
            self.browser = playwright.chromium.launch(
                headless=headless,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                ]
            )
            
            context = self.browser.new_context(
                viewport={'width': 1280, 'height': 720},
                user_agent=self.config['tiktok']['user_agent']
            )
            
            self.page = context.new_page()
            
            # ไปที่ Live URL
            self.logger.info(f"🔗 Navigating to: {url}")
            self.page.goto(url, wait_until='domcontentloaded', timeout=60000)
            
            self.logger.info("⏳ Waiting for page to load...")
            self.page.wait_for_timeout(5000)
            
            print()
            print("⚠️  IMPORTANT: Make sure you are logged in!")
            print("   If not logged in, please login now in the browser.")
            print()
            input("Press ENTER when ready to start auto-reply... ")
            print()
            
            self.logger.info("✅ Starting Auto Reply System...")
            print()
            
            start_time = time.time()
            round_num = 0
            
            while (time.time() - start_time) < duration_seconds:
                round_num += 1
                elapsed = int(time.time() - start_time)
                
                # Reset filter สำหรับรอบใหม่
                self.comment_filter.reset_round()
                
                print(f"[Round {round_num:2d} | {elapsed:3d}s] Scraping...", end=' ')
                
                new_comments = self._extract_comments()
                
                if new_comments:
                    print(f"✅ {len(new_comments)} new")
                    
                    replied_count = 0
                    skipped_count = 0
                    
                    for comment in new_comments:
                        username = comment['username']
                        text = comment['comment']
                        display_text = text[:50] + '...' if len(text) > 50 else text
                        
                        print(f"     👤 {username}: {display_text}")
                        
                        # 🔍 Filter: ควรตอบไหม?
                        should_reply, reason = self.comment_filter.should_reply(username, text)
                        
                        if not should_reply:
                            print(f"     ⏭️  SKIP: {reason}")
                            skipped_count += 1
                            continue
                        
                        # ส่งไปยัง Webhook
                        reply = self._send_to_webhook(comment)
                        
                        if reply:
                            print(f"     💬 Reply: {reply}")
                            
                            # ส่งคำตอบกลับใน Live
                            success = self._send_reply(reply)
                            
                            if success:
                                print(f"     ✅ Sent to Live!")
                                
                                # บันทึกว่าตอบแล้ว
                                self.comment_filter.mark_replied(username, text)
                                replied_count += 1
                            else:
                                print(f"     ⚠️  Failed to send to Live")
                            
                            # รอหน่อยก่อนตอบคนถัดไป
                            time.sleep(2)
                    
                    # แสดงสถิติ
                    if skipped_count > 0:
                        print(f"     📊 Replied: {replied_count} | Skipped: {skipped_count}")
                else:
                    print(f"⏭️  No new comments")
                
                self._save_comments()
                time.sleep(interval)
            
            print()
            print("=" * 70)
            print("✅ Auto Reply System completed!")
            print(f"📊 Total comments processed: {len(self.comments)}")
            print(f"💾 Saved to: {self._get_data_file()}")
            print("=" * 70)
            
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user")
        except Exception as e:
            print()
            print(f"❌ Error: {e}")
            self.logger.error(f"Fatal error: {e}", exc_info=True)
        finally:
            if self.browser:
                self.browser.close()
            playwright.stop()


def main():
    parser = argparse.ArgumentParser(description='TikTok Live Auto Reply System')
    parser.add_argument('--duration', type=int, default=300,
                        help='Duration in seconds (default: 300)')
    parser.add_argument('--headless', action='store_true',
                        help='Run in headless mode')
    parser.add_argument('--visible', action='store_true',
                        help='Run in visible mode (default)')
    
    args = parser.parse_args()
    
    headless = args.headless
    if args.visible:
        headless = False
    
    try:
        system = TikTokAutoReplySystem()
        system.run(duration_seconds=args.duration, headless=headless)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        raise


if __name__ == "__main__":
    main()
