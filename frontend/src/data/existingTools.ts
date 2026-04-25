// List of all existing tools based on the actual routes in App.tsx
export const existingTools = [
  // Audio Tools
  'audio-converter',
  'speech-to-text',
  'audio-trimmer',
  'audio-merger',
  'audio-speed',
  
  // Date & Time Tools
  'age-calculator',
  'date-difference',
  'working-days-calculator',
  'countdown-timer',
  'world-time',
  
  // Developer Tools
  'json-formatter',
  'regex-tester',
  'url-encoder',
  'color-converter',
  'lorem-ipsum-generator',
  'jwt-decoder',
  'cron-generator',
  'http-header-checker',
  'token-calculator',
  'color-palettes',
  'api-response-formatter',
  'json-to-typescript-interface',
  'sql-query-beautifier',
  'jwt-token-expiry-calculator',
  'environment-variable-generator',
  'postman-collection-generator',
  'dockerfile-generator',
  'curl-to-axios-converter',
  'http-status-code-explainer',
  
  // Education Tools
  'scientific-calculator',
  'percentage-calculator',
  'unit-converter',
  'compound-interest-calculator',
  'simple-interest-calculator',
  'cgpa-to-percentage',
  'lcm-hcf-calculator',
  'study-timetable-generator',
  'mcq-generator',
  
  // Finance Tools
  'emi-calculator',
  'gst-calculator',
  'salary-calculator',
  'currency-converter',
  'startup-burn-rate-calculator',
  'saas-pricing-calculator',
  'emi-comparison',
  'tax-slab-analyzer',
  'invoice-generator',
  'profit-margin-calculator',
  'freelancer-rate-calculator',
  'salary-breakup-generator',
  'budget-planner',
  'stock-cagr-calculator',
  'mutual-fund-calculator',
  'lumpsum-calculator',
  
  // Image Tools
  'qr-code-generator',
  'qr-code-scanner',
  'png-to-jpg-converter',
  'jpg-to-png-converter',
  'webp-to-png-converter',
  'png-to-webp-converter',
  'webp-to-jpg-converter',
  'jpg-to-webp-converter',
  'image-compressor',
  'image-resize',
  'image-crop',
  'background-remover',
  'whatsapp-status-generator',
  'image-base64',
  'image-dpi-checker',
  'exif-viewer',
  'favicon-generator',
  'image-to-pdf',
  
  // Internet Tools
  'ip-lookup',
  'user-agent-parser',
  'dns-lookup',
  'ssl-checker',
  'website-ping',
  'website-screenshot',
  
  // PDF Tools
  'pdf-merge',
  'pdf-split',
  'pdf-to-image',
  'pdf-password',
  'pdf-unlock',
  'pdf-page-remover',
  'pdf-rotate',
  'pdf-to-word',
  'pdf-to-powerpoint',
  'pdf-to-excel',
  'word-to-pdf',
  'powerpoint-to-pdf',
  'html-to-pdf',
  'pdf-reorder',
  'pdf-add-signature',
  'crop-pdf',
  
  // Security Tools
  'password-generator',
  'password-strength',
  'hash-generator',
  'base64-encoder',
  'uuid-generator',
  'password-strength-explainer',
  'data-breach-email-checker',
  'file-hash-comparison',
  'exif-location-remover',
  'text-redaction',
  'qr-phishing-scanner',
  'secure-notes',
  'url-reputation-checker',
  
  // SEO Tools
  'meta-title-description-generator',
  'keyword-density-checker',
  'robots-txt-generator',
  'sitemap-validator',
  'page-speed-checklist-generator',
  'og-image-preview-tool',
  'broken-image-finder',
  'utm-link-builder',
  'domain-age-checker',
  'tech-stack-detector',
  'page-seo-analyzer',
  
  // Social Media Tools
  'hashtag-generator',
  'bio-generator',
  'caption-formatter',
  'line-break-generator',
  'link-in-bio',
  'meme-generator',
  
  // Text Tools
  'word-counter',
  'case-converter',
  'markdown-to-html',
  'remove-spaces',
  'line-sorter',
  'duplicate-remover',
  'text-summarizer',
  'text-diff',
  
  // Video Tools
  'video-to-audio',
  'video-trim',
  'video-speed',
  'video-thumbnail',
  'video-resolution',
  
  // Zip Tools
  'create-zip',
  'extract-zip',
  'password-zip',
  'compression-zip'
];

// Helper function to check if a tool exists
export const toolExists = (slug: string): boolean => {
  return existingTools.includes(slug);
};
