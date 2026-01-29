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

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:3000', 
    'http://localhost:5000',
    'https://toolbox-backend-jet.vercel.app',
    'https://dailytools247.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Node.js server running 🚀',
    message: 'ToolBox API is running',
    version: '1.0.0',
    endpoints: [
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

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'Node.js server running 🚀',
    message: 'ToolBox API is running',
    version: '1.0.0',
    endpoints: [
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
