const express = require('express');
const router = express.Router();
const { exportMarkdown, exportPDF } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.get('/markdown/:sessionId', protect, exportMarkdown);
router.get('/pdf/:sessionId', protect, exportPDF);

module.exports = router;
