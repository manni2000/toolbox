const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5000', 
  'http://localhost:8000', 
  'https://www.dailytools247.app',
  'https://api.dailytools247.app',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.some(o => origin && origin.startsWith(o)) ||
      origin.includes('replit.dev') ||
      origin.includes('replit.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  credentials: true,
  maxAge: 86400,
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Upload rate limit exceeded.' },
});

const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
}

function sanitizeObject(obj) {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, val] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(val);
    }
    return sanitized;
  }
  return obj;
}

function requestSanitizer(req, _res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  next();
}

function errorHandler(err, req, res, _next) {
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, error: `File upload error: ${err.message}` });
  }
  if (err.message === 'CORS policy violation') {
    return res.status(403).json({ success: false, error: 'CORS policy violation' });
  }
  // console.error('[Error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
}

module.exports = {
  corsOptions,
  generalLimiter,
  strictLimiter,
  uploadLimiter,
  helmetOptions,
  requestSanitizer,
  errorHandler,
  cors,
  helmet,
};
