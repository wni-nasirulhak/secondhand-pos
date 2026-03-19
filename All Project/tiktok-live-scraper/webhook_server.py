#!/usr/bin/env python3
"""
Webhook Server - จำลอง AI Service
รับคอมเมนต์จาก Scraper และส่งคำตอบกลับ
"""

from flask import Flask, request, jsonify
import logging
from datetime import datetime

app = Flask(__name__)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)


# Simple AI Logic (ตอนนี้ใช้ rule-based ก่อน)
def generate_reply(username: str, comment: str) -> str:
    """สร้างคำตอบจากคอมเมนต์"""
    
    comment_lower = comment.lower()
    
    # Rule-based replies
    if 'สวัสดี' in comment or 'หวัดดี' in comment or 'ดีครับ' in comment or 'ดีค่ะ' in comment:
        return f"สวัสดีครับคุณ {username} ยินดีต้อนรับ! 💝"
    
    elif 'ราคา' in comment or 'เท่าไหร่' in comment or 'ขายไหม' in comment:
        return "ราคาและรายละเอียดเช็คที่ลิงก์ใต้วิดีโอได้เลยครับ 🛒"
    
    elif '?' in comment or 'ไหม' in comment or 'หรอ' in comment:
        return f"ขอบคุณที่ถามนะครับคุณ {username} ตอบคำถามให้ในสักครู่นะครับ 😊"
    
    elif '555' in comment or 'ฮา' in comment or '😂' in comment:
        return "ขอบคุณที่มาดูและสนุกกับเราครับ 😄"
    
    elif 'ขอบคุณ' in comment or 'ขอบใจ' in comment or 'thank' in comment_lower:
        return f"ยินดีครับคุณ {username} ขอบคุณที่ติดตามด้วยนะ 🙏"
    
    else:
        # Default reply
        return f"ขอบคุณที่คอมเมนต์ครับคุณ {username}! ✨"


@app.route('/webhook', methods=['POST'])
def webhook():
    """Webhook endpoint - รับคอมเมนต์และส่งคำตอบกลับ"""
    
    try:
        data = request.json
        
        username = data.get('username', 'Unknown')
        comment = data.get('comment', '')
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        logger.info(f"📨 Received: {username}: {comment}")
        
        # Generate reply
        reply = generate_reply(username, comment)
        
        logger.info(f"💬 Reply: {reply}")
        
        response = {
            "success": True,
            "reply": reply,
            "processed_at": datetime.now().isoformat()
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "TikTok Webhook Server",
        "timestamp": datetime.now().isoformat()
    }), 200


@app.route('/', methods=['GET'])
def index():
    """Root endpoint - แสดงข้อมูล server"""
    return jsonify({
        "service": "TikTok Live Webhook Server",
        "version": "1.0.0",
        "endpoints": {
            "webhook": "POST /webhook - รับคอมเมนต์และส่งคำตอบ",
            "health": "GET /health - เช็คสถานะ server"
        },
        "status": "running"
    }), 200


if __name__ == '__main__':
    print("=" * 70)
    print("🌐 TikTok Live Webhook Server")
    print("=" * 70)
    print("📍 Server running on: http://localhost:3000")
    print("🔗 Webhook endpoint: http://localhost:3000/webhook")
    print("💚 Health check: http://localhost:3000/health")
    print("=" * 70)
    print()
    
    app.run(host='0.0.0.0', port=3000, debug=False)
