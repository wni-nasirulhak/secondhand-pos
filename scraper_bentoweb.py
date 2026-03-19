# -*- coding: utf-8 -*-
"""
BentoWeb Customer Scraper
วิธีใช้:
1. เปิด Chrome > BentoWeb (login แล้ว)
2. กด F12 (Developer Tools)
3. ไปที่ Network tab
4. Refresh หน้า
5. คลิกขวาที่ request > Copy > Copy as cURL (bash)
6. วาง cURL command ตรงนี้แล้วดาจะแปลงเป็น Python

หรือให้ C copy cookies มาวางตรงนี้:
COOKIES = {
    'PHPSESSID': 'xxxxxxxx',
    '_ga': 'xxxxxxxx',
    ...
}
"""

import requests
import json
import time
import pandas as pd
from datetime import datetime
from pathlib import Path

# === CONFIG ===
COOKIES = {}  # ให้ C วาง cookies ตรงนี้
STORES = [
    {
        'name': 'Winona Feminine (official)',
        'url': 'https://winonafeminine.bentoweb.com/th/admin/customer'
    },
    {
        'name': 'Winona Probio',
        'url': 'https://winonaprobio.bentoweb.com/th/admin/customer'
    },
    {
        'name': 'Winona International',
        'url': 'https://winonainternational.bentoweb.com/th/admin/customer'
    }
]
PAGE_SIZE = 100  # จำนวนรายการต่อหน้า
DELAY_SECONDS = 3  # รอระหว่างหน้า
STATE_FILE = 'scraper_state.json'
OUTPUT_FILE = 'customers_all_stores.xlsx'

# === STATE MANAGEMENT ===
def load_state():
    """โหลด state ว่าดึงไปหน้าไหนแล้ว"""
    if Path(STATE_FILE).exists():
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_state(state):
    """บันทึก state"""
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def load_existing_data():
    """โหลดข้อมูลที่เก็บไว้แล้ว"""
    if Path(OUTPUT_FILE).exists():
        return pd.read_excel(OUTPUT_FILE)
    return pd.DataFrame()

# === SCRAPER ===
def scrape_page(store_url, page_num, cookies):
    """ดึงข้อมูล 1 หน้า"""
    
    # Note: ต้องดู network request จริงๆ ว่า BentoWeb ใช้ API แบบไหน
    # ตอนนี้เป็นตัวอย่างเท่านั้น
    
    params = {
        'length': PAGE_SIZE,
        'start': (page_num - 1) * PAGE_SIZE
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
    }
    
    try:
        response = requests.get(
            store_url,
            params=params,
            cookies=cookies,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            # Parse HTML หรือ JSON ขึ้นอยู่กับ response
            return response.json() if 'application/json' in response.headers.get('Content-Type', '') else response.text
        else:
            print(f"Error: HTTP {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Request failed: {e}")
        return None

def main():
    print("BentoWeb Customer Scraper")
    print("=" * 50)
    
    if not COOKIES:
        print("\nERROR: Please add cookies first!")
        print("\nSteps:")
        print("1. Open Chrome DevTools (F12)")
        print("2. Go to Application > Storage > Cookies")
        print("3. Copy all cookies from bentoweb.com")
        print("4. Paste into COOKIES dict in this script")
        return
    
    state = load_state()
    all_data = []
    
    for store in STORES:
        store_name = store['name']
        store_url = store['url']
        
        # Skip excluded store
        if 'Beacon' in store_name:
            print(f"\nSkipping: {store_name}")
            continue
        
        print(f"\nScraping: {store_name}")
        print(f"URL: {store_url}")
        
        # Check last page scraped
        last_page = state.get(store_name, 0)
        print(f"Resuming from page {last_page + 1}")
        
        # Scrape 2 pages for testing (200 records)
        for page in range(last_page + 1, last_page + 3):
            print(f"\n  Page {page}...")
            
            data = scrape_page(store_url, page, COOKIES)
            
            if data:
                # TODO: Parse data and add to all_data
                print(f"  + Got data (need to parse)")
                
                # Update state
                state[store_name] = page
                save_state(state)
                
                # Wait before next page
                if page < last_page + 2:
                    print(f"  Waiting {DELAY_SECONDS}s...")
                    time.sleep(DELAY_SECONDS)
            else:
                print(f"  Failed to get page {page}")
                break
    
    print("\nDone!")
    print(f"State saved to: {STATE_FILE}")
    
if __name__ == "__main__":
    main()
