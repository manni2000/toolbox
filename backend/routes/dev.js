const express = require('express');
const fetch = require('node-fetch');
const { strictLimiter } = require('../middleware/security');

const router = express.Router();
router.use(strictLimiter);

router.post('/json-formatter', (req, res) => {
  const { json, indent = 2 } = req.body;
  if (!json && json !== '') return res.status(400).json({ success: false, error: 'JSON input required' });

  try {
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, parseInt(indent) || 2);
    res.json({ success: true, result: { formatted, minified: JSON.stringify(parsed), valid: true, size: formatted.length } });
  } catch (err) {
    res.json({ success: false, error: `Invalid JSON: ${err.message}`, valid: false });
  }
});

router.post('/json-to-typescript', (req, res) => {
  const { json, interfaceName = 'RootObject' } = req.body;
  if (!json) return res.status(400).json({ success: false, error: 'JSON input required' });

  try {
    const parsed = JSON.parse(json);
    const result = generateTypeScript(parsed, interfaceName);
    res.json({ success: true, result: { typescript: result } });
  } catch (err) {
    res.status(400).json({ success: false, error: `Invalid JSON: ${err.message}` });
  }
});

function generateTypeScript(obj, name, interfaces = new Map()) {
  function getType(val, key) {
    if (val === null) return 'null';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const types = [...new Set(val.map(v => getType(v, key)))];
      return types.length === 1 ? `${types[0]}[]` : `(${types.join(' | ')})[]`;
    }
    if (typeof val === 'object') {
      const innerName = key.charAt(0).toUpperCase() + key.slice(1);
      buildInterface(val, innerName);
      return innerName;
    }
    if (typeof val === 'number') return Number.isInteger(val) ? 'number' : 'number';
    return typeof val;
  }

  function buildInterface(o, n) {
    if (interfaces.has(n)) return;
    const props = Object.entries(o).map(([k, v]) => `  ${k}: ${getType(v, k)};`).join('\n');
    interfaces.set(n, `interface ${n} {\n${props}\n}`);
  }

  buildInterface(obj, name);
  return [...interfaces.values()].reverse().join('\n\n');
}

router.post('/url-encoder', (req, res) => {
  const { text, action = 'encode' } = req.body;
  if (text === undefined) return res.status(400).json({ success: false, error: 'Text required' });

  try {
    const output = action === 'encode' ? encodeURIComponent(String(text)) : decodeURIComponent(String(text));
    res.json({ success: true, result: { output, action } });
  } catch {
    res.status(400).json({ success: false, error: 'Invalid URL encoding' });
  }
});

router.post('/lorem-generator', (req, res) => {
  const { paragraphs = 1, words, sentences } = req.body;
  const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

  if (words) {
    const wordList = lorem.replace(/[.,]/g, '').split(' ');
    const count = Math.min(parseInt(words) || 10, 1000);
    const result = [];
    while (result.length < count) result.push(...wordList);
    return res.json({ success: true, result: { text: result.slice(0, count).join(' ') } });
  }

  const paragraphTexts = [];
  const loremWords = lorem.split(' ');
  const count = Math.min(parseInt(paragraphs) || 1, 20);

  for (let i = 0; i < count; i++) {
    const start = i === 0 ? 0 : Math.floor(Math.random() * 20);
    const len = 40 + Math.floor(Math.random() * 30);
    const words = [];
    for (let j = 0; j < len; j++) words.push(loremWords[(start + j) % loremWords.length]);
    paragraphTexts.push(words.join(' ') + '.');
  }

  res.json({ success: true, result: { text: paragraphTexts.join('\n\n'), paragraphs: paragraphTexts } });
});

