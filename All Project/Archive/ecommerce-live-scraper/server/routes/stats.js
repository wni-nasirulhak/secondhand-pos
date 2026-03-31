// Statistics Routes
const express = require('express');
const router = express.Router();

// Global stats will be updated by scraper
let currentStats = {
  totalComments: 0,
  commentsPerMinute: 0,
  topUsers: [],
  platformBreakdown: {},
  timeline: [],
  uptime: 0
};

// Update stats (called by scraper)
function updateStats(stats) {
  currentStats = stats;
}

// Get overall stats
router.get('/', (req, res) => {
  res.json({ success: true, stats: currentStats });
});

// Get platform-specific stats
router.get('/platform/:platform', (req, res) => {
  const platform = req.params.platform;
  const platformStats = {
    comments: currentStats.platformBreakdown[platform] || 0,
    topUsers: currentStats.topUsers.filter(u => u.platform === platform)
  };
  res.json({ success: true, stats: platformStats });
});

// Get timeline
router.get('/timeline', (req, res) => {
  res.json({ success: true, timeline: currentStats.timeline });
});

module.exports = router;
module.exports.updateStats = updateStats;
