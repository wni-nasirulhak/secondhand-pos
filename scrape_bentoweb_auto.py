# -*- coding: utf-8 -*-
"""
BentoWeb Auto Scraper via OpenClaw Browser
This script will be called from OpenClaw with browser access
"""

import json
import time
from pathlib import Path

class BentoWebScraper:
    def __init__(self):
        self.state_file = Path('scraper_state.json')
        self.output_file = Path('customers_scraped.json')
        self.state = self.load_state()
        self.all_customers = self.load_existing_data()
        
    def load_state(self):
        """Load scraping state"""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {
            'current_store': 'Winona Feminine (official)',
            'current_page': 1,
            'total_pages_scraped': 0,
            'last_updated': None
        }
    
    def save_state(self):
        """Save scraping state"""
        self.state['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def load_existing_data(self):
        """Load existing scraped data"""
        if self.output_file.exists():
            with open(self.output_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def save_data(self):
        """Save all customer data"""
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(self.all_customers, f, ensure_ascii=False, indent=2)
    
    def add_page_data(self, customers, store_name):
        """Add scraped page data"""
        for customer in customers:
            customer['store'] = store_name
            self.all_customers.append(customer)
    
    def to_excel(self, output_file='customers_all_stores.xlsx'):
        """Convert JSON to Excel"""
        import pandas as pd
        
        df_list = []
        for customer in self.all_customers:
            df_list.append({
                'ร้าน': customer.get('store', ''),
                'ชื่อผู้สั่ง': customer.get('name', ''),
                'เบอร์โทรศัพท์': customer.get('phone', ''),
                'อีเมล': customer.get('email', ''),
                'การสั่งซื้อ': customer.get('orders', ''),
                'รายได้ทั้งหมด': customer.get('revenue', ''),
                'Loyalty Points': customer.get('points', ''),
                'วันที่เข้าสู่ระบบ': customer.get('lastLogin', '')
            })
        
        df = pd.DataFrame(df_list)
        df.to_excel(output_file, index=False, engine='openpyxl')
        print(f"Excel saved: {output_file} ({len(df)} records)")
        return output_file

    def get_status(self):
        """Get current status"""
        return {
            'state': self.state,
            'total_customers': len(self.all_customers),
            'files': {
                'state': str(self.state_file),
                'data': str(self.output_file)
            }
        }

if __name__ == "__main__":
    scraper = BentoWebScraper()
    print("Scraper initialized")
    print(json.dumps(scraper.get_status(), indent=2))
