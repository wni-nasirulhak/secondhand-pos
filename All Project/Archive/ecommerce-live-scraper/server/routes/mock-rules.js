// Mock Rules Routes
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const RULES_FILE = path.join(__dirname, '..', '..', 'data', 'mock_rules.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(RULES_FILE);
  const fsSync = require('fs');
  if (!fsSync.existsSync(dataDir)) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Get mock rules
router.get('/', async (req, res) => {
  try {
    await ensureDataDir();
    const fsSync = require('fs');
    
    if (fsSync.existsSync(RULES_FILE)) {
      const content = await fs.readFile(RULES_FILE, 'utf8');
      const rules = JSON.parse(content);
      res.json({ success: true, rules });
    } else {
      res.json({ success: true, rules: [] });
    }
  } catch (error) {
    console.error('Error reading mock rules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save mock rules
router.post('/', async (req, res) => {
  try {
    const rules = req.body.rules;
    
    if (!Array.isArray(rules)) {
      return res.status(400).json({ success: false, error: 'Rules must be an array' });
    }

    await ensureDataDir();
    await fs.writeFile(RULES_FILE, JSON.stringify(rules, null, 2), 'utf8');
    
    res.json({ success: true, message: 'บันทึกกฎสำเร็จ!' });
  } catch (error) {
    console.error('Error saving mock rules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test a rule
router.post('/test', (req, res) => {
  try {
    const { rule, testComment } = req.body;
    
    if (!rule || !testComment) {
      return res.status(400).json({ success: false, error: 'Missing rule or testComment' });
    }

    const { keywords, replies } = rule;
    const commentLower = testComment.toLowerCase();
    
    // Check if any keyword matches
    const matched = keywords && keywords.some(kw => 
      commentLower.includes(kw.toLowerCase())
    );

    if (matched && replies && replies.length > 0) {
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      res.json({
        success: true,
        matched: true,
        reply: randomReply.replace('@username', '@TestUser')
      });
    } else {
      res.json({
        success: true,
        matched: false,
        reply: null
      });
    }
  } catch (error) {
    console.error('Error testing rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
