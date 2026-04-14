const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { strictLimiter, uploadLimiter } = require('../middleware/security');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/password-generator', strictLimiter, (req, res) => {
  const { length = 16, uppercase = true, lowercase = true, numbers = true, symbols = true } = req.body;
  const len = Math.min(Math.max(parseInt(length) || 16, 4), 128);

  let chars = '';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) chars += '0123456789';
  if (symbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

  let password = '';
  const randomBytes = crypto.randomBytes(len * 2);
  for (let i = 0; i < len; i++) {
    password += chars[randomBytes[i] % chars.length];
  }

  const strength = calcStrength(password);
  res.json({ success: true, result: { password, strength, length: password.length } });
});

function calcStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return 'Weak';
  if (score <= 4) return 'Fair';
  if (score <= 6) return 'Strong';
  return 'Very Strong';
}

router.post('/password-strength', strictLimiter, (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
    noCommonPatterns: !/^(password|123456|qwerty|abc123)/i.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  let strengthLabel = 'Very Weak';
  let score = Math.round((passedChecks / 6) * 100);

  if (passedChecks <= 1) strengthLabel = 'Very Weak';
  else if (passedChecks === 2) strengthLabel = 'Weak';
  else if (passedChecks === 3) strengthLabel = 'Fair';
  else if (passedChecks === 4) strengthLabel = 'Good';
  else if (passedChecks === 5) strengthLabel = 'Strong';
  else strengthLabel = 'Very Strong';

  const suggestions = [];
  if (!checks.length) suggestions.push('Use at least 8 characters');
  if (!checks.uppercase) suggestions.push('Add uppercase letters');
  if (!checks.lowercase) suggestions.push('Add lowercase letters');
  if (!checks.numbers) suggestions.push('Include numbers');
  if (!checks.symbols) suggestions.push('Add special characters (!@#$%...)');
  if (!checks.noCommonPatterns) suggestions.push('Avoid common password patterns');

  res.json({ success: true, result: { score, strengthLabel, checks, suggestions, length: password.length } });
});

router.post('/password-strength-explainer', strictLimiter, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, error: 'Password required' });

  const entropy = calcEntropy(password);
  const crackTime = estimateCrackTime(entropy);

  res.json({
    success: true,
    result: {
      entropy: Math.round(entropy),
      crackTime,
      strength: calcStrength(password),
      length: password.length,
      patterns: analyzePatterns(password),
    },
  });
});

function calcEntropy(pwd) {
  let charsetSize = 0;
  if (/[a-z]/.test(pwd)) charsetSize += 26;
  if (/[A-Z]/.test(pwd)) charsetSize += 26;
  if (/[0-9]/.test(pwd)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) charsetSize += 32;
  return pwd.length * Math.log2(Math.max(charsetSize, 1));
}

function estimateCrackTime(entropy) {
  const guessesPerSecond = 1e10;
  const seconds = Math.pow(2, entropy) / guessesPerSecond;
  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
  return 'Centuries';
}

function analyzePatterns(pwd) {
  const patterns = [];
  if (/(.)\1{2,}/.test(pwd)) patterns.push('Repeated characters detected');
  if (/012|123|234|345|456|567|678|789|890/.test(pwd)) patterns.push('Sequential numbers detected');
  if (/abc|bcd|cde|def|efg|fgh|ghi/.test(pwd.toLowerCase())) patterns.push('Sequential letters detected');
  if (/^[a-zA-Z]+$/.test(pwd)) patterns.push('Only letters — add numbers/symbols');
  if (/^[0-9]+$/.test(pwd)) patterns.push('Only numbers — add letters/symbols');
  return patterns;
}

router.post('/hash-generator', strictLimiter, (req, res) => {
  const { text, algorithm = 'sha256' } = req.body;
  if (!text && text !== '') return res.status(400).json({ success: false, error: 'Text is required' });

  const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
  if (!algorithms.includes(algorithm.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'Invalid algorithm' });
  }

  const result = {};
  for (const algo of algorithms) {
    result[algo] = crypto.createHash(algo).update(text, 'utf8').digest('hex');
  }

  res.json({ success: true, result: { requested: result[algorithm], all: result } });
});

