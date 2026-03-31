// User Management Routes
const express = require('express');
const router = express.Router();

let userLists = {
  blacklist: [],
  whitelist: [],
  viplist: []
};

// Get blacklist
router.get('/blacklist', (req, res) => {
  res.json({ success: true, blacklist: userLists.blacklist });
});

// Update blacklist
router.post('/blacklist', (req, res) => {
  userLists.blacklist = req.body.blacklist || [];
  res.json({ success: true, blacklist: userLists.blacklist });
});

// Get whitelist
router.get('/whitelist', (req, res) => {
  res.json({ success: true, whitelist: userLists.whitelist });
});

// Update whitelist
router.post('/whitelist', (req, res) => {
  userLists.whitelist = req.body.whitelist || [];
  res.json({ success: true, whitelist: userLists.whitelist });
});

// Get VIP list
router.get('/viplist', (req, res) => {
  res.json({ success: true, viplist: userLists.viplist });
});

// Update VIP list
router.post('/viplist', (req, res) => {
  userLists.viplist = req.body.viplist || [];
  res.json({ success: true, viplist: userLists.viplist });
});

// Get all lists
router.get('/all', (req, res) => {
  res.json({ success: true, lists: userLists });
});

// Update all lists
router.post('/all', (req, res) => {
  if (req.body.blacklist) userLists.blacklist = req.body.blacklist;
  if (req.body.whitelist) userLists.whitelist = req.body.whitelist;
  if (req.body.viplist) userLists.viplist = req.body.viplist;
  res.json({ success: true, lists: userLists });
});

// Clear all lists
router.delete('/all', (req, res) => {
  userLists = { blacklist: [], whitelist: [], viplist: [] };
  res.json({ success: true });
});

module.exports = router;
module.exports.userLists = userLists; // Export for use in scraper
