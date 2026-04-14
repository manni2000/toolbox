const express = require('express');
const dns = require('dns').promises;
const tls = require('tls');
const https = require('https');
const http = require('http');
const fetch = require('node-fetch');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { strictLimiter } = require('../middleware/security');

const router = express.Router();
router.use(strictLimiter);

function isValidDomain(domain) {
  return /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(domain);
}

function isValidIP(ip) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || /^[0-9a-fA-F:]{2,39}$/.test(ip);
}

function isPrivateOrReserved(ip) {
  const parts = ip.split('.').map(Number);
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 0) return true;
  return false;
}

function execFileAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

router.post('/ip-lookup', async (req, res, next) => {
  try {
    const { ip } = req.body;
    let targetIp = ip;

    if (!targetIp) {
      const ipRes = await fetch('https://api.ipify.org?format=json', { timeout: 5000 });
      const ipData = await ipRes.json();
      targetIp = ipData.ip;
    }

    if (!isValidIP(targetIp)) {
      return res.status(400).json({ success: false, error: 'Invalid IP address format' });
    }

    if (isPrivateOrReserved(targetIp)) {
      return res.json({
        success: true,
        result: {
          ip: targetIp,
          country: 'Private Network',
          countryCode: 'N/A',
          region: 'Local',
          city: 'Local',
          latitude: 0,
          longitude: 0,
          timezone: 'Local',
          isp: 'Private',
          org: 'Private Network',
          as: 'N/A',
          note: 'This is a private/reserved IP address',
        },
      });
    }

    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(targetIp)}?fields=status,message,country,countryCode,region,city,lat,lon,timezone,isp,org,as,query`, {
      timeout: 8000,
    });
    const data = await response.json();

    if (data.status === 'fail') {
      return res.status(400).json({ success: false, error: data.message || 'IP lookup failed' });
    }

    res.json({
      success: true,
      result: {
        ip: data.query,
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
        as: data.as,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/dns-lookup', async (req, res, next) => {
  try {
    const { domain, recordType = 'A' } = req.body;

    if (!domain) return res.status(400).json({ success: false, error: 'Domain is required' });
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    if (!isValidDomain(cleanDomain)) {
      return res.status(400).json({ success: false, error: 'Invalid domain format' });
    }

    const type = (recordType || 'A').toUpperCase();
    const validTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid record type' });
    }

    let records = [];
    try {
      switch (type) {
        case 'A': records = await dns.resolve4(cleanDomain); break;
        case 'AAAA': records = await dns.resolve6(cleanDomain); break;
        case 'MX': {
          const mx = await dns.resolveMx(cleanDomain);
          records = mx.map(r => ({ priority: r.priority, exchange: r.exchange }));
          break;
        }
        case 'TXT': {
          const txt = await dns.resolveTxt(cleanDomain);
          records = txt.map(r => r.join(' '));
          break;
        }
        case 'NS': records = await dns.resolveNs(cleanDomain); break;
        case 'CNAME': records = await dns.resolveCname(cleanDomain); break;
        case 'SOA': {
          const soa = await dns.resolveSoa(cleanDomain);
          records = [soa];
          break;
        }
      }
    } catch (dnsErr) {
      return res.json({ success: true, result: { domain: cleanDomain, recordType: type, records: [], note: dnsErr.message } });
    }

    res.json({ success: true, result: { domain: cleanDomain, recordType: type, records } });
  } catch (err) {
    next(err);
  }
});

router.post('/ssl-checker', async (req, res, next) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ success: false, error: 'Domain is required' });
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    if (!isValidDomain(cleanDomain)) {
      return res.status(400).json({ success: false, error: 'Invalid domain' });
    }

    const cert = await new Promise((resolve, reject) => {
      const options = {
        host: cleanDomain,
        port: 443,
        servername: cleanDomain,
        rejectUnauthorized: false,
        timeout: 8000,
      };
      const socket = tls.connect(options, () => {
        const peerCert = socket.getPeerCertificate(true);
        socket.end();
        if (!peerCert || !peerCert.subject) {
          reject(new Error('No certificate found'));
        } else {
          resolve(peerCert);
        }
      });
      socket.on('error', reject);
      socket.on('timeout', () => { socket.destroy(); reject(new Error('Connection timed out')); });
    });

    const validFrom = new Date(cert.valid_from);
    const validTo = new Date(cert.valid_to);
    const now = new Date();
    const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
    const isValid = now >= validFrom && now <= validTo;

    res.json({
      success: true,
      result: {
        domain: cleanDomain,
        isValid,
        daysRemaining,
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
        subject: cert.subject?.CN || cleanDomain,
        subjectAltNames: cert.subjectaltname ? cert.subjectaltname.split(', ').map(s => s.replace('DNS:', '')) : [],
        protocol: socket?.getProtocol?.() || 'TLS',
        serialNumber: cert.serialNumber,
      },
    });
  } catch (err) {
    res.json({
      success: true,
      result: {
        domain: req.body.domain,
        isValid: false,
        error: err.message,
        daysRemaining: 0,
      },
    });
  }
});

router.post('/website-ping', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const parsedUrl = new URL(targetUrl);
    const hostname = parsedUrl.hostname;
    if (!isValidDomain(hostname) && !isValidIP(hostname)) {
      return res.status(400).json({ success: false, error: 'Invalid URL' });
    }

    const pings = [];
    for (let i = 0; i < 4; i++) {
      const start = Date.now();
      try {
        await new Promise((resolve, reject) => {
          const lib = targetUrl.startsWith('https') ? https : http;
          const req = lib.get(targetUrl, { timeout: 5000 }, (r) => {
            r.destroy();
            resolve(r.statusCode);
          });
          req.on('error', reject);
          req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        });
        pings.push(Date.now() - start);
      } catch {
        pings.push(null);
      }
      await new Promise(r => setTimeout(r, 200));
    }

    const successful = pings.filter(p => p !== null);
    const avgTime = successful.length ? Math.round(successful.reduce((a, b) => a + b, 0) / successful.length) : null;
    const minTime = successful.length ? Math.min(...successful) : null;
    const maxTime = successful.length ? Math.max(...successful) : null;
    const packetLoss = Math.round(((4 - successful.length) / 4) * 100);

    res.json({
      success: true,
      result: {
        url: targetUrl,
        host: hostname,
        pings: pings.map((p, i) => ({ seq: i + 1, time: p, status: p !== null ? 'success' : 'timeout' })),
        avgTime,
        minTime,
        maxTime,
        packetLoss,
        status: successful.length > 0 ? 'online' : 'offline',
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/user-agent', (req, res) => {
  const ua = req.headers['user-agent'] || '';
  const parsedUa = parseUserAgent(ua);
  res.json({ success: true, result: { parsed: { ...parsedUa, device: parsedUa.deviceType, version: parsedUa.browserVersion, isMobile: parsedUa.deviceType !== 'Desktop' }, raw: ua } });
});

router.post('/user-agent', (req, res) => {
  const ua = req.body.userAgent || req.headers['user-agent'] || '';
  const parsedUa = parseUserAgent(ua);
  res.json({ success: true, result: { parsed: { ...parsedUa, device: parsedUa.deviceType, version: parsedUa.browserVersion, isMobile: parsedUa.deviceType !== 'Desktop' }, raw: ua } });
});

function parseUserAgent(ua) {
  let browser = 'Unknown', browserVersion = '', os = 'Unknown', osVersion = '', deviceType = 'Desktop', engine = 'Unknown';

  if (/Chrome\/(\S+)/.test(ua) && !/Chromium|Edge|OPR/.test(ua)) { browser = 'Chrome'; browserVersion = ua.match(/Chrome\/(\S+)/)[1]; }
  else if (/Firefox\/(\S+)/.test(ua)) { browser = 'Firefox'; browserVersion = ua.match(/Firefox\/(\S+)/)[1]; }
  else if (/Safari\/(\S+)/.test(ua) && !/Chrome/.test(ua)) { browser = 'Safari'; const m = ua.match(/Version\/(\S+)/); browserVersion = m ? m[1] : ''; }
  else if (/Edg\/(\S+)/.test(ua)) { browser = 'Microsoft Edge'; browserVersion = ua.match(/Edg\/(\S+)/)[1]; }
  else if (/OPR\/(\S+)/.test(ua)) { browser = 'Opera'; browserVersion = ua.match(/OPR\/(\S+)/)[1]; }

  if (/Windows NT (\S+)/.test(ua)) { os = 'Windows'; osVersion = ua.match(/Windows NT (\S+)/)[1]; }
  else if (/Mac OS X (\S+)/.test(ua)) { os = 'macOS'; osVersion = ua.match(/Mac OS X (\S+)/)[1].replace(/_/g, '.'); }
  else if (/Android (\S+)/.test(ua)) { os = 'Android'; osVersion = ua.match(/Android (\S+)/)[1]; }
  else if (/iPhone OS (\S+)/.test(ua)) { os = 'iOS'; osVersion = ua.match(/iPhone OS (\S+)/)[1].replace(/_/g, '.'); }
  else if (/Linux/.test(ua)) { os = 'Linux'; }

  if (/Mobi|Android|iPhone|iPad/.test(ua)) { deviceType = /iPad/.test(ua) ? 'Tablet' : 'Mobile'; }

  if (/Gecko/.test(ua)) engine = 'Gecko';
  else if (/WebKit/.test(ua)) engine = 'WebKit';
  else if (/Trident/.test(ua)) engine = 'Trident';
  else if (/Blink/.test(ua)) engine = 'Blink';

  return { browser, browserVersion, os, osVersion, deviceType, engine };
}

router.post('/website-screenshot', async (req, res, next) => {
  const { url, width = 1440, height = 900, format = 'png' } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid URL' });
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return res.status(400).json({ success: false, error: 'Only HTTP and HTTPS URLs are supported' });
  }

  const hostname = targetUrl.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return res.status(400).json({ success: false, error: 'Localhost URLs are not allowed for screenshots' });
  }

  if (isValidIP(hostname) && isPrivateOrReserved(hostname)) {
    return res.status(400).json({ success: false, error: 'Private network IPs are not allowed for screenshots' });
  }

  const normalizedFormat = String(format).toLowerCase() === 'jpeg' ? 'jpeg' : 'png';
  const extension = normalizedFormat === 'jpeg' ? 'jpg' : 'png';
  const screenshotPath = path.join(os.tmpdir(), `website-screenshot-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`);

  try {
    await execFileAsync('playwright.exe', [
      'screenshot',
      '--full-page',
      '--viewport-size', `${parseInt(width) || 1440},${parseInt(height) || 900}`,
      '--timeout', '30000',
      targetUrl.toString(),
      screenshotPath,
    ], { windowsHide: true, timeout: 45000 });

    const imageBuffer = fs.readFileSync(screenshotPath);
    const mimeType = normalizedFormat === 'jpeg' ? 'image/jpeg' : 'image/png';

    res.json({
      success: true,
      result: {
        url: targetUrl.toString(),
        width: parseInt(width) || 1440,
        height: parseInt(height) || 900,
        format: normalizedFormat,
        screenshot: `data:${mimeType};base64,${imageBuffer.toString('base64')}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    const stderr = `${err.stderr || ''} ${err.message || ''}`;
    if (/Executable doesn't exist/i.test(stderr) || /playwright install/i.test(stderr)) {
      return res.json({
        success: false,
        error: 'Website screenshot needs a Playwright browser runtime. Run `playwright install chromium` on the server, then try again.',
      });
    }

    if (/ENOENT/i.test(err.message)) {
      return res.json({
        success: false,
        error: 'Playwright CLI is not installed on the server PATH. Install Playwright to enable website screenshots.',
      });
    }

    return res.json({
      success: false,
      error: 'Failed to capture website screenshot.',
      details: err.message,
    });
  } finally {
    try {
      if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath);
    } catch {}
  }
});

module.exports = router;
