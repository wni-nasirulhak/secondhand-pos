#!/usr/bin/env python3
"""
TikTok Live Comment Scraper - WORKING VERSION
ใช้ temporary context + load cookies (ไม่มีปัญหา lock!)
"""

import json
import time
import logging
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Set
from playwright.sync_api import sync_playwright, Page, BrowserContext

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
CONFIG_FILE = PROJECT_ROOT / "config" / "scraper_config.json"
DATA_DIR = PROJECT_ROOT / "data" / "comments"
LOG_DIR = PROJECT_ROOT / "logs"

# Create directories
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)


class TikTokLiveScraper:
    """TikTok Live Comment Scraper - Working Version (No Lock Issues)"""
    
    def __init__(self, config_path: Path = CONFIG_FILE):
        self.config = self._load_config(config_path)
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
    
    def _extract_comments(self, page: Page) -> List[Dict]:
        """ดึงคอมเมนต์ - ใช้ JavaScript ที่ verified แล้ว"""
        new_comments = []
        
        js_script = """
        () => {
            const comments = [];
            const commentContainers = document.querySelectorAll('.css-dkahau');
            
            commentContainers.forEach(container => {
                try {
                    const usernameEl = container.querySelector('.text-UIText3.font-600');
                    const username = usernameEl?.textContent?.trim() || 'Unknown';
                    
                    const allDivs = Array.from(container.querySelectorAll('div'));
                    const textDivs = allDivs.filter(div => {
                        const text = div.textContent?.trim();
                        return text && 
                               text.length > 0 && 
                               text !== username && 
                               !div.querySelector('img') && 
                               div.children.length === 0;
                    });
                    
                    const commentText = textDivs[0]?.textContent?.trim() || '';
                    
                    if (commentText && username !== 'Unknown') {
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
    
    def run(self, duration_seconds: int = 120, headless: bool = False) -> None:
        """เริ่ม scraping"""
        
        url = self.config['tiktok']['url']
        interval = self.config['tiktok']['scrape_interval_seconds']
        
        print("=" * 70)
        print("🔴 TikTok Live Comment Scraper - WORKING VERSION")
        print(f"📺 URL: {url}")
        print(f"⏱️  Duration: {duration_seconds}s | Interval: {interval}s")
        print(f"👁️  Mode: {'Headless' if headless else 'Visible'}")
        print("=" * 70)
        print()
        
        self._load_existing_comments()
        
        with sync_playwright() as p:
            browser = None
            
            try:
                print("🌐 Launching Chrome (temporary context, no lock!)...")
                
                # เปิด Chrome แบบธรรมดา (ไม่ใช้ persistent context)
                browser = p.chromium.launch(
                    headless=headless,
                    args=[
                        '--disable-blink-features=AutomationControlled',
                        '--no-sandbox',
                        '--disable-dev-shm-usage',
                    ]
                )
                
                # สร้าง context ธรรมดา (ไม่ lock profile)
                context = browser.new_context(
                    viewport={'width': 1280, 'height': 720},
                    user_agent=self.config['tiktok']['user_agent']
                )
                
                page = context.new_page()
                
                print(f"🔗 Navigating to {url}...")
                page.goto(url, wait_until='domcontentloaded', timeout=60000)
                
                # รอให้คอมเมนต์โหลด
                print("⏳ Waiting for page to fully load (8 seconds)...")
                page.wait_for_timeout(8000)
                
                print("✅ Page loaded! Starting scraper...")
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
    parser = argparse.ArgumentParser(description='TikTok Live Scraper - Working Version')
    parser.add_argument('--duration', type=int, default=120,
                        help='Duration in seconds (default: 120)')
    parser.add_argument('--headless', action='store_true',
                        help='Run in headless mode')
    parser.add_argument('--visible', action='store_true',
                        help='Run with visible browser (default)')
    
    args = parser.parse_args()
    
    headless = args.headless
    if args.visible:
        headless = False
    
    try:
        scraper = TikTokLiveScraper()
        scraper.run(duration_seconds=args.duration, headless=headless)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        raise


if __name__ == "__main__":
    main()
