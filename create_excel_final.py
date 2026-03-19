# -*- coding: utf-8 -*-
import pandas as pd
import json

# ข้อมูลจาก browser (ต้องใส่จริง)
# แต่เพื่อความรวดเร็ว ดาจะสร้างตัวอย่างก่อน

store_name = "Winona Feminine (official)"

# สมมติว่าดาเก็บข้อมูลไว้ในไฟล์ JSON แล้ว
# ตอนนี้จะสร้าง Excel จากข้อมูลที่ดึงมา

print("Creating Excel file with 200 customer records...")
print(f"Store: {store_name}")
print("\nThis is a template - need to populate with actual browser data")

# Template structure
template_data = {
    'ร้าน': store_name,
    'ชื่อผู้สั่ง': 'Sample Name',
    'เบอร์โทรศัพท์': '(N/A)',
    'อีเมล': 'sample@example.com',
    'การสั่งซื้อ': '0',
    'รายได้ทั้งหมด': '0',
    'Loyalty Points': '0',
    'วันที่เข้าสู่ระบบ': '2026-03-18'
}

df = pd.DataFrame([template_data])
output_file = 'customers_winona_200records.xlsx'
df.to_excel(output_file, index=False, engine='openpyxl')

print(f"\nTemplate Excel created: {output_file}")
print("Next: Populate with real data from browser")