router.post('/base64', strictLimiter, (req, res) => {
  const { text, action = 'encode' } = req.body;
  if (text === undefined || text === null) return res.status(400).json({ success: false, error: 'Text is required' });

  try {
    if (action === 'encode') {
      const encoded = Buffer.from(String(text), 'utf8').toString('base64');
      res.json({ success: true, result: { output: encoded, action: 'encode' } });
    } else {
      const decoded = Buffer.from(String(text), 'base64').toString('utf8');
      res.json({ success: true, result: { output: decoded, action: 'decode' } });
    }
  } catch {
    res.status(400).json({ success: false, error: 'Invalid Base64 input' });
  }
});

router.post('/uuid-generator', strictLimiter, (req, res) => {
  const { count = 1 } = req.body;
  const num = Math.min(Math.max(parseInt(count) || 1, 1), 100);
  const uuids = Array.from({ length: num }, () => uuidv4());
  res.json({ success: true, result: { uuids, count: uuids.length } });
});

router.post('/text-redaction', strictLimiter, (req, res) => {
  const { text, patterns = [] } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'Text is required' });

  let redacted = text;
  const redactedItems = [];

  const defaultPatterns = [
    { name: 'Email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
    { name: 'Phone', regex: /\b[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}\b/g },
    { name: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
    { name: 'Credit Card', regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g },
    { name: 'IP Address', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
  ];

  for (const pattern of defaultPatterns) {
    const matches = redacted.match(pattern.regex);
    if (matches) {
      redactedItems.push({ type: pattern.name, count: matches.length });
      redacted = redacted.replace(pattern.regex, `[${pattern.name.toUpperCase()} REDACTED]`);
    }
  }

  res.json({ success: true, result: { redacted, original: text, redactedItems, totalRedacted: redactedItems.reduce((a, b) => a + b.count, 0) } });
});

router.post('/file-hash-comparison', uploadLimiter, upload.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }]), (req, res) => {
  if (!req.files?.file1?.[0] || !req.files?.file2?.[0]) {
    return res.status(400).json({ success: false, error: 'Two files are required' });
  }

  const algorithms = ['md5', 'sha1', 'sha256'];
  const hashes1 = {};
  const hashes2 = {};

  for (const algo of algorithms) {
    hashes1[algo] = crypto.createHash(algo).update(req.files.file1[0].buffer).digest('hex');
    hashes2[algo] = crypto.createHash(algo).update(req.files.file2[0].buffer).digest('hex');
  }

  const match = hashes1.sha256 === hashes2.sha256;

  res.json({
    success: true,
    result: {
      match,
      file1: { name: req.files.file1[0].originalname, size: req.files.file1[0].size, hashes: hashes1 },
      file2: { name: req.files.file2[0].originalname, size: req.files.file2[0].size, hashes: hashes2 },
    },
  });
});

router.post('/qr-phishing-scanner', strictLimiter, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

  const suspiciousPatterns = [
    { pattern: /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/i, reason: 'URL shortener detected' },
    { pattern: /login|signin|account|verify|secure|update|confirm/i, reason: 'Phishing keyword detected' },
    { pattern: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, reason: 'IP address used instead of domain' },
    { pattern: /paypal|amazon|google|microsoft|apple/i, reason: 'Brand name impersonation attempt' },
    { pattern: /\.xyz|\.tk|\.ml|\.ga|\.cf/i, reason: 'High-risk TLD detected' },
    { pattern: /http:\/\/(?!localhost)/i, reason: 'Non-HTTPS connection' },
  ];

  const risks = [];
  let riskScore = 0;

  for (const { pattern, reason } of suspiciousPatterns) {
    if (pattern.test(url)) {
      risks.push(reason);
      riskScore += 20;
    }
  }

  const level = riskScore === 0 ? 'Safe' : riskScore <= 20 ? 'Low Risk' : riskScore <= 40 ? 'Medium Risk' : 'High Risk';

  res.json({
    success: true,
    result: {
      url,
      riskScore: Math.min(riskScore, 100),
      riskLevel: level,
      risks,
      isSafe: riskScore === 0,
      note: 'This is a heuristic check. Always verify URLs with your browser before clicking.',
    },
  });
});

