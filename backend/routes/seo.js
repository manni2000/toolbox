const express = require('express');
const fetch = require('node-fetch');
const { strictLimiter } = require('../middleware/security');
const dns = require('dns').promises;
const https = require('https');
const http = require('http');

const router = express.Router();
router.use(strictLimiter);

function isValidUrl(url) {
  try { new URL(url.startsWith('http') ? url : 'https://' + url); return true; } catch { return false; }
}

async function fetchWithTimeout(url, timeout = 10000) {
  return fetch(url.startsWith('http') ? url : 'https://' + url, {
    timeout,
    headers: { 'User-Agent': 'DailyTools247/1.0 SEO Analyzer' },
  });
}

async function getDomainAgeResult(domain) {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();

  let nsRecords = [];
  try { nsRecords = await dns.resolveNs(cleanDomain); } catch {}

  let creationDate = 'Unavailable';
  let expirationDate = 'Unavailable';
  let age = 0;
  let daysUntilExpiration = 0;
  let registrar = 'Unavailable';
  let note = 'Exact domain age requires WHOIS/RDAP support.';

  try {
    const rdapResponse = await fetch(`https://rdap.org/domain/${encodeURIComponent(cleanDomain)}`, {
      timeout: 8000,
      headers: { 'User-Agent': 'DailyTools247/1.0 SEO Analyzer' },
    });

    if (rdapResponse.ok) {
      const rdap = await rdapResponse.json();
      const eventMap = Object.fromEntries((rdap.events || []).map((event) => [event.eventAction, event.eventDate]));
      const createdAt = eventMap.registration || eventMap['last changed'];
      const expiresAt = eventMap.expiration;

      if (createdAt) {
        creationDate = new Date(createdAt).toISOString().split('T')[0];
        age = Math.max(0, Math.round(((Date.now() - new Date(createdAt).getTime()) / (365.25 * 24 * 3600 * 1000)) * 10) / 10);
      }

      if (expiresAt) {
        expirationDate = new Date(expiresAt).toISOString().split('T')[0];
        daysUntilExpiration = Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / (24 * 3600 * 1000)));
      }

      const registrarEntity = (rdap.entities || []).find((entity) => (entity.roles || []).includes('registrar'));
      const registrarFn = registrarEntity?.vcardArray?.[1]?.find((item) => item[0] === 'fn');
      if (registrarFn?.[3]) registrar = registrarFn[3];

      note = nsRecords.length
        ? 'Domain age data fetched via RDAP. Nameservers are also included.'
        : 'Domain age data fetched via RDAP.';
    }
  } catch {
    // Fall back to DNS-only metadata when RDAP is unavailable.
  }

  return {
    domain: cleanDomain,
    nameservers: nsRecords,
    creationDate,
    expirationDate,
    age,
    daysUntilExpiration,
    registrar,
    status: nsRecords.length > 0 || creationDate !== 'Unavailable' ? 'valid' : 'error',
    note,
    checked: new Date().toISOString(),
  };
}

router.post('/meta-title-description', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || !isValidUrl(url)) return res.status(400).json({ success: false, error: 'Valid URL required' });

    const response = await fetchWithTimeout(url);
    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);

    const title = titleMatch?.[1]?.trim() || '';
    const description = metaDescMatch?.[1]?.trim() || '';

    res.json({
      success: true,
      result: {
        url,
        title,
        titleLength: title.length,
        titleStatus: title.length >= 50 && title.length <= 60 ? 'Good' : title.length < 50 ? 'Too Short' : 'Too Long',
        description,
        descriptionLength: description.length,
        descriptionStatus: description.length >= 150 && description.length <= 160 ? 'Good' : description.length < 150 ? 'Too Short' : 'Too Long',
        ogTitle: ogTitleMatch?.[1]?.trim() || null,
        ogDescription: ogDescMatch?.[1]?.trim() || null,
        ogImage: ogImageMatch?.[1]?.trim() || null,
        canonical: canonicalMatch?.[1]?.trim() || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/keyword-density', (req, res) => {
  const { text, topN = 20 } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'Text required' });

  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'this', 'that', 'these', 'those', 'it', 'its', 'as', 'if', 'not', 'no', 'so', 'than']);

  const words = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  const total = words.length;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, parseInt(topN) || 20);

  res.json({
    success: true,
    result: {
      totalWords: total,
      uniqueWords: Object.keys(freq).length,
      keywords: sorted.map(([word, count]) => ({
        word,
        count,
        density: ((count / total) * 100).toFixed(2) + '%',
      })),
    },
  });
});

