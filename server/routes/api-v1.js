const express = require('express');
const crypto = require('crypto');
const { Redis } = require('@upstash/redis');
const multer = require('multer');
const sharp = require('sharp');
const QRCode = require('qrcode');
const { PDFDocument } = require('pdf-lib');
const archiver = require('archiver');
const router = express.Router();

// ============================================
// REDIS CLIENT
// ============================================
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// ============================================
// API KEY MANAGEMENT
// ============================================
const API_KEY_PREFIX = 'apikey:';
const USER_KEYS_PREFIX = 'userkeys:';
const RATE_LIMIT_PREFIX = 'ratelimit:';

function generateApiKey() {
  const prefix = 'tb_live_';
  const randomPart = crypto.randomBytes(24).toString('hex');
  return `${prefix}${randomPart}`;
}

async function createApiKey(email, name = 'Default') {
  const apiKey = generateApiKey();
  const keyData = {
    key: apiKey,
    email,
    name,
    createdAt: Date.now(),
    status: 'active',
    tier: 'free',
    dailyLimit: parseInt(process.env.API_DAILY_LIMIT) || 100,
  };

  await redis.set(`${API_KEY_PREFIX}${apiKey}`, JSON.stringify(keyData));
  await redis.sadd(`${USER_KEYS_PREFIX}${email}`, apiKey);

  return keyData;
}

async function validateApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('tb_live_')) {
    return null;
  }

  const data = await redis.get(`${API_KEY_PREFIX}${apiKey}`);
  if (!data) {
    return null;
  }

  const keyData = typeof data === 'string' ? JSON.parse(data) : data;
  
  if (keyData.status !== 'active') {
    return null;
  }

  return keyData;
}

