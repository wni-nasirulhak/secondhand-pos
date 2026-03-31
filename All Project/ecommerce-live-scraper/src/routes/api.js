const express = require('express');
const router = express.Router();

const scraperController = require('../controllers/scraperController');
const sessionController = require('../controllers/sessionController');
const aiController = require('../controllers/aiController');
const profileController = require('../controllers/profileController');
const systemController = require('../controllers/systemController');

// Scraper Routes
router.get('/check-cookies', scraperController.checkCookies);
router.post('/import-cookies', scraperController.importCookies);

// Session Routes
router.post('/start', sessionController.startScraper);
router.post('/stop', sessionController.stopScraper);
router.get('/sessions', sessionController.listSessions);
router.get('/comments', sessionController.getComments);

// AI & Rules Routes
router.post('/ai-webhook/start', aiController.startAIWebhook);
router.post('/ai-webhook/stop', aiController.stopAIWebhook);
router.get('/mock-rules', aiController.getMockRules);
router.post('/mock-rules', aiController.saveMockRules);

// Profile Management Routes
router.get('/profiles', profileController.listProfiles);
router.post('/profiles', profileController.saveProfile);
router.delete('/profiles/:name', profileController.deleteProfile);

// System Management Routes
router.get('/system/health', systemController.getSystemHealth);

module.exports = router;