function handleSqlBeautifier(req, res) {
  const { sql, indent = 2 } = req.body;
  if (!sql) return res.status(400).json({ success: false, error: 'SQL required' });

  try {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING',
      'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN',
      'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
      'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'LIMIT', 'OFFSET',
      'UNION', 'UNION ALL', 'DISTINCT', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'WITH', 'EXISTS', 'IN', 'NOT', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL'
    ];

    // Remove existing formatting first
    let formatted = sql.replace(/\s+/g, ' ').trim();

    // Sort keywords by length (longer first) to handle multi-word keywords
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    // Add newlines before major keywords
    for (const kw of sortedKeywords) {
      const regex = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi');
      formatted = formatted.replace(regex, (match) => {
        // Don't add newline if already at start or after newline
        const beforeLastChar = formatted[formatted.indexOf(match) - 1];
        if (beforeLastChar === '\n' || beforeLastChar === ' ') {
          return match.toUpperCase();
        }
        return `\n${match.toUpperCase()}`;
      });
    }

    // Split into lines and process
    const lines = formatted.split('\n').map(line => line.trim()).filter(Boolean);

    // Add proper indentation
    const indentStr = ' '.repeat(parseInt(indent) || 2);
    let indentedLines = [];
    let indentLevel = 0;

    for (const line of lines) {
      const upperLine = line.toUpperCase();

      // Decrease indent for certain keywords
      if (upperLine.match(/^(FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT)/)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      if (upperLine === 'END') {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add current line with indentation
      indentedLines.push(indentStr.repeat(indentLevel) + line);

      // Increase indent for certain keywords
      if (upperLine.match(/^(SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|VALUES|CASE|WHEN|THEN|ELSE|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|ON|WHERE|GROUP BY|ORDER BY|HAVING)/)) {
        indentLevel++;
      }
      if (upperLine === 'CASE') {
        indentLevel++;
      }
    }

    const finalFormatted = indentedLines.join('\n');
    res.json({ success: true, result: { formatted: finalFormatted, original: sql } });
  } catch (err) {
    res.status(500).json({ success: false, error: `Failed to format SQL: ${err.message}` });
  }
}

router.post('/sql-query-beautifier', handleSqlBeautifier);

router.post('/cron-generator', (req, res) => {
  const { minute = '*', hour = '*', dayOfMonth = '*', month = '*', dayOfWeek = '*', description } = req.body;
  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const interpretCron = (expr) => {
    const parts = expr.split(' ');
    if (parts.length !== 5) return 'Invalid cron expression';
    const [m, h, dom, mo, dow] = parts;

    if (m === '0' && h === '*' && dom === '*' && mo === '*' && dow === '*') return 'Every hour at :00';
    if (m === '0' && dom === '*' && mo === '*' && dow === '*') return `Every day at ${h}:00`;
    if (m === '*/5') return 'Every 5 minutes';
    if (m === '*/15') return 'Every 15 minutes';
    if (m === '*/30') return 'Every 30 minutes';
    if (m === '0' && h === '0') return `Daily at midnight${dom !== '*' ? ` on day ${dom}` : ''}`;
    if (dow !== '*') return `Every week on day ${dow} at ${h}:${m}`;
    return `At ${m} ${h} ${dom !== '*' ? `on day ${dom} ` : ''}${mo !== '*' ? `of month ${mo}` : ''}`;
  };

  res.json({ success: true, result: { expression, description: description || interpretCron(expression), nextRuns: [] } });
});

router.post('/http-header-checker', async (req, res, next) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL required' });

  let targetUrl = url;
  if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

  try {
    const response = await fetch(targetUrl, {
      method: 'HEAD',
      timeout: 8000,
      redirect: 'follow',
    });

    const headers = {};
    response.headers.forEach((value, key) => { headers[key] = value; });

    const securityHeaders = {
      'strict-transport-security': headers['strict-transport-security'] || null,
      'content-security-policy': headers['content-security-policy'] || null,
      'x-frame-options': headers['x-frame-options'] || null,
      'x-content-type-options': headers['x-content-type-options'] || null,
      'referrer-policy': headers['referrer-policy'] || null,
      'permissions-policy': headers['permissions-policy'] || null,
    };

    res.json({
      success: true,
      result: {
        url: targetUrl,
        statusCode: response.status,
        headers,
        securityHeaders,
        missingSecurityHeaders: Object.entries(securityHeaders).filter(([_, v]) => !v).map(([k]) => k),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: `Failed to fetch headers: ${err.message}` });
  }
});

router.post('/curl-to-axios', (req, res) => {
  const { curl } = req.body;
  if (!curl) return res.status(400).json({ success: false, error: 'cURL command required' });

  try {
    const urlMatch = curl.match(/['"']?(https?:\/\/[^'"\s]+)['"']?/);
    const methodMatch = curl.match(/-X\s+(\w+)/i);
    const headerMatches = [...curl.matchAll(/(?:-H|--header)\s+['"']([^'"']+)['"']/g)];
    const dataMatch = curl.match(/(?:-d|--data(?:-raw)?)\s+['"']([^'"']+)['"']/);

    const url = urlMatch?.[1] || '';
    const method = (methodMatch?.[1] || 'GET').toLowerCase();
    const headers = {};
    headerMatches.forEach(([, h]) => {
      const [key, ...vals] = h.split(':');
      headers[key.trim()] = vals.join(':').trim();
    });

    let data = null;
    if (dataMatch?.[1]) {
      try { data = JSON.parse(dataMatch[1]); } catch { data = dataMatch[1]; }
    }

    const axiosLines = [
      `const response = await axios.${method}(`,
      `  '${url}',`,
      ...(data ? [`  ${JSON.stringify(data, null, 2)},`] : []),
      ...(Object.keys(headers).length ? [`  { headers: ${JSON.stringify(headers, null, 2)} }`] : []),
      ');',
    ];

    res.json({ success: true, result: { axios: axiosLines.join('\n') } });
  } catch {
    res.status(400).json({ success: false, error: 'Could not parse cURL command' });
  }
});

router.post('/jwt-decoder', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'JWT token required' });

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return res.status(400).json({ success: false, error: 'Invalid JWT format' });

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? payload.exp < now : false;
    const expiresIn = payload.exp ? payload.exp - now : null;

    res.json({
      success: true,
      result: {
        header,
        payload,
        isExpired,
        expiresIn: expiresIn ? `${Math.floor(expiresIn / 60)} minutes` : 'No expiry',
        issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
        signature: parts[2],
        note: 'Signature verification requires the secret key',
      },
    });
  } catch {
    res.status(400).json({ success: false, error: 'Invalid JWT token' });
  }
});