router.post('/url-reputation-checker', strictLimiter, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

  const risks = [];
  let score = 100;

  if (!/^https:\/\//.test(url)) { risks.push('Not using HTTPS'); score -= 20; }
  if (/\.(xyz|tk|ml|ga|cf|pw|top|click|loan|gdn)$/i.test(url)) { risks.push('Suspicious TLD'); score -= 30; }
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) { risks.push('IP address in URL'); score -= 40; }
  if (url.length > 200) { risks.push('Unusually long URL'); score -= 10; }
  if (/%[0-9a-fA-F]{2}/.test(url)) { risks.push('URL encoded characters detected'); score -= 10; }

  const rating = score >= 80 ? 'Safe' : score >= 50 ? 'Suspicious' : 'Dangerous';

  res.json({
    success: true,
    result: { url, reputationScore: Math.max(score, 0), rating, risks, checked: new Date().toISOString() },
  });
});

router.post('/secure-notes', strictLimiter, (req, res) => {
  const { note, action = 'encrypt', key } = req.body;
  if (!note || !key) return res.status(400).json({ success: false, error: 'Note and key are required' });

  try {
    const keyHash = crypto.createHash('sha256').update(key).digest();
    const iv = action === 'encrypt' ? crypto.randomBytes(16) : Buffer.from(note.slice(0, 32), 'hex');

    if (action === 'encrypt') {
      const cipher = crypto.createCipheriv('aes-256-cbc', keyHash, iv);
      const encrypted = Buffer.concat([cipher.update(note, 'utf8'), cipher.final()]);
      res.json({ success: true, result: { output: iv.toString('hex') + encrypted.toString('hex'), action: 'encrypt' } });
    } else {
      const encryptedBuf = Buffer.from(note.slice(32), 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyHash, iv);
      const decrypted = Buffer.concat([decipher.update(encryptedBuf), decipher.final()]);
      res.json({ success: true, result: { output: decrypted.toString('utf8'), action: 'decrypt' } });
    }
  } catch {
    res.status(400).json({ success: false, error: 'Decryption failed. Check your key.' });
  }
});

router.post('/data-breach-checker', strictLimiter, (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }
  res.json({
    success: true,
    result: {
      email,
      note: 'For accurate breach data, integrate with HaveIBeenPwned API (requires paid API key). This tool checks email format only.',
      checked: true,
      breachCount: 0,
    },
  });
});

router.post('/data-breach-check', strictLimiter, (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }
  res.json({
    success: true,
    result: {
      email,
      note: 'For accurate breach data, integrate with HaveIBeenPwned API (requires paid API key). This tool checks email format only.',
      checked: true,
      breachCount: 0,
    },
  });
});

router.post('/url-reputation', strictLimiter, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

  const risks = [];
  let score = 100;

  if (!/^https:\/\//.test(url)) { risks.push('Not using HTTPS'); score -= 20; }
  if (/\.(xyz|tk|ml|ga|cf|pw|top|click|loan|gdn)$/i.test(url)) { risks.push('Suspicious TLD'); score -= 30; }
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) { risks.push('IP address in URL'); score -= 40; }
  if (url.length > 200) { risks.push('Unusually long URL'); score -= 10; }
  if (/%[0-9a-fA-F]{2}/.test(url)) { risks.push('URL encoded characters detected'); score -= 10; }

  const rating = score >= 80 ? 'Safe' : score >= 50 ? 'Suspicious' : 'Dangerous';

  res.json({
    success: true,
    result: { url, reputationScore: Math.max(score, 0), rating, risks, checked: new Date().toISOString() },
  });
});

router.post('/exif-location-remover', uploadLimiter, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, error: 'Invalid image type. Use JPEG, PNG, or WebP' });
  }

  res.json({
    success: true,
    result: {
      message: 'EXIF data removal requires a server-side library like exiftool-vendored or sharp. For privacy, use a tool like exiftool locally to strip metadata.',
      note: 'Your file was received but EXIF stripping requires additional dependencies. For production use, install sharp and use sharp(buffer).toBuffer() which strips most metadata by default.',
      filename: req.file.originalname,
      size: req.file.size,
    },
  });
});

module.exports = router;
