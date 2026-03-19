# -*- coding: utf-8 -*-
"""
Get cookies from Chrome for BentoWeb
ใช้สคริปต์นี้ดึง cookies จาก Chrome ที่ login ไว้แล้ว
"""

import json
import sqlite3
import os
import shutil
from pathlib import Path

def get_chrome_cookies(domain='.bentoweb.com'):
    """ดึง cookies จาก Chrome database"""
    
    # Chrome cookies path (Windows)
    chrome_cookies_path = Path.home() / 'AppData' / 'Local' / 'Google' / 'Chrome' / 'User Data' / 'Default' / 'Network' / 'Cookies'
    
    if not chrome_cookies_path.exists():
        print(f"Not found: {chrome_cookies_path}")
        return None
    
    # Copy cookies file (Chrome locks it)
    temp_cookies = 'temp_cookies.db'
    try:
        shutil.copy2(chrome_cookies_path, temp_cookies)
    except Exception as e:
        print(f"Copy failed: {e}")
        print("Try closing Chrome first")
        return None
    
    cookies = {}
    
    try:
        # เชื่อมต่อ SQLite
        conn = sqlite3.connect(temp_cookies)
        cursor = conn.cursor()
        
        # ดึง cookies ของ domain นี้
        cursor.execute(f"""
            SELECT name, value, host_key 
            FROM cookies 
            WHERE host_key LIKE '%{domain}%'
        """)
        
        for name, value, host in cursor.fetchall():
            cookies[name] = value
            print(f"+ {name}: {value[:30]}..." if len(value) > 30 else f"+ {name}: {value}")
        
        conn.close()
        
    except Exception as e:
        print(f"Read failed: {e}")
        return None
    finally:
        # Delete temp file
        if os.path.exists(temp_cookies):
            os.remove(temp_cookies)
    
    if not cookies:
        print("No BentoWeb cookies found")
        print("Please login to BentoWeb in Chrome first")
        return None
    
    # Save cookies
    with open('bentoweb_cookies.json', 'w', encoding='utf-8') as f:
        json.dump(cookies, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved {len(cookies)} cookies to bentoweb_cookies.json")
    return cookies

if __name__ == "__main__":
    print("Getting cookies from Chrome...\n")
    cookies = get_chrome_cookies()
    
    if cookies:
        print("\nSuccess! Cookies saved.")
    else:
        print("\nFailed - check steps above")