router.get('/http-status-codes', (req, res) => {
  const codes = {
    '1xx': { name: 'Informational', codes: { 100: 'Continue', 101: 'Switching Protocols', 102: 'Processing' } },
    '2xx': { name: 'Success', codes: { 200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content', 206: 'Partial Content' } },
    '3xx': { name: 'Redirection', codes: { 301: 'Moved Permanently', 302: 'Found', 303: 'See Other', 304: 'Not Modified', 307: 'Temporary Redirect', 308: 'Permanent Redirect' } },
    '4xx': { name: 'Client Error', codes: { 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 409: 'Conflict', 422: 'Unprocessable Entity', 429: 'Too Many Requests' } },
    '5xx': { name: 'Server Error', codes: { 500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable', 504: 'Gateway Timeout' } },
  };
  res.json({ success: true, result: codes });
});

router.post('/dockerfile-generator', (req, res) => {
  const { language = 'node', version = 'latest', appPort = 3000, startCommand } = req.body;

  const nodeCmd = startCommand ? `CMD ["${startCommand}"]` : `CMD ["node", "server.js"]`;
  const templates = {
    node: `FROM node:${version}-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE ${appPort}\n${nodeCmd}`,
    python: `FROM python:${version}-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE ${appPort}\nCMD ["python", "${startCommand || 'app.py'}"]`,
    react: `FROM node:${version}-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`,
    go: `FROM golang:${version}-alpine AS build\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux go build -o main .\n\nFROM alpine:latest\nCOPY --from=build /app/main .\nEXPOSE ${appPort}\nCMD ["./main"]`,
  };

  const dockerfile = templates[language] || templates.node;
  res.json({ success: true, result: { dockerfile, language, version } });
});

router.post('/color-converter', (req, res) => {
  const { color, from = 'hex' } = req.body;
  if (!color) return res.status(400).json({ success: false, error: 'Color value required' });

  try {
    let r, g, b;
    if (from === 'hex') {
      const hex = color.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (from === 'rgb') {
      const match = color.match(/(\d+),?\s*(\d+),?\s*(\d+)/);
      if (!match) throw new Error('Invalid RGB');
      [, r, g, b] = match.map(Number);
    } else if (from === 'hsl') {
      const match = color.match(/([\d.]+),?\s*([\d.]+)%?,?\s*([\d.]+)%?/);
      if (!match) throw new Error('Invalid HSL');
      const [, h, s, l] = match.map(Number);
      [r, g, b] = hslToRgb(h / 360, s / 100, l / 100);
    }

    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    const [h, s, l] = rgbToHsl(r, g, b);

    res.json({
      success: true,
      result: {
        hex,
        rgb: { r, g, b, string: `rgb(${r}, ${g}, ${b})` },
        hsl: { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100), string: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)` },
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    g = Math.round(hue2rgb(p, q, h) * 255);
    b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
  }
  return [r, g, b];
}

router.post('/uuid-generator', (req, res) => {
  const { count = 1, version = 4 } = req.body;
  const num = Math.min(Math.max(parseInt(count) || 1, 1), 100);

  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateUUIDv1 = () => {
    const now = Date.now();
    const timeHex = now.toString(16).padStart(12, '0');
    const clockSeq = Math.floor(Math.random() * 0x3fff) | 0x8000;
    const node = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-1${timeHex.slice(9, 12)}-${clockSeq.toString(16)}-${node}`;
  };

  const generate = version === 1 ? generateUUIDv1 : generateUUIDv4;
  const uuids = Array.from({ length: num }, generate);

  res.json({ success: true, result: { uuids, count: num, version } });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
