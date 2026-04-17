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
    const response = await fetch(targetUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    const html = await response.text();
    const headers = {};
    response.headers.forEach((v, k) => { headers[k] = v; });

    const detectedMethods = new Set();
    const confidence = {};

    function addTech(category, name, score, method) {
      if (!result[category]) result[category] = [];
      if (!result[category].includes(name)) result[category].push(name);
      confidence[name] = Math.max(confidence[name] || 0, score);
      detectedMethods.add(method);
    }

    const result = {
      url: targetUrl,
      frontend: [],
      backend: [],
      database: [],
      server: [],
      cms: [],
      analytics: [],
      frameworks: [],
      other: [],
    };

    const lhtml = html.toLowerCase();

    // ── Script sources ──────────────────────────────────────────────────────────
    const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    const allScripts = scriptSrcs.join(' ').toLowerCase();

    // ── Meta generator ──────────────────────────────────────────────────────────
    const metaGen = (html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']generator["']/i));
    const generatorTag = metaGen ? metaGen[1].toLowerCase() : '';

    // ── Fetch main JS bundle (Vite/CRA/webpack SPAs hide frameworks in bundles) ─
    let bundleContent = '';
    try {
      const base = new URL(targetUrl);
      // Find the main entry script: <script type="module" src="..."> or largest /assets/*.js
      const moduleScript = html.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i) ||
                           html.match(/<script[^>]+src=["']([^"']+\/(?:index|main|app)[^"']*\.js)["']/i) ||
                           html.match(/<script[^>]+src=["']([^"']+\/assets\/[^"']+\.js)["']/i);
      if (moduleScript) {
        let bundleUrl = moduleScript[1];
        if (!bundleUrl.startsWith('http')) {
          bundleUrl = bundleUrl.startsWith('/') ? `${base.protocol}//${base.host}${bundleUrl}` : `${base.protocol}//${base.href}${bundleUrl}`;
        }
        const bundleRes = await fetch(bundleUrl, {
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Range': 'bytes=0-49999',
          },
        });
        bundleContent = await bundleRes.text();
        detectedMethods.add('bundle_analysis');
      }
    } catch (_) { /* bundle fetch optional */ }

    // ══════════════════════════════════════════════════════════════════════════════
    // FRONTEND FRAMEWORKS & LIBRARIES
    // ══════════════════════════════════════════════════════════════════════════════

    // Combined search targets: HTML + partial bundle
    const htmlAndBundle = html + ' ' + bundleContent;

    // Next.js
    if (/__NEXT_DATA__|_next\/static|_next\/image|__next/i.test(html) || allScripts.includes('/_next/')) {
      addTech('frontend', 'Next.js', 95, 'html_pattern');
    }

    // Nuxt.js
    if (/__nuxt__|_nuxt\/|window\.__NUXT__|nuxt\.js/i.test(html) || allScripts.includes('/_nuxt/')) {
      addTech('frontend', 'Nuxt.js', 95, 'html_pattern');
    }

    // Gatsby
    if (/___gatsby|gatsby-image|gatsby\.js|window\.gatsby/i.test(html) || allScripts.includes('gatsby')) {
      addTech('frontend', 'Gatsby', 92, 'html_pattern');
    }

    // Remix
    if (/__remixContext|remix\.run|@remix-run/i.test(html)) {
      addTech('frontend', 'Remix', 92, 'html_pattern');
    }

    // Astro
    if (/astro-island|astro:page-load|astro\.js/i.test(html) || allScripts.includes('astro')) {
      addTech('frontend', 'Astro', 92, 'html_pattern');
    }

    // SvelteKit
    if (/__sveltekit|sveltekit|svelte-kit/i.test(html) || allScripts.includes('svelte')) {
      addTech('frontend', 'SvelteKit', 90, 'html_pattern');
    } else if (/svelte/i.test(htmlAndBundle)) {
      addTech('frontend', 'Svelte', 82, 'bundle_analysis');
    }

    // React — HTML markers first, then bundle analysis
    const reactInHtml = /data-reactroot|__react|react-root|react\.development|react\.production/i.test(html) ||
        /react-dom|react\.min\.js|\/react@\d/i.test(allScripts);
    // In minified bundles React signals: createRoot(, ReactDOM, createElement(, useState, useEffect, "react", 'react'
    const reactInBundle = bundleContent && (
        /createRoot\(|ReactDOM\.render\(|React\.createElement\(/.test(bundleContent) ||
        /\.createElement\(|\.useState\(|\.useEffect\(|\.useRef\(/.test(bundleContent) ||
        /useState\b|useEffect\b|useRef\b|useCallback\b|useMemo\b/.test(bundleContent) ||
        /"react"|'react'|from"react"|from 'react'/.test(bundleContent) ||
        /\{createElement:/.test(bundleContent)
    );
    const divRoot = /<div\s+id=["']root["']/.test(html);
    if (reactInHtml) {
      addTech('frontend', 'React', 92, 'html_pattern');
    } else if (reactInBundle) {
      addTech('frontend', 'React', 90, 'bundle_analysis');
    } else if (result.frontend.includes('Next.js') || result.frontend.includes('Gatsby') || result.frontend.includes('Remix')) {
      addTech('frontend', 'React', 88, 'framework_inference');
    } else if (divRoot && bundleContent) {
      addTech('frontend', 'React', 78, 'html_pattern');
    }

    // Vue.js — HTML markers + bundle
    const vueInHtml = /vue-app|__vue__|data-v-[a-f0-9]{7,}|vue\.js|vue\.min\.js|vue\.runtime/i.test(html) ||
        /\/vue@\d|\/vue\.(?:min|esm)\.js/i.test(allScripts);
    const vueInBundle = bundleContent && /(createApp\s*\(|defineComponent\s*\(|ref\s*\(|reactive\s*\(|computed\s*\()/.test(bundleContent) &&
        /Vue|"vue"|'vue'/.test(bundleContent);
    const divApp = /<div\s+id=["']app["']/.test(html);
    if (vueInHtml) {
      addTech('frontend', 'Vue.js', 92, 'html_pattern');
    } else if (vueInBundle) {
      addTech('frontend', 'Vue.js', 90, 'bundle_analysis');
    } else if (divApp && bundleContent && /createApp|defineComponent/.test(bundleContent) && !reactInBundle) {
      addTech('frontend', 'Vue.js', 78, 'bundle_analysis');
    }

    // Angular — strict patterns only (no generic ng- check)
    if (/ng-version=["'][0-9]|ng-app=|angular\.js|angular\.min\.js|zone\.js/i.test(html) ||
        /\bangular\b/.test(bundleContent) && /NgModule|Component\s*\(|Injectable\s*\(/.test(bundleContent) ||
        allScripts.includes('angular.min.js') || allScripts.includes('angular.js')) {
      addTech('frontend', 'Angular', 90, 'html_pattern');
    }

    // Ember.js
    if (/ember-application|ember\.js|ember\.min\.js|Ember\.VERSION/i.test(html) || allScripts.includes('ember')) {
      addTech('frontend', 'Ember.js', 88, 'html_pattern');
    }

    // Alpine.js
    if (/x-data=|x-init=|alpine\.js|alpinejs/i.test(html) || allScripts.includes('alpine')) {
      addTech('frontend', 'Alpine.js', 88, 'html_pattern');
    }

    // Backbone.js
    if (/backbone\.js|backbone\.min\.js/i.test(html) || allScripts.includes('backbone')) {
      addTech('frontend', 'Backbone.js', 85, 'script_src');
    }

    // Preact
    if (/preact(\.min)?\.js/i.test(html) || allScripts.includes('preact') ||
        (bundleContent && /preact/.test(bundleContent))) {
      addTech('frontend', 'Preact', 88, 'bundle_analysis');
    }

    // Solid.js
    if (/solid-js|solidjs/i.test(html) || allScripts.includes('solid-js') ||
        (bundleContent && /solid-js|createSignal\s*\(|createEffect\s*\(/.test(bundleContent))) {
      addTech('frontend', 'Solid.js', 88, 'bundle_analysis');
    }

    // jQuery
    if (/jquery(\.min)?\.js|window\.jquery|\$\.fn\.jquery/i.test(html) ||
        /jquery[\-\.]?\d|\/jquery(\.min)?\.js/.test(allScripts) ||
        (bundleContent && /jQuery\.fn\.jquery|window\.jQuery/.test(bundleContent))) {
      addTech('frontend', 'jQuery', 90, 'script_src');
    }

    // htmx
    if (/hx-get=|hx-post=|htmx\.js/i.test(html) || allScripts.includes('htmx')) {
      addTech('frontend', 'htmx', 88, 'html_pattern');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // CSS / UI FRAMEWORKS
    // ══════════════════════════════════════════════════════════════════════════════

    const cssSrcs = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m => m[1].toLowerCase()).join(' ');

    if (/bootstrap(\.min)?\.css|bootstrap(\.min)?\.js|class=["'][^"']*\b(container|row|col-|btn btn-)/i.test(html) ||
        cssSrcs.includes('bootstrap') || allScripts.includes('bootstrap')) {
      addTech('frameworks', 'Bootstrap', 85, 'html_pattern');
    }

    if (/tailwindcss|tw-|class=["'][^"']*(flex|grid|px-|py-|text-sm|font-bold|rounded-|bg-)[^"']*/i.test(html) ||
        cssSrcs.includes('tailwind') || allScripts.includes('tailwind')) {
      addTech('frameworks', 'Tailwind CSS', 82, 'html_pattern');
    }

    if (/@mui|material-ui|MuiButton|MuiAppBar/i.test(html) || allScripts.includes('@mui') || allScripts.includes('material-ui')) {
      addTech('frameworks', 'Material UI', 88, 'html_pattern');
    }

    if (/ant-design|antd|ant-btn|ant-layout/i.test(html) || allScripts.includes('antd')) {
      addTech('frameworks', 'Ant Design', 85, 'html_pattern');
    }

    if (/chakra-ui|ChakraProvider/i.test(html) || allScripts.includes('chakra')) {
      addTech('frameworks', 'Chakra UI', 85, 'html_pattern');
    }

    if (/bulma(\.min)?\.css|class=["'][^"']*\b(is-primary|is-danger|hero is-)/i.test(html) || cssSrcs.includes('bulma')) {
      addTech('frameworks', 'Bulma', 82, 'html_pattern');
    }

    if (/foundation(\.min)?\.css/i.test(html) || cssSrcs.includes('foundation')) {
      addTech('frameworks', 'Foundation', 82, 'css_pattern');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // BUILD TOOLS / BUNDLERS
    // ══════════════════════════════════════════════════════════════════════════════

    if (/__webpack_require__|webpackJsonp|webpack-runtime|webpackChunk/i.test(html) || allScripts.includes('webpack')) {
      addTech('frameworks', 'Webpack', 88, 'html_pattern');
    }

    // Vite: type="module" + /assets/index-[hash].js is its signature output
    const isVite = /\/@vite\/|__vite__|from 'vite'/i.test(html) ||
        allScripts.includes('/@vite/') ||
        /\/assets\/[a-zA-Z0-9_\-]+\-[a-zA-Z0-9_\-]{7,}\.(js|css)/.test(html) ||
        (html.includes('type="module"') && /\/assets\/index[\-\.]/.test(html));
    if (isVite) {
      addTech('frameworks', 'Vite', 90, 'html_pattern');
    }

    if (/parcel-bundle|parcelrequire/i.test(html) || allScripts.includes('parcel')) {
      addTech('frameworks', 'Parcel', 82, 'html_pattern');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // CMS PLATFORMS
    // ══════════════════════════════════════════════════════════════════════════════

    if (/wp-content|wp-includes|wordpress|xmlrpc\.php|\/wp-json\//i.test(html) || generatorTag.includes('wordpress')) {
      addTech('cms', 'WordPress', 95, 'html_pattern');
    }

    if (/shopify\.com\/s\/files|cdn\.shopify\.com|Shopify\.theme|shopify-section/i.test(html)) {
      addTech('cms', 'Shopify', 95, 'html_pattern');
    }

    if (/squarespace\.com|static1\.squarespace|squarespace-cdn/i.test(html)) {
      addTech('cms', 'Squarespace', 95, 'html_pattern');
    }

    if (/wixcode|static\.wixstatic\.com|wix\.com\/|parastorage\.com/i.test(html)) {
      addTech('cms', 'Wix', 95, 'html_pattern');
    }

    if (/webflow\.com|webflow-badge|WebFlow/i.test(html) || generatorTag.includes('webflow')) {
      addTech('cms', 'Webflow', 92, 'html_pattern');
    }

    if (/drupal\.settings|sites\/all\/|Drupal\.behaviors|drupal\.js/i.test(html) || generatorTag.includes('drupal')) {
      addTech('cms', 'Drupal', 92, 'html_pattern');
    }

    if (/joomla!|\/components\/com_|joomla\.js/i.test(html) || generatorTag.includes('joomla')) {
      addTech('cms', 'Joomla', 92, 'html_pattern');
    }

    if (/ghost-sdk|ghost\.io|content\.ghost\.io|ghost\.js/i.test(html)) {
      addTech('cms', 'Ghost', 90, 'html_pattern');
    }

    if (/prestashop|\/modules\/ps_|Prestashop/i.test(html)) {
      addTech('cms', 'PrestaShop', 90, 'html_pattern');
    }

    if (/Mage\.Cookies|Mage\.Customer|magento|magento2|\/skin\/frontend\/|\/mage\/|require\(['"]Magento/i.test(html) || generatorTag.includes('magento')) {
      addTech('cms', 'Magento', 90, 'html_pattern');
    }

    if (/bigcommerce\.com|cdn11\.bigcommerce/i.test(html)) {
      addTech('cms', 'BigCommerce', 92, 'html_pattern');
    }

    if (/contentful\.com|ctfassets\.net/i.test(html) || allScripts.includes('contentful')) {
      addTech('cms', 'Contentful', 88, 'script_src');
    }

    if (/strapi|strapi\.io/i.test(html)) {
      addTech('cms', 'Strapi', 80, 'html_pattern');
    }

    if (/sanity\.io|\.sanity\.studio/i.test(html) || allScripts.includes('sanity')) {
      addTech('cms', 'Sanity', 85, 'script_src');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // ANALYTICS & MARKETING
    // ══════════════════════════════════════════════════════════════════════════════

    if (/google-analytics\.com|googletagmanager\.com\/gtag|gtag\(|ga\('create'|_gaq\.push/i.test(html) ||
        allScripts.includes('google-analytics') || allScripts.includes('gtag/js')) {
      addTech('analytics', 'Google Analytics', 95, 'script_src');
    }

    if (/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+|gtm\.js/i.test(html) ||
        allScripts.includes('googletagmanager.com/gtm')) {
      addTech('analytics', 'Google Tag Manager', 95, 'script_src');
    }

    if (/hotjar\.com|_hjSettings|hjid:/i.test(html) || allScripts.includes('hotjar')) {
      addTech('analytics', 'Hotjar', 92, 'script_src');
    }

    if (/cdn\.mixpanel\.com|mixpanel\.init|mixpanel\.track/i.test(html) || allScripts.includes('mixpanel')) {
      addTech('analytics', 'Mixpanel', 92, 'script_src');
    }

    if (/cdn\.segment\.com|analytics\.identify|analytics\.track/i.test(html) || allScripts.includes('segment.com/analytics')) {
      addTech('analytics', 'Segment', 92, 'script_src');
    }

    if (/amplitude\.com\/libs|amplitude\.getInstance/i.test(html) || allScripts.includes('amplitude')) {
      addTech('analytics', 'Amplitude', 90, 'script_src');
    }

    if (/connect\.facebook\.net|fbq\(|_fbq|facebook-jssdk/i.test(html) || allScripts.includes('connect.facebook.net')) {
      addTech('analytics', 'Facebook Pixel', 92, 'script_src');
    }

    if (/hs-scripts\.com|hubspot\.com|_hsq\.push|HubSpotForms/i.test(html) ||
        allScripts.includes('hs-scripts.com') || allScripts.includes('hubspot')) {
      addTech('analytics', 'HubSpot', 92, 'script_src');
    }

    if (/intercomcdn\.com|window\.Intercom|intercom\.io/i.test(html) || allScripts.includes('intercom')) {
      addTech('analytics', 'Intercom', 92, 'script_src');
    }

    if (/crisp\.chat|window\.\$crisp|crisp-client/i.test(html) || allScripts.includes('crisp.chat')) {
      addTech('analytics', 'Crisp Chat', 92, 'script_src');
    }

    if (/heapanalytics\.com|heap\.load/i.test(html) || allScripts.includes('heapanalytics')) {
      addTech('analytics', 'Heap Analytics', 90, 'script_src');
    }

    if (/plausible\.io\/js|plausible\.io\/api/i.test(html) || allScripts.includes('plausible.io')) {
      addTech('analytics', 'Plausible Analytics', 95, 'script_src');
    }

    if (/matomo\.js|piwik\.js|_paq\.push/i.test(html) || allScripts.includes('matomo') || allScripts.includes('piwik')) {
      addTech('analytics', 'Matomo', 92, 'script_src');
    }

    if (/clarity\.ms\/tag|clarity\.ms\/c\//i.test(html) || allScripts.includes('clarity.ms')) {
      addTech('analytics', 'Microsoft Clarity', 92, 'script_src');
    }

    if (/cdn\.fullstory\.com|window\[_fs_namespace\]/i.test(html) || allScripts.includes('fullstory')) {
      addTech('analytics', 'FullStory', 90, 'script_src');
    }

    if (/static\.zdassets\.com|zendesk\.com|zESettings/i.test(html) || allScripts.includes('zendesk')) {
      addTech('analytics', 'Zendesk', 90, 'script_src');
    }

    if (/static\.klaviyo\.com|_learnq\.push|klaviyo/i.test(html) || allScripts.includes('klaviyo')) {
      addTech('analytics', 'Klaviyo', 90, 'script_src');
    }

    if (/cdn\.jsdelivr\.net\/npm\/cookieyes|cookieyes\.com/i.test(html) || allScripts.includes('cookieyes')) {
      addTech('analytics', 'CookieYes', 85, 'script_src');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // PAYMENT / E-COMMERCE
    // ══════════════════════════════════════════════════════════════════════════════

    if (/js\.stripe\.com|Stripe\(|stripe-js/i.test(html) || allScripts.includes('js.stripe.com')) {
      addTech('other', 'Stripe', 95, 'script_src');
    }

    if (/paypal\.com\/sdk\/js|PayPalCheckout|paypal-button/i.test(html) || allScripts.includes('paypal.com')) {
      addTech('other', 'PayPal', 92, 'script_src');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // BACKEND (from headers + cookies + HTML signals)
    // ══════════════════════════════════════════════════════════════════════════════

    const poweredBy = (headers['x-powered-by'] || '').toLowerCase();
    const serverHeader = (headers['server'] || '').toLowerCase();
    const setCookie = (headers['set-cookie'] || '').toLowerCase();
    const xGenerator = (headers['x-generator'] || '').toLowerCase();

    if (poweredBy.includes('php') || html.includes('.php') || setCookie.includes('phpsessid')) {
      addTech('backend', 'PHP', poweredBy.includes('php') ? 95 : 75, 'response_header');
    }

    if (poweredBy.includes('express') || poweredBy.includes('node')) {
      addTech('backend', 'Node.js', 95, 'response_header');
      addTech('backend', 'Express.js', 90, 'response_header');
    } else if (allScripts.includes('node_modules') || html.includes('express')) {
      addTech('backend', 'Node.js', 70, 'html_pattern');
    }

    if (poweredBy.includes('asp.net') || html.includes('__viewstate') || headers['x-aspnet-version'] || headers['x-aspnetmvc-version']) {
      addTech('backend', 'ASP.NET', 95, 'response_header');
    }

    if (/csrfmiddlewaretoken|django|djdt/i.test(html) || headers['x-django-request-id']) {
      addTech('backend', 'Django', 90, 'html_pattern');
      addTech('backend', 'Python', 88, 'framework_inference');
    }

    if (poweredBy.includes('flask') || html.includes('flask') || (headers['server'] || '').includes('werkzeug')) {
      addTech('backend', 'Flask', 88, 'response_header');
      addTech('backend', 'Python', 85, 'framework_inference');
    }

    if (/X-Rails|_rails_session|csrf-token.*rails|data-remote/i.test(html) ||
        setCookie.includes('_session_id') || headers['x-request-id']) {
      if (/rubyonrails|rails/i.test(poweredBy + html)) {
        addTech('backend', 'Ruby on Rails', 88, 'html_pattern');
        addTech('backend', 'Ruby', 85, 'framework_inference');
      }
    }

    if (/laravel_session|__laravel|laravel/i.test(html + setCookie)) {
      addTech('backend', 'Laravel', 90, 'html_pattern');
      addTech('backend', 'PHP', 88, 'framework_inference');
    }

    if (/symfony|_symfony_|sf_admin/i.test(html + setCookie)) {
      addTech('backend', 'Symfony', 88, 'html_pattern');
      addTech('backend', 'PHP', 85, 'framework_inference');
    }

    if (/x-spring-version|spring-web|Spring Framework/i.test(Object.values(headers).join(' ') + html) ||
        setCookie.includes('jsessionid')) {
      addTech('backend', 'Spring Boot', 85, 'response_header');
      addTech('backend', 'Java', 82, 'framework_inference');
    }

    if (/x-go-version|gorilla|gin-gonic/i.test(Object.values(headers).join(' '))) {
      addTech('backend', 'Go', 88, 'response_header');
    }

    if (result.frontend.includes('Next.js') && !result.backend.includes('Node.js')) {
      addTech('backend', 'Node.js', 85, 'framework_inference');
    }

    // Vite/React/Vue SPAs are built with Node.js toolchain
    if ((result.frameworks.includes('Vite') || result.frameworks.includes('Webpack')) &&
        !result.backend.length) {
      addTech('backend', 'Node.js', 75, 'framework_inference');
    }

    if (result.cms.includes('WordPress') && !result.backend.includes('PHP')) {
      addTech('backend', 'PHP', 90, 'framework_inference');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // SERVER / HOSTING / CDN
    // ══════════════════════════════════════════════════════════════════════════════

    if (headers['x-vercel-id'] || headers['x-vercel-cache'] || (serverHeader.includes('vercel'))) {
      addTech('server', 'Vercel', 98, 'response_header');
    }

    if (headers['x-nf-request-id'] || serverHeader.includes('netlify') || headers['x-netlify']) {
      addTech('server', 'Netlify', 98, 'response_header');
    }

    if (headers['cf-ray'] || headers['cf-cache-status'] || serverHeader.includes('cloudflare')) {
      addTech('server', 'Cloudflare', 98, 'response_header');
    }

    if (headers['x-amz-request-id'] || headers['x-amz-cf-id'] || serverHeader.includes('amazons3') ||
        (headers['server'] || '').includes('AmazonS3') || html.includes('.amazonaws.com')) {
      addTech('server', 'AWS', 90, 'response_header');
    }

    if (headers['x-github-request-id'] || serverHeader.includes('github.com') ||
        html.includes('github.io') || html.includes('github.com/')) {
      if (html.includes('github.io') || headers['x-github-request-id']) {
        addTech('server', 'GitHub Pages', 90, 'response_header');
      }
    }

    if (serverHeader.includes('nginx')) {
      addTech('server', 'Nginx', 95, 'response_header');
    }

    if (serverHeader.includes('apache')) {
      addTech('server', 'Apache', 95, 'response_header');
    }

    if (serverHeader.includes('iis') || serverHeader.includes('microsoft')) {
      addTech('server', 'IIS', 95, 'response_header');
    }

    if (serverHeader.includes('litespeed')) {
      addTech('server', 'LiteSpeed', 95, 'response_header');
    }

    if (headers['x-fastly-request-id'] || headers['surrogate-key'] || serverHeader.includes('fastly')) {
      addTech('server', 'Fastly CDN', 95, 'response_header');
    }

    if (headers['x-akamai-transformed'] || (headers['x-check-cacheable'])) {
      addTech('server', 'Akamai', 88, 'response_header');
    }

    if (serverHeader.includes('heroku') || headers['via']?.includes('vegur')) {
      addTech('server', 'Heroku', 90, 'response_header');
    }

    if (headers['x-goog-request-id'] || serverHeader.includes('gws') || html.includes('storage.googleapis.com')) {
      addTech('server', 'Google Cloud', 85, 'response_header');
    }

    if (headers['x-azure-ref'] || serverHeader.includes('windows-azure')) {
      addTech('server', 'Azure', 90, 'response_header');
    }

    // Generic server header fallback
    if (headers['server'] && !result.server.length) {
      addTech('server', headers['server'], 70, 'response_header');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // DATABASE (inferred from detected tech)
    // ══════════════════════════════════════════════════════════════════════════════

    if (/firebase\.googleapis\.com|firebaseapp\.com|firebaseio\.com/i.test(html) || allScripts.includes('firebase')) {
      addTech('database', 'Firebase', 92, 'script_src');
    }

    if (/supabase\.co|supabase-js/i.test(html) || allScripts.includes('supabase')) {
      addTech('database', 'Supabase', 92, 'script_src');
    }

    if (/cdn\.auth0\.com|auth0\.com|auth0-js/i.test(html) || allScripts.includes('auth0')) {
      addTech('other', 'Auth0', 92, 'script_src');
    }

    if (result.cms.includes('WordPress') || result.backend.includes('Laravel') || result.backend.includes('Symfony')) {
      if (!result.database.includes('MySQL')) addTech('database', 'MySQL', 75, 'framework_inference');
    }

    if (result.backend.includes('Django') || result.backend.includes('Ruby on Rails')) {
      if (!result.database.includes('PostgreSQL')) addTech('database', 'PostgreSQL', 72, 'framework_inference');
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // OTHER USEFUL TECH
    // ══════════════════════════════════════════════════════════════════════════════

    if (/recaptcha\.net|google\.com\/recaptcha/i.test(html) || allScripts.includes('recaptcha')) {
      addTech('other', 'reCAPTCHA', 95, 'script_src');
    }

    if (/mapbox\.com|mapboxgl|mapbox\.js/i.test(html) || allScripts.includes('mapbox')) {
      addTech('other', 'Mapbox', 92, 'script_src');
    }

    if (/maps\.googleapis\.com|google\.maps/i.test(html) || allScripts.includes('maps.googleapis.com')) {
      addTech('other', 'Google Maps', 95, 'script_src');
    }

    if (/player\.vimeo\.com|vimeocdn\.com/i.test(html) || allScripts.includes('vimeo')) {
      addTech('other', 'Vimeo', 92, 'script_src');
    }

    if (/youtube\.com\/embed|ytimg\.com/i.test(html)) {
      addTech('other', 'YouTube', 92, 'html_pattern');
    }

    if (/twilio\.com|twilio-js/i.test(html) || allScripts.includes('twilio')) {
      addTech('other', 'Twilio', 90, 'script_src');
    }

    // ── Summary ──────────────────────────────────────────────────────────────────
    const allTech = [
      ...result.frontend, ...result.backend, ...result.database,
      ...result.server, ...result.cms, ...result.analytics,
      ...result.frameworks, ...result.other
    ];
    const totalTechnologies = allTech.length;
    const highConfidence = allTech.filter(t => (confidence[t] || 0) >= 85).length;
    const mediumConfidence = allTech.filter(t => (confidence[t] || 0) >= 70 && (confidence[t] || 0) < 85).length;
    const lowConfidence = allTech.filter(t => (confidence[t] || 0) < 70).length;

    result.confidence = confidence;
    result.detectionMethods = [...detectedMethods];
    result.timestamp = new Date().toISOString();
    result.summary = { totalTechnologies, highConfidence, mediumConfidence, lowConfidence };

    res.json({ success: true, result });
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
