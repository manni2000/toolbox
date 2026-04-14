require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { corsOptions, generalLimiter, helmetOptions, requestSanitizer, errorHandler } = require('./middleware/security');
const { cacheMiddleware } = require('./middleware/cache');

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


app.get('/api/health', cacheMiddleware('health', 30), (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Health checkup for all endpoints
app.get('/api/health/all', async (_req, res) => {
  // List of endpoints to check (POST endpoints will be checked with OPTIONS)
  const endpoints = [
    '/api/pdf/html-to-pdf', '/api/pdf/to-image', '/api/pdf/to-word', '/api/pdf/to-excel', '/api/pdf/to-powerpoint', '/api/pdf/word-to-pdf', '/api/pdf/powerpoint-to-pdf', '/api/pdf/merge', '/api/pdf/split', '/api/pdf/password', '/api/pdf/unlock', '/api/pdf/remove-pages', '/api/pdf/rotate', '/api/pdf/compress', '/api/pdf/info',
    '/api/image/compress', '/api/image/convert', '/api/image/resize', '/api/image/crop', '/api/image/background-remover', '/api/image/image-to-word', '/api/image/image-to-pdf', '/api/image/qr-generator', '/api/image/qr-scanner', '/api/image/base64', '/api/image/exif-viewer', '/api/image/favicon-generator', '/api/image/dpi-checker',
    '/api/audio/convert', '/api/audio/merge', '/api/audio/trim', '/api/audio/speed', '/api/audio/speech-to-text',
    '/api/video/download', '/api/video/to-audio', '/api/video/trim', '/api/video/speed', '/api/video/thumbnail', '/api/video/resolution', '/api/video/convert', '/api/video/compress', '/api/video/info',
    '/api/security/password-generator', '/api/security/password-strength', '/api/security/hash-generator', '/api/security/base64', '/api/security/uuid-generator', '/api/security/password-strength-explainer', '/api/security/data-breach-checker', '/api/security/file-hash-comparison', '/api/security/exif-location-remover', '/api/security/text-redaction', '/api/security/qr-phishing-scanner', '/api/security/secure-notes', '/api/security/url-reputation-checker',
    '/api/date-time/date-difference', '/api/date-time/working-days', '/api/date-time/countdown', '/api/date-time/world-time', '/api/date-time/age-calculator',
    '/api/dev/json-formatter', '/api/dev/regex-tester', '/api/dev/url-encoder', '/api/dev/color-converter', '/api/dev/lorem-generator', '/api/dev/jwt-decoder', '/api/dev/cron-generator', '/api/dev/uuid-generator', '/api/dev/http-header-checker', '/api/dev/api-response-formatter', '/api/dev/json-to-typescript', '/api/dev/sql-query-beautifier', '/api/dev/jwt-expiry', '/api/dev/environment-variable', '/api/dev/postman-collection', '/api/dev/dockerfile-generator', '/api/dev/curl-to-axios', '/api/dev/http-status-codes',
    '/api/education/scientific-calculator', '/api/education/percentage-calculator', '/api/education/unit-converter', '/api/education/compound-interest', '/api/education/simple-interest', '/api/education/cgpa-to-percentage', '/api/education/lcm-hcf', '/api/education/study-timetable', '/api/education/mcq-generator',
    '/api/finance/emi-calculator', '/api/finance/gst-calculator', '/api/finance/salary-calculator', '/api/finance/currency-converter', '/api/finance/burn-rate-calculator', '/api/finance/saas-pricing-calculator', '/api/finance/emi-comparison', '/api/finance/tax-slab-analyzer', '/api/finance/invoice-generator', '/api/finance/profit-margin', '/api/finance/freelancer-rate-calculator', '/api/finance/salary-breakup-generator', '/api/finance/budget-planner', '/api/finance/stock-cagr-calculator',
    '/api/internet/ip-lookup', '/api/internet/user-agent', '/api/internet/dns-lookup', '/api/internet/ssl-checker', '/api/internet/website-ping', '/api/internet/http-status', '/api/internet/port-scanner', '/api/internet/whois', '/api/internet/url-shortener', '/api/internet/website-screenshot',
    '/api/seo/meta-title-description', '/api/seo/keyword-density', '/api/seo/robots-txt-generator', '/api/seo/sitemap-validator', '/api/seo/page-speed-checklist', '/api/seo/og-image-preview', '/api/seo/broken-image-finder', '/api/seo/utm-link-builder', '/api/seo/domain-age-checker', '/api/seo/tech-stack-detector', '/api/seo/page-seo-analyzer',
    '/api/social/hashtag-generator', '/api/social/bio-generator', '/api/social/caption-formatter', '/api/social/line-break-generator', '/api/social/link-in-bio', '/api/social/meme-generator', '/api/social/post-generator', '/api/social/emoji-suggester', '/api/social/analytics', '/api/social/content-calendar',
    '/api/text/word-counter', '/api/text/case-converter', '/api/text/markdown-to-html', '/api/text/remove-spaces', '/api/text/line-sorter', '/api/text/duplicate-remover', '/api/text/text-summarizer', '/api/text/text-diff',
    '/api/zip/create', '/api/zip/extract', '/api/zip/password', '/api/zip/compression-test', '/api/zip/split', '/api/zip/merge', '/api/zip/info', '/api/zip/to-7z', '/api/zip/to-tar', '/api/zip/repair',
    '/api/blog', '/api/blog/search', '/api/blog/categories'
  ];

  // Use OPTIONS to check if endpoint exists (does not execute logic)
  const fetch = require('node-fetch');
  const base = `http://localhost:${PORT}`;
  const results = await Promise.all(endpoints.map(async (ep) => {
    try {
      const resp = await fetch(base + ep, { method: 'OPTIONS' });
      return { endpoint: ep, status: resp.status };
    } catch (e) {
      return { endpoint: ep, status: 'error', error: e.message };
    }
  }));
  res.json({ success: true, checked: results.length, results });
});

app.use('/api/v1', require('./routes/apiv1'));
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Backend running on http://localhost:${PORT}`);
});

module.exports = app;
