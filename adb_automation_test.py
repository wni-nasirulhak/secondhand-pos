# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import subprocess
import time
import xml.etree.ElementTree as ET

# ADB command helper
def adb_command(cmd):
    """Run adb command and return output"""
    result = subprocess.run(
        f'C:\\Android\\platform-tools\\adb.exe {cmd}',
        shell=True,
        capture_output=True,
        text=True
    )
    return result.stdout

def dump_ui():
    """Dump UI hierarchy and return XML tree"""
    adb_command('shell uiautomator dump /sdcard/ui_temp.xml')
    adb_command('pull /sdcard/ui_temp.xml ui_temp.xml')
    
    try:
        tree = ET.parse('ui_temp.xml')
        return tree
    except:
        return None

def find_elements_by_text(tree, text_contains):
    """Find elements containing specific text"""
    elements = []
    root = tree.getroot()
    
    for node in root.iter('node'):
        text = node.get('text', '')
        if text and text_contains.lower() in text.lower():
            elements.append({
                'text': text,
                'bounds': node.get('bounds'),
                'class': node.get('class'),
                'resource-id': node.get('resource-id')
            })
    
    return elements

def tap_coordinate(x, y):
    """Tap at specific coordinate"""
    adb_command(f'shell input tap {x} {y}')
    print(f"Tapped at ({x}, {y})")

def input_text(text):
    """Input text (ASCII only, no Thai)"""
    # For Thai text, need to use different method
    adb_command(f'shell input text "{text}"')
    print(f"Typed: {text}")

def swipe(x1, y1, x2, y2, duration_ms=300):
    """Swipe from (x1,y1) to (x2,y2)"""
    adb_command(f'shell input swipe {x1} {y1} {x2} {y2} {duration_ms}')
    print(f"Swiped from ({x1},{y1}) to ({x2},{y2})")

def take_screenshot(filename='screenshot.png'):
    """Take screenshot"""
    adb_command(f'shell screencap -p /sdcard/{filename}')
    adb_command(f'pull /sdcard/{filename} {filename}')
    print(f"Screenshot saved: {filename}")

# Test functions
if __name__ == "__main__":
    print("=" * 50)
    print("ADB Automation Test")
    print("=" * 50)
    
    # 1. Dump UI
    print("\n1. Dumping UI hierarchy...")
    tree = dump_ui()
    
    if tree:
        print("✓ UI dumped successfully!")
        
        # 2. Find all text elements
        print("\n2. Finding all text elements...")
        root = tree.getroot()
        text_elements = []
        
        for node in root.iter('node'):
            text = node.get('text', '')
            if text:
                text_elements.append({
                    'text': text,
                    'bounds': node.get('bounds'),
                    'resource-id': node.get('resource-id')
                })
        
        print(f"✓ Found {len(text_elements)} text elements")
        
        # Display first 20
        print("\nFirst 20 text elements:")
        for i, el in enumerate(text_elements[:20], 1):
            print(f"  {i}. {el['text'][:50]}")
            print(f"     bounds: {el['bounds']}")
            print(f"     id: {el['resource-id']}")
        
        # 3. Take screenshot
        print("\n3. Taking screenshot...")
        take_screenshot('test_screen.png')
        
        print("\n" + "=" * 50)
        print("Test completed!")
        print("=" * 50)
    else:
        print("✗ Failed to dump UI")
