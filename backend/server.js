require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Trust Render's reverse proxy so rate-limiter works correctly in production
app.set('trust proxy', 1);

// ── Middleware ──────────────────────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from our React frontend (accepting all origins for easy local dev)
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/research', require('./routes/researchRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// ── Health Check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'PaperMind API is running 🚀' });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenRouter Key: ${process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.slice(0, 20) + '...' : 'NOT FOUND ❌'}`);
  console.log(`Serper Key:     ${process.env.SERPER_API_KEY ? process.env.SERPER_API_KEY.slice(0, 10) + '...' : 'NOT FOUND ❌'}`);
});
