const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);   // get new access token using refresh token
router.post('/logout', logout);     // clear refresh token from DB
router.get('/me', protect, getMe);  // protected — requires valid access token

module.exports = router;
