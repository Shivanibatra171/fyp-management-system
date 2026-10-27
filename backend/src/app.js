const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const supervisorRoutes = require('./routes/supervisorRoutes');

const app = express();

// Trust reverse proxy (Cloudflare tunnel, Nginx, Heroku) so req.ip and rate limiters work properly
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// Global API Rate Limiting (prevents DDoS & abuse)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', globalLimiter);

// Stricter Auth Rate Limiting (prevents brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 60 auth requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or registration attempts. Please try again after 15 minutes.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS Configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging in non-test mode
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'University FYP Management System API is running smoothly.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/supervisor', supervisorRoutes);

// Serve static frontend assets from production build with high-performance gzip & caching
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  // Pre-compressed gzip handler for JavaScript bundles
  app.get('/assets/*.js', (req, res, next) => {
    const gzFile = path.join(frontendDist, req.path + '.gz');
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('gzip') && fs.existsSync(gzFile)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(gzFile);
    }
    next();
  });

  // Pre-compressed gzip handler for CSS bundles
  app.get('/assets/*.css', (req, res, next) => {
    const gzFile = path.join(frontendDist, req.path + '.gz');
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('gzip') && fs.existsSync(gzFile)) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(gzFile);
    }
    next();
  });

  // Long-term immutable caching for hashed static assets
  app.use(
    '/assets',
    express.static(path.join(frontendDist, 'assets'), {
      maxAge: '1y',
      immutable: true,
    })
  );

  // General static assets (favicon, etc.)
  app.use(express.static(frontendDist, { maxAge: '1h' }));

  // SPA fallback: return index.html for all other non-API routes with fresh cache check
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
