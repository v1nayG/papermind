const express = require('express');
const router = express.Router();
const { exportMarkdown } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.get('/markdown/:sessionId', protect, exportMarkdown);

module.exports = router;
