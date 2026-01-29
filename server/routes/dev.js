const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// JSON formatter
router.post('/json-formatter', (req, res) => {
  try {
    const { json, action = 'format' } = req.body;
    
    if (!json) {
      return res.status(400).json({ error: 'JSON data is required' });
    }

    let result;
    try {
      const parsed = JSON.parse(json);
      
      if (action === 'format') {
        result = JSON.stringify(parsed, null, 2);
      } else if (action === 'minify') {
        result = JSON.stringify(parsed);
      } else if (action === 'validate') {
        result = { valid: true, message: 'Valid JSON' };
      }
      
      res.json({
        success: true,
        result
      });
    } catch (parseError) {
      res.json({
        success: false,
        error: 'Invalid JSON',
        message: parseError.message,
        line: parseError.message.match(/line (\d+)/)?.[1] || 'unknown'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regex tester
router.post('/regex-tester', (req, res) => {
  try {
    const { pattern, flags, testString } = req.body;
    
    if (!pattern || !testString) {
      return res.status(400).json({ error: 'Pattern and test string are required' });
    }

    try {
      const regex = new RegExp(pattern, flags || '');
      const matches = [];
      let match;
      
      while ((match = regex.exec(testString)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          fullMatch: match
        });
        
        // Reset lastIndex to prevent infinite loop
        if (regex.global) {
          regex.lastIndex = match.index + 1;
        } else {
          break;
        }
      }

      res.json({
        success: true,
        result: {
          pattern: pattern,
          flags: flags || '',
          testString: testString,
          matches: matches,
          matchCount: matches.length,
          isValid: true
        }
      });
    } catch (regexError) {
      res.json({
        success: false,
        error: 'Invalid regex pattern',
        message: regexError.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// URL encoder/decoder
router.post('/url-encoder', (req, res) => {
  try {
    const { text, action = 'encode' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    let result;
    if (action === 'encode') {
      result = encodeURIComponent(text);
    } else if (action === 'decode') {
      result = decodeURIComponent(text);
    } else if (action === 'encode-component') {
      result = encodeURIComponent(text);
    } else if (action === 'decode-component') {
      result = decodeURIComponent(text);
    }

    res.json({
      success: true,
      result,
      action
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Color converter
router.post('/color-converter', (req, res) => {
  try {
    const { color, fromFormat, toFormat } = req.body;
    
    if (!color) {
      return res.status(400).json({ error: 'Color value is required' });
    }

    // Convert to RGB first
    let rgb = { r: 0, g: 0, b: 0 };
    
    if (fromFormat === 'hex') {
      const hex = color.replace('#', '');
      rgb = {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    } else if (fromFormat === 'rgb') {
      const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (matches) {
        rgb = { r: parseInt(matches[1]), g: parseInt(matches[2]), b: parseInt(matches[3]) };
      }
    }

    // Convert from RGB to target format
    let result;
    if (toFormat === 'hex') {
      result = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
    } else if (toFormat === 'rgb') {
      result = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    } else if (toFormat === 'hsl') {
      const rNorm = rgb.r / 255;
      const gNorm = rgb.g / 255;
      const bNorm = rgb.b / 255;
      
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      const l = (max + min) / 2;
      
      let h, s;
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
          case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
          case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
        }
      }
      
      result = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    res.json({
      success: true,
      result,
      rgb
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lorem ipsum generator
router.post('/lorem-generator', (req, res) => {
  try {
    const { type = 'words', count = 10 } = req.body;
    
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];

    const sentences = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.'
    ];

    let result = '';
    
    if (type === 'words') {
      for (let i = 0; i < count; i++) {
        result += words[Math.floor(Math.random() * words.length)] + ' ';
      }
      result = result.trim();
    } else if (type === 'sentences') {
      for (let i = 0; i < count; i++) {
        result += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
      }
      result = result.trim();
    } else if (type === 'paragraphs') {
      for (let i = 0; i < count; i++) {
        const paragraphLength = Math.floor(Math.random() * 3) + 3;
        for (let j = 0; j < paragraphLength; j++) {
          result += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
        }
        result += '\n\n';
      }
      result = result.trim();
    }

    res.json({
      success: true,
      result,
      type,
      count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// JWT decoder
router.post('/jwt-decoder', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'JWT token is required' });
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return res.status(400).json({ error: 'Invalid JWT format' });
      }

      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      res.json({
        success: true,
        result: {
          header,
          payload,
          signature: parts[2]
        }
      });
    } catch (decodeError) {
      res.status(400).json({ error: 'Failed to decode JWT', message: decodeError.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cron generator
router.post('/cron-generator', (req, res) => {
  try {
    const { minute = '*', hour = '*', dayOfMonth = '*', month = '*', dayOfWeek = '*' } = req.body;
    
    const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    
    // Generate human readable description
    const getDescription = (part, name) => {
      if (part === '*') return `every ${name}`;
      if (part.includes('/')) {
        const [base, interval] = part.split('/');
        return `every ${interval} ${name}${base !== '*' ? ` starting at ${base}` : ''}`;
      }
      if (part.includes(',')) {
        return `at ${name}s: ${part}`;
      }
      return `at ${name} ${part}`;
    };

    const description = `${getDescription(minute, 'minute')}, ${getDescription(hour, 'hour')}, ${getDescription(dayOfMonth, 'day of month')}, ${getDescription(month, 'month')}, ${getDescription(dayOfWeek, 'day of week')}`;

    res.json({
      success: true,
      result: {
        cronExpression,
        description,
        nextRuns: getNextRuns(cronExpression, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get next cron runs (simplified)
function getNextRuns(cronExpression, count) {
  // This is a simplified implementation
  // In a real implementation, you would use a proper cron parser
  const now = new Date();
  const runs = [];
  
  for (let i = 0; i < count; i++) {
    const nextRun = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000); // Simple hourly
    runs.push(nextRun.toISOString());
  }
  
  return runs;
}

// UUID generator
router.post('/uuid-generator', (req, res) => {
  try {
    const { version = '4', count = 1 } = req.body;
    
    const uuids = [];
    for (let i = 0; i < count; i++) {
      if (version === '4') {
        uuids.push(uuidv4());
      } else {
        // For other versions, you would need different implementations
        uuids.push(uuidv4());
      }
    }

    res.json({
      success: true,
      result: {
        uuids,
        version,
        count
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HTTP header checker
router.post('/http-header-checker', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const response = await axios.head(url, {
        timeout: 10000,
        validateStatus: () => true
      });

      res.json({
        success: true,
        result: {
          url: url,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          responseTime: response.headers['x-response-time'] || 'N/A'
        }
      });
    } catch (axiosError) {
      res.status(400).json({
        success: false,
        error: 'Failed to fetch headers',
        message: axiosError.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
