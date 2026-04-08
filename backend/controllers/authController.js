const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Token Generators ────────────────────────────────────────

// Short lived — used for every API request (15 minutes)
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Long lived — used only to get a new access token (7 days)
// Stored in DB so we can invalidate it on logout
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── Register ────────────────────────────────────────────────
const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const user = await User.create({ email, password });

    // Generate both tokens on register
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'Account created successfully',
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Login ───────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate both tokens on login
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save fresh refresh token to DB (replaces old one if any)
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Refresh ─────────────────────────────────────────────────
// Called automatically by frontend when access token expires (401)
// Validates the refresh token and issues a brand new access token
const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }

  try {
    // Step 1: Verify the token is a valid JWT (not tampered, not expired)
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Step 2: Check if this refresh token actually exists in our DB
    // This is what allows us to invalidate tokens on logout
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken,
    });

    if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Step 3: Issue a brand new access token for this user
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      accessToken: newAccessToken,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    // jwt.verify throws if token is expired or tampered
    return res.status(403).json({ error: 'Refresh token expired or invalid. Please log in again.' });
  }
};

// ── Logout ──────────────────────────────────────────────────
// Clears the refresh token from DB — makes it permanently unusable
const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    // Find user by refresh token and clear it
    await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null }
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Get Current User ────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ user: { id: req.user._id, email: req.user.email } });
};

module.exports = { register, login, refresh, logout, getMe };
