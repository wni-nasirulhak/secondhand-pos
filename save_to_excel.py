# -*- coding: utf-8 -*-
import pandas as pd
import json

# ข้อมูลหน้า 1 (100 รายการ) - ต้องใส่ข้อมูลจริงตรงนี้
page1_data = []

def save_customers_to_excel(data, filename="customers_winona_feminine.xlsx"):
    """บันทึกข้อมูลลูกค้าลง Excel"""
    
    # แปลงข้อมูลเป็น DataFrame
    df_list = []
    
    for item in data:
        df_list.append({
            'ร้าน': 'Winona Feminine (official)',
            'ชื่อผู้สั่ง': item.get('name', ''),
            'เบอร์โทรศัพท์': item.get('phone', ''),
            'อีเมล': item.get('email', ''),
            'การสั่งซื้อ': item.get('orders', ''),
            'รายได้ทั้งหมด': item.get('revenue', ''),
            'Loyalty Points': item.get('points', ''),
            'วันที่เข้าสู่ระบบ': item.get('lastLogin', '')
        })
    
    df = pd.DataFrame(df_list)
    
    # บันทึกลง Excel
    df.to_excel(filename, index=False, engine='openpyxl')
    print(f"Saved {len(df)} records to {filename}")
    return filename

# ทดสอบสร้างไฟล์ว่าง
if __name__ == "__main__":
    # สร้างไฟล์ Excel เปล่าไว้ก่อน
    sample_data = [{
        'name': 'Test',
        'phone': 'N/A',
        'email': 'test@example.com',
        'orders': '0',
        'revenue': '0',
        'points': '0',
        'lastLogin': '2026-03-18'
    }]
    
    filename = save_customers_to_excel(sample_data, "customers_test.xlsx")
    print(f"Test file created: {filename}")
