#!/usr/bin/env python3
"""
TikTok LIVE Comment Scraper using Playwright
Saves comments to daily JSON files and sends webhooks
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Set
import requests
from playwright.sync_api import sync_playwright, Page

# Load configuration
CONFIG_PATH = Path(__file__).parent.parent / "config" / "scraper_config.json"
with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
    CONFIG = json.load(f)

# Global state
seen_comments: Set[str] = set()
session_stats = {
    "start_time": None,
    "total_new": 0,
    "total_duplicates": 0,
    "rounds": 0
}


def get_today_file() -> Path:
    """Get the JSON file path for today's comments"""
    data_dir = Path(__file__).parent.parent / CONFIG['storage']['data_dir']
    data_dir.mkdir(parents=True, exist_ok=True)
    
    filename = datetime.now().strftime(CONFIG['storage']['filename_pattern'])
    return data_dir / filename


def load_existing_comments() -> List[Dict]:
    """Load existing comments from today's file"""
    filepath = get_today_file()
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def save_comments(comments: List[Dict]):
    """Save comments to today's JSON file"""
    filepath = get_today_file()
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(comments, f, ensure_ascii=False, indent=2)
    print(f"💾 Saved to: {filepath.name}")


def send_webhook(comment_data: Dict):
    """Send webhook notification for new comment"""
    if not CONFIG['webhook']['enabled']:
        return
    
    webhook_url = CONFIG['webhook']['url']
    if webhook_url == "YOUR_WEBHOOK_URL_HERE":
        return  # Skip if not configured
    
    try:
        payload = {
            "username": comment_data['username'],
            "comment": comment_data['comment'],
            "timestamp": comment_data['timestamp']
        }
        response = requests.post(webhook_url, json=payload, timeout=5)
        if response.status_code == 200:
            print(f"  📡 Webhook sent ✓")
        else:
            print(f"  ⚠️  Webhook failed: {response.status_code}")
    except Exception as e:
        print(f"  ⚠️  Webhook error: {e}")


def extract_comments(page: Page) -> List[Dict]:
    """Extract comments from the current page state"""
    selectors = CONFIG['selectors']
    
    # JavaScript to extract comments
    js_code = f"""
    () => {{
        const comments = [];
        const containerSelectors = {json.dumps(selectors['comment_container'])};
        const usernameSelectors = {json.dumps(selectors['username'])};
        const textSelectors = {json.dumps(selectors['text'])};
        
        function findElements(selectors) {{
            for (const selector of selectors) {{
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) return Array.from(elements);
            }}
            return [];
        }}
        
        function getText(parent, selectors) {{
            for (const selector of selectors) {{
                const el = parent.querySelector(selector);
                if (el && el.textContent.trim()) return el.textContent.trim();
            }}
            return '';
        }}
        
        const commentElements = findElements(containerSelectors);
        
        commentElements.forEach((element) => {{
            try {{
                const username = getText(element, usernameSelectors) || 'Unknown';
                const commentText = getText(element, textSelectors);
                
                if (commentText) {{
                    comments.push({{ username, comment: commentText }});
                }}
            }} catch (e) {{}}
        }});
        
        return comments;
    }}
    """
    
    try:
        result = page.evaluate(js_code)
        return result or []
    except Exception as e:
        print(f"  ⚠️  Error extracting comments: {e}")
        return []


def process_comments(raw_comments: List[Dict], all_comments: List[Dict]) -> int:
    """Process new comments, filter duplicates, save and send webhooks"""
    new_count = 0
    
    for raw in raw_comments:
        # Create unique key
        key = f"{raw['username']}:{raw['comment']}"
        
        if key not in seen_comments:
            seen_comments.add(key)
            
            comment_data = {
                "timestamp": datetime.now().isoformat(),
                "username": raw['username'],
                "comment": raw['comment']
            }
            
            all_comments.append(comment_data)
            new_count += 1
            
            # Print new comment
            print(f"  💬 [{comment_data['username']}] {comment_data['comment']}")
            
            # Send webhook
            if CONFIG['webhook']['send_on_new_comment']:
                send_webhook(comment_data)
    
    return new_count


def print_stats():
    """Print session statistics"""
    elapsed = time.time() - session_stats['start_time']
    print(f"\n{'='*60}")
    print(f"📊 Session Stats:")
    print(f"   ⏱️  Runtime: {int(elapsed)}s")
    print(f"   🆕 New comments: {session_stats['total_new']}")
    print(f"   🔄 Rounds: {session_stats['rounds']}")
    print(f"   📁 File: {get_today_file().name}")
    print(f"{'='*60}\n")


def main():
    """Main scraper loop"""
    print("🎭 TikTok LIVE Comment Scraper (Playwright)")
    print(f"🔗 URL: {CONFIG['tiktok']['url']}")
    print(f"⏱️  Interval: {CONFIG['tiktok']['scrape_interval_seconds']}s")
    print(f"📡 Webhook: {'✓ Enabled' if CONFIG['webhook']['enabled'] else '✗ Disabled'}")
    print()
    
    # Load existing comments
    all_comments = load_existing_comments()
    for comment in all_comments:
        key = f"{comment['username']}:{comment['comment']}"
        seen_comments.add(key)
    print(f"📂 Loaded {len(all_comments)} existing comments from today\n")
    
    session_stats['start_time'] = time.time()
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=CONFIG['tiktok']['headless'])
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        print("🌐 Opening TikTok LIVE...")
        page.goto(CONFIG['tiktok']['url'], wait_until='domcontentloaded')
        
        # Wait for page to load
        print("⏳ Waiting for comments to load...")
        time.sleep(5)
        
        print("🔴 Scraping started! (Press Ctrl+C to stop)\n")
        
        try:
            while True:
                session_stats['rounds'] += 1
                elapsed = int(time.time() - session_stats['start_time'])
                
                print(f"[Round {session_stats['rounds']} | {elapsed}s] Fetching comments...")
                
                # Extract comments
                raw_comments = extract_comments(page)
                
                # Process new comments
                new_count = process_comments(raw_comments, all_comments)
                
                if new_count > 0:
                    session_stats['total_new'] += new_count
                    print(f"  ✅ {new_count} new | Total: {len(all_comments)}")
                    
                    # Save to file
                    save_comments(all_comments)
                else:
                    session_stats['total_duplicates'] += len(raw_comments)
                    print(f"  ⏭️  No new comments")
                
                # Wait before next round
                time.sleep(CONFIG['tiktok']['scrape_interval_seconds'])
                
        except KeyboardInterrupt:
            print("\n\n⏹️  Stopping scraper...")
            save_comments(all_comments)
            print_stats()
        finally:
            browser.close()
            print("👋 Browser closed. Goodbye!")


if __name__ == "__main__":
    main()
