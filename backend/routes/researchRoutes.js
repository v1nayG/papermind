const express = require('express');
const router = express.Router();
const { startResearch, getHistory, getSession } = require('../controllers/researchController');
const { protect } = require('../middleware/auth');

// All research routes require authentication
router.post('/start', protect, startResearch);
router.get('/history', protect, getHistory);
router.get('/session/:id', protect, getSession);

module.exports = router;
