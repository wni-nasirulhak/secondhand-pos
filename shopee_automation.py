# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from appium.options.android import UiAutomator2Options
import time

# Appium server
APPIUM_SERVER = "http://localhost:4723"

# Device capabilities
options = UiAutomator2Options()
options.platform_name = "Android"
options.platform_version = "11"
options.device_name = "e5c0354a"  # Device ID จาก adb devices
options.app_package = "com.shopee.th"
options.app_activity = "com.shopee.app.splash.SplashActivity"  # Main activity
options.automation_name = "UiAutomator2"
options.no_reset = True  # ไม่ reset app (รักษา login state)
options.full_reset = False
# Skip hidden API policy checks (fix for Android 11+)
options.set_capability("skipDeviceInitialization", True)
options.set_capability("skipServerInstallation", False)
options.set_capability("disableAndroidWatchers", True)

print("Connecting to Appium server...")

try:
    # Connect to Appium
    driver = webdriver.Remote(APPIUM_SERVER, options=options)
    print("Connected successfully!")
    
    # รอให้แอปเปิดเสร็จ
    time.sleep(5)
    
    # ดึงข้อมูล current activity
    current_activity = driver.current_activity
    print(f"Current Activity: {current_activity}")
    
    # ลอง dump UI hierarchy
    print("\nFetching UI elements...")
    page_source = driver.page_source
    print(f"Page source length: {len(page_source)} characters")
    
    # ทดสอบค้นหา elements
    print("\nSearching for text elements...")
    elements = driver.find_elements(AppiumBy.CLASS_NAME, "android.widget.TextView")
    print(f"Found {len(elements)} TextView elements")
    
    # แสดง text ของ 10 elements แรก
    print("\nFirst 10 text elements:")
    for i, el in enumerate(elements[:10]):
        try:
            text = el.text
            if text:
                print(f"  {i+1}. {text}")
        except:
            pass
    
    print("\nBasic test successful!")
    print("Next step: Navigate to Live section")
    
    # ปิดการเชื่อมต่อ
    # driver.quit()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
