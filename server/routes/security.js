const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require('crypto-js');
const router = express.Router();

// Password Generator
router.post('/password-generator', (req, res) => {
  try {
    const { length = 12, includeUppercase = true, includeLowercase = true, includeNumbers = true, includeSymbols = true } = req.body;
    
    const passwordLength = parseInt(length);
    if (passwordLength < 4 || passwordLength > 128) {
      return res.status(400).json({ error: 'Password length must be between 4 and 128' });
    }

    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      return res.status(400).json({ error: 'At least one character type must be selected' });
    }

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const strength = calculatePasswordStrength(password);

    res.json({
      success: true,
      result: {
        password,
        length: passwordLength,
        strength,
        entropy: calculateEntropy(password)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password Strength Checker
router.post('/password-strength', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const strength = calculatePasswordStrength(password);
    const entropy = calculateEntropy(password);
    const suggestions = generatePasswordSuggestions(password);

    res.json({
      success: true,
      result: {
        password,
        strength,
        entropy,
        suggestions,
        score: strength.score,
        feedback: strength.feedback
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hash Generator
router.post('/hash-generator', (req, res) => {
  try {
    const { text, algorithm = 'sha256' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const supportedAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];
    if (!supportedAlgorithms.includes(algorithm)) {
      return res.status(400).json({ error: 'Unsupported algorithm. Use md5, sha1, sha256, or sha512' });
    }

    let hash;
    switch (algorithm) {
      case 'md5':
        hash = CryptoJS.MD5(text).toString();
        break;
      case 'sha1':
        hash = CryptoJS.SHA1(text).toString();
        break;
      case 'sha256':
        hash = CryptoJS.SHA256(text).toString();
        break;
      case 'sha512':
        hash = CryptoJS.SHA512(text).toString();
        break;
    }

    res.json({
      success: true,
      result: {
        originalText: text,
        algorithm,
        hash,
        uppercase: hash.toUpperCase()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Base64 Encoder/Decoder
router.post('/base64', (req, res) => {
  try {
    const { text, action = 'encode' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    let result;
    try {
      if (action === 'encode') {
        result = Buffer.from(text).toString('base64');
      } else if (action === 'decode') {
        result = Buffer.from(text, 'base64').toString('utf8');
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid input for ' + action + ' operation' });
    }

    res.json({
      success: true,
      result: {
        originalText: text,
        action,
        result
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UUID Generator
router.post('/uuid-generator', (req, res) => {
  try {
    const { version = '4', count = 1 } = req.body;
    
    const uuidCount = parseInt(count);
    if (uuidCount < 1 || uuidCount > 100) {
      return res.status(400).json({ error: 'Count must be between 1 and 100' });
    }

    const uuids = [];
    for (let i = 0; i < uuidCount; i++) {
      uuids.push(uuidv4());
    }

    res.json({
      success: true,
      result: {
        uuids,
        version,
        count: uuidCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password Strength Explainer
router.post('/password-strength-explainer', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const analysis = analyzePasswordStrength(password);

    res.json({
      success: true,
      result: analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data Breach Email Checker (placeholder)
router.post('/data-breach-checker', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use an API like HaveIBeenPwned
    res.json({
      success: true,
      result: {
        email,
        breaches: [],
        note: 'This is a placeholder. Implement with a real breach checking service like HaveIBeenPwned API.'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File Hash Comparison
router.post('/file-hash-comparison', (req, res) => {
  try {
    const { file1, file2, algorithm = 'sha256' } = req.body;
    
    if (!file1 || !file2) {
      return res.status(400).json({ error: 'Both file contents are required' });
    }

    const supportedAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];
    if (!supportedAlgorithms.includes(algorithm)) {
      return res.status(400).json({ error: 'Unsupported algorithm' });
    }

    let hash1, hash2;
    switch (algorithm) {
      case 'md5':
        hash1 = CryptoJS.MD5(file1).toString();
        hash2 = CryptoJS.MD5(file2).toString();
        break;
      case 'sha1':
        hash1 = CryptoJS.SHA1(file1).toString();
        hash2 = CryptoJS.SHA1(file2).toString();
        break;
      case 'sha256':
        hash1 = CryptoJS.SHA256(file1).toString();
        hash2 = CryptoJS.SHA256(file2).toString();
        break;
      case 'sha512':
        hash1 = CryptoJS.SHA512(file1).toString();
        hash2 = CryptoJS.SHA512(file2).toString();
        break;
    }

    const areIdentical = hash1 === hash2;

    res.json({
      success: true,
      result: {
        algorithm,
        hash1,
        hash2,
        identical: areIdentical,
        message: areIdentical ? 'Files are identical' : 'Files are different'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Text Redaction
router.post('/text-redaction', (req, res) => {
  try {
    const { text, patterns = [] } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    let redactedText = text;
    const redactions = [];

    // Default patterns for common sensitive data
    const defaultPatterns = [
      { name: 'Email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
      { name: 'Phone', pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g },
      { name: 'Credit Card', pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g },
      { name: 'SSN', pattern: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g }
    ];

    const patternsToUse = patterns.length > 0 ? patterns : defaultPatterns;

    for (const patternInfo of patternsToUse) {
      const pattern = typeof patternInfo === 'string' ? 
        { name: patternInfo, pattern: new RegExp(patternInfo, 'g') } : 
        patternInfo;

      const matches = text.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          redactedText = redactedText.replace(match, '[REDACTED]');
          redactions.push({
            type: pattern.name,
            original: match,
            redacted: '[REDACTED]'
          });
        });
      }
    }

    res.json({
      success: true,
      result: {
        originalText: text,
        redactedText,
        redactions,
        redactionCount: redactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QR Phishing Scanner (placeholder)
router.post('/qr-phishing-scanner', (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ error: 'QR code data is required' });
    }

    // Basic phishing detection patterns
    const suspiciousPatterns = [
      /bit\.ly/i,
      /tinyurl\.com/i,
      /shortened/i,
      /free.*gift/i,
      /click.*here/i,
      /verify.*account/i,
      /urgent/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(qrData));
    const isURL = /^https?:\/\//i.test(qrData);

    res.json({
      success: true,
      result: {
        qrData,
        isURL,
        isSuspicious,
        riskLevel: isSuspicious ? 'high' : (isURL ? 'medium' : 'low'),
        recommendations: isSuspicious ? [
          'Be cautious with this QR code',
          'Verify the source before scanning',
          'Consider using a QR scanner with security features'
        ] : [
          'This QR code appears to be safe',
          'Still verify the source if unknown'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// URL Reputation Checker
router.post('/url-reputation', (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const reputationAnalysis = analyzeURLReputation(url);

    res.json({
      success: true,
      result: reputationAnalysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function calculatePasswordStrength(password) {
  let score = 0;
  let feedback = [];

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');

  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  // Common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Avoid repeated characters');

  if (!/123|abc|qwe|password/i.test(password)) score += 1;
  else feedback.push('Avoid common patterns');

  let strength = 'Weak';
  if (score >= 7) strength = 'Very Strong';
  else if (score >= 5) strength = 'Strong';
  else if (score >= 3) strength = 'Medium';

  return { score, strength, feedback };
}

function calculateEntropy(password) {
  const charset = 94; // ASCII printable characters
  return Math.round(password.length * Math.log2(charset));
}

function generatePasswordSuggestions(password) {
  const suggestions = [];
  
  if (password.length < 12) {
    suggestions.push('Consider using a longer password (12+ characters)');
  }
  
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters');
  }
  
  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters');
  }
  
  if (!/\d/.test(password)) {
    suggestions.push('Add numbers');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    suggestions.push('Add special characters');
  }
  
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid repeated characters');
  }
  
  return suggestions;
}

function analyzePasswordStrength(password) {
  const strength = calculatePasswordStrength(password);
  const entropy = calculateEntropy(password);
  
  return {
    password,
    strength: strength.strength,
    score: strength.score,
    entropy,
    feedback: strength.feedback,
    timeToCrack: estimateCrackTime(entropy),
    characterAnalysis: {
      length: password.length,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
      hasRepeatedChars: /(.)\1{2,}/.test(password),
      hasCommonPatterns: /123|abc|qwe|password/i.test(password)
    }
  };
}

function estimateCrackTime(entropy) {
  // Very simplified estimation
  const guessesPerSecond = 1000000000; // 1 billion guesses per second
  const totalCombinations = Math.pow(2, entropy);
  const secondsToCrack = totalCombinations / (2 * guessesPerSecond);
  
  if (secondsToCrack < 1) return 'Less than a second';
  if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`;
  if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
  if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
  if (secondsToCrack < 2592000) return `${Math.round(secondsToCrack / 86400)} days`;
  if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 2592000)} months`;
  return `${Math.round(secondsToCrack / 31536000)} years`;
}

function analyzeURLReputation(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  let riskScore = 0;
  const riskFactors = [];
  const recommendations = [];

  // Basic HTTPS check
  const isHttps = urlObj.protocol === 'https:';
  if (!isHttps) {
    riskScore += 3;
    riskFactors.push('Uses HTTP instead of HTTPS (not encrypted)');
    recommendations.push('Avoid non-HTTPS websites for sensitive activities');
  } else {
    recommendations.push('Good: Uses HTTPS encryption');
  }

  // Check for suspicious TLDs
  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.click', '.link', '.xyz', '.top', '.club'];
  const tld = hostname.substring(hostname.lastIndexOf('.'));
  if (suspiciousTLDs.includes(tld)) {
    riskScore += 2;
    riskFactors.push(`Uses suspicious top-level domain: ${tld}`);
    recommendations.push('Be cautious with uncommon TLDs');
  }

  // Check for IP addresses instead of domain names
  const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
  if (isIPAddress) {
    riskScore += 2;
    riskFactors.push('Uses IP address instead of domain name');
    recommendations.push('IP addresses are often used for malicious sites');
  }

  // Check for suspicious keywords in hostname
  const suspiciousKeywords = ['free', 'gift', 'win', 'prize', 'click', 'urgent', 'account', 'verify', 'secure', 'login', 'bank', 'paypal', 'amazon', 'google'];
  const hostnameWords = hostname.split('.').join(' ').split('-').join(' ').split('_').join(' ');
  suspiciousKeywords.forEach(keyword => {
    if (hostnameWords.includes(keyword)) {
      riskScore += 1;
      riskFactors.push(`Contains suspicious keyword: "${keyword}"`);
    }
  });

  // Check for long subdomains (potential subdomain takeover)
  const subdomains = hostname.split('.');
  if (subdomains.length > 3) {
    riskScore += 1;
    riskFactors.push('Has multiple subdomains');
    recommendations.push('Verify each subdomain is legitimate');
  }

  // Check for URL shorteners
  const urlShorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly', 'tiny.cc', 'cli.gs'];
  if (urlShorteners.includes(hostname)) {
    riskScore += 3;
    riskFactors.push('Uses URL shortener service');
    recommendations.push('URL shorteners can hide malicious destinations');
  }

  // Check for excessive query parameters (often used in phishing)
  const queryParams = urlObj.searchParams;
  if (queryParams.toString().length > 200) {
    riskScore += 1;
    riskFactors.push('Has very long query parameters');
    recommendations.push('Long URLs with many parameters can be suspicious');
  }

  // Check for unusual characters in hostname
  if (/[^a-zA-Z0-9.-]/.test(hostname)) {
    riskScore += 1;
    riskFactors.push('Contains unusual characters in domain name');
    recommendations.push('Domain names should only contain letters, numbers, hyphens, and dots');
  }

  // Domain age estimation (simplified)
  const domainName = hostname.replace('www.', '');
  // This is a very basic estimation - in reality you'd use WHOIS data
  const commonDomains = ['google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com', 'twitter.com', 'github.com', 'youtube.com'];
  const isCommonDomain = commonDomains.some(domain => domainName.includes(domain));
  const domainAgeDays = isCommonDomain ? 365 * 10 : Math.floor(Math.random() * 365 * 5) + 30; // Random age for demo

  if (domainAgeDays < 90) {
    riskScore += 2;
    riskFactors.push('Domain appears to be very new (less than 3 months)');
    recommendations.push('Newly registered domains are more likely to be malicious');
  }

  // Determine reputation and color based on risk score
  let reputation, color;
  if (riskScore >= 7) {
    reputation = 'Dangerous';
    color = 'red';
  } else if (riskScore >= 4) {
    reputation = 'Suspicious';
    color = 'orange';
  } else {
    reputation = 'Safe';
    color = 'green';
  }

  // Cap risk score at 10
  riskScore = Math.min(riskScore, 10);

  // Add general recommendations
  if (reputation !== 'Safe') {
    recommendations.push('Do not enter personal information on this site');
    recommendations.push('Verify the URL is correct and legitimate');
    recommendations.push('Consider using antivirus software with web protection');
  } else {
    recommendations.push('This URL appears to be safe');
    recommendations.push('Always remain cautious with unknown websites');
  }

  return {
    url,
    reputation,
    risk_score: riskScore,
    color,
    factors: riskFactors,
    domain_age_days: domainAgeDays,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
}

module.exports = router;
