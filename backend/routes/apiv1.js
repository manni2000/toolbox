const express = require('express');
const crypto = require('crypto');
const { strictLimiter } = require('../middleware/security');

const router = express.Router();

const apiKeys = new Map();

function generateKey() {
  return 'dt247_' + crypto.randomBytes(24).toString('hex');
}

function getKeyUsageToday(key) {
  const record = apiKeys.get(key);
  if (!record) return null;
  const today = new Date().toDateString();
  if (record.lastReset !== today) {
    record.usageToday = 0;
    record.lastReset = today;
  }
  return record;
}

function validateApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key) {
    return res.status(401).json({ success: false, error: 'API key required. Add X-API-Key header.' });
  }
  const record = getKeyUsageToday(key);
  if (!record) {
    return res.status(401).json({ success: false, error: 'Invalid API key. Generate one at /api-docs.' });
  }
  const limit = record.tier === 'pro' ? 1000 : 100;
  if (record.usageToday >= limit) {
    return res.status(429).json({
      success: false,
      error: 'Daily API limit reached.',
      limit,
      resetAt: 'midnight UTC',
    });
  }
  record.usageToday++;
  record.totalRequests++;
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', limit - record.usageToday);
  req.apiKeyRecord = record;
  next();
}

const API_DOCUMENTATION = {
  version: '1.0.0',
  baseUrl: '/api/v1',
  description: 'DailyTools247 Developer API - 100+ tool endpoints',
  endpoints: [
    {
      category: 'Text',
      endpoints: [
        {
          method: 'POST', path: '/api/v1/text/word-count', name: 'Word Counter',
          description: 'Count words, characters, sentences in text',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to analyze' },
          ],
          example: {
            curl: `curl -X POST /api/v1/text/word-count -H "X-API-Key: YOUR_KEY" -d '{"text":"Hello world!"}'`,
            response: { success: true, result: { words: 2, characters: 12, sentences: 1 } },
          },
        },
        {
          method: 'POST', path: '/api/v1/text/case-converter', name: 'Case Converter',
          description: 'Convert text to different cases (upper, lower, title, camel, snake)',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to convert' },
            { name: 'case', type: 'string', required: true, default: 'upper', description: 'upper | lower | title | camel | snake | kebab' },
          ],
          example: {
            curl: `curl -X POST /api/v1/text/case-converter -H "X-API-Key: YOUR_KEY" -d '{"text":"hello world","case":"title"}'`,
            response: { success: true, result: { converted: 'Hello World' } },
          },
        },
        {
          method: 'POST', path: '/api/v1/text/markdown-to-html', name: 'Markdown to HTML',
          description: 'Convert Markdown text to HTML',
          contentType: 'application/json',
          parameters: [
            { name: 'markdown', type: 'string', required: true, description: 'Markdown content' },
          ],
          example: {
            curl: `curl -X POST /api/v1/text/markdown-to-html -H "X-API-Key: YOUR_KEY" -d '{"markdown":"# Hello"}'`,
            response: { success: true, result: { html: '<h1>Hello</h1>' } },
          },
        },
      ],
    },
    {
      category: 'Image',
      endpoints: [
        {
          method: 'POST', path: '/api/image/compress', name: 'Image Compressor',
          description: 'Compress images (JPEG, PNG, WebP) with quality control',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: true, description: 'Image file (JPEG, PNG, WebP, GIF, AVIF)' },
            { name: 'quality', type: 'number', required: false, default: 80, description: 'Quality 1-100' },
          ],
          example: {
            curl: `curl -X POST /api/image/compress -H "X-API-Key: YOUR_KEY" -F "image=@photo.jpg" -F "quality=75"`,
            response: 'Binary image data',
          },
        },
        {
          method: 'POST', path: '/api/image/resize', name: 'Image Resizer',
          description: 'Resize images to specified dimensions',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: true, description: 'Image file' },
            { name: 'width', type: 'number', required: false, description: 'Target width in pixels' },
            { name: 'height', type: 'number', required: false, description: 'Target height in pixels' },
            { name: 'maintainAspect', type: 'boolean', required: false, default: true, description: 'Maintain aspect ratio' },
          ],
          example: {
            curl: `curl -X POST /api/image/resize -H "X-API-Key: YOUR_KEY" -F "image=@photo.jpg" -F "width=800"`,
            response: 'Binary image data',
          },
        },
        {
          method: 'POST', path: '/api/image/convert', name: 'Image Format Converter',
          description: 'Convert images between formats: JPEG, PNG, WebP, AVIF, TIFF',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: true, description: 'Source image file' },
            { name: 'format', type: 'string', required: true, default: 'png', description: 'jpeg | png | webp | avif | tiff' },
          ],
          example: {
            curl: `curl -X POST /api/image/convert -H "X-API-Key: YOUR_KEY" -F "image=@photo.png" -F "format=webp"`,
            response: 'Binary image data',
          },
        },
        {
          method: 'POST', path: '/api/image/qr-generator', name: 'QR Code Generator',
          description: 'Generate QR codes for any text or URL',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text or URL to encode' },
            { name: 'size', type: 'number', required: false, default: 300, description: 'Size in pixels (64-1024)' },
            { name: 'format', type: 'string', required: false, default: 'png', description: 'png | svg | base64' },
            { name: 'errorCorrectionLevel', type: 'string', required: false, default: 'M', description: 'L | M | Q | H' },
            { name: 'darkColor', type: 'string', required: false, default: '#000000', description: 'QR dark color hex' },
            { name: 'lightColor', type: 'string', required: false, default: '#ffffff', description: 'QR light color hex' },
          ],
          example: {
            curl: `curl -X POST /api/image/qr-generator -H "X-API-Key: YOUR_KEY" -d '{"text":"https://dailytools247.app","size":300}'`,
            response: 'Binary PNG image',
          },
        },
        {
          method: 'POST', path: '/api/image/qr-scanner', name: 'QR Code Scanner',
          description: 'Scan and decode QR codes from images',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: true, description: 'Image containing QR code (PNG, JPEG, WebP)' },
          ],
          example: {
            curl: `curl -X POST /api/image/qr-scanner -H "X-API-Key: YOUR_KEY" -F "image=@qrcode.png"`,
            response: { success: true, result: { text: 'https://example.com', version: 2 } },
          },
        },
        {
          method: 'POST', path: '/api/image/dpi-checker', name: 'DPI Checker',
          description: 'Check image DPI and print dimensions',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: true, description: 'Image file' },
          ],
          example: {
            curl: `curl -X POST /api/image/dpi-checker -H "X-API-Key: YOUR_KEY" -F "image=@photo.jpg"`,
            response: { success: true, result: { dpi: 72, width: 1920, height: 1080, quality: 'Screen (72-149 DPI)' } },
          },
        },
        {
          method: 'POST', path: '/api/image/base64', name: 'Image Base64',
          description: 'Encode image to Base64 or decode Base64 to image',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: false, description: 'Image file (for encoding)' },
            { name: 'action', type: 'string', required: false, default: 'encode', description: 'encode | decode' },
            { name: 'data', type: 'string', required: false, description: 'Base64 string (for decoding)' },
          ],
          example: {
            curl: `curl -X POST /api/image/base64 -H "X-API-Key: YOUR_KEY" -F "image=@photo.jpg" -F "action=encode"`,
            response: { success: true, result: { base64: '...', dataUrl: 'data:image/jpeg;base64,...' } },
          },
        },
      ],
    },
    {
      category: 'PDF',
      endpoints: [
        {
          method: 'POST', path: '/api/pdf/merge', name: 'PDF Merge',
          description: 'Merge multiple PDF files into one',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'files', type: 'file[]', required: true, description: 'PDF files to merge (2-20 files)' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/merge -H "X-API-Key: YOUR_KEY" -F "files=@doc1.pdf" -F "files=@doc2.pdf"`,
            response: 'Binary PDF data',
          },
        },
        {
          method: 'POST', path: '/api/pdf/split', name: 'PDF Split',
          description: 'Extract a range of pages from a PDF',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'PDF file to split' },
            { name: 'fromPage', type: 'number', required: false, default: 1, description: 'Start page (1-indexed)' },
            { name: 'toPage', type: 'number', required: false, description: 'End page (default: last page)' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/split -H "X-API-Key: YOUR_KEY" -F "file=@doc.pdf" -F "fromPage=1" -F "toPage=3"`,
            response: 'Binary PDF data',
          },
        },
        {
          method: 'POST', path: '/api/pdf/compress', name: 'PDF Compress',
          description: 'Compress a PDF to reduce file size',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'PDF file to compress' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/compress -H "X-API-Key: YOUR_KEY" -F "file=@doc.pdf"`,
            response: 'Binary PDF data',
          },
        },
        {
          method: 'POST', path: '/api/pdf/info', name: 'PDF Info',
          description: 'Get metadata and info from a PDF file',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'PDF file to inspect' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/info -H "X-API-Key: YOUR_KEY" -F "file=@doc.pdf"`,
            response: { success: true, result: { pageCount: 5, title: 'My Doc', author: null, fileSizeKB: '120.50' } },
          },
        },
        {
          method: 'POST', path: '/api/pdf/password', name: 'PDF Password Protect',
          description: 'Add password protection to a PDF',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'PDF file' },
            { name: 'password', type: 'string', required: true, description: 'Password to protect the PDF' },
            { name: 'ownerPassword', type: 'string', required: false, description: 'Owner password (optional)' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/password -H "X-API-Key: YOUR_KEY" -F "file=@doc.pdf" -F "password=secret123"`,
            response: 'Binary PDF data',
          },
        },
        {
          method: 'POST', path: '/api/pdf/rotate', name: 'PDF Rotate',
          description: 'Rotate pages in a PDF',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'PDF file' },
            { name: 'rotation', type: 'number', required: false, default: 90, description: 'Degrees: 90, 180, 270' },
            { name: 'pages', type: 'string', required: false, description: 'Page numbers (e.g. "1,3") or "all"' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/rotate -H "X-API-Key: YOUR_KEY" -F "file=@doc.pdf" -F "rotation=90"`,
            response: 'Binary PDF data',
          },
        },
        {
          method: 'POST', path: '/api/pdf/html-to-pdf', name: 'HTML to PDF',
          description: 'Convert HTML content to a PDF document',
          contentType: 'application/json',
          parameters: [
            { name: 'html', type: 'string', required: true, description: 'HTML content to convert' },
            { name: 'title', type: 'string', required: false, default: 'Document', description: 'PDF document title' },
            { name: 'fontSize', type: 'number', required: false, default: 12, description: 'Base font size (8-18)' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/html-to-pdf -H "X-API-Key: YOUR_KEY" -d '{"html":"<h1>Hello</h1><p>World</p>","title":"My Doc"}'`,
            response: 'Binary PDF data',
          },
        },
        {
          method: 'POST', path: '/api/pdf/to-word', name: 'PDF to Word',
          description: 'Extract text from PDF and create a Word (.docx) document',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'PDF file to convert' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/to-word -H "X-API-Key: YOUR_KEY" -F "file=@doc.pdf"`,
            response: 'Binary DOCX data',
          },
        },
        {
          method: 'POST', path: '/api/pdf/to-excel', name: 'PDF to Excel',
          description: 'Extract tabular text from PDF and create an Excel (.xlsx) file',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'PDF file to convert' },
          ],
          example: {
            curl: `curl -X POST /api/pdf/to-excel -H "X-API-Key: YOUR_KEY" -F "file=@doc.pdf"`,
            response: 'Binary XLSX data',
          },
        },
      ],
    },
    {
      category: 'Security',
      endpoints: [
        {
          method: 'POST', path: '/api/security/password-generator', name: 'Password Generator',
          description: 'Generate secure random passwords',
          contentType: 'application/json',
          parameters: [
            { name: 'length', type: 'number', required: false, default: 16, description: 'Password length (8-128)' },
            { name: 'uppercase', type: 'boolean', required: false, default: true, description: 'Include uppercase' },
            { name: 'lowercase', type: 'boolean', required: false, default: true, description: 'Include lowercase' },
            { name: 'numbers', type: 'boolean', required: false, default: true, description: 'Include numbers' },
            { name: 'symbols', type: 'boolean', required: false, default: true, description: 'Include symbols' },
          ],
          example: {
            curl: `curl -X POST /api/security/password-generator -H "X-API-Key: YOUR_KEY" -d '{"length":20,"symbols":true}'`,
            response: { success: true, result: { password: 'xK3#mP9@qL7$nR2!vT5^', strength: 'Very Strong' } },
          },
        },
        {
          method: 'POST', path: '/api/security/hash-generator', name: 'Hash Generator',
          description: 'Generate MD5, SHA1, SHA256, SHA512 hashes',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to hash' },
            { name: 'algorithm', type: 'string', required: false, default: 'sha256', description: 'md5 | sha1 | sha256 | sha512' },
          ],
          example: {
            curl: `curl -X POST /api/security/hash-generator -H "X-API-Key: YOUR_KEY" -d '{"text":"hello","algorithm":"sha256"}'`,
            response: { success: true, result: { hash: '2cf24dba...', algorithm: 'sha256' } },
          },
        },
        {
          method: 'POST', path: '/api/security/uuid-generator', name: 'UUID Generator',
          description: 'Generate RFC 4122 UUIDs',
          contentType: 'application/json',
          parameters: [
            { name: 'count', type: 'number', required: false, default: 1, description: 'Number of UUIDs to generate (1-100)' },
          ],
          example: {
            curl: `curl -X POST /api/security/uuid-generator -H "X-API-Key: YOUR_KEY" -d '{"count":3}'`,
            response: { success: true, result: { uuids: ['...', '...', '...'] } },
          },
        },
      ],
    },
    {
      category: 'Developer',
      endpoints: [
        {
          method: 'POST', path: '/api/dev/json-formatter', name: 'JSON Formatter',
          description: 'Format, validate and minify JSON',
          contentType: 'application/json',
          parameters: [
            { name: 'json', type: 'string', required: true, description: 'JSON string to format' },
            { name: 'action', type: 'string', required: false, default: 'format', description: 'format | minify | validate' },
            { name: 'indent', type: 'number', required: false, default: 2, description: 'Indentation spaces' },
          ],
          example: {
            curl: `curl -X POST /api/dev/json-formatter -H "X-API-Key: YOUR_KEY" -d '{"json":"{\"a\":1}","action":"format"}'`,
            response: { success: true, result: { formatted: '{\n  "a": 1\n}', valid: true } },
          },
        },
        {
          method: 'POST', path: '/api/dev/url-encoder', name: 'URL Encoder/Decoder',
          description: 'Encode or decode URLs',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'URL or text to encode/decode' },
            { name: 'action', type: 'string', required: false, default: 'encode', description: 'encode | decode' },
          ],
          example: {
            curl: `curl -X POST /api/dev/url-encoder -H "X-API-Key: YOUR_KEY" -d '{"text":"hello world","action":"encode"}'`,
            response: { success: true, result: { output: 'hello%20world' } },
          },
        },
      ],
    },
    {
      category: 'Finance',
      endpoints: [
        {
          method: 'POST', path: '/api/finance/emi-calculator', name: 'EMI Calculator',
          description: 'Calculate loan EMI (Equated Monthly Installment)',
          contentType: 'application/json',
          parameters: [
            { name: 'principal', type: 'number', required: true, description: 'Loan amount' },
            { name: 'rate', type: 'number', required: true, description: 'Annual interest rate (%)' },
            { name: 'tenure', type: 'number', required: true, description: 'Loan tenure in months' },
          ],
          example: {
            curl: `curl -X POST /api/finance/emi-calculator -H "X-API-Key: YOUR_KEY" -d '{"principal":500000,"rate":8.5,"tenure":60}'`,
            response: { success: true, result: { emi: 10233.4, totalPayment: 614004, totalInterest: 114004 } },
          },
        },
      ],
    },
  ],
};

