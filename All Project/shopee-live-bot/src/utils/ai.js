const axios = require('axios');
const logger = require('./logger');

class AIService {
  constructor() {
    this.apiUrl = process.env.OPENCLAW_API_URL;
    this.apiKey = process.env.OPENCLAW_API_KEY;
  }

  async generateReply(message, context = {}) {
    try {
      logger.debug(`🤖 Generating AI reply for: "${message}"`);

      const prompt = `คุณเป็นผู้ช่วยในไลฟ์ของ Shopee กรุณาตอบคำถามนี้อย่างเป็นกันเอง สั้น กระชับ และเป็นประโยชน์:

คำถาม: ${message}

${context.productInfo ? `ข้อมูลสินค้า: ${context.productInfo}` : ''}
${context.currentPrice ? `ราคาปัจจุบัน: ${context.currentPrice} บาท` : ''}

ตอบ:`;

      // TODO: Replace with actual OpenClaw API call
      // For now, return a simple response
      const response = await this.mockAIResponse(message);
      
      logger.info(`✅ AI Reply generated: "${response}"`);
      return response;

    } catch (error) {
      logger.error('❌ AI generation failed:', error.message);
      return 'ขอบคุณที่สนใจนะคะ 😊';
    }
  }

  async mockAIResponse(message) {
    // Mock responses for testing
    const responses = {
      'ราคา': 'ราคาพิเศษวันนี้ลดแล้วนะคะ! 🎉',
      'สี': 'มีหลายสีให้เลือกเลยค่ะ สีไหนชอบบอกได้เลย 💕',
      'ขนาด': 'มีครบทุกไซส์นะคะ S M L XL',
      'จัดส่ง': 'จัดส่งฟรีทั่วไทยค่ะ ได้ภายใน 2-3 วัน 🚚',
      'default': 'สนใจสินค้าไหนบอกได้เลยนะคะ ยินดีช่วยเหลือ 😊'
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    return responses.default;
  }
}

module.exports = new AIService();
