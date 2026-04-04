// Enhanced SEO metadata for tools with improved descriptions, keywords, and schema markup
// This data layer provides rich SEO context for better search visibility

export interface ToolSeoMetadata {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  longTailKeywords: string[];
  category: string;
  faqs?: Array<{ question: string; answer: string }>;
  relatedTools?: string[];
  schema?: {
    type: 'SoftwareApplication' | 'Product';
    appCategory?: string;
    applicationCategory?: string;
    operatingSystem?: string;
    offers?: {
      price: string;
      priceCurrency: string;
    };
  };
}

export const toolSeoEnhancements: Record<string, ToolSeoMetadata> = {
  'pdf-to-word': {
    slug: 'pdf-to-word',
    title: 'PDF to Word Converter - Convert PDF to DOCX Online Free',
    description: 'Convert PDF files to editable Word documents (.DOCX) instantly online. Preserve formatting, maintain layout, and download without installation. Perfect for contracts, resumes, and reports.',
    keywords: [
      'pdf to word converter',
      'convert pdf to word',
      'pdf to docx',
      'online pdf converter',
      'free pdf to word',
      'convert pdf document',
      'edit pdf as word',
    ],
    longTailKeywords: [
      'convert pdf to editable word document',
      'pdf to word converter free no signup',
      'how to convert pdf to word online',
      'best pdf to word converter',
      'fast pdf to word conversion tool',
      'convert scanned pdf to word',
    ],
    category: 'PDF Tools',
    faqs: [
      {
        question: 'Is PDF to Word conversion free?',
        answer: 'Yes, our PDF to Word converter is completely free with no hidden charges or subscriptions.',
      },
      {
        question: 'Will formatting be preserved?',
        answer: 'Our tool preserves most formatting, though complex layouts may need minor adjustments in Word.',
      },
      {
        question: 'Can I convert scanned PDFs?',
        answer: 'Scanned PDFs are images. For best results, use our OCR-enabled converter for better text recognition.',
      },
    ],
    relatedTools: ['pdf-merge', 'pdf-split', 'word-to-pdf', 'pdf-compress'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Document Converter',
      operatingSystem: 'Web',
      offers: {
        price: '0',
        priceCurrency: 'USD',
      },
    },
  },

  'image-compressor': {
    slug: 'image-compressor',
    title: 'Image Compressor - Reduce File Size Online Free (PNG, JPG, WebP)',
    description: 'Compress images online to reduce file size while maintaining quality. Supports PNG, JPG, WebP, and GIF. Perfect for web optimization, faster page loads, and better SEO performance.',
    keywords: [
      'image compressor',
      'compress image online',
      'reduce image size',
      'online image compressor',
      'free image compression',
      'png compressor',
      'jpg compressor',
      'webp compressor',
      'image optimization',
    ],
    longTailKeywords: [
      'compress image without losing quality',
      'best free online image compressor',
      'compress images for web performance',
      'reduce image file size fast',
      'online tool to compress images',
      'how to compress images for social media',
    ],
    category: 'Image Tools',
    faqs: [
      {
        question: 'How much will my image be compressed?',
        answer: 'Compression ratio depends on your image and quality settings. Usually 30-60% size reduction with minimal quality loss.',
      },
      {
        question: 'What formats are supported?',
        answer: 'We support PNG, JPG, JPEG, WebP, GIF, and AVIF formats.',
      },
      {
        question: 'Is my image secure?',
        answer: 'Yes. Images are processed locally in your browser and never stored on our servers.',
      },
    ],
    relatedTools: ['image-converter', 'image-resize', 'png-to-jpg-converter', 'background-remover'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Image Editor',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'qr-generator': {
    slug: 'qr-generator',
    title: 'QR Code Generator - Create Custom QR Codes Online Free',
    description: 'Generate custom QR codes instantly from URLs, text, or contact info. Adjust size and error correction level. Perfect for marketing, packaging, and digital campaigns. Download as PNG or SVG.',
    keywords: [
      'qr code generator',
      'create qr code',
      'online qr code maker',
      'free qr code generator',
      'custom qr codes',
      'qr code creator',
      'qr code maker',
      'dynamic qr code',
    ],
    longTailKeywords: [
      'how to generate qr code for free',
      'best free qr code generator online',
      'create qr code for url instantly',
      'qr code generator for wifi',
      'advanced qr code generator with logo',
      'batch qr code generator',
    ],
    category: 'Image Tools',
    relatedTools: ['qr-scanner', 'barcode-generator', 'png-to-jpg-converter'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Code Generator',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'json-formatter': {
    slug: 'json-formatter',
    title: 'JSON Formatter - Format & Validate JSON Online Instantly',
    description: 'Format, validate, and beautify JSON data. Detect errors, convert to different formats, and export instantly. Essential tool for developers debugging APIs and working with JSON data.',
    keywords: [
      'json formatter',
      'json validator',
      'format json',
      'validate json',
      'json beautifier',
      'json prettifier',
      'minify json',
      'json debugger',
    ],
    longTailKeywords: [
      'online json formatter and validator',
      'how to format json online',
      'best json formatting tool',
      'validate json structure instantly',
      'convert json to different formats',
      'beautify minified json',
    ],
    category: 'Developer Tools',
    faqs: [
      {
        question: 'Can it detect JSON errors?',
        answer: 'Yes, our formatter highlights syntax errors and shows exact line numbers.',
      },
      {
        question: 'Is there a file size limit?',
        answer: 'No hard limit, but very large files may take a moment to process.',
      },
    ],
    relatedTools: ['regex-tester', 'jwt-decoder', 'url-encoder'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Developer Tools',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'password-generator': {
    slug: 'password-generator',
    title: 'Secure Password Generator - Create Strong Passwords Online',
    description: 'Generate cryptographically secure passwords with customizable length and character types. Includes uppercase, lowercase, numbers, and symbols. Instantly create strong passwords for any account.',
    keywords: [
      'password generator',
      'secure password generator',
      'strong password creator',
      'random password generator',
      'online password maker',
      'password strength generator',
    ],
    longTailKeywords: [
      'generate secure passwords online free',
      'best online password generator tool',
      'create strong passwords instantly',
      'random secure password maker',
      'customizable password generator',
      'password generator with special characters',
    ],
    category: 'Security Tools',
    relatedTools: ['password-strength', 'hash-generator', 'uuid-generator'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Security Tool',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'word-counter': {
    slug: 'word-counter',
    title: 'Word Counter - Count Words, Characters, Sentences Online Free',
    description: 'Count words, characters, sentences, paragraphs, and reading time in real-time. Perfect for content writers, students, and SEO professionals. Paste text and get instant statistics.',
    keywords: [
      'word counter',
      'character counter',
      'sentence counter',
      'word count tool',
      'online word counter',
      'text statistics',
      'reading time calculator',
    ],
    longTailKeywords: [
      'count words and characters online',
      'best word counter tool free',
      'instant word counting software',
      'calculate reading time online',
      'word counter for seo content',
    ],
    category: 'Text Tools',
    relatedTools: ['case-converter', 'text-summarizer', 'duplicate-remover'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Text Analysis',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'meta-title-description-generator': {
    slug: 'meta-title-description-generator',
    title: 'Meta Title & Description Generator - SEO Optimization Tool',
    description: 'Generate SEO-optimized meta titles and descriptions automatically. Perfect for WordPress, Shopify, and any website. Get suggestions with character counts and preview SERP appearance.',
    keywords: [
      'meta title generator',
      'meta description generator',
      'seo meta tags generator',
      'title tag optimizer',
      'meta tag generator',
      'serp preview tool',
      'seo optimization tool',
    ],
    longTailKeywords: [
      'generate meta titles and descriptions for seo',
      'best meta description generator online',
      'seo title tag generator',
      'how to create effective meta descriptions',
      'meta tag optimization tool',
      'serp title generator',
    ],
    category: 'SEO Tools',
    relatedTools: ['keyword-density', 'robots-txt', 'sitemap-validator'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'SEO Tool',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'pdf-merge': {
    slug: 'pdf-merge',
    title: 'PDF Merger - Combine Multiple PDF Files Online Free',
    description: 'Merge multiple PDF files into one document instantly. Reorder pages, remove pages, and combine documents without installation. Secure, fast, and completely free.',
    keywords: [
      'pdf merger',
      'merge pdf',
      'combine pdf',
      'pdf combiner',
      'join pdf files',
      'online pdf merger',
      'free pdf merger',
    ],
    longTailKeywords: [
      'merge multiple pdf files online',
      'best free pdf merger tool',
      'how to combine pdf files instantly',
      'join pdf documents online free',
      'pdf merger with page reordering',
    ],
    category: 'PDF Tools',
    relatedTools: ['pdf-split', 'pdf-to-word', 'pdf-compress'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Document Editor',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'png-to-jpg-converter': {
    slug: 'png-to-jpg-converter',
    title: 'PNG to JPG Converter - Convert Images Online Free',
    description: 'Convert PNG images to JPG format instantly. Optimize quality, reduce file size, and batch convert multiple images. Perfect for web optimization and social media.',
    keywords: [
      'png to jpg converter',
      'convert png to jpg',
      'png to jpeg online',
      'image converter',
      'online image converter',
      'batch image converter',
    ],
    longTailKeywords: [
      'convert png to jpg online free',
      'best png to jpg converter tool',
      'how to convert png images to jpg',
      'batch convert png to jpg',
      'online png to jpeg converter',
    ],
    category: 'Image Tools',
    relatedTools: ['jpg-to-png-converter', 'webp-to-png-converter', 'image-compressor'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Image Converter',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'jwt-decoder': {
    slug: 'jwt-decoder',
    title: 'JWT Decoder - Decode JWT Tokens Online Free',
    description: 'Decode and verify JWT tokens instantly. View header, payload, and signature. Perfect for debugging authentication tokens and API integrations. No installation required.',
    keywords: [
      'jwt decoder',
      'jwt token decoder',
      'decode jwt',
      'jwt validator',
      'json web token decoder',
      'jwt debugger',
      'jwt parser',
    ],
    longTailKeywords: [
      'decode jwt tokens online instantly',
      'best jwt decoder tool for developers',
      'how to verify jwt tokens',
      'jwt token validator online',
      'decode jwt payload and headers',
    ],
    category: 'Developer Tools',
    relatedTools: ['json-formatter', 'url-encoder', 'regex-tester'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Developer Tools',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'hash-generator': {
    slug: 'hash-generator',
    title: 'Hash Generator - Generate MD5, SHA, BCrypt Hashes Online',
    description: 'Generate secure hashes using MD5, SHA-1, SHA-256, SHA-512, and BCrypt algorithms. Perfect for password storage, file verification, and data integrity checks.',
    keywords: [
      'hash generator',
      'sha256 generator',
      'md5 generator',
      'bcrypt generator',
      'hash calculator',
      'online hash generator',
      'secure hash function',
    ],
    longTailKeywords: [
      'generate hashes online securely',
      'best hash generator tool',
      'sha256 hash generator',
      'md5 hash generator online',
      'bcrypt hash calculator',
    ],
    category: 'Security Tools',
    relatedTools: ['password-generator', 'base64-tool', 'uuid-generator'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Security Tool',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'url-encoder': {
    slug: 'url-encoder',
    title: 'URL Encoder/Decoder - Encode & Decode URLs Online',
    description: 'Encode and decode URLs instantly. Handle special characters, spaces, and international characters. Essential for API development, sharing URLs safely, and debugging.',
    keywords: [
      'url encoder',
      'url decoder',
      'encode url',
      'decode url',
      'percent encoder',
      'url encoding',
      'online url encoder',
    ],
    longTailKeywords: [
      'encode url online instantly',
      'best url encoder decoder tool',
      'how to encode urls with special characters',
      'percent encoding online',
      'url safe encoding tool',
    ],
    category: 'Developer Tools',
    relatedTools: ['jwt-decoder', 'json-formatter', 'base64-tool'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Developer Tools',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'background-remover': {
    slug: 'background-remover',
    title: 'Background Remover - Remove Image Backgrounds Online Free',
    description: 'Remove image backgrounds instantly with AI-powered technology. Convert to PNG with transparency. Perfect for product photos, portraits, and design projects.',
    keywords: [
      'background remover',
      'remove background',
      'background eraser',
      'transparent background',
      'remove background from image',
      'online background remover',
      'ai background removal',
    ],
    longTailKeywords: [
      'remove image background online free',
      'best background remover tool ai',
      'how to remove background from photos',
      'transparent background generator',
      'batch background removal online',
    ],
    category: 'Image Tools',
    relatedTools: ['image-compressor', 'image-resize', 'png-to-jpg-converter'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Image Editor',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'emi-calculator': {
    slug: 'emi-calculator',
    title: 'EMI Calculator - Calculate Loan EMI Online Instantly',
    description: 'Calculate EMI (Equated Monthly Installment) for loans. Input principal, rate, and tenure to get instant monthly payment breakdown. Perfect for home, auto, and personal loans.',
    keywords: [
      'emi calculator',
      'loan emi calculator',
      'calculate emi',
      'monthly installment calculator',
      'home loan calculator',
      'emi computation',
    ],
    longTailKeywords: [
      'calculate emi online instantly',
      'best loan emi calculator tool',
      'home loan emi calculator',
      'personal loan emi calculator',
      'how to calculate emi manually',
    ],
    category: 'Finance Tools',
    relatedTools: ['gst-calculator', 'salary-calculator', 'currency-converter'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Financial Calculator',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'regex-tester': {
    slug: 'regex-tester',
    title: 'Regex Tester - Test Regular Expressions Online Free',
    description: 'Test and debug regular expressions instantly. Supports multiple regex flavors including JavaScript, Python, and PHP. Perfect for validation patterns and text matching.',
    keywords: [
      'regex tester',
      'regular expression tester',
      'regex validator',
      'regex debugger',
      'test regex online',
      'regular expression tool',
      'pattern matcher',
    ],
    longTailKeywords: [
      'test regex patterns online instantly',
      'best regex tester tool',
      'how to test regular expressions',
      'javascript regex tester',
      'regex pattern validator online',
    ],
    category: 'Developer Tools',
    relatedTools: ['json-formatter', 'url-encoder', 'jwt-decoder'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Developer Tools',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'age-calculator': {
    slug: 'age-calculator',
    title: 'Age Calculator - Calculate Age in Years, Months, Days',
    description: 'Calculate your age instantly. Get age in years, months, days, hours, and seconds. Perfect for birthdays, eligibility checks, and personal records.',
    keywords: [
      'age calculator',
      'calculate age',
      'birth date calculator',
      'age computation',
      'online age calculator',
      'years months days calculator',
    ],
    longTailKeywords: [
      'calculate age from date of birth',
      'age calculator in years months days',
      'how old am i calculator',
      'instant age calculator online',
      'accurate age calculator',
    ],
    category: 'Date & Time Tools',
    relatedTools: ['date-difference', 'world-time', 'countdown'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Utility',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'mutual-fund-calculator': {
    slug: 'mutual-fund-calculator',
    title: 'Mutual Fund Calculator - Calculate Returns Online Free',
    description: 'Calculate mutual fund returns instantly. Compare SIP vs lump sum, estimate investment growth, and plan your portfolio. Works with real market data and historical returns.',
    keywords: [
      'mutual fund calculator',
      'mf calculator',
      'mutual fund return calculator',
      'online mutual fund calculator',
      'free mf calculator',
      'sip vs lump sum calculator',
      'fund performance calculator',
    ],
    longTailKeywords: [
      'calculate mutual fund returns online',
      'best mutual fund calculator tool',
      'how to calculate mf returns',
      'sip calculation for mutual funds',
      'mutual fund growth calculator',
      'investment calculator mutual funds',
    ],
    category: 'Finance Tools',
    relatedTools: ['sip-calculator', 'lump-sum-calculator', 'roi-calculator'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Financial Calculator',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },

  'lump-sum-calculator': {
    slug: 'lump-sum-calculator',
    title: 'Lump Sum Calculator - Calculate One-Time Investment Returns',
    description: 'Calculate returns on lump sum investments instantly. Input amount, rate, and tenure to get projected maturity value. Perfect for planning financial investments.',
    keywords: [
      'lump sum calculator',
      'lump sum investment calculator',
      'online lump sum calculator',
      'free lump sum calculator',
      'investment lump sum',
      'maturity calculator',
      'returns calculator',
    ],
    longTailKeywords: [
      'calculate lump sum investment returns',
      'best lump sum calculator online',
      'lump sum vs sip calculator',
      'how to calculate lump sum returns',
      'one time investment calculator',
      'lump sum maturity calculator',
    ],
    category: 'Finance Tools',
    relatedTools: ['sip-calculator', 'mutual-fund-calculator', 'roi-calculator'],
    schema: {
      type: 'SoftwareApplication',
      appCategory: 'Financial Calculator',
      operatingSystem: 'Web',
      offers: { price: '0', priceCurrency: 'USD' },
    }
  },
};

export const getToolSeoMetadata = (toolSlug: string): ToolSeoMetadata | null => {
  return toolSeoEnhancements[toolSlug] || null;
};

export const getAllToolSlugs = (): string[] => {
  return Object.keys(toolSeoEnhancements);
};
