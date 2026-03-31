#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ทดสอบ Webhook Server"""

import requests
import json
import sys
import io

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Test data
test_comments = [
    {"username": "TestUser1", "comment": "สวัสดีครับ"},
    {"username": "TestUser2", "comment": "ราคาเท่าไหร่ครับ"},
    {"username": "TestUser3", "comment": "555 สนุกมาก"},
    {"username": "TestUser4", "comment": "ขอบคุณครับ"},
]

print("Testing Webhook Server...")
print("=" * 70)

for i, comment_data in enumerate(test_comments, 1):
    print(f"\n[Test {i}] Sending: {comment_data['username']}: {comment_data['comment']}")
    
    try:
        response = requests.post(
            'http://localhost:3000/webhook',
            json=comment_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Reply: {result['reply']}")
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

print("\n" + "=" * 70)
print("✅ Test completed!")