router.post('/keys/generate', strictLimiter, (req, res) => {
  const { email, name = 'Default' } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email required' });
  }

  const emailKeys = [...apiKeys.values()].filter(k => k.email === email);
  if (emailKeys.length >= 3) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 3 API keys per email. Delete an existing key to create a new one.',
    });
  }

  const key = generateKey();
  const today = new Date().toDateString();

  apiKeys.set(key, {
    key,
    name,
    email,
    status: 'active',
    tier: 'free',
    dailyLimit: 100,
    usageToday: 0,
    totalRequests: 0,
    lastReset: today,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    data: {
      apiKey: key,
      name,
      email,
      tier: 'free',
      dailyLimit: 100,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  });
});

router.post('/keys/list', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email required' });
  }

  const keys = [...apiKeys.values()]
    .filter(k => k.email === email)
    .map(k => ({
      key: k.key.substring(0, 12) + '...',
      name: k.name,
      status: k.status,
      tier: k.tier,
      dailyLimit: k.dailyLimit,
      usageToday: k.usageToday,
      totalRequests: k.totalRequests,
      createdAt: k.createdAt,
    }));

  res.json({ success: true, keys });
});

router.get('/docs', (req, res) => {
  res.json({
    success: true,
    ...API_DOCUMENTATION,
  });
});

