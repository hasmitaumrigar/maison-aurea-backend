require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const Voucher      = require('./models/Voucher');

const app = express();

// ── Security Headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('NOT ALLOWED BY CORS'));
  },
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'TOO MANY ATTEMPTS. PLEASE WAIT 15 MINUTES.' },
});

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging (dev only) ────────────────────────────────
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     authLimiter, require('./routes/authRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/cart',     require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.use('/api/contact',  require('./routes/contactRoutes'));

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'MAISON AURÈA API', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `ROUTE NOT FOUND: ${req.method} ${req.originalUrl}` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
//const PORT = process.env.PORT || 5000;
const PORT = process.env.PORT || 8080;
async function start() {
  await connectDB();
  await Voucher.seed(); // Ensure voucher codes exist
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║     MAISON AURÈA API — RUNNING       ║
║  http://localhost:${PORT}               ║
║  ENV: ${(process.env.NODE_ENV || 'development').padEnd(28)}║
╚══════════════════════════════════════╝`);
  });
}

start().catch((err) => { console.error('STARTUP ERROR:', err); process.exit(1); });

module.exports = app;