async function getUserApiKeys(email) {
  const keys = await redis.smembers(`${USER_KEYS_PREFIX}${email}`);
  if (!keys || keys.length === 0) {
    return [];
  }

  const keyDataPromises = keys.map(async (key) => {
    const data = await redis.get(`${API_KEY_PREFIX}${key}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  });

  const keyData = await Promise.all(keyDataPromises);
  return keyData.filter(Boolean);
}

async function revokeApiKey(apiKey, email) {
  const data = await redis.get(`${API_KEY_PREFIX}${apiKey}`);
  if (!data) {
    return false;
  }

  const keyData = typeof data === 'string' ? JSON.parse(data) : data;
  
  if (keyData.email !== email) {
    return false;
  }

  keyData.status = 'revoked';
  keyData.revokedAt = Date.now();
  
  await redis.set(`${API_KEY_PREFIX}${apiKey}`, JSON.stringify(keyData));
  return true;
}

async function deleteApiKey(apiKey, email) {
  const data = await redis.get(`${API_KEY_PREFIX}${apiKey}`);
  if (!data) {
    return false;
  }

  const keyData = typeof data === 'string' ? JSON.parse(data) : data;
  
  if (keyData.email !== email) {
    return false;
  }

  await redis.del(`${API_KEY_PREFIX}${apiKey}`);
  await redis.srem(`${USER_KEYS_PREFIX}${email}`, apiKey);
  return true;
}

// ============================================
// RATE LIMITING
// ============================================
function getDayKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
  return Math.ceil((midnight - now) / 1000);
}

async function apiRateLimit(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Please provide your API key in the X-API-Key header',
      docs: '/api/v1/docs',
    });
  }

  try {
    const keyData = await validateApiKey(apiKey);
    if (!keyData) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked',
        docs: '/api/v1/docs',
      });
    }

    const dayKey = getDayKey();
    const rateLimitKey = `${RATE_LIMIT_PREFIX}${apiKey}:${dayKey}`;
    
    const currentCount = await redis.get(rateLimitKey);
    const count = parseInt(currentCount) || 0;
    const limit = keyData.dailyLimit || 100;

    const remaining = Math.max(0, limit - count - 1);
    const resetTime = new Date();
    resetTime.setUTCHours(24, 0, 0, 0);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
    res.setHeader('X-RateLimit-Reset', Math.floor(resetTime.getTime() / 1000));
    res.setHeader('X-RateLimit-Policy', `${limit};d`);

    if (count >= limit) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `You have exceeded your daily limit of ${limit} requests. Limit resets at midnight UTC.`,
        limit,
        used: count,
        resetAt: resetTime.toISOString(),
      });
    }

    const ttl = getSecondsUntilMidnight();
    await redis.incr(rateLimitKey);
    await redis.expire(rateLimitKey, ttl);

    req.apiKeyData = keyData;
    
    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while processing your request',
    });
  }
}

async function getApiKeyUsage(apiKey) {
  const dayKey = getDayKey();
  const rateLimitKey = `${RATE_LIMIT_PREFIX}${apiKey}:${dayKey}`;
  const count = await redis.get(rateLimitKey);
  return parseInt(count) || 0;
}

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for API
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP are allowed.'));
  }
});

// PDF upload configuration
const pdfUpload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only PDF files are allowed.'));
  }
});

// General file upload for ZIP
const generalUpload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for ZIP
});

// ============================================
// API DOCUMENTATION
// ============================================
const API_DOCS = {
  openapi: '3.0.3',
  info: {
    title: 'Toolbox API',
    description: 'Powerful developer APIs for image processing, text manipulation, and more. Free tier: 100 requests/day.',
    version: '1.0.0',
    contact: {
      name: 'Daily Tools API',
      url: 'https://dailytools247.vercel.app'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'https://toolbox-backend-jet.vercel.app',
      description: 'Production server'
    }
  ],
  security: [{ ApiKeyAuth: [] }],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Your API key'
      }
    }
  },
  paths: {},
  endpoints: [
    {
      category: 'Image Processing',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/image/compress',
          name: 'Compress Image',
          description: 'Compress images to reduce file size while maintaining quality',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: true, description: 'Image file (JPEG, PNG, WebP, GIF)' },
            { name: 'quality', type: 'number', required: false, default: 80, description: 'Quality (1-100)' },
            { name: 'format', type: 'string', required: false, default: 'jpeg', description: 'Output format: jpeg, png, webp' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/image/compress" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "quality=80"`,
            response: {
              success: true,
              result: {
                compressedImage: 'data:image/jpeg;base64,...',
                originalSize: 1024000,
                compressedSize: 256000,
                compressionRatio: '75.00',
                format: 'jpeg'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/image/resize',
          name: 'Resize Image',
          description: 'Resize images to specific dimensions',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: true, description: 'Image file' },
            { name: 'width', type: 'number', required: false, description: 'Target width in pixels' },
            { name: 'height', type: 'number', required: false, description: 'Target height in pixels' },
            { name: 'maintainAspect', type: 'boolean', required: false, default: true, description: 'Maintain aspect ratio' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/image/resize" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "width=800" \\
  -F "height=600"`,
            response: {
              success: true,
              result: {
                resizedImage: 'data:image/jpeg;base64,...',
                newSize: { width: 800, height: 600 }
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/image/convert',
          name: 'Convert Image Format',
          description: 'Convert images between formats (JPEG, PNG, WebP, GIF)',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'image', type: 'file', required: true, description: 'Image file' },
            { name: 'format', type: 'string', required: true, description: 'Target format: jpeg, png, webp, gif' },
            { name: 'quality', type: 'number', required: false, default: 90, description: 'Quality (1-100)' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/image/convert" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "image=@photo.png" \\
  -F "format=webp"`,
            response: {
              success: true,
              result: {
                convertedImage: 'data:image/webp;base64,...',
                originalFormat: 'image/png',
                newFormat: 'webp'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/image/qr-generate',
          name: 'Generate QR Code',
          description: 'Generate QR codes from text or URLs',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text or URL to encode' },
            { name: 'size', type: 'number', required: false, default: 200, description: 'QR code size in pixels' },
            { name: 'errorCorrectionLevel', type: 'string', required: false, default: 'M', description: 'Error correction: L, M, Q, H' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/image/qr-generate" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "https://example.com", "size": 300}'`,
            response: {
              success: true,
              result: {
                qrCode: 'data:image/png;base64,...',
                text: 'https://example.com',
                size: 300
              }
            }
          }
        }
      ]
    },
    {
      category: 'Text Processing',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/text/word-count',
          name: 'Word Counter',
          description: 'Count words, characters, sentences, and analyze text',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to analyze' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/word-count" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello world! This is a test."}'`,
            response: {
              success: true,
              result: {
                words: 6,
                characters: 29,
                charactersNoSpaces: 24,
                sentences: 2,
                paragraphs: 1,
                readingTime: 1
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/character-count',
          name: 'Character Counter',
          description: 'Detailed character analysis including letters, digits, spaces, and special characters',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to analyze' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/character-count" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello World! 123"}'`,
            response: {
              success: true,
              result: {
                totalCharacters: 16,
                charactersNoSpaces: 14,
                letters: 10,
                digits: 3,
                specialChars: 1,
                spaces: 2
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/case-convert',
          name: 'Case Converter',
          description: 'Convert text to different cases',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to convert' },
            { name: 'caseType', type: 'string', required: true, description: 'uppercase, lowercase, titlecase, sentencecase, camelcase, pascalcase, snakecase, kebabcase' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/case-convert" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "hello world", "caseType": "titlecase"}'`,
            response: {
              success: true,
              result: {
                originalText: 'hello world',
                caseType: 'titlecase',
                convertedText: 'Hello World'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/remove-extra-spaces',
          name: 'Remove Extra Spaces',
          description: 'Clean up multiple spaces, trim lines, and remove blank lines',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to clean' },
            { name: 'options', type: 'object', required: false, description: 'Options: trimLines, removeMultipleSpaces, removeBlankLines, preserveIndentation' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/remove-extra-spaces" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello    world  ", "options": {"trimLines": true}}'`,
            response: {
              success: true,
              result: {
                processedText: 'Hello world',
                spacesRemoved: 5
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/slug-generator',
          name: 'Slug Generator',
          description: 'Generate URL-friendly slugs from text',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to convert to slug' },
            { name: 'options', type: 'object', required: false, description: 'Options: separator, lowercase, maxLength, removeStopWords, transliterate' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/slug-generator" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello World! This is a Test", "options": {"removeStopWords": true}}'`,
            response: {
              success: true,
              result: {
                originalText: 'Hello World! This is a Test',
                slug: 'hello-world-test',
                length: 16
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/sorter',
          name: 'Text Sorter',
          description: 'Sort lines, words, or paragraphs alphabetically or numerically',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to sort' },
            { name: 'options', type: 'object', required: false, description: 'Options: sortBy (lines/words/paragraphs), order (ascending/descending), caseSensitive, numeric, removeDuplicates' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/sorter" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "cherry\\napple\\nbanana", "options": {"sortBy": "lines", "order": "ascending"}}'`,
            response: {
              success: true,
              result: {
                sortedText: 'apple\nbanana\ncherry',
                itemCount: 3
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/remove-duplicates',
          name: 'Remove Duplicates',
          description: 'Remove duplicate lines, words, or characters from text',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to process' },
            { name: 'removeType', type: 'string', required: false, default: 'lines', description: 'lines, words, or characters' },
            { name: 'caseSensitive', type: 'boolean', required: false, default: true, description: 'Case sensitive comparison' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/remove-duplicates" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "apple\\nbanana\\napple", "removeType": "lines"}'`,
            response: {
              success: true,
              result: {
                processedText: 'apple\nbanana',
                duplicatesRemoved: 1
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/reverse-lines',
          name: 'Line Reverser',
          description: 'Reverse the order of lines in text',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to reverse' },
            { name: 'options', type: 'object', required: false, description: 'Options: reverseCharacters, preserveEmptyLines' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/reverse-lines" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "line1\\nline2\\nline3"}'`,
            response: {
              success: true,
              result: {
                reversedText: 'line3\nline2\nline1',
                lineCount: 3
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/find-replace',
          name: 'Find and Replace',
          description: 'Find and replace text with regex support',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to process' },
            { name: 'find', type: 'string', required: true, description: 'Text or pattern to find' },
            { name: 'replace', type: 'string', required: false, description: 'Replacement text' },
            { name: 'options', type: 'object', required: false, description: 'Options: caseSensitive, useRegex, replaceAll, wholeWord' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/find-replace" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello World", "find": "World", "replace": "Universe"}'`,
            response: {
              success: true,
              result: {
                processedText: 'Hello Universe',
                matchesFound: 1,
                replacementsMade: 1
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/add-line-numbers',
          name: 'Add Line Numbers',
          description: 'Add line numbers to text',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to number' },
            { name: 'options', type: 'object', required: false, description: 'Options: startNumber, separator, padWidth, skipEmpty' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/add-line-numbers" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "apple\\nbanana\\ncherry"}'`,
            response: {
              success: true,
              result: {
                numberedText: '1. apple\n2. banana\n3. cherry',
                totalLines: 3
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/markdown-to-html',
          name: 'Markdown to HTML',
          description: 'Convert Markdown text to HTML',
          contentType: 'application/json',
          parameters: [
            { name: 'markdown', type: 'string', required: true, description: 'Markdown text' },
            { name: 'action', type: 'string', required: false, default: 'to-html', description: 'to-html or to-plain' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/markdown-to-html" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"markdown": "# Hello\\n**Bold** text"}'`,
            response: {
              success: true,
              result: {
                output: '<h1>Hello</h1><br><strong>Bold</strong> text'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/text/summarize',
          name: 'Text Summarizer',
          description: 'Extract key sentences to summarize text',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to summarize' },
            { name: 'summaryLength', type: 'string', required: false, default: 'medium', description: 'short, medium, or long' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/text/summarize" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your long text here...", "summaryLength": "short"}'`,
            response: {
              success: true,
              result: {
                summary: 'Extracted summary...',
                compressionRatio: '60.00'
              }
            }
          }
        }
      ]
    },
    {
      category: 'PDF Tools',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/pdf/merge',
          name: 'Merge PDFs',
          description: 'Merge multiple PDF files into a single PDF',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'pdfs', type: 'file[]', required: true, description: 'Multiple PDF files to merge (max 10)' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/pdf/merge" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "pdfs=@file1.pdf" \\
  -F "pdfs=@file2.pdf"`,
            response: {
              success: true,
              result: {
                mergedPdf: 'data:application/pdf;base64,...',
                pageCount: 10,
                fileSize: 524288
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/pdf/compress',
          name: 'Compress PDF',
          description: 'Reduce PDF file size while maintaining quality',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'pdf', type: 'file', required: true, description: 'PDF file to compress' },
            { name: 'quality', type: 'string', required: false, default: 'medium', description: 'Compression quality: low, medium, high' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/pdf/compress" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "pdf=@document.pdf" \\
  -F "quality=medium"`,
            response: {
              success: true,
              result: {
                compressedPdf: 'data:application/pdf;base64,...',
                originalSize: 1048576,
                compressedSize: 524288,
                compressionRatio: '50.00'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/pdf/page-count',
          name: 'Get PDF Page Count',
          description: 'Get the number of pages in a PDF file',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'pdf', type: 'file', required: true, description: 'PDF file' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/pdf/page-count" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "pdf=@document.pdf"`,
            response: {
              success: true,
              result: {
                pageCount: 15,
                fileSize: 1048576
              }
            }
          }
        }
      ]
    },
    {
      category: 'SEO Tools',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/seo/meta-generator',
          name: 'Meta Title & Description Generator',
          description: 'Generate optimized meta titles and descriptions for SEO',
          contentType: 'application/json',
          parameters: [
            { name: 'title', type: 'string', required: true, description: 'Page title to optimize' },
            { name: 'description', type: 'string', required: false, description: 'Page description to optimize' },
            { name: 'keywords', type: 'string', required: false, description: 'Target keywords (comma-separated)' },
            { name: 'targetLength', type: 'string', required: false, default: 'standard', description: 'Target length: short, standard, long' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/seo/meta-generator" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Best Coffee Shop in NYC", "keywords": "coffee, cafe, NYC"}'`,
            response: {
              success: true,
              result: {
                optimizedTitle: 'Best Coffee Shop in NYC | Premium Coffee & Cafe',
                optimizedDescription: 'Discover the best coffee shop in NYC...',
                titleLength: 45,
                descriptionLength: 150
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/seo/keyword-density',
          name: 'Keyword Density Checker',
          description: 'Analyze keyword density and frequency in text',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text content to analyze' },
            { name: 'keywords', type: 'string', required: true, description: 'Keywords to check (comma-separated)' },
            { name: 'caseSensitive', type: 'boolean', required: false, default: false, description: 'Case sensitive matching' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/seo/keyword-density" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your article text here...", "keywords": "coffee,espresso"}'`,
            response: {
              success: true,
              result: {
                totalWords: 500,
                keywordAnalysis: [
                  { keyword: 'coffee', count: 15, density: 3.0 }
                ]
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/seo/sitemap-generator',
          name: 'Sitemap Generator',
          description: 'Generate XML or TXT sitemaps from URLs',
          contentType: 'application/json',
          parameters: [
            { name: 'urls', type: 'array', required: true, description: 'Array of URLs or URL objects with loc, lastmod, changefreq, priority' },
            { name: 'format', type: 'string', required: false, default: 'xml', description: 'Output format: xml or txt' },
            { name: 'options', type: 'object', required: false, description: 'Options: includeLastmod, defaultChangefreq, defaultPriority' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/seo/sitemap-generator" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"urls": ["https://example.com/", "https://example.com/about"], "format": "xml"}'`,
            response: {
              success: true,
              result: {
                sitemap: '<?xml version="1.0"?>...',
                urlCount: 2
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/seo/robots-txt',
          name: 'Robots.txt Generator',
          description: 'Generate a robots.txt file for your website',
          contentType: 'application/json',
          parameters: [
            { name: 'sitemapUrl', type: 'string', required: false, description: 'URL to your sitemap' },
            { name: 'disallowPaths', type: 'array', required: false, description: 'Paths to disallow' },
            { name: 'allowPaths', type: 'array', required: false, description: 'Paths to explicitly allow' },
            { name: 'crawlDelay', type: 'number', required: false, description: 'Crawl delay in seconds' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/seo/robots-txt" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"sitemapUrl": "https://example.com/sitemap.xml", "disallowPaths": ["/admin", "/private"]}'`,
            response: {
              success: true,
              result: {
                robotsTxt: 'User-agent: *\\nDisallow: /admin\\nDisallow: /private\\nSitemap: https://example.com/sitemap.xml'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/seo/og-tags-generator',
          name: 'Open Graph Tags Generator',
          description: 'Generate Open Graph and Twitter Card meta tags',
          contentType: 'application/json',
          parameters: [
            { name: 'title', type: 'string', required: true, description: 'Page title' },
            { name: 'description', type: 'string', required: false, description: 'Page description' },
            { name: 'url', type: 'string', required: false, description: 'Page URL' },
            { name: 'image', type: 'string', required: false, description: 'Image URL' },
            { name: 'siteName', type: 'string', required: false, description: 'Site name' },
            { name: 'twitterCard', type: 'string', required: false, default: 'summary_large_image', description: 'Twitter card type' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/seo/og-tags-generator" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "My Page", "description": "Description", "url": "https://example.com"}'`,
            response: {
              success: true,
              result: {
                tags: '<meta property="og:title" content="My Page">...'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/seo/canonical-generator',
          name: 'Canonical URL Generator',
          description: 'Generate canonical URLs with normalization options',
          contentType: 'application/json',
          parameters: [
            { name: 'url', type: 'string', required: true, description: 'URL to canonicalize' },
            { name: 'options', type: 'object', required: false, description: 'Options: forceHttps, removeTrailingSlash, removeWww, addWww, lowercasePath, removeQueryParams' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/seo/canonical-generator" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "http://www.example.com/Page/", "options": {"forceHttps": true, "removeWww": true}}'`,
            response: {
              success: true,
              result: {
                canonicalUrl: 'https://example.com/page',
                canonicalTag: '<link rel="canonical" href="https://example.com/page">'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/seo/utm-builder',
          name: 'UTM Link Builder',
          description: 'Build URLs with UTM tracking parameters',
          contentType: 'application/json',
          parameters: [
            { name: 'url', type: 'string', required: true, description: 'Base URL' },
            { name: 'source', type: 'string', required: true, description: 'Campaign source (e.g., google, newsletter)' },
            { name: 'medium', type: 'string', required: true, description: 'Campaign medium (e.g., cpc, email)' },
            { name: 'campaign', type: 'string', required: true, description: 'Campaign name' },
            { name: 'term', type: 'string', required: false, description: 'Campaign term (keywords)' },
            { name: 'content', type: 'string', required: false, description: 'Campaign content (A/B testing)' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/seo/utm-builder" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "source": "google", "medium": "cpc", "campaign": "spring_sale"}'`,
            response: {
              success: true,
              result: {
                utmUrl: 'https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale'
              }
            }
          }
        }
      ]
    },
    {
      category: 'ZIP Tools',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/zip/create',
          name: 'Create ZIP Archive',
          description: 'Create a ZIP archive from multiple files',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'files', type: 'file[]', required: true, description: 'Files to include in ZIP (max 20)' },
            { name: 'zipName', type: 'string', required: false, default: 'archive.zip', description: 'Name for the ZIP file' },
            { name: 'compressionLevel', type: 'number', required: false, default: 6, description: 'Compression level (0-9)' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/zip/create" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "files=@file1.txt" \\
  -F "files=@file2.jpg" \\
  -F "zipName=my-archive.zip"`,
            response: {
              success: true,
              result: {
                zipFile: 'data:application/zip;base64,...',
                filename: 'my-archive.zip',
                size: 1048576,
                filesCount: 2
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/zip/extract',
          name: 'Extract ZIP Archive',
          description: 'Extract files from a ZIP archive',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'zip', type: 'file', required: true, description: 'ZIP file to extract' },
            { name: 'extractPath', type: 'string', required: false, default: './extracted', description: 'Path for extracted files' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/zip/extract" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "zip=@archive.zip" \\
  -F "extractPath=./extracted"`,
            response: {
              success: true,
              result: {
                originalFile: 'archive.zip',
                extractedFiles: [
                  { name: 'file1.txt', path: 'file1.txt', size: 1024, type: '.txt', data: 'data:application/octet-stream;base64,...' }
                ],
                filesCount: 1,
                totalSize: 1024
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/zip/password',
          name: 'Create Password-Protected ZIP',
          description: 'Create a ZIP archive with password protection',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'files', type: 'file[]', required: true, description: 'Files to include in ZIP (max 20)' },
            { name: 'password', type: 'string', required: true, description: 'Password for protection' },
            { name: 'zipName', type: 'string', required: false, default: 'protected.zip', description: 'Name for the ZIP file' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/zip/password" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "files=@file1.txt" \\
  -F "files=@file2.jpg" \\
  -F "password=secret123" \\
  -F "zipName=protected.zip"`,
            response: {
              success: true,
              result: {
                zipName: 'protected.zip',
                password: '***',
                filesCount: 2,
                files: [
                  { name: 'file1.txt', size: 1024 },
                  { name: 'file2.jpg', size: 2048 }
                ],
                note: 'Password protection is not implemented in this demo. Please integrate with a ZIP library that supports encryption like node-7z.'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/zip/compression-test',
          name: 'Compression Level Test',
          description: 'Test different compression levels on a file to find optimal settings',
          contentType: 'multipart/form-data',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'File to test compression on' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/zip/compression-test" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "file=@largefile.pdf"`,
            response: {
              success: true,
              result: {
                originalFile: 'largefile.pdf',
                originalSize: 5242880,
                compressionResults: [
                  { level: 0, compressedSize: 5242880, compressionRatio: 0.00, spaceSaved: 0 },
                  { level: 6, compressedSize: 2621440, compressionRatio: 50.00, spaceSaved: 2621440 },
                  { level: 9, compressedSize: 2097152, compressionRatio: 60.00, spaceSaved: 3145728 }
                ],
                recommendation: {
                  bestCompression: 9,
                  fastest: 0,
                  balanced: 6,
                  recommendation: 'Use level 6 for balanced compression and speed'
                }
              }
            }
          }
        }
  ]
},
{
  category: 'Security Tools',
  endpoints: [
    {
      method: 'POST',
      path: '/api/v1/security/password-generate',
      name: 'Password Generator',
      description: 'Generate secure passwords with customizable options',
      contentType: 'application/json',
      parameters: [
        { name: 'length', type: 'number', required: false, default: 12, description: 'Password length (8-128)' },
        { name: 'includeUppercase', type: 'boolean', required: false, default: true, description: 'Include uppercase letters' },
        { name: 'includeLowercase', type: 'boolean', required: false, default: true, description: 'Include lowercase letters' },
        { name: 'includeNumbers', type: 'boolean', required: false, default: true, description: 'Include numbers' },
        { name: 'includeSymbols', type: 'boolean', required: false, default: true, description: 'Include special symbols' },
        { name: 'excludeSimilar', type: 'boolean', required: false, default: false, description: 'Exclude similar characters (0,O,l,1,etc)' }
      ],
      example: {
        curl: `curl -X POST "{{baseUrl}}/api/v1/security/password-generate" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"length": 16, "includeSymbols": true}'`,
        response: {
          success: true,
          result: {
            password: 'K7#mN9$xP2@qR5!w',
            strength: 'Very Strong',
            entropy: 95.2,
            length: 16
          }
        }
      }
    },
    {
          method: 'POST',
          path: '/api/v1/security/password-strength',
          name: 'Password Strength Checker',
          description: 'Analyze password strength and provide security score',
          contentType: 'application/json',
          parameters: [
            { name: 'password', type: 'string', required: true, description: 'Password to analyze' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/security/password-strength" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"password": "MyPassword123!"}'`,
            response: {
              success: true,
              result: {
                score: 85,
                strength: 'Strong',
                feedback: ['Consider adding more special characters'],
                entropy: 58.4,
                timeToCrack: '2 years'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/security/hash-generate',
          name: 'Hash Generator',
          description: 'Generate various hash types (MD5, SHA1, SHA256, etc.)',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to hash' },
            { name: 'algorithm', type: 'string', required: false, default: 'sha256', description: 'Hash algorithm (md5, sha1, sha256, sha512)' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/security/hash-generate" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello World", "algorithm": "sha256"}'`,
            response: {
              success: true,
              result: {
                original: 'Hello World',
                algorithm: 'sha256',
                hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/security/base64-encode',
          name: 'Base64 Encode',
          description: 'Encode text or data to Base64 format',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to encode' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/security/base64-encode" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello World"}'`,
            response: {
              success: true,
              result: {
                original: 'Hello World',
                encoded: 'SGVsbG8gV29ybGQ='
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/security/base64-decode',
          name: 'Base64 Decode',
          description: 'Decode Base64 encoded text back to original format',
          contentType: 'application/json',
          parameters: [
            { name: 'encoded', type: 'string', required: true, description: 'Base64 encoded text to decode' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/security/base64-decode" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"encoded": "SGVsbG8gV29ybGQ="}'`,
            response: {
              success: true,
              result: {
                encoded: 'SGVsbG8gV29ybGQ=',
                decoded: 'Hello World'
              }
            }
          }
        },
        {
          method: 'GET',
          path: '/api/v1/security/uuid-generate',
          name: 'UUID Generator',
          description: 'Generate UUID (v4) unique identifiers',
          contentType: 'application/json',
          parameters: [
            { name: 'count', type: 'number', required: false, default: 1, description: 'Number of UUIDs to generate (max 100)' }
          ],
          example: {
            curl: `curl -X GET "{{baseUrl}}/api/v1/security/uuid-generate?count=5" \\
  -H "X-API-Key: YOUR_API_KEY"`,
            response: {
              success: true,
              result: {
                uuids: [
                  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                  '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
                ],
                count: 2
              }
            }
          }
        }
      ]
    },
    {
      category: 'Developer Tools',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/developer/json-format',
          name: 'JSON Formatter',
          description: 'Format, validate and beautify JSON data',
          contentType: 'application/json',
          parameters: [
            { name: 'json', type: 'string', required: true, description: 'JSON string to format' },
            { name: 'indent', type: 'number', required: false, default: 2, description: 'Indentation spaces' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/json-format" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"json": "{\\"name\\":\\"John\\",\\"age\\":30}", "indent": 2}'`,
            response: {
              success: true,
              result: {
                formatted: '{\n  "name": "John",\n  "age": 30\n}',
                valid: true,
                size: 25
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/url-encode',
          name: 'URL Encoder',
          description: 'Encode and decode URLs and URL components',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to URL encode' },
            { name: 'operation', type: 'string', required: false, default: 'encode', description: 'Operation: encode or decode' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/url-encode" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello World!", "operation": "encode"}'`,
            response: {
              success: true,
              result: {
                original: 'Hello World!',
                encoded: 'Hello%20World%21',
                operation: 'encode'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/regex-test',
          name: 'Regex Tester',
          description: 'Test regular expressions against text input',
          contentType: 'application/json',
          parameters: [
            { name: 'pattern', type: 'string', required: true, description: 'Regular expression pattern' },
            { name: 'text', type: 'string', required: true, description: 'Text to test against' },
            { name: 'flags', type: 'string', required: false, default: 'g', description: 'Regex flags (g, i, m, etc.)' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/regex-test" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"pattern": "\\\\d+", "text": "I have 5 apples and 10 oranges", "flags": "g"}'`,
            response: {
              success: true,
              result: {
                matches: ['5', '10'],
                matchCount: 2,
                isValid: true
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/color-convert',
          name: 'Color Converter',
          description: 'Convert colors between HEX, RGB, HSL formats',
          contentType: 'application/json',
          parameters: [
            { name: 'color', type: 'string', required: true, description: 'Color value to convert' },
            { name: 'fromFormat', type: 'string', required: true, description: 'Source format: hex, rgb, hsl' },
            { name: 'toFormat', type: 'string', required: true, description: 'Target format: hex, rgb, hsl' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/color-convert" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"color": "#ff0000", "fromFormat": "hex", "toFormat": "rgb"}'`,
            response: {
              success: true,
              result: {
                original: '#ff0000',
                converted: 'rgb(255, 0, 0)',
                fromFormat: 'hex',
                toFormat: 'rgb'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/json-validate',
          name: 'JSON Validator',
          description: 'Validate JSON and get detailed error information',
          contentType: 'application/json',
          parameters: [
            { name: 'json', type: 'string', required: true, description: 'JSON string to validate' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/json-validate" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"json": "{\\"name\\": \\"John\\"}"}'`,
            response: {
              success: true,
              result: {
                valid: true,
                dataType: 'object',
                itemCount: 1
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/json-minify',
          name: 'JSON Minify',
          description: 'Minify JSON by removing whitespace',
          contentType: 'application/json',
          parameters: [
            { name: 'json', type: 'string', required: true, description: 'JSON string to minify' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/json-minify" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"json": "{\\n  \\"name\\": \\"John\\"\\n}"}'`,
            response: {
              success: true,
              result: {
                minified: '{"name":"John"}',
                savings: '40.00%'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/html-encode',
          name: 'HTML Encoder/Decoder',
          description: 'Encode or decode HTML entities',
          contentType: 'application/json',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to encode/decode' },
            { name: 'operation', type: 'string', required: false, default: 'encode', description: 'Operation: encode or decode' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/html-encode" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "<script>alert(1)</script>", "operation": "encode"}'`,
            response: {
              success: true,
              result: {
                processed: '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/jwt-decode',
          name: 'JWT Decoder',
          description: 'Decode JWT tokens (without verification)',
          contentType: 'application/json',
          parameters: [
            { name: 'token', type: 'string', required: true, description: 'JWT token to decode' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/jwt-decode" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'`,
            response: {
              success: true,
              result: {
                header: { alg: 'HS256', typ: 'JWT' },
                payload: { sub: '1234', name: 'John' },
                isExpired: false
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/timestamp-convert',
          name: 'Timestamp Converter',
          description: 'Convert between timestamp formats',
          contentType: 'application/json',
          parameters: [
            { name: 'value', type: 'string|number', required: true, description: 'Timestamp value' },
            { name: 'fromFormat', type: 'string', required: false, default: 'auto', description: 'unix_seconds, unix_milliseconds, or auto' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/timestamp-convert" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"value": 1704067200}'`,
            response: {
              success: true,
              result: {
                conversions: {
                  iso8601: '2024-01-01T00:00:00.000Z',
                  unix_seconds: 1704067200
                }
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/developer/lorem-ipsum',
          name: 'Lorem Ipsum Generator',
          description: 'Generate placeholder text',
          contentType: 'application/json',
          parameters: [
            { name: 'type', type: 'string', required: false, default: 'paragraphs', description: 'words, sentences, or paragraphs' },
            { name: 'count', type: 'number', required: false, default: 3, description: 'Number of items to generate' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/developer/lorem-ipsum" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "paragraphs", "count": 2}'`,
            response: {
              success: true,
              result: {
                text: 'Lorem ipsum dolor sit amet...',
                wordCount: 150
              }
            }
          }
        }
      ]
    },
    {
      category: 'Date & Time Tools',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/datetime/age-calculate',
          name: 'Age Calculator',
          description: 'Calculate age from birth date with detailed breakdown',
          contentType: 'application/json',
          parameters: [
            { name: 'birthDate', type: 'string', required: true, description: 'Birth date (YYYY-MM-DD format)' },
            { name: 'currentDate', type: 'string', required: false, description: 'Current date (defaults to today)' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/datetime/age-calculate" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"birthDate": "1990-05-15"}'`,
            response: {
              success: true,
              result: {
                years: 33,
                months: 7,
                days: 10,
                totalDays: 12280,
                nextBirthday: '2024-05-15'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/datetime/date-difference',
          name: 'Date Difference Calculator',
          description: 'Calculate difference between two dates',
          contentType: 'application/json',
          parameters: [
            { name: 'startDate', type: 'string', required: true, description: 'Start date (YYYY-MM-DD)' },
            { name: 'endDate', type: 'string', required: true, description: 'End date (YYYY-MM-DD)' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/datetime/date-difference" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"startDate": "2024-01-01", "endDate": "2024-12-31"}'`,
            response: {
              success: true,
              result: {
                days: 365,
                weeks: 52,
                months: 12,
                years: 1
              }
            }
          }
        },
        {
          method: 'GET',
          path: '/api/v1/datetime/world-time',
          name: 'World Time Zones',
          description: 'Get current time in different time zones',
          contentType: 'application/json',
          parameters: [
            { name: 'timezone', type: 'string', required: false, description: 'Specific timezone (e.g., America/New_York)' }
          ],
          example: {
            curl: `curl -X GET "{{baseUrl}}/api/v1/datetime/world-time?timezone=America/New_York" \\
  -H "X-API-Key: YOUR_API_KEY"`,
            response: {
              success: true,
              result: {
                timezone: 'America/New_York',
                currentTime: '2024-01-15T14:30:00-05:00',
                utcOffset: '-05:00'
              }
            }
          }
        }
      ]
    },
    {
      category: 'Finance Tools',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/finance/emi-calculate',
          name: 'EMI Calculator',
          description: 'Calculate Equated Monthly Installment for loans',
          contentType: 'application/json',
          parameters: [
            { name: 'principal', type: 'number', required: true, description: 'Loan amount' },
            { name: 'rate', type: 'number', required: true, description: 'Annual interest rate (%)' },
            { name: 'tenure', type: 'number', required: true, description: 'Loan tenure in months' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/finance/emi-calculate" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"principal": 1000000, "rate": 8.5, "tenure": 240}'`,
            response: {
              success: true,
              result: {
                emi: 8678,
                totalPayment: 2082720,
                totalInterest: 1082720,
                principal: 1000000
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/finance/compound-interest',
          name: 'Compound Interest Calculator',
          description: 'Calculate compound interest for investments',
          contentType: 'application/json',
          parameters: [
            { name: 'principal', type: 'number', required: true, description: 'Initial investment amount' },
            { name: 'rate', type: 'number', required: true, description: 'Annual interest rate (%)' },
            { name: 'time', type: 'number', required: true, description: 'Investment period (years)' },
            { name: 'compound', type: 'number', required: false, default: 1, description: 'Compounding frequency per year' }
          ],
          example: {
            curl: `curl -X POST "{{baseUrl}}/api/v1/finance/compound-interest" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"principal": 100000, "rate": 12, "time": 5, "compound": 12}'`,
            response: {
              success: true,
              result: {
                maturityAmount: 181939,
                interest: 81939,
                principal: 100000
              }
            }
          }
        }
      ]
    }
  ],
  rateLimit: {
    free: {
      requests: 100,
      period: 'day',
      description: 'Free tier: 100 requests per day'
    }
  }
};

// ============================================
// PUBLIC API ROUTES (NO AUTH)
// ============================================

// API Documentation
router.get('/docs', (req, res) => {
  res.json(API_DOCS);
});

// API Key Generation (public endpoint)
router.post('/keys/generate', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Check if user already has a key
    const existingKeys = await getUserApiKeys(email);
    if (existingKeys.length >= 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum API keys reached',
        message: 'You can only have up to 3 API keys. Please delete an existing key first.',
      });
    }

    const keyData = await createApiKey(email, name || 'Default');

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      data: {
        apiKey: keyData.key,
        name: keyData.name,
        tier: keyData.tier,
        dailyLimit: keyData.dailyLimit,
        createdAt: new Date(keyData.createdAt).toISOString(),
      },
      important: 'Save your API key securely. It will not be shown again in full.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create API key',
    });
  }
});

// Get user's API keys
router.post('/keys/list', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const keys = await getUserApiKeys(email);
    
    // Mask the API keys for security
    const maskedKeys = keys.map(k => ({
      key: k.key.substring(0, 12) + '...' + k.key.substring(k.key.length - 4),
      name: k.name,
      status: k.status,
      tier: k.tier,
      dailyLimit: k.dailyLimit,
      createdAt: new Date(k.createdAt).toISOString(),
    }));

    res.json({
      success: true,
      count: maskedKeys.length,
      keys: maskedKeys,
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list API keys',
    });
  }
});

// Revoke API key
router.post('/keys/revoke', async (req, res) => {
  try {
    const { email, apiKey } = req.body;

    if (!email || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Email and API key are required',
      });
    }

    const success = await revokeApiKey(apiKey, email);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'API key not found or already revoked',
      });
    }

    res.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke API key',
    });
  }
});

// ============================================
// PROTECTED API ROUTES (REQUIRE API KEY)
// ============================================


// ============================================
// IMAGE API ENDPOINTS
// ============================================

// Compress Image
router.post('/image/compress', apiRateLimit, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const { quality = 80, format = 'jpeg' } = req.body;
    const qualityNum = Math.min(100, Math.max(1, parseInt(quality)));

    let compressedImage;
    const sharpInstance = sharp(req.file.buffer);

    switch (format) {
      case 'png':
        compressedImage = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
        break;
      case 'webp':
        compressedImage = await sharpInstance.webp({ quality: qualityNum }).toBuffer();
        break;
      default:
        compressedImage = await sharpInstance.jpeg({ quality: qualityNum }).toBuffer();
    }

    res.json({
      success: true,
      result: {
        compressedImage: `data:image/${format};base64,${compressedImage.toString('base64')}`,
        originalSize: req.file.size,
        compressedSize: compressedImage.length,
        compressionRatio: ((req.file.size - compressedImage.length) / req.file.size * 100).toFixed(2),
        format,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resize Image
router.post('/image/resize', apiRateLimit, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const { width, height, maintainAspect = 'true' } = req.body;

    if (!width && !height) {
      return res.status(400).json({ success: false, error: 'Width or height is required' });
    }

    const resizeOptions = {};
    if (width) resizeOptions.width = parseInt(width);
    if (height) resizeOptions.height = parseInt(height);
    if (maintainAspect === 'true') resizeOptions.fit = 'inside';

    const resizedImage = await sharp(req.file.buffer)
      .resize(resizeOptions)
      .jpeg({ quality: 90 })
      .toBuffer();

    const metadata = await sharp(resizedImage).metadata();

    res.json({
      success: true,
      result: {
        resizedImage: `data:image/jpeg;base64,${resizedImage.toString('base64')}`,
        newSize: { width: metadata.width, height: metadata.height },
        originalFileSize: req.file.size,
        resizedFileSize: resizedImage.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Convert Image
router.post('/image/convert', apiRateLimit, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const { format = 'jpeg', quality = 90 } = req.body;
    const supportedFormats = ['jpeg', 'png', 'webp', 'gif'];

    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported format. Use jpeg, png, webp, or gif' 
      });
    }

    const qualityNum = parseInt(quality);
    const image = sharp(req.file.buffer);
    let convertedImage;

    switch (format) {
      case 'png':
        convertedImage = await image.png().toBuffer();
        break;
      case 'webp':
        convertedImage = await image.webp({ quality: qualityNum }).toBuffer();
        break;
      case 'gif':
        convertedImage = await image.gif().toBuffer();
        break;
      default:
        convertedImage = await image.jpeg({ quality: qualityNum }).toBuffer();
    }

    res.json({
      success: true,
      result: {
        convertedImage: `data:image/${format};base64,${convertedImage.toString('base64')}`,
        originalFormat: req.file.mimetype,
        newFormat: format,
        originalSize: req.file.size,
        convertedSize: convertedImage.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate QR Code
router.post('/image/qr-generate', apiRateLimit, async (req, res) => {
  try {
    const { text, size = 200, errorCorrectionLevel = 'M' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: parseInt(size),
      errorCorrectionLevel,
      margin: 1,
    });

    res.json({
      success: true,
      result: {
        qrCode: qrCodeDataUrl,
        text,
        size: parseInt(size),
        errorCorrectionLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TEXT API ENDPOINTS
// ============================================

// Word Counter
router.post('/text/word-count', apiRateLimit, (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const lines = text.split('\n').length;

    res.json({
      success: true,
      result: {
        words: words.length,
        characters,
        charactersNoSpaces,
        sentences,
        paragraphs,
        lines,
        readingTime: Math.ceil(words.length / 200),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Case Converter
router.post('/text/case-convert', apiRateLimit, (req, res) => {
  try {
    const { text, caseType } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    if (!caseType) {
      return res.status(400).json({ success: false, error: 'Case type is required' });
    }

    let result;
    switch (caseType) {
      case 'uppercase':
        result = text.toUpperCase();
        break;
      case 'lowercase':
        result = text.toLowerCase();
        break;
      case 'titlecase':
        result = text.replace(/\w\S*/g, txt => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case 'sentencecase':
        result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        break;
      case 'camelcase':
        result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '');
        break;
      case 'pascalcase':
        result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, word => 
          word.toUpperCase()
        ).replace(/\s+/g, '');
        break;
      case 'snakecase':
        result = text.toLowerCase().replace(/\s+/g, '_');
        break;
      case 'kebabcase':
        result = text.toLowerCase().replace(/\s+/g, '-');
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid case type' });
    }

    res.json({
      success: true,
      result: {
        originalText: text,
        caseType,
        convertedText: result,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Markdown to HTML
router.post('/text/markdown-to-html', apiRateLimit, (req, res) => {
  try {
    const { markdown, action = 'to-html' } = req.body;

    if (!markdown) {
      return res.status(400).json({ success: false, error: 'Markdown text is required' });
    }

    let result;
    if (action === 'to-html') {
      result = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/gim, '<br>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    } else {
      result = markdown
        .replace(/^#{1,6}\s/gm, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    }

    res.json({
      success: true,
      result: {
        originalMarkdown: markdown,
        action,
        output: result,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Text Summarizer
router.post('/text/summarize', apiRateLimit, (req, res) => {
  try {
    const { text, summaryLength = 'medium' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid sentences found' });
    }

    // Word frequency analysis
    const wordFrequency = {};
    const allWords = text.toLowerCase().split(/\s+/);
    
    allWords.forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 3) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });

    // Score sentences
    const sentenceScores = sentences.map(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      let score = 0;
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z0-9]/g, '');
        if (wordFrequency[cleanWord]) {
          score += wordFrequency[cleanWord];
        }
      });
      return { sentence, score };
    });

    sentenceScores.sort((a, b) => b.score - a.score);

    let summaryLengthNum;
    switch (summaryLength) {
      case 'short':
        summaryLengthNum = Math.max(1, Math.floor(sentences.length * 0.2));
        break;
      case 'long':
        summaryLengthNum = Math.max(3, Math.floor(sentences.length * 0.6));
        break;
      default:
        summaryLengthNum = Math.max(2, Math.floor(sentences.length * 0.4));
    }

    const topSentences = sentenceScores.slice(0, summaryLengthNum).map(item => item.sentence.trim());
    const summary = sentences.filter(s => topSentences.includes(s.trim())).join('. ') + '.';

    res.json({
      success: true,
      result: {
        summary,
        summaryLength,
        originalSentences: sentences.length,
        summarySentences: topSentences.length,
        compressionRatio: ((1 - summary.length / text.length) * 100).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove Duplicates
router.post('/text/remove-duplicates', apiRateLimit, (req, res) => {
  try {
    const { text, removeType = 'lines', caseSensitive = true } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    let result;
    let removedCount = 0;

    if (removeType === 'lines') {
      const lines = text.split('\n');
      const uniqueLines = [];
      const seen = new Set();

      for (const line of lines) {
        const key = caseSensitive ? line : line.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueLines.push(line);
        } else {
          removedCount++;
        }
      }
      result = uniqueLines.join('\n');
    } else if (removeType === 'words') {
      const words = text.split(/\s+/);
      const uniqueWords = [];
      const seen = new Set();

      for (const word of words) {
        const key = caseSensitive ? word : word.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueWords.push(word);
        } else {
          removedCount++;
        }
      }
      result = uniqueWords.join(' ');
    } else {
      const chars = text.split('');
      const uniqueChars = [];
      const seen = new Set();

      for (const char of chars) {
        const key = caseSensitive ? char : char.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueChars.push(char);
        } else {
          removedCount++;
        }
      }
      result = uniqueChars.join('');
    }

    res.json({
      success: true,
      result: {
        processedText: result,
        removeType,
        caseSensitive,
        duplicatesRemoved: removedCount,
        originalLength: text.length,
        processedLength: result.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Character Counter (separate detailed endpoint)
router.post('/text/character-count', apiRateLimit, (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const totalCharacters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const specialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
    const spaces = (text.match(/\s/g) || []).length;
    const newlines = (text.match(/\n/g) || []).length;

    res.json({
      success: true,
      result: {
        totalCharacters,
        charactersNoSpaces,
        letters,
        digits,
        specialChars,
        spaces,
        newlines,
        breakdown: {
          uppercase: (text.match(/[A-Z]/g) || []).length,
          lowercase: (text.match(/[a-z]/g) || []).length,
        }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove Extra Spaces
router.post('/text/remove-extra-spaces', apiRateLimit, (req, res) => {
  try {
    const { text, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const { 
      trimLines = true, 
      removeMultipleSpaces = true, 
      removeBlankLines = false,
      preserveIndentation = false 
    } = options;

    let result = text;
    let spacesRemoved = 0;
    const originalLength = text.length;

    if (removeMultipleSpaces) {
      if (preserveIndentation) {
        // Only remove multiple spaces not at line start
        result = result.replace(/([^\n\s])[ \t]{2,}/g, '$1 ');
      } else {
        result = result.replace(/[ \t]+/g, ' ');
      }
    }

    if (trimLines) {
      result = result.split('\n').map(line => line.trim()).join('\n');
    }

    if (removeBlankLines) {
      result = result.replace(/\n{2,}/g, '\n').trim();
    }

    spacesRemoved = originalLength - result.length;

    res.json({
      success: true,
      result: {
        processedText: result,
        originalLength,
        processedLength: result.length,
        spacesRemoved,
        options: { trimLines, removeMultipleSpaces, removeBlankLines, preserveIndentation }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Slug Generator
router.post('/text/slug-generator', apiRateLimit, (req, res) => {
  try {
    const { text, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const {
      separator = '-',
      lowercase = true,
      maxLength = 100,
      removeStopWords = false,
      transliterate = true
    } = options;

    // Common stop words to optionally remove
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'it', 'this', 'that'];

    let slug = text;

    // Basic transliteration of common accented characters
    if (transliterate) {
      const transliterationMap = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ñ': 'n', 'ç': 'c', 'ß': 'ss'
      };
      slug = slug.split('').map(char => transliterationMap[char.toLowerCase()] || char).join('');
    }

    // Convert to lowercase if option is set
    if (lowercase) {
      slug = slug.toLowerCase();
    }

    // Remove special characters, keep alphanumeric and spaces
    slug = slug.replace(/[^a-zA-Z0-9\s-]/g, '');

    // Remove stop words if option is set
    if (removeStopWords) {
      const words = slug.split(/\s+/);
      slug = words.filter(word => !stopWords.includes(word.toLowerCase())).join(' ');
    }

    // Replace spaces and multiple separators with single separator
    slug = slug.replace(/\s+/g, separator).replace(new RegExp(`${separator}+`, 'g'), separator);

    // Remove leading/trailing separators
    slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');

    // Truncate to max length (at word boundary if possible)
    if (slug.length > maxLength) {
      slug = slug.substring(0, maxLength);
      const lastSep = slug.lastIndexOf(separator);
      if (lastSep > maxLength * 0.5) {
        slug = slug.substring(0, lastSep);
      }
    }

    res.json({
      success: true,
      result: {
        originalText: text,
        slug,
        length: slug.length,
        options: { separator, lowercase, maxLength, removeStopWords, transliterate }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Text Sorter
router.post('/text/sorter', apiRateLimit, (req, res) => {
  try {
    const { text, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const {
      sortBy = 'lines',      // lines, words, paragraphs
      order = 'ascending',   // ascending, descending
      caseSensitive = false,
      numeric = false,       // Sort numerically if true
      removeDuplicates = false,
      trimItems = true
    } = options;

    let items;
    let delimiter;

    // Split based on sortBy option
    switch (sortBy) {
      case 'words':
        items = text.split(/\s+/);
        delimiter = ' ';
        break;
      case 'paragraphs':
        items = text.split(/\n\n+/);
        delimiter = '\n\n';
        break;
      case 'lines':
      default:
        items = text.split('\n');
        delimiter = '\n';
    }

    // Trim items if requested
    if (trimItems) {
      items = items.map(item => item.trim()).filter(item => item.length > 0);
    }

    // Remove duplicates if requested
    if (removeDuplicates) {
      const seen = new Set();
      items = items.filter(item => {
        const key = caseSensitive ? item : item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // Sort the items
    items.sort((a, b) => {
      let compareA = caseSensitive ? a : a.toLowerCase();
      let compareB = caseSensitive ? b : b.toLowerCase();

      if (numeric) {
        const numA = parseFloat(compareA) || 0;
        const numB = parseFloat(compareB) || 0;
        return order === 'ascending' ? numA - numB : numB - numA;
      }

      if (order === 'ascending') {
        return compareA.localeCompare(compareB);
      } else {
        return compareB.localeCompare(compareA);
      }
    });

    const result = items.join(delimiter);

    res.json({
      success: true,
      result: {
        sortedText: result,
        itemCount: items.length,
        sortBy,
        order,
        options: { caseSensitive, numeric, removeDuplicates, trimItems }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Line Reverser
router.post('/text/reverse-lines', apiRateLimit, (req, res) => {
  try {
    const { text, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const { reverseCharacters = false, preserveEmptyLines = true } = options;

    let lines = text.split('\n');
    
    if (!preserveEmptyLines) {
      lines = lines.filter(line => line.trim().length > 0);
    }

    // Reverse the order of lines
    lines = lines.reverse();

    // Optionally reverse characters in each line too
    if (reverseCharacters) {
      lines = lines.map(line => line.split('').reverse().join(''));
    }

    const result = lines.join('\n');

    res.json({
      success: true,
      result: {
        reversedText: result,
        lineCount: lines.length,
        options: { reverseCharacters, preserveEmptyLines }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Text Find and Replace
router.post('/text/find-replace', apiRateLimit, (req, res) => {
  try {
    const { text, find, replace = '', options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }
    if (find === undefined || find === null) {
      return res.status(400).json({ success: false, error: 'Find pattern is required' });
    }

    const { 
      caseSensitive = false, 
      useRegex = false, 
      replaceAll = true,
      wholeWord = false 
    } = options;

    let pattern;
    let flags = replaceAll ? 'g' : '';
    if (!caseSensitive) flags += 'i';

    try {
      if (useRegex) {
        pattern = new RegExp(find, flags);
      } else {
        // Escape special regex characters for literal search
        let escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (wholeWord) {
          escapedFind = `\\b${escapedFind}\\b`;
        }
        pattern = new RegExp(escapedFind, flags);
      }
    } catch (regexError) {
      return res.status(400).json({ success: false, error: 'Invalid search pattern', details: regexError.message });
    }

    const matches = text.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')) || [];
    const result = text.replace(pattern, replace);

    res.json({
      success: true,
      result: {
        processedText: result,
        matchesFound: matches.length,
        replacementsMade: replaceAll ? matches.length : (matches.length > 0 ? 1 : 0),
        options: { caseSensitive, useRegex, replaceAll, wholeWord }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add Line Numbers
router.post('/text/add-line-numbers', apiRateLimit, (req, res) => {
  try {
    const { text, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const {
      startNumber = 1,
      separator = '. ',
      padWidth = 0,      // 0 = auto-detect
      skipEmpty = false
    } = options;

    const lines = text.split('\n');
    const maxNum = startNumber + lines.length - 1;
    const width = padWidth || String(maxNum).length;
    
    let currentNum = startNumber;
    const numberedLines = lines.map(line => {
      if (skipEmpty && line.trim() === '') {
        return line;
      }
      const numStr = String(currentNum).padStart(width, '0');
      currentNum++;
      return `${numStr}${separator}${line}`;
    });

    res.json({
      success: true,
      result: {
        numberedText: numberedLines.join('\n'),
        totalLines: lines.length,
        numberedLines: skipEmpty ? lines.filter(l => l.trim() !== '').length : lines.length,
        options: { startNumber, separator, padWidth: width, skipEmpty }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PDF API ENDPOINTS
// ============================================

// Merge PDFs
router.post('/pdf/merge', apiRateLimit, pdfUpload.array('pdfs', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 PDF files are required' });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedBase64 = Buffer.from(mergedPdfBytes).toString('base64');

    res.json({
      success: true,
      result: {
        mergedPdf: `data:application/pdf;base64,${mergedBase64}`,
        pageCount: mergedPdf.getPageCount(),
        fileSize: mergedPdfBytes.length,
        filesProcessed: req.files.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PDF Page Count
router.post('/pdf/page-count', apiRateLimit, pdfUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file provided' });
    }

    const pdfDoc = await PDFDocument.load(req.file.buffer);

    res.json({
      success: true,
      result: {
        pageCount: pdfDoc.getPageCount(),
        fileSize: req.file.size,
        filename: req.file.originalname
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compress PDF (basic - removes metadata)
router.post('/pdf/compress', apiRateLimit, pdfUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file provided' });
    }

    const pdfDoc = await PDFDocument.load(req.file.buffer);
    
    // Remove metadata to reduce size
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
    const compressedBase64 = Buffer.from(compressedBytes).toString('base64');

    res.json({
      success: true,
      result: {
        compressedPdf: `data:application/pdf;base64,${compressedBase64}`,
        originalSize: req.file.size,
        compressedSize: compressedBytes.length,
        compressionRatio: ((req.file.size - compressedBytes.length) / req.file.size * 100).toFixed(2),
        pageCount: pdfDoc.getPageCount()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SEO API ENDPOINTS
// ============================================

// Meta Title & Description Generator
router.post('/seo/meta-generator', apiRateLimit, (req, res) => {
  try {
    const { title, description, keywords = '', targetLength = 'standard' } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    // Optimize title
    let optimizedTitle = title.replace(/\s+/g, ' ').trim();
    const maxTitleLength = targetLength === 'short' ? 50 : targetLength === 'long' ? 70 : 60;
    if (optimizedTitle.length > maxTitleLength) {
      optimizedTitle = optimizedTitle.substring(0, maxTitleLength - 3) + '...';
    }

    // Optimize description
    let optimizedDescription = description ? description.replace(/\s+/g, ' ').trim() : '';
    const maxDescLength = targetLength === 'short' ? 120 : targetLength === 'long' ? 200 : 160;
    if (optimizedDescription.length > maxDescLength) {
      optimizedDescription = optimizedDescription.substring(0, maxDescLength - 3) + '...';
    }

    // Generate suggestions
    const suggestions = [];
    if (optimizedTitle.length < 30) suggestions.push('Consider making the title longer for better SEO');
    if (optimizedDescription.length < 100) suggestions.push('Description is short. Aim for 150-160 characters');
    if (keywords && !optimizedTitle.toLowerCase().includes(keywords.split(',')[0]?.toLowerCase())) {
      suggestions.push('Consider including primary keyword in title');
    }

    res.json({
      success: true,
      result: {
        optimizedTitle,
        optimizedDescription,
        titleLength: optimizedTitle.length,
        descriptionLength: optimizedDescription.length,
        suggestions,
        htmlTags: {
          title: `<title>${optimizedTitle}</title>`,
          description: `<meta name="description" content="${optimizedDescription}">`
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Keyword Density Checker
router.post('/seo/keyword-density', apiRateLimit, (req, res) => {
  try {
    const { text, keywords, caseSensitive = false } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }
    if (!keywords) {
      return res.status(400).json({ success: false, error: 'Keywords are required' });
    }

    const keywordList = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    const totalWords = text.split(/\s+/).filter(word => word.length > 0).length;

    const keywordAnalysis = keywordList.map(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
      const matches = text.match(regex) || [];
      const count = matches.length;
      const density = ((count / totalWords) * 100).toFixed(2);

      return {
        keyword,
        count,
        density: parseFloat(density),
        status: parseFloat(density) < 1 ? 'low' : parseFloat(density) > 3 ? 'high' : 'optimal'
      };
    });

    res.json({
      success: true,
      result: {
        totalWords,
        totalCharacters: text.length,
        keywordAnalysis,
        recommendation: 'Optimal keyword density is between 1-3%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Robots.txt Generator
router.post('/seo/robots-txt', apiRateLimit, (req, res) => {
  try {
    const { sitemapUrl, disallowPaths = [], allowPaths = [], crawlDelay, userAgent = '*' } = req.body;

    let robotsTxt = `User-agent: ${userAgent}\n`;

    if (allowPaths.length > 0) {
      allowPaths.forEach(path => {
        robotsTxt += `Allow: ${path}\n`;
      });
    }

    if (disallowPaths.length > 0) {
      disallowPaths.forEach(path => {
        robotsTxt += `Disallow: ${path}\n`;
      });
    }

    if (crawlDelay) {
      robotsTxt += `Crawl-delay: ${crawlDelay}\n`;
    }

    if (sitemapUrl) {
      robotsTxt += `\nSitemap: ${sitemapUrl}`;
    }

    res.json({
      success: true,
      result: {
        robotsTxt: robotsTxt.trim(),
        preview: robotsTxt.trim().split('\n')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UTM Link Builder
router.post('/seo/utm-builder', apiRateLimit, (req, res) => {
  try {
    const { url, source, medium, campaign, term, content } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }
    if (!source || !medium || !campaign) {
      return res.status(400).json({ success: false, error: 'Source, medium, and campaign are required' });
    }

    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', medium);
    urlObj.searchParams.set('utm_campaign', campaign);
    
    if (term) urlObj.searchParams.set('utm_term', term);
    if (content) urlObj.searchParams.set('utm_content', content);

    res.json({
      success: true,
      result: {
        utmUrl: urlObj.toString(),
        parameters: {
          utm_source: source,
          utm_medium: medium,
          utm_campaign: campaign,
          utm_term: term || null,
          utm_content: content || null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sitemap Generator
router.post('/seo/sitemap-generator', apiRateLimit, (req, res) => {
  try {
    const { urls, format = 'xml', options = {} } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, error: 'URLs array is required' });
    }

    if (urls.length > 1000) {
      return res.status(400).json({ success: false, error: 'Maximum 1000 URLs allowed per request' });
    }

    const { 
      includeLastmod = true,
      defaultChangefreq = 'weekly',
      defaultPriority = 0.5
    } = options;

    // Validate and normalize URLs
    const normalizedUrls = urls.map((urlItem, index) => {
      // Handle both string URLs and objects with url, lastmod, changefreq, priority
      if (typeof urlItem === 'string') {
        return {
          loc: urlItem,
          lastmod: includeLastmod ? new Date().toISOString().split('T')[0] : null,
          changefreq: defaultChangefreq,
          priority: defaultPriority
        };
      }
      
      return {
        loc: urlItem.url || urlItem.loc,
        lastmod: urlItem.lastmod || (includeLastmod ? new Date().toISOString().split('T')[0] : null),
        changefreq: urlItem.changefreq || defaultChangefreq,
        priority: urlItem.priority !== undefined ? urlItem.priority : defaultPriority
      };
    });

    let sitemap;

    if (format === 'xml') {
      const urlEntries = normalizedUrls.map(url => {
        let entry = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`;
        if (url.lastmod) entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
        if (url.changefreq) entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
        if (url.priority !== null && url.priority !== undefined) entry += `\n    <priority>${url.priority}</priority>`;
        entry += '\n  </url>';
        return entry;
      }).join('\n');

      sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
    } else if (format === 'txt') {
      sitemap = normalizedUrls.map(url => url.loc).join('\n');
    } else {
      return res.status(400).json({ success: false, error: 'Format must be "xml" or "txt"' });
    }

    res.json({
      success: true,
      result: {
        sitemap,
        format,
        urlCount: normalizedUrls.length,
        size: sitemap.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Open Graph Meta Tags Generator
router.post('/seo/og-tags-generator', apiRateLimit, (req, res) => {
  try {
    const { 
      title, 
      description, 
      url, 
      image,
      siteName,
      type = 'website',
      locale = 'en_US',
      twitterCard = 'summary_large_image',
      twitterSite,
      twitterCreator
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const tags = [];

    // Open Graph tags
    tags.push(`<meta property="og:title" content="${escapeHtml(title)}">`);
    if (description) tags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
    if (url) tags.push(`<meta property="og:url" content="${escapeHtml(url)}">`);
    if (image) tags.push(`<meta property="og:image" content="${escapeHtml(image)}">`);
    if (siteName) tags.push(`<meta property="og:site_name" content="${escapeHtml(siteName)}">`);
    tags.push(`<meta property="og:type" content="${escapeHtml(type)}">`);
    tags.push(`<meta property="og:locale" content="${escapeHtml(locale)}">`);

    // Twitter Card tags
    tags.push(`<meta name="twitter:card" content="${escapeHtml(twitterCard)}">`);
    tags.push(`<meta name="twitter:title" content="${escapeHtml(title)}">`);
    if (description) tags.push(`<meta name="twitter:description" content="${escapeHtml(description)}">`);
    if (image) tags.push(`<meta name="twitter:image" content="${escapeHtml(image)}">`);
    if (twitterSite) tags.push(`<meta name="twitter:site" content="${escapeHtml(twitterSite)}">`);
    if (twitterCreator) tags.push(`<meta name="twitter:creator" content="${escapeHtml(twitterCreator)}">`);

    res.json({
      success: true,
      result: {
        tags: tags.join('\n'),
        tagList: tags,
        preview: {
          og: { title, description, url, image, siteName, type },
          twitter: { card: twitterCard, title, description, image, site: twitterSite }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Canonical URL Generator
router.post('/seo/canonical-generator', apiRateLimit, (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const {
      forceHttps = true,
      removeTrailingSlash = true,
      removeWww = false,
      addWww = false,
      lowercasePath = true,
      removeQueryParams = false,
      allowedQueryParams = []
    } = options;

    try {
      const urlObj = new URL(url);
      
      // Force HTTPS
      if (forceHttps) {
        urlObj.protocol = 'https:';
      }

      // Handle www
      if (removeWww && urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = urlObj.hostname.slice(4);
      } else if (addWww && !urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = 'www.' + urlObj.hostname;
      }

      // Lowercase path
      if (lowercasePath) {
        urlObj.pathname = urlObj.pathname.toLowerCase();
      }

      // Handle query params
      if (removeQueryParams) {
        if (allowedQueryParams.length > 0) {
          const newParams = new URLSearchParams();
          allowedQueryParams.forEach(param => {
            if (urlObj.searchParams.has(param)) {
              newParams.set(param, urlObj.searchParams.get(param));
            }
          });
          urlObj.search = newParams.toString();
        } else {
          urlObj.search = '';
        }
      }

      // Remove trailing slash (except for root)
      let canonicalUrl = urlObj.toString();
      if (removeTrailingSlash && canonicalUrl.endsWith('/') && urlObj.pathname !== '/') {
        canonicalUrl = canonicalUrl.slice(0, -1);
      }

      res.json({
        success: true,
        result: {
          originalUrl: url,
          canonicalUrl,
          canonicalTag: `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
          appliedRules: { forceHttps, removeTrailingSlash, removeWww, addWww, lowercasePath, removeQueryParams }
        }
      });
    } catch (urlError) {
      res.status(400).json({ success: false, error: 'Invalid URL format' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function for XML escaping
function escapeXml(str) {
  if (!str) return '';
  return str.replace(/[<>&'"]/g, char => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return char;
    }
  });
}

// Helper function for HTML escaping
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, char => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return char;
    }
  });
}

// ============================================
// ZIP API ENDPOINTS
// ============================================

// Create ZIP Archive
router.post('/zip/create', apiRateLimit, generalUpload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    const { zipName = 'archive.zip', compressionLevel = 6 } = req.body;

    const archive = archiver('zip', {
      zlib: { level: parseInt(compressionLevel) }
    });

    const buffers = [];
    archive.on('data', (data) => buffers.push(data));

    await new Promise((resolve, reject) => {
      archive.on('end', resolve);
      archive.on('error', reject);

      req.files.forEach(file => {
        archive.append(file.buffer, { name: file.originalname });
      });

      archive.finalize();
    });

    const zipBuffer = Buffer.concat(buffers);
    const zipBase64 = zipBuffer.toString('base64');

    res.json({
      success: true,
      result: {
        zipFile: `data:application/zip;base64,${zipBase64}`,
        filename: zipName,
        size: zipBuffer.length,
        filesCount: req.files.length,
        files: req.files.map(f => ({ name: f.originalname, size: f.size }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SECURITY API ENDPOINTS
// ============================================

// Password Generator
router.post('/security/password-generate', apiRateLimit, (req, res) => {
  try {
    const { 
      length = 12, 
      includeUppercase = true, 
      includeLowercase = true, 
      includeNumbers = true, 
      includeSymbols = true,
      excludeSimilar = false 
    } = req.body;

    if (length < 8 || length > 128) {
      return res.status(400).json({ success: false, error: 'Password length must be between 8 and 128' });
    }

    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }

    if (!charset) {
      return res.status(400).json({ success: false, error: 'At least one character set must be included' });
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Calculate strength
    let strengthScore = 0;
    if (password.length >= 8) strengthScore += 25;
    if (password.length >= 12) strengthScore += 25;
    if (/[a-z]/.test(password)) strengthScore += 10;
    if (/[A-Z]/.test(password)) strengthScore += 10;
    if (/[0-9]/.test(password)) strengthScore += 10;
    if (/[^A-Za-z0-9]/.test(password)) strengthScore += 20;

    const getStrengthLabel = (score) => {
      if (score < 30) return 'Weak';
      if (score < 60) return 'Fair';
      if (score < 90) return 'Good';
      return 'Very Strong';
    };

    res.json({
      success: true,
      result: {
        password,
        strength: getStrengthLabel(strengthScore),
        entropy: Math.log2(charset.length) * length,
        length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Password Strength Checker
router.post('/security/password-strength', apiRateLimit, (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');
    
    if (password.length >= 12) score += 10;
    else if (password.length >= 8) feedback.push('Consider using 12+ characters');

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 10;
    else feedback.push('Add uppercase letters');
    
    if (/[0-9]/.test(password)) score += 15;
    else feedback.push('Add numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    else feedback.push('Add special characters');

    // Avoid common patterns
    if (!/(.)\1{2,}/.test(password)) score += 10;
    else feedback.push('Avoid repeated characters');

    const getStrengthLabel = (score) => {
      if (score < 30) return 'Very Weak';
      if (score < 50) return 'Weak';
      if (score < 70) return 'Fair';
      if (score < 90) return 'Strong';
      return 'Very Strong';
    };

    // Estimate time to crack (simplified)
    const charset = /[a-z]/.test(password) ? 26 : 0 +
                   /[A-Z]/.test(password) ? 26 : 0 +
                   /[0-9]/.test(password) ? 10 : 0 +
                   /[^A-Za-z0-9]/.test(password) ? 32 : 0;
    
    const combinations = Math.pow(charset, password.length);
    const timeToCrack = combinations < 1e12 ? 'Less than a day' : 
                       combinations < 1e15 ? 'Few days' :
                       combinations < 1e18 ? 'Few months' : 
                       'Many years';

    res.json({
      success: true,
      result: {
        score,
        strength: getStrengthLabel(score),
        feedback: feedback.length ? feedback : ['Password looks good!'],
        entropy: Math.log2(charset) * password.length,
        timeToCrack
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hash Generator
router.post('/security/hash-generate', apiRateLimit, (req, res) => {
  try {
    const { text, algorithm = 'sha256' } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const validAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];
    if (!validAlgorithms.includes(algorithm.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Invalid algorithm. Use: md5, sha1, sha256, sha512' });
    }

    const hash = crypto.createHash(algorithm).update(text).digest('hex');

    res.json({
      success: true,
      result: {
        original: text,
        algorithm,
        hash
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Base64 Encode
router.post('/security/base64-encode', apiRateLimit, (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const encoded = Buffer.from(text, 'utf8').toString('base64');

    res.json({
      success: true,
      result: {
        original: text,
        encoded
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Base64 Decode
router.post('/security/base64-decode', apiRateLimit, (req, res) => {
  try {
    const { encoded } = req.body;
    
    if (!encoded) {
      return res.status(400).json({ success: false, error: 'Encoded text is required' });
    }

    try {
      const decoded = Buffer.from(encoded, 'base64').toString('utf8');
      
      res.json({
        success: true,
        result: {
          encoded,
          decoded
        }
      });
    } catch (decodeError) {
      res.status(400).json({ success: false, error: 'Invalid Base64 input' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UUID Generator
router.get('/security/uuid-generate', apiRateLimit, (req, res) => {
  try {
    const count = Math.min(parseInt(req.query.count) || 1, 100);
    
    const uuids = [];
    for (let i = 0; i < count; i++) {
      uuids.push(crypto.randomUUID());
    }

    res.json({
      success: true,
      result: {
        uuids,
        count: uuids.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// DEVELOPER API ENDPOINTS
// ============================================

// JSON Formatter
router.post('/developer/json-format', apiRateLimit, (req, res) => {
  try {
    const { json, indent = 2 } = req.body;
    
    if (!json) {
      return res.status(400).json({ success: false, error: 'JSON string is required' });
    }

    try {
      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, indent);
      
      res.json({
        success: true,
        result: {
          formatted,
          valid: true,
          size: formatted.length
        }
      });
    } catch (parseError) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid JSON format',
        details: parseError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// JSON Validator
router.post('/developer/json-validate', apiRateLimit, (req, res) => {
  try {
    const { json } = req.body;
    
    if (!json) {
      return res.status(400).json({ success: false, error: 'JSON string is required' });
    }

    let isValid = true;
    let errorDetails = null;
    let parsedData = null;
    let dataType = null;
    let itemCount = null;

    try {
      parsedData = JSON.parse(json);
      
      // Determine data type and count
      if (Array.isArray(parsedData)) {
        dataType = 'array';
        itemCount = parsedData.length;
      } else if (parsedData === null) {
        dataType = 'null';
      } else if (typeof parsedData === 'object') {
        dataType = 'object';
        itemCount = Object.keys(parsedData).length;
      } else {
        dataType = typeof parsedData;
      }
    } catch (parseError) {
      isValid = false;
      
      // Extract more useful error information
      const errorMatch = parseError.message.match(/at position (\d+)/);
      const position = errorMatch ? parseInt(errorMatch[1]) : null;
      
      // Find the line and column
      let line = 1;
      let column = 1;
      if (position !== null) {
        for (let i = 0; i < position && i < json.length; i++) {
          if (json[i] === '\n') {
            line++;
            column = 1;
          } else {
            column++;
          }
        }
      }

      errorDetails = {
        message: parseError.message,
        position,
        line,
        column,
        near: position !== null ? json.substring(Math.max(0, position - 20), Math.min(json.length, position + 20)) : null
      };
    }

    res.json({
      success: true,
      result: {
        valid: isValid,
        dataType,
        itemCount,
        size: json.length,
        error: errorDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// JSON Minify
router.post('/developer/json-minify', apiRateLimit, (req, res) => {
  try {
    const { json } = req.body;
    
    if (!json) {
      return res.status(400).json({ success: false, error: 'JSON string is required' });
    }

    try {
      const parsed = JSON.parse(json);
      const minified = JSON.stringify(parsed);
      
      res.json({
        success: true,
        result: {
          minified,
          originalSize: json.length,
          minifiedSize: minified.length,
          savings: ((json.length - minified.length) / json.length * 100).toFixed(2) + '%'
        }
      });
    } catch (parseError) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid JSON format',
        details: parseError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// HTML Encode/Decode
router.post('/developer/html-encode', apiRateLimit, (req, res) => {
  try {
    const { text, operation = 'encode' } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    const reverseEntities = Object.fromEntries(
      Object.entries(htmlEntities).map(([k, v]) => [v, k])
    );

    let result;
    if (operation === 'encode') {
      result = text.replace(/[&<>"'`=\/]/g, char => htmlEntities[char] || char);
    } else if (operation === 'decode') {
      result = text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|&#x60;|&#x3D;/g, entity => reverseEntities[entity] || entity);
      // Also handle numeric entities
      result = result.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
      result = result.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    } else {
      return res.status(400).json({ success: false, error: 'Operation must be "encode" or "decode"' });
    }

    res.json({
      success: true,
      result: {
        original: text,
        processed: result,
        operation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// JWT Decoder (decode only, no verification)
router.post('/developer/jwt-decode', apiRateLimit, (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, error: 'JWT token is required' });
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ success: false, error: 'Invalid JWT format. Expected 3 parts separated by dots.' });
    }

    try {
      // Decode header
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      
      // Decode payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      
      // Check expiration
      let isExpired = false;
      let expiresAt = null;
      if (payload.exp) {
        expiresAt = new Date(payload.exp * 1000).toISOString();
        isExpired = Date.now() > payload.exp * 1000;
      }

      res.json({
        success: true,
        result: {
          header,
          payload,
          signature: parts[2],
          isExpired,
          expiresAt,
          issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : null
        }
      });
    } catch (decodeError) {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to decode JWT',
        details: decodeError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Timestamp Converter
router.post('/developer/timestamp-convert', apiRateLimit, (req, res) => {
  try {
    const { value, fromFormat = 'auto' } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({ success: false, error: 'Timestamp value is required' });
    }

    let date;
    let detectedFormat = fromFormat;

    if (fromFormat === 'auto') {
      // Try to auto-detect the format
      if (typeof value === 'number' || /^\d+$/.test(value)) {
        const numValue = Number(value);
        // If it's a reasonable Unix timestamp (seconds)
        if (numValue > 1e9 && numValue < 1e11) {
          date = new Date(numValue * 1000);
          detectedFormat = 'unix_seconds';
        } 
        // If it's milliseconds
        else if (numValue > 1e12 && numValue < 1e15) {
          date = new Date(numValue);
          detectedFormat = 'unix_milliseconds';
        }
      } else {
        // Try parsing as ISO string
        date = new Date(value);
        detectedFormat = 'iso_string';
      }
    } else if (fromFormat === 'unix_seconds') {
      date = new Date(Number(value) * 1000);
    } else if (fromFormat === 'unix_milliseconds') {
      date = new Date(Number(value));
    } else {
      date = new Date(value);
    }

    if (!date || isNaN(date.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid timestamp value' });
    }

    res.json({
      success: true,
      result: {
        inputValue: value,
        detectedFormat,
        conversions: {
          iso8601: date.toISOString(),
          unix_seconds: Math.floor(date.getTime() / 1000),
          unix_milliseconds: date.getTime(),
          utc_string: date.toUTCString(),
          local_string: date.toString(),
          date_only: date.toISOString().split('T')[0],
          time_only: date.toISOString().split('T')[1].split('.')[0]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lorem Ipsum Generator
router.post('/developer/lorem-ipsum', apiRateLimit, (req, res) => {
  try {
    const { type = 'paragraphs', count = 3, options = {} } = req.body;

    const loremWords = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'vivamus', 'vel', 'turpis',
      'vitae', 'sapien', 'varius', 'fringilla', 'sodales', 'nibh', 'placerat', 'eget'
    ];

    const { startWithLorem = true, minWordsPerSentence = 5, maxWordsPerSentence = 15 } = options;

    const generateWord = () => loremWords[Math.floor(Math.random() * loremWords.length)];
    
    const generateSentence = (isFirst = false) => {
      const wordCount = Math.floor(Math.random() * (maxWordsPerSentence - minWordsPerSentence + 1)) + minWordsPerSentence;
      const words = [];
      
      for (let i = 0; i < wordCount; i++) {
        if (i === 0 && isFirst && startWithLorem) {
          words.push('Lorem');
        } else if (i === 1 && isFirst && startWithLorem) {
          words.push('ipsum');
        } else {
          words.push(generateWord());
        }
      }
      
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      return words.join(' ') + '.';
    };

    const generateParagraph = (isFirst = false) => {
      const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences
      const sentences = [];
      for (let i = 0; i < sentenceCount; i++) {
        sentences.push(generateSentence(isFirst && i === 0));
      }
      return sentences.join(' ');
    };

    let result;
    const safeCount = Math.min(Math.max(1, count), 100);

    switch (type) {
      case 'words':
        const words = [];
        for (let i = 0; i < safeCount; i++) {
          if (i === 0 && startWithLorem) words.push('Lorem');
          else if (i === 1 && startWithLorem) words.push('ipsum');
          else words.push(generateWord());
        }
        result = words.join(' ');
        break;
      case 'sentences':
        const sentences = [];
        for (let i = 0; i < safeCount; i++) {
          sentences.push(generateSentence(i === 0));
        }
        result = sentences.join(' ');
        break;
      case 'paragraphs':
      default:
        const paragraphs = [];
        for (let i = 0; i < safeCount; i++) {
          paragraphs.push(generateParagraph(i === 0));
        }
        result = paragraphs.join('\n\n');
    }

    res.json({
      success: true,
      result: {
        text: result,
        type,
        count: safeCount,
        characterCount: result.length,
        wordCount: result.split(/\s+/).length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// URL Encoder/Decoder
router.post('/developer/url-encode', apiRateLimit, (req, res) => {
  try {
    const { text, operation = 'encode' } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    let result;
    if (operation === 'encode') {
      result = encodeURIComponent(text);
    } else if (operation === 'decode') {
      try {
        result = decodeURIComponent(text);
      } catch (decodeError) {
        return res.status(400).json({ success: false, error: 'Invalid URL encoded string' });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Operation must be "encode" or "decode"' });
    }

    res.json({
      success: true,
      result: {
        original: text,
        [operation === 'encode' ? 'encoded' : 'decoded']: result,
        operation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Regex Tester
router.post('/developer/regex-test', apiRateLimit, (req, res) => {
  try {
    const { pattern, text, flags = 'g' } = req.body;
    
    if (!pattern || !text) {
      return res.status(400).json({ success: false, error: 'Pattern and text are required' });
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = Array.from(text.matchAll(regex), match => match[0]);
      
      res.json({
        success: true,
        result: {
          matches,
          matchCount: matches.length,
          isValid: true,
          pattern,
          flags
        }
      });
    } catch (regexError) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid regular expression',
        details: regexError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Color Converter
router.post('/developer/color-convert', apiRateLimit, (req, res) => {
  try {
    const { color, fromFormat, toFormat } = req.body;
    
    if (!color || !fromFormat || !toFormat) {
      return res.status(400).json({ success: false, error: 'Color, fromFormat, and toFormat are required' });
    }

    // Helper functions for color conversion
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgbToHex = (r, g, b) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const rgbToHsl = (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    let converted;
    
    if (fromFormat === 'hex' && toFormat === 'rgb') {
      const rgb = hexToRgb(color);
      if (!rgb) throw new Error('Invalid hex color');
      converted = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    } else if (fromFormat === 'rgb' && toFormat === 'hex') {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) throw new Error('Invalid RGB color');
      converted = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    } else if (fromFormat === 'hex' && toFormat === 'hsl') {
      const rgb = hexToRgb(color);
      if (!rgb) throw new Error('Invalid hex color');
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      converted = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported color format conversion' });
    }

    res.json({
      success: true,
      result: {
        original: color,
        converted,
        fromFormat,
        toFormat
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// DATE & TIME API ENDPOINTS
// ============================================

// Age Calculator
router.post('/datetime/age-calculate', apiRateLimit, (req, res) => {
  try {
    const { birthDate, currentDate } = req.body;
    
    if (!birthDate) {
      return res.status(400).json({ success: false, error: 'Birth date is required' });
    }

    const birth = new Date(birthDate);
    const current = currentDate ? new Date(currentDate) : new Date();
    
    if (isNaN(birth.getTime()) || isNaN(current.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date format' });
    }

    if (birth > current) {
      return res.status(400).json({ success: false, error: 'Birth date cannot be in the future' });
    }

    let years = current.getFullYear() - birth.getFullYear();
    let months = current.getMonth() - birth.getMonth();
    let days = current.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      days += new Date(current.getFullYear(), current.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((current - birth) / (1000 * 60 * 60 * 24));
    
    // Next birthday
    const nextBirthday = new Date(current.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < current) {
      nextBirthday.setFullYear(current.getFullYear() + 1);
    }

    res.json({
      success: true,
      result: {
        years,
        months,
        days,
        totalDays,
        nextBirthday: nextBirthday.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Date Difference
router.post('/datetime/date-difference', apiRateLimit, (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date format' });
    }

    const diffTime = Math.abs(end - start);
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44); // Average month length
    const years = Math.floor(days / 365.25); // Account for leap years

    res.json({
      success: true,
      result: {
        days,
        weeks,
        months,
        years,
        totalSeconds: Math.floor(diffTime / 1000)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// World Time
router.get('/datetime/world-time', apiRateLimit, (req, res) => {
  try {
    const timezone = req.query.timezone;
    
    if (timezone) {
      try {
        const now = new Date();
        const timeInZone = now.toLocaleString("en-US", { timeZone: timezone });
        const utcOffset = now.toLocaleString("en-US", { timeZone: timezone, timeZoneName: 'short' })
          .split(', ')[1].split(' ')[1];

        res.json({
          success: true,
          result: {
            timezone,
            currentTime: new Date(timeInZone).toISOString(),
            utcOffset,
            localTime: timeInZone
          }
        });
      } catch (tzError) {
        res.status(400).json({ success: false, error: 'Invalid timezone' });
      }
    } else {
      // Return multiple popular timezones
      const timezones = [
        'America/New_York', 'America/Los_Angeles', 'Europe/London', 
        'Europe/Paris', 'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney'
      ];
      
      const times = timezones.map(tz => {
        const now = new Date();
        const timeInZone = now.toLocaleString("en-US", { timeZone: tz });
        return {
          timezone: tz,
          currentTime: new Date(timeInZone).toISOString(),
          localTime: timeInZone
        };
      });

      res.json({
        success: true,
        result: { times }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// FINANCE API ENDPOINTS
// ============================================

// EMI Calculator
router.post('/finance/emi-calculate', apiRateLimit, (req, res) => {
  try {
    const { principal, rate, tenure } = req.body;
    
    if (!principal || !rate || !tenure) {
      return res.status(400).json({ success: false, error: 'Principal, rate, and tenure are required' });
    }

    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - principal;

    res.json({
      success: true,
      result: {
        emi: Math.round(emi),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest),
        principal
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compound Interest Calculator
router.post('/finance/compound-interest', apiRateLimit, (req, res) => {
  try {
    const { principal, rate, time, compound = 1 } = req.body;
    
    if (!principal || !rate || !time) {
      return res.status(400).json({ success: false, error: 'Principal, rate, and time are required' });
    }

    const maturityAmount = principal * Math.pow((1 + (rate / 100) / compound), compound * time);
    const interest = maturityAmount - principal;

    res.json({
      success: true,
      result: {
        maturityAmount: Math.round(maturityAmount),
        interest: Math.round(interest),
        principal
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// UTILITIES API ENDPOINTS
// ============================================

// Check API usage
router.get('/usage', apiRateLimit, async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const usage = await getApiKeyUsage(apiKey);
    const limit = req.apiKeyData.dailyLimit || 100;
    
    const resetTime = new Date();
    resetTime.setUTCHours(24, 0, 0, 0);

    res.json({
      success: true,
      usage: {
        used: usage,
        limit: limit,
        remaining: Math.max(0, limit - usage),
        resetAt: resetTime.toISOString(),
        tier: req.apiKeyData.tier,
      },
    });
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage',
    });
  }
});

module.exports = router;