router.post('/text/word-count', validateApiKey, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'text is required' });

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  const lines = text.split('\n').length;
  const readingTime = Math.max(1, Math.round(words / 200));

  res.json({
    success: true,
    result: { words, characters, charactersNoSpaces, sentences, paragraphs, lines, readingTimeMinutes: readingTime },
  });
});

router.post('/text/case-converter', validateApiKey, (req, res) => {
  const { text, case: targetCase = 'upper' } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'text is required' });

  let converted;
  switch (targetCase.toLowerCase()) {
    case 'upper': converted = text.toUpperCase(); break;
    case 'lower': converted = text.toLowerCase(); break;
    case 'title': converted = text.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()); break;
    case 'camel': converted = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()); break;
    case 'snake': converted = text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); break;
    case 'kebab': converted = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); break;
    case 'sentence': converted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); break;
    default: return res.status(400).json({ success: false, error: 'Invalid case. Use: upper, lower, title, camel, snake, kebab, sentence' });
  }

  res.json({ success: true, result: { original: text, converted, case: targetCase } });
});

router.post('/text/markdown-to-html', validateApiKey, (req, res) => {
  const { markdown } = req.body;
  if (!markdown) return res.status(400).json({ success: false, error: 'markdown is required' });

  let html = markdown
    .replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[a-z])/gm, '<p>')
    .replace(/(?<!\>)\n/g, '<br>');

  res.json({ success: true, result: { html } });
});

