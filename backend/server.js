require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Trust Render's reverse proxy (required for rate limiter + IP detection)
app.set('trust proxy', 1);

// ── CORS — must be FIRST before everything else ──────────────
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Handle ALL preflight OPTIONS requests immediately — before rate limiter
app.options('*', cors(corsOptions));

// ── Body Parser ──────────────────────────────────────────────
app.use(express.json());

// ── Rate Limiting ────────────────────────────────────────────
// Disable X-Forwarded-For validation warning since we handle it via trust proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  validate: { xForwardedForHeader: false },
});
app.use('/api', limiter);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/research', require('./routes/researchRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// ── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'PaperMind API is running 🚀' });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenRouter Key: ${process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.slice(0, 20) + '...' : 'NOT FOUND ❌'}`);
  console.log(`Serper Key:     ${process.env.SERPER_API_KEY ? process.env.SERPER_API_KEY.slice(0, 10) + '...' : 'NOT FOUND ❌'}`);
});
