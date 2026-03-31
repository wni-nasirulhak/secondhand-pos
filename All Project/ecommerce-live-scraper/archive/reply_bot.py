#!/usr/bin/env python3
"""
TikTok Live Reply Bot
ใช้ Playwright ตอบคอมเมนต์ใน TikTok Live อัตโนมัติ
"""

import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional
from playwright.sync_api import sync_playwright, Page, Browser

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)


class TikTokReplyBot:
    """TikTok Live Reply Bot - ตอบคอมเมนต์อัตโนมัติ"""
    
    def __init__(self, live_url: str):
        self.live_url = live_url
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
    
    def start(self, headless: bool = False) -> None:
        """เริ่มต้น browser และเปิดหน้า Live"""
        
        logger.info("🌐 Starting browser...")
        
        playwright = sync_playwright().start()
        
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
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        self.page = context.new_page()
        
        logger.info(f"🔗 Navigating to: {self.live_url}")
        self.page.goto(self.live_url, wait_until='domcontentloaded', timeout=60000)
        
        logger.info("⏳ Waiting for page to load...")
        self.page.wait_for_timeout(5000)
        
        logger.info("✅ Browser ready!")
    
    def find_comment_input(self) -> Optional[any]:
        """หา input box สำหรับพิมพ์คอมเมนต์"""
        
        # Selectors ที่เป็นไปได้ (TikTok ใช้ contenteditable div)
        selectors = [
            'div[contenteditable="plaintext-only"]',  # TikTok Live primary
            'div[placeholder*="พิมพ์"]',
            'div[contenteditable="true"]',
            'input[placeholder*="พิมพ์"]',
            'input[placeholder*="Comment"]',
            'textarea[placeholder*="พิมพ์"]',
            '[data-e2e="comment-input"]',
        ]
        
        for selector in selectors:
            try:
                input_box = self.page.query_selector(selector)
                if input_box and input_box.is_visible():
                    logger.info(f"✅ Found input box: {selector}")
                    return input_box
            except:
                continue
        
        logger.warning("⚠️  Comment input box not found!")
        return None
    
    def send_comment(self, message: str, delay_ms: int = 100) -> bool:
        """ส่งคอมเมนต์ใน Live"""
        
        try:
            # หา input box
            input_box = self.find_comment_input()
            
            if not input_box:
                logger.error("❌ Cannot find comment input box")
                return False
            
            # คลิกที่ input box
            logger.info("🖱️  Clicking input box...")
            input_box.click()
            self.page.wait_for_timeout(500)
            
            # พิมพ์ข้อความ (ช้าๆ เหมือนคน)
            logger.info(f"⌨️  Typing: {message}")
            input_box.type(message, delay=delay_ms)
            self.page.wait_for_timeout(500)
            
            # กด Enter ส่ง
            logger.info("📤 Sending...")
            input_box.press('Enter')
            self.page.wait_for_timeout(1000)
            
            logger.info(f"✅ Comment sent: {message}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send comment: {e}")
            return False
    
    def send_multiple_comments(self, comments: list, interval_seconds: int = 3) -> None:
        """ส่งคอมเมนต์หลายข้อความ"""
        
        for i, comment in enumerate(comments, 1):
            logger.info(f"\n[{i}/{len(comments)}] Sending comment...")
            
            success = self.send_comment(comment)
            
            if success:
                logger.info(f"✅ Success! Waiting {interval_seconds}s before next...")
            else:
                logger.warning(f"⚠️  Failed! Continuing anyway...")
            
            if i < len(comments):
                time.sleep(interval_seconds)
    
    def stop(self) -> None:
        """ปิด browser"""
        if self.browser:
            logger.info("🛑 Closing browser...")
            self.browser.close()
            logger.info("✅ Browser closed")


def test_reply_bot(live_url: str, visible: bool = True):
    """ทดสอบ Reply Bot"""
    
    print("=" * 70)
    print("🤖 TikTok Live Reply Bot - TEST MODE")
    print("=" * 70)
    print(f"📺 Live URL: {live_url}")
    print(f"👁️  Visible: {visible}")
    print("=" * 70)
    print()
    
    # Test messages
    test_messages = [
        "สวัสดีครับทุกคน! 💝",
        "ขอบคุณที่มาดู Live นะครับ 🙏",
        "มีคำถามถามได้เลยครับ 😊",
    ]
    
    bot = TikTokReplyBot(live_url)
    
    try:
        # เริ่ม browser
        bot.start(headless=not visible)
        
        print("⏸️  Browser is ready!")
        print("⚠️  Make sure you are logged in to TikTok!")
        print()
        input("Press ENTER when ready to send comments... ")
        print()
        
        # ส่งคอมเมนต์ทดสอบ
        bot.send_multiple_comments(test_messages, interval_seconds=3)
        
        print()
        print("=" * 70)
        print("✅ Test completed!")
        print("=" * 70)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        logger.error(f"Fatal error: {e}", exc_info=True)
    finally:
        bot.stop()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='TikTok Live Reply Bot')
    parser.add_argument('--url', type=str, 
                        default='https://www.tiktok.com/@kanunspicy/live',
                        help='TikTok Live URL')
    parser.add_argument('--headless', action='store_true',
                        help='Run in headless mode')
    parser.add_argument('--visible', action='store_true',
                        help='Run in visible mode (default)')
    
    args = parser.parse_args()
    
    visible = not args.headless
    if args.visible:
        visible = True
    
    test_reply_bot(args.url, visible=visible)