router.post('/security/password-generator', validateApiKey, (req, res) => {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    count = 1,
  } = req.body;

  const len = Math.min(Math.max(parseInt(length) || 16, 8), 128);
  let charset = '';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const generateOne = () => {
    let pw = '';
    for (let i = 0; i < len; i++) {
      pw += charset[crypto.randomInt(charset.length)];
    }
    return pw;
  };

  const passwords = Array.from({ length: Math.min(parseInt(count) || 1, 10) }, generateOne);
  const pw = passwords[0];
  let strength = 'Weak';
  if (len >= 12 && uppercase && lowercase && numbers && symbols) strength = 'Very Strong';
  else if (len >= 10 && ((uppercase && lowercase && numbers) || (uppercase && lowercase && symbols))) strength = 'Strong';
  else if (len >= 8 && ((uppercase && lowercase) || (lowercase && numbers))) strength = 'Medium';

  res.json({
    success: true,
    result: {
      password: pw,
      passwords: passwords.length > 1 ? passwords : undefined,
      length: len,
      strength,
    },
  });
});

router.post('/security/hash-generator', validateApiKey, (req, res) => {
  const { text, algorithm = 'sha256', encoding = 'hex' } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'text is required' });

  const validAlgorithms = ['md5', 'sha1', 'sha256', 'sha512', 'sha224', 'sha384'];
  const alg = algorithm.toLowerCase();
  if (!validAlgorithms.includes(alg)) {
    return res.status(400).json({ success: false, error: `Invalid algorithm. Use: ${validAlgorithms.join(', ')}` });
  }

  const hash = crypto.createHash(alg).update(text).digest(encoding === 'base64' ? 'base64' : 'hex');
  res.json({ success: true, result: { hash, algorithm: alg, encoding: encoding === 'base64' ? 'base64' : 'hex', inputLength: text.length } });
});

