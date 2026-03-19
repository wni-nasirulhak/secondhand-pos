# -*- coding: utf-8 -*-
"""
Save 200 customer records to Excel
Data from browser (page 1 + page 2)
"""

import pandas as pd
import sys

# Set console encoding to UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Store name
store_name = "Winona Feminine (official)"

# Page 1 data (100 records) - will be populated
page1_data = []  # Browser data here

# Page 2 data (100 records) - will be populated
page2_data = []  # Browser data here

def create_excel(page1, page2, store, output_file='customers_winona_200records.xlsx'):
    """Create Excel from browser data"""
    
    all_customers = []
    
    # Add page 1
    for customer in page1:
        all_customers.append({
            'ร้าน': store,
            'ชื่อผู้สั่ง': customer.get('name', ''),
            'เบอร์โทรศัพท์': customer.get('phone', ''),
            'อีเมล': customer.get('email', ''),
            'การสั่งซื้อ': customer.get('orders', ''),
            'รายได้ทั้งหมด': customer.get('revenue', ''),
            'Loyalty Points': customer.get('points', ''),
            'วันที่เข้าสู่ระบบ': customer.get('lastLogin', '')
        })
    
    # Add page 2
    for customer in page2:
        all_customers.append({
            'ร้าน': store,
            'ชื่อผู้สั่ง': customer.get('name', ''),
            'เบอร์โทรศัพท์': customer.get('phone', ''),
            'อีเมล': customer.get('email', ''),
            'การสั่งซื้อ': customer.get('orders', ''),
            'รายได้ทั้งหมด': customer.get('revenue', ''),
            'Loyalty Points': customer.get('points', ''),
            'วันที่เข้าสู่ระบบ': customer.get('lastLogin', '')
        })
    
    # Create DataFrame
    df = pd.DataFrame(all_customers)
    
    # Save to Excel
    df.to_excel(output_file, index=False, engine='openpyxl')
    
    print(f"Excel created: {output_file}")
    print(f"Total records: {len(df)}")
    print(f"Store: {store}")
    
    return output_file

# Test with empty data
if __name__ == "__main__":
    if not page1_data and not page2_data:
        print("No data loaded yet")
        print("Waiting for browser data...")
    else:
        create_excel(page1_data, page2_data, store_name)
