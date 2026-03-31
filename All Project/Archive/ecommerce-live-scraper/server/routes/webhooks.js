// Webhook Routes
const express = require('express');
const router = express.Router();

let webhooks = [];

// Get all webhooks
router.get('/', (req, res) => {
  res.json({ success: true, webhooks });
});

// Add webhook
router.post('/', (req, res) => {
  const webhook = {
    id: Date.now().toString(),
    ...req.body,
    enabled: req.body.enabled !== false
  };
  
  webhooks.push(webhook);
  res.json({ success: true, webhook });
});

// Update webhook
router.put('/:id', (req, res) => {
  const index = webhooks.findIndex(w => w.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Webhook not found' });
  }
  
  webhooks[index] = { ...webhooks[index], ...req.body };
  res.json({ success: true, webhook: webhooks[index] });
});

// Delete webhook
router.delete('/:id', (req, res) => {
  const index = webhooks.findIndex(w => w.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Webhook not found' });
  }
  
  webhooks.splice(index, 1);
  res.json({ success: true });
});

// Test webhook
router.post('/:id/test', async (req, res) => {
  const webhook = webhooks.find(w => w.id === req.params.id);
  
  if (!webhook) {
    return res.status(404).json({ success: false, error: 'Webhook not found' });
  }
  
  const testComment = {
    platform: 'test',
    username: 'TestUser',
    comment: 'This is a test message from E-commerce Live Scraper!',
    timestamp: new Date().toISOString()
  };
  
  try {
    const WebhookManager = require('../../core/webhook-manager');
    const manager = new WebhookManager([webhook]);
    const result = await manager.send(testComment);
    res.json({ success: result[0].success });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
