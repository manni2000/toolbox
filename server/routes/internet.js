const express = require('express');
const axios = require('axios');
const router = express.Router();

// IP Lookup
router.post('/ip-lookup', async (req, res) => {
  try {
    const { ip } = req.body;
    
    // Use provided IP or client's IP
    const targetIP = ip || req.ip || req.connection.remoteAddress;
    
    // This is a placeholder implementation
    // In a real implementation, you would use a service like ipapi.co or ip-api.com
    const ipInfo = {
      ip: targetIP,
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles',
      isp: 'Example ISP',
      org: 'Example Organization',
      as: 'AS12345 Example ASN',
      note: 'This is a placeholder. Implement with real IP geolocation service.'
    };

    res.json({
      success: true,
      result: ipInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Agent Parser
router.post('/user-agent-parser', (req, res) => {
  try {
    const { userAgent } = req.body;
    
    if (!userAgent) {
      return res.status(400).json({ error: 'User agent string is required' });
    }

    // Basic user agent parsing (simplified)
    const parsed = parseUserAgent(userAgent);

    res.json({
      success: true,
      result: {
        userAgent,
        parsed
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DNS Lookup
router.post('/dns-lookup', async (req, res) => {
  try {
    const { domain, recordType = 'A' } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use the 'dns' module or external service
    const dnsInfo = {
      domain,
      recordType,
      records: [
        { type: 'A', value: '192.168.1.1', ttl: 300 },
        { type: 'A', value: '192.168.1.2', ttl: 300 }
      ],
      note: 'This is a placeholder. Implement with real DNS lookup service.'
    };

    res.json({
      success: true,
      result: dnsInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SSL Checker
router.post('/ssl-checker', async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use Node's tls module or external service
    const sslInfo = {
      domain,
      valid: true,
      issuer: 'Let\'s Encrypt Authority X3',
      subject: domain,
      validFrom: '2024-01-01T00:00:00Z',
      validUntil: '2024-04-01T00:00:00Z',
      daysUntilExpiry: 60,
      protocol: 'TLSv1.3',
      cipherSuite: 'TLS_AES_256_GCM_SHA384',
      note: 'This is a placeholder. Implement with real SSL checker.'
    };

    res.json({
      success: true,
      result: sslInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Website Ping
router.post('/website-ping', async (req, res) => {
  try {
    const { url, count = 4 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use actual ping functionality
    const pingResults = [];
    
    for (let i = 0; i < count; i++) {
      pingResults.push({
        sequence: i + 1,
        time: Math.floor(Math.random() * 100) + 20, // Random time between 20-120ms
        ttl: 64
      });
    }

    const avgTime = pingResults.reduce((sum, result) => sum + result.time, 0) / pingResults.length;

    const pingInfo = {
      url,
      host: new URL(url).hostname,
      packetsTransmitted: count,
      packetsReceived: count,
      packetLoss: 0,
      minTime: Math.min(...pingResults.map(r => r.time)),
      maxTime: Math.max(...pingResults.map(r => r.time)),
      avgTime: Math.round(avgTime),
      results: pingResults,
      note: 'This is a placeholder. Implement with real ping functionality.'
    };

    res.json({
      success: true,
      result: pingInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HTTP Status Code Checker
router.post('/http-status', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const response = await axios.head(url, {
        timeout: 10000,
        validateStatus: () => true,
        maxRedirects: 5
      });

      const statusInfo = {
        url,
        statusCode: response.status,
        statusText: response.statusText,
        headers: response.headers,
        responseTime: response.headers['x-response-time'] || 'N/A',
        redirects: response.request._redirectable ? 'Yes' : 'No',
        contentType: response.headers['content-type'] || 'Unknown',
        contentLength: response.headers['content-length'] || 'Unknown',
        server: response.headers['server'] || 'Unknown'
      };

      res.json({
        success: true,
        result: statusInfo
      });
    } catch (axiosError) {
      res.status(400).json({
        success: false,
        error: 'Failed to check HTTP status',
        message: axiosError.message,
        url
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Port Scanner (placeholder - would need proper networking library)
router.post('/port-scanner', async (req, res) => {
  try {
    const { host, ports = '80,443,22,21,25,53,110,143,993,995' } = req.body;
    
    if (!host) {
      return res.status(400).json({ error: 'Host is required' });
    }

    const portList = ports.split(',').map(p => parseInt(p.trim()));
    
    // This is a placeholder implementation
    const scanResults = portList.map(port => ({
      port,
      status: Math.random() > 0.7 ? 'open' : 'closed',
      service: getServiceName(port),
      responseTime: Math.floor(Math.random() * 100) + 10
    }));

    const scanInfo = {
      host,
      portsScanned: portList.length,
      openPorts: scanResults.filter(r => r.status === 'open').length,
      closedPorts: scanResults.filter(r => r.status === 'closed').length,
      results: scanResults,
      note: 'This is a placeholder. Implement with real port scanning functionality.'
    };

    res.json({
      success: true,
      result: scanInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WHOIS Lookup (placeholder)
router.post('/whois', async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // This is a placeholder implementation
    const whoisInfo = {
      domain,
      registrar: 'Example Registrar Inc.',
      registrationDate: '2020-01-01T00:00:00Z',
      expiryDate: '2025-01-01T00:00:00Z',
      updatedDate: '2023-06-01T00:00:00Z',
      status: ['clientTransferProhibited'],
      nameServers: ['ns1.example.com', 'ns2.example.com'],
      registrant: {
        name: 'Example Registrant',
        organization: 'Example Organization',
        country: 'US'
      },
      note: 'This is a placeholder. Implement with real WHOIS lookup service.'
    };

    res.json({
      success: true,
      result: whoisInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// URL Shortener (placeholder)
router.post('/url-shortener', async (req, res) => {
  try {
    const { url, action = 'shorten' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (action === 'shorten') {
      // Generate short URL (placeholder)
      const shortCode = generateShortCode();
      const shortUrl = `https://short.ly/${shortCode}`;
      
      res.json({
        success: true,
        result: {
          originalUrl: url,
          shortUrl,
          shortCode,
          note: 'This is a placeholder. Implement with real URL shortening service.'
        }
      });
    } else if (action === 'expand') {
      // Expand short URL (placeholder)
      res.json({
        success: true,
        result: {
          shortUrl: url,
          originalUrl: 'https://example.com/very-long-url-path',
          note: 'This is a placeholder. Implement with real URL expansion service.'
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Website Screenshot (placeholder - would need puppeteer)
router.post('/website-screenshot', async (req, res) => {
  try {
    const { url, width = 1920, height = 1080, format = 'png' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // This is a placeholder implementation
    const screenshotInfo = {
      url,
      width,
      height,
      format,
      screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      timestamp: new Date().toISOString(),
      note: 'This is a placeholder. Implement with real screenshot service using puppeteer.'
    };

    res.json({
      success: true,
      result: screenshotInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function parseUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Unknown';
  let version = 'Unknown';
  
  if (ua.includes('chrome')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('edge')) {
    browser = 'Edge';
    const match = ua.match(/edge\/(\d+\.\d+)/);
    version = match ? match[1] : 'Unknown';
  }
  
  // OS detection
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }
  
  // Device detection
  let device = 'Desktop';
  if (ua.includes('mobile')) {
    device = 'Mobile';
  } else if (ua.includes('tablet')) {
    device = 'Tablet';
  }
  
  return {
    browser,
    version,
    os,
    device,
    userAgent
  };
}

function getServiceName(port) {
  const services = {
    20: 'FTP Data',
    21: 'FTP Control',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    993: 'IMAPS',
    995: 'POP3S'
  };
  
  return services[port] || 'Unknown';
}

function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router;
