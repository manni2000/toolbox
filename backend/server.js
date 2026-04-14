const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { corsOptions, generalLimiter, helmetOptions, requestSanitizer, errorHandler } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 8000;

app.set('trust proxy', 1);

app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestSanitizer);
app.use(generalLimiter);

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/internet', require('./routes/internet'));
app.use('/api/security', require('./routes/security'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/image', require('./routes/image'));
app.use('/api/audio', require('./routes/audio'));
app.use('/api/video', require('./routes/video'));
app.use('/api/dev', require('./routes/dev'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/social', require('./routes/social'));
app.use('/api/text', require('./routes/text'));
app.use('/api/zip', require('./routes/zip'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/education', require('./routes/education'));
app.use('/api/date-time', require('./routes/datetime'));
app.use('/api/blog', require('./routes/blog'));

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use(errorHandler);

app.listen(PORT, 'localhost', () => {
  console.log(`[Server] Backend running on http://localhost:${PORT}`);
});

module.exports = app;
