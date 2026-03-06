const cheerio = require('cheerio');
const axios = require('axios');

function detectTechnologies($, html, url, headers) {
  const techStack = {
    url: url,
    frontend: [],
    backend: [],
    database: [],
    server: [],
    cms: [],
    analytics: [],
    frameworks: [],
    other: []
  };

  const lowerHtml = html.toLowerCase();

  // Detect Frontend Technologies
  if (lowerHtml.includes('react') || lowerHtml.includes('_react') || lowerHtml.includes('data-reactroot')) {
    techStack.frontend.push('React');
    techStack.frameworks.push('React');
  }

  if (lowerHtml.includes('vue') || $('[v-]').length > 0 || lowerHtml.includes('vue.js')) {
    techStack.frontend.push('Vue.js');
    techStack.frameworks.push('Vue.js');
  }

  if (lowerHtml.includes('angular') || lowerHtml.includes('ng-app') || lowerHtml.includes('angular.js')) {
    techStack.frontend.push('Angular');
    techStack.frameworks.push('Angular');
  }

  if (lowerHtml.includes('jquery') || lowerHtml.includes('jquery.js')) {
    techStack.frontend.push('jQuery');
  }

  if (lowerHtml.includes('typescript') || lowerHtml.includes('.ts') || lowerHtml.includes('typescript.js')) {
    techStack.frontend.push('TypeScript');
  }

  // Detect CSS Frameworks
  if (lowerHtml.includes('bootstrap') || lowerHtml.includes('bootstrap.css')) {
    techStack.frontend.push('Bootstrap');
  }

  if (lowerHtml.includes('tailwind') || lowerHtml.includes('tailwindcss')) {
    techStack.frontend.push('Tailwind CSS');
  }

  if (lowerHtml.includes('bulma')) {
    techStack.frontend.push('Bulma');
  }

  if (lowerHtml.includes('materialize') || lowerHtml.includes('materializecss')) {
    techStack.frontend.push('Materialize CSS');
  }

  // Detect CMS and Backend
  if (lowerHtml.includes('wordpress') || lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes')) {
    techStack.cms.push('WordPress');
    techStack.backend.push('PHP');
  }

  if (lowerHtml.includes('drupal')) {
    techStack.cms.push('Drupal');
    techStack.backend.push('PHP');
  }

  if (lowerHtml.includes('joomla')) {
    techStack.cms.push('Joomla');
    techStack.backend.push('PHP');
  }

  if (lowerHtml.includes('shopify')) {
    techStack.cms.push('Shopify');
  }

  if (lowerHtml.includes('wix')) {
    techStack.cms.push('Wix');
  }

  // Detect Analytics
  if (lowerHtml.includes('google-analytics') || lowerHtml.includes('googletagmanager') || lowerHtml.includes('gtag')) {
    techStack.analytics.push('Google Analytics');
  }

  if (lowerHtml.includes('facebook-pixel') || lowerHtml.includes('fbq')) {
    techStack.analytics.push('Facebook Pixel');
  }

  if (lowerHtml.includes('hotjar')) {
    techStack.analytics.push('Hotjar');
  }

  if (lowerHtml.includes('mixpanel')) {
    techStack.analytics.push('Mixpanel');
  }

  // Detect Server/CDN from headers
  const serverHeader = headers['server'] || headers['Server'];
  if (serverHeader) {
    if (serverHeader.toLowerCase().includes('nginx')) {
      techStack.server.push('Nginx');
    }
    if (serverHeader.toLowerCase().includes('apache')) {
      techStack.server.push('Apache');
    }
    if (serverHeader.toLowerCase().includes('iis')) {
      techStack.server.push('IIS');
    }
  }

  const poweredBy = headers['x-powered-by'] || headers['X-Powered-By'];
  if (poweredBy) {
    if (poweredBy.toLowerCase().includes('express')) {
      techStack.backend.push('Express.js');
      techStack.frameworks.push('Express.js');
    }
    if (poweredBy.toLowerCase().includes('php')) {
      techStack.backend.push('PHP');
    }
  }

  // Check for CDN
  const via = headers['via'] || headers['Via'];
  const cfRay = headers['cf-ray'] || headers['CF-RAY'];
  if (cfRay || lowerHtml.includes('cloudflare') || via?.toLowerCase().includes('cloudflare')) {
    techStack.server.push('Cloudflare');
  }

  if (lowerHtml.includes('stackpath') || lowerHtml.includes('bootstrapcdn')) {
    techStack.other.push('BootstrapCDN');
  }

  if (lowerHtml.includes('jsdelivr')) {
    techStack.other.push('jsDelivr');
  }

  // Check for font services
  if (lowerHtml.includes('fonts.googleapis.com')) {
    techStack.other.push('Google Fonts');
  }

  if (lowerHtml.includes('typekit') || lowerHtml.includes('fonts.adobe.com')) {
    techStack.other.push('Adobe Fonts');
  }

  // Check for other common libraries
  if (lowerHtml.includes('lodash') || lowerHtml.includes('lodash.js')) {
    techStack.other.push('Lodash');
  }

  if (lowerHtml.includes('moment') || lowerHtml.includes('moment.js')) {
    techStack.other.push('Moment.js');
  }

  if (lowerHtml.includes('axios') || lowerHtml.includes('axios.js')) {
    techStack.other.push('Axios');
  }

  // If no technologies detected, add basic ones
  if (techStack.frontend.length === 0) {
    techStack.frontend.push('HTML5', 'CSS3', 'JavaScript');
  }

  // Remove duplicates
  Object.keys(techStack).forEach(key => {
    if (Array.isArray(techStack[key])) {
      techStack[key] = [...new Set(techStack[key])];
    }
  });

  return techStack;
}

async function test() {
  try {
    console.log('Testing tech stack detection with https://example.com...');
    const response = await axios.get('https://example.com', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const result = detectTechnologies($, html, 'https://example.com', response.headers);

    console.log('Detection result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();