router.post('/security/uuid-generator', validateApiKey, (req, res) => {
  const count = Math.min(Math.max(parseInt(req.body.count) || 1, 1), 100);
  const uuids = Array.from({ length: count }, () => crypto.randomUUID());
  res.json({ success: true, result: { uuids, count } });
});

router.post('/dev/json-formatter', validateApiKey, (req, res) => {
  const { json, action = 'format', indent = 2 } = req.body;
  if (!json) return res.status(400).json({ success: false, error: 'json is required' });

  try {
    const parsed = JSON.parse(json);
    let result;
    if (action === 'minify') {
      result = JSON.stringify(parsed);
    } else if (action === 'validate') {
      return res.json({ success: true, result: { valid: true, type: typeof parsed, keys: typeof parsed === 'object' ? Object.keys(parsed).length : null } });
    } else {
      result = JSON.stringify(parsed, null, parseInt(indent) || 2);
    }
    res.json({ success: true, result: { formatted: result, valid: true, action } });
  } catch (e) {
    res.json({ success: true, result: { valid: false, error: e.message, action: 'validate' } });
  }
});

router.post('/dev/url-encoder', validateApiKey, (req, res) => {
  const { text, action = 'encode' } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'text is required' });

  const output = action === 'decode' ? decodeURIComponent(text) : encodeURIComponent(text);
  res.json({ success: true, result: { input: text, output, action } });
});

router.post('/finance/emi-calculator', validateApiKey, (req, res) => {
  const { principal, rate, tenure } = req.body;
  if (!principal || !rate || !tenure) {
    return res.status(400).json({ success: false, error: 'principal, rate, and tenure are required' });
  }

  const p = parseFloat(principal);
  const r = parseFloat(rate) / 100 / 12;
  const n = parseInt(tenure);

  if (r === 0) {
    const emi = p / n;
    return res.json({ success: true, result: { emi: +emi.toFixed(2), totalPayment: +(emi * n).toFixed(2), totalInterest: 0, principal: p } });
  }

  const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;

  res.json({
    success: true,
    result: {
      emi: +emi.toFixed(2),
      totalPayment: +totalPayment.toFixed(2),
      totalInterest: +totalInterest.toFixed(2),
      principal: p,
      rate: parseFloat(rate),
      tenure: n,
    },
  });
});

router.get('/health', (req, res) => {
  res.json({ success: true, version: '1.0.0', status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
