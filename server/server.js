const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(compression());
app.use(morgan('dev'));

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://api.dailytools247.app',
      'https://api.dailytools247.app',
      'https://dailytools247.vercel.app',
      'https://www.dailytools247.app'
    ]
  : [
      'http://localhost:8080', 
      'http://localhost:3000', 
      'http://localhost:5000',
      'http://localhost:5173',
      'https://api.dailytools247.app',
      'https://dailytools247.vercel.app',
      'https://api.dailytools247.app'
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  keyGenerator: (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const clientIP = forwardedFor.split(',')[0].trim();
      return clientIP;
    }
    return req.ip;
  },
  skip: (req) => {
    return req.path === '/health';
  }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Daily Tools Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/',
      docs: 'API endpoints available at /api/{category}'
    },
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', require('./routes/api-v1'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/audio', require('./routes/audio'));
app.use('/api/date-time', require('./routes/date-time'));
app.use('/api/dev', require('./routes/dev'));
app.use('/api/education', require('./routes/education'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/image', require('./routes/image'));
app.use('/api/internet', require('./routes/internet'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/security', require('./routes/security'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/social', require('./routes/social'));
app.use('/api/text', require('./routes/text'));
app.use('/api/video', require('./routes/video'));
app.use('/api/zip', require('./routes/zip'));

app.get('/', (req, res) => {
  res.json({
    status: 'Node.js server running 🚀',
    message: 'ToolBox API is running',
    version: '1.0.0',
    endpoints: [
      '/api/blog/',
      '/api/audio/',
      '/api/date-time/',
      '/api/dev/',
      '/api/education/',
      '/api/finance/',
      '/api/image/',
      '/api/internet/',
      '/api/pdf/',
      '/api/security/',
      '/api/seo/',
      '/api/social/',
      '/api/text/',
      '/api/video/',
      '/api/zip/'
    ]
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'Node.js server running 🚀',
    message: 'ToolBox API is running',
    version: '1.0.0',
    publicApi: {
      docs: '/api/v1/docs',
      description: 'Public API for developers - 100 free requests/day',
      generateKey: 'POST /api/v1/keys/generate'
    },
    endpoints: [
      '/api/v1/ (Public Developer API)',
      '/api/blog/',
      '/api/audio/',
      '/api/date-time/',
      '/api/dev/',
      '/api/education/',
      '/api/finance/',
      '/api/image/',
      '/api/internet/',
      '/api/pdf/',
      '/api/security/',
      '/api/seo/',
      '/api/social/',
      '/api/text/',
      '/api/video/',
      '/api/zip/'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  if (err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'External service not available'
    });
  }
  
  if (err.code === 'EMFILE' || err.code === 'ENFILE') {
    return res.status(503).json({
      error: 'Too many open files',
      message: 'Server temporarily overloaded'
    });
  }
  
  if (err.message && err.message.includes('memory')) {
    return res.status(507).json({
      error: 'Insufficient Storage',
      message: 'Server memory limit exceeded'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
