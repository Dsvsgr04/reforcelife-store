require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const fs      = require('fs');

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// ─── Ensure upload dir exists ────────────────
const uploadDir = process.env.UPLOAD_DIR || 'uploads/products';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ─── Security & Logging ──────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(morgan('dev'));

// ─── CORS ────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ─── Body Parsers ────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));
app.use(express.static(path.join(__dirname, '../public')));

// ─── API Routes ──────────────────────────────
app.use('/api', routes);

// ─── Serve Frontend (SPA fallback) ───────────
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'ReforceLife API is running', status: 'ok', version: '1.0.0' });
  }
});

// ─── Global Error Handler ────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────
const PORT = process.env.PORT || 8081;

sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🌿 ReforceLife Server running on http://localhost:${PORT}`);
      console.log(`📦 API base: http://localhost:${PORT}/api`);
      console.log(`🗃️  Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
      console.log(`\nEndpoints:`);
      console.log(`  POST /api/auth/register`);
      console.log(`  POST /api/auth/login`);
      console.log(`  GET  /api/products`);
      console.log(`  POST /api/orders/checkout`);
      console.log(`  POST /api/contact`);
      console.log(`  GET  /api/admin/orders  (admin only)`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  });

module.exports = app;