router.post('/robots-txt-generator', (req, res) => {
  const { userAgent = '*', disallowPaths = [], allowPaths = [], sitemap, crawlDelay } = req.body;

  const lines = [];
  const agents = Array.isArray(userAgent) ? userAgent : [userAgent];

  for (const agent of agents) {
    lines.push(`User-agent: ${agent}`);
    const disallows = Array.isArray(disallowPaths) ? disallowPaths : [disallowPaths];
    const allows = Array.isArray(allowPaths) ? allowPaths : [allowPaths];
    for (const path of allows) if (path) lines.push(`Allow: ${path}`);
    for (const path of disallows) if (path) lines.push(`Disallow: ${path}`);
    if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`);
    lines.push('');
  }

  if (sitemap) lines.push(`Sitemap: ${sitemap}`);

  res.json({ success: true, result: { robotsTxt: lines.join('\n') } });
});

router.post('/sitemap-validator', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || !isValidUrl(url)) return res.status(400).json({ success: false, error: 'Valid URL required' });

    const targetUrl = url.startsWith('http') ? url : 'https://' + url;
    const sitemapUrl = targetUrl.endsWith('.xml') ? targetUrl : `${targetUrl.replace(/\/$/, '')}/sitemap.xml`;

    const response = await fetchWithTimeout(sitemapUrl);
    const xml = await response.text();

    const urlMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
    const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, '').trim());
    const isValid = xml.includes('<urlset') || xml.includes('<sitemapindex');

    res.json({
      success: true,
      result: {
        sitemapUrl,
        isValid,
        urlCount: urls.length,
        urls: urls.slice(0, 50),
        hasMoreUrls: urls.length > 50,
        type: xml.includes('<sitemapindex') ? 'Sitemap Index' : 'URL Set',
      },
    });
  } catch (err) {
    res.json({ success: true, result: { isValid: false, error: err.message, urlCount: 0 } });
  }
});

router.post('/og-image-preview', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || !isValidUrl(url)) return res.status(400).json({ success: false, error: 'Valid URL required' });

    const response = await fetchWithTimeout(url);
    const html = await response.text();

    const extract = (pattern) => html.match(pattern)?.[1]?.trim() || null;

    res.json({
      success: true,
      result: {
        url,
        og: {
          title: extract(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i),
          description: extract(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i),
          image: extract(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i),
          type: extract(/<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i),
          siteName: extract(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i),
        },
        twitter: {
          title: extract(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i),
          description: extract(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i),
          image: extract(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i),
          card: extract(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/broken-image-finder', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || !isValidUrl(url)) return res.status(400).json({ success: false, error: 'Valid URL required' });

    const targetUrl = url.startsWith('http') ? url : 'https://' + url;
    const response = await fetchWithTimeout(targetUrl);
    const html = await response.text();
    const base = new URL(targetUrl);

    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
    const imageUrls = imgMatches.map(m => {
      const src = m[1];
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return base.protocol + src;
      if (src.startsWith('/')) return `${base.protocol}//${base.host}${src}`;
      return `${base.protocol}//${base.host}/${src}`;
    }).slice(0, 30);

    const results = await Promise.allSettled(imageUrls.map(async imgUrl => {
      const r = await fetch(imgUrl, { method: 'HEAD', timeout: 5000 });
      return { url: imgUrl, ok: r.ok, status: r.status };
    }));

    const images = results.map((r, i) => r.status === 'fulfilled' ? r.value : { url: imageUrls[i], ok: false, status: 0, error: 'Fetch failed' });
    const broken = images.filter(i => !i.ok);

    res.json({ success: true, result: { totalImages: images.length, brokenImages: broken.length, images, brokenList: broken } });
  } catch (err) {
    next(err);
  }
});

async function handleDomainAge(req, res, next) {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ success: false, error: 'Domain required' });
    const result = await getDomainAgeResult(domain);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

router.post('/domain-age-checker', handleDomainAge);

router.post('/tech-stack-detector', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || !isValidUrl(url)) return res.status(400).json({ success: false, error: 'Valid URL required' });

    const targetUrl = url.startsWith('http') ? url : 'https://' + url;
    const response = await fetchWithTimeout(targetUrl);
    const html = await response.text();
    const headers = {};
    response.headers.forEach((v, k) => { headers[k] = v; });

    const tech = [];

    if (/<meta[^>]+next\.js|__NEXT_DATA__|_next\/static/i.test(html)) tech.push('Next.js');
    if (/react|__react|data-reactroot/i.test(html)) tech.push('React');
    if (/vue\.js|__vue/i.test(html)) tech.push('Vue.js');
    if (/ng-version|angular/i.test(html)) tech.push('Angular');
    if (/wordpress|wp-content|wp-includes/i.test(html)) tech.push('WordPress');
    if (/shopify/i.test(html)) tech.push('Shopify');
    if (/gatsby/i.test(html)) tech.push('Gatsby');
    if (/nuxt/i.test(html)) tech.push('Nuxt.js');
    if (/bootstrap/i.test(html)) tech.push('Bootstrap');
    if (/tailwind/i.test(html)) tech.push('Tailwind CSS');
    if (/jquery/i.test(html)) tech.push('jQuery');

    const server = headers['server'];
    if (server) tech.push(`Server: ${server}`);
    if (headers['x-powered-by']) tech.push(`Powered by: ${headers['x-powered-by']}`);
    if (headers['x-generator']) tech.push(`Generator: ${headers['x-generator']}`);

    res.json({ success: true, result: { url: targetUrl, technologies: [...new Set(tech)], headers } });
  } catch (err) {
    next(err);
  }
});

router.post('/utm-link-builder', (req, res) => {
  const { url, source, medium, campaign, term, content } = req.body;
  if (!url || !source || !campaign) return res.status(400).json({ success: false, error: 'URL, source, and campaign are required' });

  const params = new URLSearchParams();
  params.set('utm_source', source);
  params.set('utm_medium', medium || 'cpc');
  params.set('utm_campaign', campaign);
  if (term) params.set('utm_term', term);
  if (content) params.set('utm_content', content);

  const separator = url.includes('?') ? '&' : '?';
  const finalUrl = `${url}${separator}${params.toString()}`;

  res.json({ success: true, result: { url: finalUrl, params: Object.fromEntries(params) } });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
