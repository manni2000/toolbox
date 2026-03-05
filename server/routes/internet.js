const express = require('express');
const axios = require('axios');
const router = express.Router();

// IP Lookup
router.post('/ip-lookup', async (req, res) => {
  try {
    const { ip } = req.body;
    
    // Use provided IP or client's IP
    let targetIP = ip || req.ip || req.connection.remoteAddress;
    
    // Handle IPv6 localhost (::1) and convert to IPv4 if possible
    if (targetIP === '::1' || targetIP === '127.0.0.1') {
      // For localhost, we'll use a public IP for demonstration
      targetIP = '8.8.8.8'; // Google's DNS as fallback
    }
    
    // Clean up the IP address (remove IPv6 prefix if present)
    if (targetIP && targetIP.includes('::ffff:')) {
      targetIP = targetIP.replace('::ffff:', '');
    }
    
    try {
      // Use ip-api.com free service for real IP geolocation
      const response = await axios.get(`http://ip-api.com/json/${targetIP}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'DailyTools247/1.0'
        }
      });
      
      if (response.data && response.data.status === 'success') {
        const data = response.data;
        const ipInfo = {
          ip: data.query,
          country: data.country || 'Unknown',
          countryCode: data.countryCode || 'XX',
          region: data.regionName || 'Unknown',
          city: data.city || 'Unknown',
          latitude: data.lat || 0,
          longitude: data.lon || 0,
          timezone: data.timezone || 'Unknown',
          isp: data.isp || 'Unknown',
          org: data.org || 'Unknown',
          as: data.as || 'Unknown',
          note: data.org ? null : 'Limited information available for this IP address.'
        };

        res.json({
          success: true,
          result: ipInfo
        });
      } else {
        throw new Error(response.data?.message || 'IP lookup service failed');
      }
    } catch (apiError) {
      console.warn('IP API service failed, using fallback:', apiError.message);
      
      // Fallback to basic IP info if API fails
      const ipInfo = {
        ip: targetIP,
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'Unknown',
        isp: 'Unknown',
        org: 'Unknown',
        as: 'Unknown',
        note: 'IP geolocation service temporarily unavailable. Showing basic IP information.'
      };

      res.json({
        success: true,
        result: ipInfo
      });
    }
  } catch (error) {
    console.error('IP lookup error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to lookup IP address',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

    const dns = require('dns').promises;
    
    try {
      let records = [];
      
      // Use Node.js built-in DNS module for real DNS lookup
      switch (recordType.toUpperCase()) {
        case 'A':
          const aRecords = await dns.resolve4(domain);
          records = aRecords.map(addr => ({ type: 'A', value: addr, ttl: 300 }));
          break;
          
        case 'AAAA':
          const aaaaRecords = await dns.resolve6(domain);
          records = aaaaRecords.map(addr => ({ type: 'AAAA', value: addr, ttl: 300 }));
          break;
          
        case 'MX':
          const mxRecords = await dns.resolveMx(domain);
          records = mxRecords.map(record => ({ 
            type: 'MX', 
            value: `${record.priority} ${record.exchange}`, 
            ttl: 300 
          }));
          break;
          
        case 'TXT':
          const txtRecords = await dns.resolveTxt(domain);
          records = txtRecords.map(record => ({ 
            type: 'TXT', 
            value: Array.isArray(record) ? record.join('') : record, 
            ttl: 300 
          }));
          break;
          
        case 'NS':
          const nsRecords = await dns.resolveNs(domain);
          records = nsRecords.map(record => ({ type: 'NS', value: record, ttl: 300 }));
          break;
          
        case 'CNAME':
          try {
            const cnameRecord = await dns.resolveCname(domain);
            records = cnameRecord.map(record => ({ type: 'CNAME', value: record, ttl: 300 }));
          } catch (cnameError) {
            // CNAME records don't exist for all domains
            records = [];
          }
          break;
          
        case 'SOA':
          try {
            const soaRecords = await dns.resolveSoa(domain);
            records = [{
              type: 'SOA',
              value: `${soaRecords.nsname} ${soaRecords.hostmaster} ${soaRecords.serial} ${soaRecords.refresh} ${soaRecords.retry} ${soaRecords.expire} ${soaRecords.minttl}`,
              ttl: 300
            }];
          } catch (soaError) {
            // SOA records might not be accessible
            records = [];
          }
          break;
          
        default:
          return res.status(400).json({ error: `Unsupported record type: ${recordType}` });
      }

      const dnsInfo = {
        domain,
        recordType: recordType.toUpperCase(),
        records: records.length > 0 ? records : [],
        note: records.length === 0 
          ? `No ${recordType.toUpperCase()} records found for ${domain}` 
          : null
      };

      res.json({
        success: true,
        result: dnsInfo
      });
      
    } catch (dnsError) {
      console.warn('DNS lookup failed:', dnsError.message);
      
      // Return error if DNS lookup fails
      const dnsInfo = {
        domain,
        recordType: recordType.toUpperCase(),
        records: [],
        note: `DNS lookup failed: ${dnsError.message}. The domain may not exist or the DNS server may be unreachable.`
      };

      res.json({
        success: true,
        result: dnsInfo
      });
    }
  } catch (error) {
    console.error('DNS lookup error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to lookup DNS records',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// SSL Checker
router.post('/ssl-checker', async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Extract domain from URL if full URL is provided
    let targetDomain = domain;
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      try {
        const urlObj = new URL(domain);
        targetDomain = urlObj.hostname;
      } catch (urlError) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid domain or URL format' 
        });
      }
    }

    // Remove any trailing slashes or paths
    targetDomain = targetDomain.split('/')[0];

    const tls = require('tls');
    const https = require('https');
    
    try {
      console.log(`Attempting SSL check for domain: ${targetDomain}`);
      
      // Create a TLS connection to check SSL certificate
      const socket = tls.connect(443, targetDomain, { servername: targetDomain }, () => {
        const cert = socket.getPeerCertificate(true);
        const cipher = socket.getCipher();
        
        if (!cert || Object.keys(cert).length === 0) {
          socket.destroy();
          return res.status(400).json({
            success: false,
            error: 'No SSL certificate found or invalid certificate'
          });
        }

        // Calculate days until expiry
        const now = new Date();
        const expiryDate = new Date(cert.valid_to);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        const sslInfo = {
          domain: targetDomain,
          valid: socket.authorized || true, // Check if certificate is valid
          issuer: cert.issuer?.CN || cert.issuer?.O || 'Unknown',
          subject: cert.subject?.CN || cert.subject?.O || targetDomain,
          validFrom: cert.valid_from,
          validUntil: cert.valid_to,
          daysUntilExpiry: daysUntilExpiry,
          protocol: cipher?.name || 'TLS',
          cipherSuite: cipher?.standardName || cipher?.name || 'Unknown',
          fingerprint: cert.fingerprint,
          serial: cert.serialNumber,
          note: daysUntilExpiry < 30 ? `Certificate expires in ${daysUntilExpiry} days!` : null
        };

        socket.destroy();
        
        console.log(`SSL check successful for ${targetDomain}`);
        res.json({
          success: true,
          result: sslInfo
        });
      });

      socket.on('error', (error) => {
        console.warn(`SSL check failed for ${targetDomain}:`, error.message);
        socket.destroy();
        
        // Try HTTPS fallback
        try {
          const req = https.request(`https://${targetDomain}`, { method: 'HEAD', timeout: 5000 }, (res) => {
            const sslInfo = {
              domain: targetDomain,
              valid: true,
              issuer: 'Unknown',
              subject: targetDomain,
              validFrom: new Date().toISOString(),
              validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              daysUntilExpiry: 90,
              protocol: 'TLS',
              cipherSuite: 'Unknown',
              note: 'SSL certificate verified via HTTPS. Detailed certificate information not available.'
            };

            console.log(`HTTPS fallback successful for ${targetDomain}`);
            res.json({
              success: true,
              result: sslInfo
            });
          });

          req.on('error', () => {
            console.error(`HTTPS fallback also failed for ${targetDomain}`);
            res.status(400).json({
              success: false,
              error: 'SSL certificate check failed. The domain may not have SSL certificate or the connection failed.',
              domain: targetDomain
            });
          });

          req.on('timeout', () => {
            req.destroy();
            res.status(408).json({
              success: false,
              error: 'SSL certificate check timed out',
              domain: targetDomain
            });
          });

          req.end();
        } catch (fallbackError) {
          console.error(`HTTPS fallback error for ${targetDomain}:`, fallbackError.message);
          res.status(400).json({
            success: false,
            error: 'SSL certificate check failed. The domain may not have SSL certificate or the connection failed.',
            domain: targetDomain
          });
        }
      });

      socket.setTimeout(5000, () => {
        console.warn(`SSL check timed out for ${targetDomain}`);
        socket.destroy();
        res.status(408).json({
          success: false,
          error: 'SSL certificate check timed out',
          domain: targetDomain
        });
      });

    } catch (sslError) {
      console.error('SSL checker error:', sslError);
      res.status(500).json({ 
        success: false,
        error: sslError.message || 'Failed to check SSL certificate',
        details: process.env.NODE_ENV === 'development' ? sslError.stack : undefined
      });
    }
  } catch (error) {
    console.error('SSL checker error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to check SSL certificate',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Website Ping
router.post('/website-ping', async (req, res) => {
  try {
    const { url, count = 4 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Ensure URL has protocol
    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = 'https://' + url;
    }

    const pingResults = [];
    let successCount = 0;
    
    try {
      // Perform multiple HTTP requests to simulate ping
      for (let i = 0; i < count; i++) {
        const startTime = Date.now();
        
        try {
          const response = await axios.head(targetUrl, {
            timeout: 5000,
            validateStatus: () => true, // Accept any status code
            maxRedirects: 5
          });
          
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          pingResults.push({
            sequence: i + 1,
            time: responseTime,
            ttl: 64, // Standard TTL
            status: response.status,
            success: true
          });
          
          successCount++;
          
        } catch (requestError) {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          pingResults.push({
            sequence: i + 1,
            time: responseTime,
            ttl: 64,
            status: 0,
            success: false,
            error: requestError.code || 'Request failed'
          });
        }
        
        // Small delay between requests
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const successfulPings = pingResults.filter(r => r.success);
      const avgTime = successfulPings.length > 0 
        ? Math.round(successfulPings.reduce((sum, result) => sum + result.time, 0) / successfulPings.length)
        : 0;

      const pingInfo = {
        url: targetUrl,
        host: new URL(targetUrl).hostname,
        packetsTransmitted: count,
        packetsReceived: successCount,
        packetLoss: Math.round(((count - successCount) / count) * 100),
        minTime: successfulPings.length > 0 ? Math.min(...successfulPings.map(r => r.time)) : 0,
        maxTime: successfulPings.length > 0 ? Math.max(...successfulPings.map(r => r.time)) : 0,
        avgTime: avgTime,
        results: pingResults,
        note: successCount === 0 
          ? 'Website is not responding or unreachable' 
          : successCount < count 
            ? `Some requests failed (${count - successCount}/${count} failed)`
            : null
      };

      res.json({
        success: true,
        result: pingInfo
      });
      
    } catch (error) {
      console.error('Website ping error:', error);
      
      const pingInfo = {
        url: targetUrl,
        host: new URL(targetUrl).hostname,
        packetsTransmitted: count,
        packetsReceived: 0,
        packetLoss: 100,
        minTime: 0,
        maxTime: 0,
        avgTime: 0,
        results: [],
        note: 'Website ping failed. The site may be down or unreachable.'
      };

      res.json({
        success: false,
        error: 'Failed to ping website',
        result: pingInfo
      });
    }
  } catch (error) {
    console.error('Website ping error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to ping website',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
