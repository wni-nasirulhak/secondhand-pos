import json
import time
from datetime import datetime

# เก็บข้อมูลลูกค้าทั้งหมด
all_customers = []
current_store = "Winona Feminine (official)"

# ข้อมูลหน้าแรก (100 รายการ)
page_1_data = []  # จะอัพเดตจาก browser

def add_store_column(data, store_name):
    """เพิ่มคอลัมน์ร้านค้า"""
    for customer in data:
        customer['ร้าน'] = store_name
        # เปลี่ยนชื่อคอลัมน์เป็นภาษาไทย
        customer['ชื่อผู้สั่ง'] = customer.pop('name')
        customer['เบอร์โทรศัพท์'] = customer.pop('phone')
        customer['อีเมล'] = customer.pop('email')
        customer['การสั่งซื้อ'] = customer.pop('orders')
        customer['รายได้ทั้งหมด'] = customer.pop('revenue')
        customer['Loyalty Points'] = customer.pop('points')
        customer['วันที่เข้าสู่ระบบ'] = customer.pop('lastLogin')
    return data

def save_to_json(data, filename):
    """บันทึกข้อมูลเป็น JSON"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ บันทึกข้อมูล {len(data)} รายการลง {filename}")

print(f"Store: {current_store}")
print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("Waiting for browser data...")
