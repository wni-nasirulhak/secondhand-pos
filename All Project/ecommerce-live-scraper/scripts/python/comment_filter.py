#!/usr/bin/env python3
"""
Comment Filter - กรองคอมเมนต์ก่อนตอบ
แยกไฟล์เพื่อให้แก้ไขได้ง่าย
"""

import time
import re
from typing import Dict, Optional, Tuple
from datetime import datetime


class CommentFilter:
    """
    กรองคอมเมนต์เพื่อลดการตอบที่ไม่จำเป็น
    
    Features:
    - Cooldown per user (ไม่ตอบคนเดิมบ่อยเกินไป)
    - Rate limiting (จำกัดจำนวนการตอบต่อรอบ)
    - Smart filter (กรอง emoji, คำสั้น, ซ้ำ)
    - Priority filter (ให้ priority คำถาม/keyword)
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """
        config = {
            "cooldown_seconds": 120,        # ตอบคนเดิมได้ทุก 2 นาที
            "max_replies_per_round": 2,     # ตอบไม่เกิน 2 คนต่อรอบ
            "min_comment_length": 3,        # คอมเมนต์สั้นกว่า 3 ตัวอักษร = skip
            "enable_emoji_filter": True,    # กรอง emoji อย่างเดียว
            "enable_duplicate_filter": True, # กรองคอมเมนต์ซ้ำ
            "enable_priority_filter": True,  # ให้ priority คำถาม/keyword
            "priority_keywords": ["ราคา", "เท่าไหร่", "ขาย", "สั่ง", "อยาก", "ได้ไหม"]
        }
        """
        self.config = config or self._default_config()
        
        # Track state
        self.user_last_reply: Dict[str, float] = {}  # {username: timestamp}
        self.recent_comments: Dict[str, float] = {}  # {comment_text: timestamp}
        self.replies_this_round: int = 0
        self.round_start_time: float = time.time()
    
    def _default_config(self) -> Dict:
        """Default configuration"""
        return {
            "cooldown_seconds": 120,
            "max_replies_per_round": 2,
            "min_comment_length": 3,
            "enable_emoji_filter": True,
            "enable_duplicate_filter": True,
            "enable_priority_filter": True,
            "priority_keywords": ["ราคา", "เท่าไหร่", "ขาย", "สั่ง", "อยาก", "ได้ไหม", "?"]
        }
    
    def reset_round(self):
        """เริ่มรอบใหม่ - เรียกทุกครั้งก่อนเริ่ม scrape รอบใหม่"""
        self.replies_this_round = 0
        self.round_start_time = time.time()
        
        # ลบ recent_comments ที่เก่าเกิน 5 นาที
        current_time = time.time()
        self.recent_comments = {
            text: ts for text, ts in self.recent_comments.items()
            if current_time - ts < 300  # 5 minutes
        }
    
    def should_reply(self, username: str, comment: str) -> Tuple[bool, str]:
        """
        ตัดสินใจว่าควรตอบคอมเมนต์นี้หรือไม่
        
        Returns:
            (should_reply: bool, reason: str)
        """
        
        # 1. Rate Limiting - เกินโควต้ารอบนี้หรือยัง
        max_replies = self.config.get("max_replies_per_round", 2)
        if self.replies_this_round >= max_replies:
            return False, f"Rate limit reached ({self.replies_this_round}/{max_replies} this round)"
        
        # 2. Cooldown per User - ตอบคนนี้ไปแล้วหรือยัง
        cooldown = self.config.get("cooldown_seconds", 120)
        if username in self.user_last_reply:
            elapsed = time.time() - self.user_last_reply[username]
            if elapsed < cooldown:
                remaining = int(cooldown - elapsed)
                return False, f"User cooldown ({remaining}s remaining for {username})"
        
        # 3. Smart Filter - คอมเมนต์ผ่านเกณฑ์หรือไม่
        
        # 3a. ความยาว
        min_length = self.config.get("min_comment_length", 3)
        if len(comment.strip()) < min_length:
            return False, f"Comment too short ({len(comment)} < {min_length})"
        
        # 3b. Emoji อย่างเดียว
        if self.config.get("enable_emoji_filter", True):
            if self._is_only_emoji(comment):
                return False, "Comment is only emoji/symbols"
        
        # 3c. Duplicate - เห็นคอมเมนต์นี้ซ้ำไหม (ใน 5 นาทีที่แล้ว)
        if self.config.get("enable_duplicate_filter", True):
            if comment.strip() in self.recent_comments:
                return False, "Duplicate comment (seen recently)"
        
        # 4. Priority Filter - ให้ priority คำถาม/keyword สำคัญ
        is_priority = False
        if self.config.get("enable_priority_filter", True):
            is_priority = self._is_priority_comment(comment)
        
        # ถ้าไม่ priority และโควต้าใกล้หมด → skip เพื่อเว้นไว้ให้ priority
        if not is_priority and self.replies_this_round >= (max_replies - 1):
            return False, "Saving quota for priority comments"
        
        # ✅ ผ่านทุกเงื่อนไข!
        return True, "OK" if not is_priority else "OK (priority)"
    
    def mark_replied(self, username: str, comment: str):
        """บันทึกว่าได้ตอบคอมเมนต์นี้แล้ว"""
        self.user_last_reply[username] = time.time()
        self.recent_comments[comment.strip()] = time.time()
        self.replies_this_round += 1
    
    def _is_only_emoji(self, text: str) -> bool:
        """เช็คว่าเป็น emoji/symbols อย่างเดียวหรือไม่"""
        # ลบ emoji, symbols, whitespace ออก
        clean_text = re.sub(r'[^\w\s]', '', text, flags=re.UNICODE)
        clean_text = re.sub(r'\s+', '', clean_text)
        
        # ถ้าเหลือน้อยกว่า 2 ตัวอักษร = emoji อย่างเดียว
        return len(clean_text) < 2
    
    def _is_priority_comment(self, comment: str) -> bool:
        """เช็คว่าเป็นคอมเมนต์ priority หรือไม่"""
        keywords = self.config.get("priority_keywords", [])
        comment_lower = comment.lower()
        
        for keyword in keywords:
            if keyword.lower() in comment_lower:
                return True
        
        return False
    
    def get_stats(self) -> Dict:
        """สถิติการกรอง"""
        return {
            "replies_this_round": self.replies_this_round,
            "max_replies_per_round": self.config.get("max_replies_per_round", 2),
            "users_on_cooldown": len(self.user_last_reply),
            "recent_comments_tracked": len(self.recent_comments)
        }


# ==================== Configuration ====================

def load_filter_config(config_file: str = "filter_config.json") -> Dict:
    """โหลด config จากไฟล์ (optional)"""
    import json
    from pathlib import Path
    
    config_path = Path(config_file)
    if config_path.exists():
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # Return default
    return CommentFilter()._default_config()


# ==================== Example Usage ====================

if __name__ == "__main__":
    """ทดสอบ Filter"""
    
    # Fix encoding for Windows
    import sys
    import io
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    # สร้าง filter
    filter = CommentFilter()
    
    print("=" * 70)
    print("Testing Comment Filter")
    print("=" * 70)
    print()
    
    # Test cases
    test_comments = [
        ("user1", "สวัสดีครับ"),
        ("user2", "555"),
        ("user3", "🔥🔥🔥"),
        ("user4", "ราคาเท่าไหร่ครับ"),
        ("user1", "อีกแล้ว"),  # Same user
        ("user5", "สวัสดีครับ"),  # Duplicate
        ("user6", "ขอบคุณครับ"),
        ("user7", "ซื้อได้ไหมครับ"),  # Priority
    ]
    
    filter.reset_round()
    
    for username, comment in test_comments:
        should_reply, reason = filter.should_reply(username, comment)
        
        status = "✅ REPLY" if should_reply else "❌ SKIP"
        print(f"{status} | {username}: {comment}")
        print(f"         Reason: {reason}")
        
        if should_reply:
            filter.mark_replied(username, comment)
        
        print()
    
    print("=" * 70)
    print("📊 Filter Stats:")
    stats = filter.get_stats()
    for key, value in stats.items():
        print(f"   {key}: {value}")
    print("=" * 70)
