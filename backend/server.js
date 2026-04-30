// Suppress dotenvx and logging messages
const originalConsoleLog = console.log;
console.log = () => {};
require('dotenv').config();
// Restore console.log but filter out unwanted messages
console.log = (message, ...args) => {
  if (typeof message === 'string') {
    if (message.includes('No logging configuration')) return;
    if (message.includes('injected env')) return;
  }
  return originalConsoleLog(message, ...args);
};
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { corsOptions, generalLimiter, helmetOptions, requestSanitizer, errorHandler } = require('./middleware/security');
const { cacheMiddleware } = require('./middleware/cache');

const app = express();
const PORT = 8000;


app.set('trust proxy', 1);

app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestSanitizer);
app.use(generalLimiter);



// Root route - API Documentation Landing Page
app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DailyTools247 API</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
            animation: fadeInDown 0.8s ease;
        }
        .header h1 { 
            font-size: 3em; 
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p { 
            font-size: 1.2em; 
            opacity: 0.9;
        }
        .api-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .api-category {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeInUp 0.8s ease;
        }
        .api-category:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        .api-category h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.4em;
        }
        .api-endpoint {
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
            margin: 5px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            border-left: 3px solid #667eea;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            margin-left: 10px;
        }
        .status-online { background: #d4edda; color: #155724; }
        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.8;
        }
        .health-check {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            animation: fadeIn 1s ease;
        }
        .health-check h3 { color: #28a745; margin-bottom: 10px; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 DailyTools247 API</h1>
            <p>Powerful backend APIs for all your daily tools needs</p>
        </div>

        <div class="health-check">
            <h3>✅ Server Status: Online</h3>
            <p>Server is running and ready to accept requests</p>
            <p><strong>Health Check:</strong> <a href="/api/health" style="color: #667eea;">/api/health</a></p>
        </div>

        <div class="api-grid">
            <div class="api-category">
                <h3>📄 PDF Tools</h3>
                <div class="api-endpoint">/api/pdf/html-to-pdf</div>
                <div class="api-endpoint">/api/pdf/to-image</div>
                <div class="api-endpoint">/api/pdf/to-word</div>
                <div class="api-endpoint">/api/pdf/merge</div>
                <div class="api-endpoint">/api/pdf/compress</div>
            </div>

            <div class="api-category">
                <h3>🖼️ Image Tools</h3>
                <div class="api-endpoint">/api/image/compress</div>
                <div class="api-endpoint">/api/image/convert</div>
                <div class="api-endpoint">/api/image/background-remover</div>
                <div class="api-endpoint">/api/image/qr-generator</div>
                <div class="api-endpoint">/api/image/resize</div>
            </div>

            <div class="api-category">
                <h3>🎵 Audio Tools</h3>
                <div class="api-endpoint">/api/audio/convert</div>
                <div class="api-endpoint">/api/audio/merge</div>
                <div class="api-endpoint">/api/audio/trim</div>
                <div class="api-endpoint">/api/audio/speed</div>
            </div>

            <div class="api-category">
                <h3>🎥 Video Tools</h3>
                <div class="api-endpoint">/api/video/to-audio</div>
                <div class="api-endpoint">/api/video/trim</div>
                <div class="api-endpoint">/api/video/thumbnail</div>
                <div class="api-endpoint">/api/video/compress</div>
            </div>

            <div class="api-category">
                <h3>🔒 Security Tools</h3>
                <div class="api-endpoint">/api/security/password-generator</div>
                <div class="api-endpoint">/api/security/hash-generator</div>
                <div class="api-endpoint">/api/security/base64</div>
                <div class="api-endpoint">/api/security/uuid-generator</div>
            </div>

            <div class="api-category">
                <h3>🛠️ Developer Tools</h3>
                <div class="api-endpoint">/api/dev/json-formatter</div>
                <div class="api-endpoint">/api/dev/regex-tester</div>
                <div class="api-endpoint">/api/dev/jwt-decoder</div>
                <div class="api-endpoint">/api/dev/color-converter</div>
            </div>

            <div class="api-category">
                <h3>📈 SEO Tools</h3>
                <div class="api-endpoint">/api/seo/meta-title-description</div>
                <div class="api-endpoint">/api/seo/keyword-density</div>
                <div class="api-endpoint">/api/seo/robots-txt-generator</div>
                <div class="api-endpoint">/api/seo/sitemap-validator</div>
            </div>

            <div class="api-category">
                <h3>💰 Finance Tools</h3>
                <div class="api-endpoint">/api/finance/emi-calculator</div>
                <div class="api-endpoint">/api/finance/gst-calculator</div>
                <div class="api-endpoint">/api/finance/currency-converter</div>
                <div class="api-endpoint">/api/finance/invoice-generator</div>
            </div>

            <div class="api-category">
                <h3>📚 Education Tools</h3>
                <div class="api-endpoint">/api/education/scientific-calculator</div>
                <div class="api-endpoint">/api/education/percentage-calculator</div>
                <div class="api-endpoint">/api/education/unit-converter</div>
                <div class="api-endpoint">/api/education/cgpa-to-percentage</div>
            </div>

            <div class="api-category">
                <h3>🌐 Internet Tools</h3>
                <div class="api-endpoint">/api/internet/ip-lookup</div>
                <div class="api-endpoint">/api/internet/dns-lookup</div>
                <div class="api-endpoint">/api/internet/ssl-checker</div>
                <div class="api-endpoint">/api/internet/website-screenshot</div>
            </div>

            <div class="api-category">
                <h3>📝 Text Tools</h3>
                <div class="api-endpoint">/api/text/word-counter</div>
                <div class="api-endpoint">/api/text/case-converter</div>
                <div class="api-endpoint">/api/text/markdown-to-html</div>
                <div class="api-endpoint">/api/text/text-summarizer</div>
            </div>

            <div class="api-category">
                <h3>📦 ZIP Tools</h3>
                <div class="api-endpoint">/api/zip/create</div>
                <div class="api-endpoint">/api/zip/extract</div>
                <div class="api-endpoint">/api/zip/password</div>
                <div class="api-endpoint">/api/zip/compression-test</div>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 DailyTools247 | Built with ❤️ and Node.js</p>
            <p>Server Time: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
  `);
});

app.get('/api/health', cacheMiddleware('health', 30), (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/all', async (_req, res) => {
  const endpoints = [
    '/api/pdf/html-to-pdf', '/api/pdf/to-image', '/api/pdf/to-word', '/api/pdf/to-excel', '/api/pdf/to-powerpoint', '/api/pdf/word-to-pdf', '/api/pdf/powerpoint-to-pdf', '/api/pdf/merge', '/api/pdf/split', '/api/pdf/password', '/api/pdf/unlock', '/api/pdf/remove-pages', '/api/pdf/rotate', '/api/pdf/compress', '/api/pdf/info',
    '/api/image/compress', '/api/image/convert', '/api/image/resize', '/api/image/crop', '/api/image/background-remover', '/api/image/image-to-pdf', '/api/image/qr-generator', '/api/image/qr-scanner', '/api/image/base64', '/api/image/exif-viewer', '/api/image/favicon-generator', '/api/image/dpi-checker',
    '/api/audio/convert', '/api/audio/merge', '/api/audio/trim', '/api/audio/speed', '/api/audio/speech-to-text',
    '/api/video/to-audio', '/api/video/trim', '/api/video/speed', '/api/video/thumbnail', '/api/video/resolution', '/api/video/convert', '/api/video/compress', '/api/video/info',
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

app.use((_req, res, next) => {
  if (!_req.url.startsWith('/api')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  res.setHeader('Last-Modified', new Date().toUTCString());
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, 'public');
  app.use(express.static(staticPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  }));
  
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });
}

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
