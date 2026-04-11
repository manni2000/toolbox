// API Configuration - Updated for Node.js Server Integration
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'https://api.dailytools247.app'
  : 'http://localhost:5000';

// For deployment on dailytools247.vercel.app, ensure backend allows this origin
export const API_URLS = {
  BASE_URL: API_BASE_URL,
  
  // Blog endpoints
  BLOG_LIST: `${API_BASE_URL}/api/blog`,
  BLOG_SEARCH: `${API_BASE_URL}/api/blog/search`,
  BLOG_CATEGORIES: `${API_BASE_URL}/api/blog/categories`,
  BLOG_POST: (slug: string) => `${API_BASE_URL}/api/blog/${slug}`,
  BLOG_CATEGORY: (category: string) => `${API_BASE_URL}/api/blog/category/${category}`,
  
  // PDF endpoints
  HTML_TO_PDF: `${API_BASE_URL}/api/pdf/html-to-pdf`,
  PDF_TO_IMAGE: `${API_BASE_URL}/api/pdf/to-image`,
  PDF_TO_WORD: `${API_BASE_URL}/api/pdf/to-word`,
  PDF_TO_EXCEL: `${API_BASE_URL}/api/pdf/to-excel`,
  PDF_TO_POWERPOINT: `${API_BASE_URL}/api/pdf/to-powerpoint`,
  WORD_TO_PDF: `${API_BASE_URL}/api/pdf/word-to-pdf`,
  POWERPOINT_TO_PDF: `${API_BASE_URL}/api/pdf/powerpoint-to-pdf`,
  PDF_MERGE: `${API_BASE_URL}/api/pdf/merge`,
  PDF_SPLIT: `${API_BASE_URL}/api/pdf/split`,
  PDF_PASSWORD: `${API_BASE_URL}/api/pdf/password`,
  PDF_UNLOCK: `${API_BASE_URL}/api/pdf/unlock`,
  PDF_PAGE_REMOVER: `${API_BASE_URL}/api/pdf/remove-pages`,
  PDF_ROTATE: `${API_BASE_URL}/api/pdf/rotate`,
  PDF_COMPRESS: `${API_BASE_URL}/api/pdf/compress`,
  PDF_INFO: `${API_BASE_URL}/api/pdf/info`,
  
  // Image endpoints
  IMAGE_COMPRESSOR: `${API_BASE_URL}/api/image/compress`,
  IMAGE_CONVERTER: `${API_BASE_URL}/api/image/convert`,
  IMAGE_RESIZE: `${API_BASE_URL}/api/image/resize`,
  IMAGE_CROP: `${API_BASE_URL}/api/image/crop`,
  BACKGROUND_REMOVER: `${API_BASE_URL}/api/image/background-remover`,
  IMAGE_TO_WORD: `${API_BASE_URL}/api/image/image-to-word`,
  IMAGE_TO_PDF: `${API_BASE_URL}/api/image/image-to-pdf`,
  QR_GENERATOR: `${API_BASE_URL}/api/image/qr-generator`,
  QR_SCANNER: `${API_BASE_URL}/api/image/qr-scanner`,
  IMAGE_BASE64: `${API_BASE_URL}/api/image/base64`,
  EXIF_VIEWER: `${API_BASE_URL}/api/image/exif-viewer`,
  FAVICON_GENERATOR: `${API_BASE_URL}/api/image/favicon-generator`,
  IMAGE_DPI_CHECKER: `${API_BASE_URL}/api/image/dpi-checker`,
  
  // Audio endpoints
  AUDIO_CONVERTER: `${API_BASE_URL}/api/audio/convert`,
  AUDIO_MERGER: `${API_BASE_URL}/api/audio/merge`,
  AUDIO_TRIMMER: `${API_BASE_URL}/api/audio/trim`,
  AUDIO_SPEED: `${API_BASE_URL}/api/audio/speed`,
  SPEECH_TO_TEXT: `${API_BASE_URL}/api/audio/speech-to-text`,
  
  // Video endpoints
  VIDEO_DOWNLOADER: `${API_BASE_URL}/api/video/download`,
  VIDEO_TO_AUDIO: `${API_BASE_URL}/api/video/to-audio`,
  VIDEO_TRIM: `${API_BASE_URL}/api/video/trim`,
  VIDEO_SPEED: `${API_BASE_URL}/api/video/speed`,
  VIDEO_THUMBNAIL: `${API_BASE_URL}/api/video/thumbnail`,
  VIDEO_RESOLUTION: `${API_BASE_URL}/api/video/resolution`,
  VIDEO_CONVERT: `${API_BASE_URL}/api/video/convert`,
  VIDEO_COMPRESS: `${API_BASE_URL}/api/video/compress`,
  VIDEO_INFO: `${API_BASE_URL}/api/video/info`,
  
  // Security endpoints
  PASSWORD_GENERATOR: `${API_BASE_URL}/api/security/password-generator`,
  PASSWORD_STRENGTH: `${API_BASE_URL}/api/security/password-strength`,
  HASH_GENERATOR: `${API_BASE_URL}/api/security/hash-generator`,
  BASE64_ENCODER: `${API_BASE_URL}/api/security/base64`,
  UUID_GENERATOR: `${API_BASE_URL}/api/security/uuid-generator`,
  PASSWORD_STRENGTH_EXPLAINER: `${API_BASE_URL}/api/security/password-strength-explainer`,
  DATA_BREACH_EMAIL_CHECKER: `${API_BASE_URL}/api/security/data-breach-checker`,
  FILE_HASH_COMPARISON: `${API_BASE_URL}/api/security/file-hash-comparison`,
  EXIF_LOCATION_REMOVER: `${API_BASE_URL}/api/security/exif-location-remover`,
  TEXT_REDACTION: `${API_BASE_URL}/api/security/text-redaction`,
  QR_PHISHING_SCANNER: `${API_BASE_URL}/api/security/qr-phishing-scanner`,
  SECURE_NOTES: `${API_BASE_URL}/api/security/secure-notes`,
  URL_REPUTATION_CHECKER: `${API_BASE_URL}/api/security/url-reputation-checker`,
  
  // Date & Time endpoints
  DATE_DIFFERENCE: `${API_BASE_URL}/api/date-time/date-difference`,
  WORKING_DAYS: `${API_BASE_URL}/api/date-time/working-days`,
  COUNTDOWN_TIMER: `${API_BASE_URL}/api/date-time/countdown`,
  WORLD_TIME: `${API_BASE_URL}/api/date-time/world-time`,
  AGE_CALCULATOR: `${API_BASE_URL}/api/date-time/age-calculator`,
  
  // Developer Tools endpoints
  JSON_FORMATTER: `${API_BASE_URL}/api/dev/json-formatter`,
  REGEX_TESTER: `${API_BASE_URL}/api/dev/regex-tester`,
  URL_ENCODER: `${API_BASE_URL}/api/dev/url-encoder`,
  COLOR_CONVERTER: `${API_BASE_URL}/api/dev/color-converter`,
  LOREM_GENERATOR: `${API_BASE_URL}/api/dev/lorem-generator`,
  JWT_DECODER: `${API_BASE_URL}/api/dev/jwt-decoder`,
  CRON_GENERATOR: `${API_BASE_URL}/api/dev/cron-generator`,
  UUID_GENERATOR_DEV: `${API_BASE_URL}/api/dev/uuid-generator`,
  HTTP_HEADER_CHECKER: `${API_BASE_URL}/api/dev/http-header-checker`,
  API_RESPONSE_FORMATTER: `${API_BASE_URL}/api/dev/api-response-formatter`,
  JSON_TO_TYPESCRIPT: `${API_BASE_URL}/api/dev/json-to-typescript`,
  SQL_QUERY_BEAUTIFIER: `${API_BASE_URL}/api/dev/sql-query-beautifier`,
  JWT_EXPIRY: `${API_BASE_URL}/api/dev/jwt-expiry`,
  ENVIRONMENT_VARIABLE: `${API_BASE_URL}/api/dev/environment-variable`,
  POSTMAN_COLLECTION: `${API_BASE_URL}/api/dev/postman-collection`,
  DOCKERFILE_GENERATOR: `${API_BASE_URL}/api/dev/dockerfile-generator`,
  CURL_TO_AXIOS: `${API_BASE_URL}/api/dev/curl-to-axios`,
  HTTP_STATUS_CODE: `${API_BASE_URL}/api/dev/http-status-code`,
  
  // Education endpoints
  SCIENTIFIC_CALCULATOR: `${API_BASE_URL}/api/education/scientific-calculator`,
  PERCENTAGE_CALCULATOR: `${API_BASE_URL}/api/education/percentage-calculator`,
  UNIT_CONVERTER: `${API_BASE_URL}/api/education/unit-converter`,
  COMPOUND_INTEREST: `${API_BASE_URL}/api/education/compound-interest`,
  SIMPLE_INTEREST: `${API_BASE_URL}/api/education/simple-interest`,
  CGPA_TO_PERCENTAGE: `${API_BASE_URL}/api/education/cgpa-to-percentage`,
  LCM_HCF: `${API_BASE_URL}/api/education/lcm-hcf`,
  STUDY_TIMETABLE: `${API_BASE_URL}/api/education/study-timetable`,
  MCQ_GENERATOR: `${API_BASE_URL}/api/education/mcq-generator`,
  
  // Finance endpoints
  EMI_CALCULATOR: `${API_BASE_URL}/api/finance/emi-calculator`,
  GST_CALCULATOR: `${API_BASE_URL}/api/finance/gst-calculator`,
  SALARY_CALCULATOR: `${API_BASE_URL}/api/finance/salary-calculator`,
  CURRENCY_CONVERTER: `${API_BASE_URL}/api/finance/currency-converter`,
  STARTUP_BURN_RATE: `${API_BASE_URL}/api/finance/burn-rate-calculator`,
  SAAS_PRICING: `${API_BASE_URL}/api/finance/saas-pricing-calculator`,
  EMI_COMPARISON: `${API_BASE_URL}/api/finance/emi-comparison`,
  TAX_SLAB_ANALYZER: `${API_BASE_URL}/api/finance/tax-slab-analyzer`,
  INVOICE_GENERATOR: `${API_BASE_URL}/api/finance/invoice-generator`,
  PROFIT_MARGIN: `${API_BASE_URL}/api/finance/profit-margin-calculator`,
  FREELANCER_RATE: `${API_BASE_URL}/api/finance/freelancer-rate-calculator`,
  SALARY_BREAKUP: `${API_BASE_URL}/api/finance/salary-breakup-generator`,
  BUDGET_PLANNER: `${API_BASE_URL}/api/finance/budget-planner`,
  STOCK_CAGR: `${API_BASE_URL}/api/finance/stock-cagr-calculator`,
  
  // Internet endpoints
  IP_LOOKUP: `${API_BASE_URL}/api/internet/ip-lookup`,
  USER_AGENT: `${API_BASE_URL}/api/internet/user-agent-parser`,
  DNS_LOOKUP: `${API_BASE_URL}/api/internet/dns-lookup`,
  SSL_CHECKER: `${API_BASE_URL}/api/internet/ssl-checker`,
  WEBSITE_PING: `${API_BASE_URL}/api/internet/website-ping`,
  HTTP_STATUS: `${API_BASE_URL}/api/internet/http-status`,
  PORT_SCANNER: `${API_BASE_URL}/api/internet/port-scanner`,
  WHOIS: `${API_BASE_URL}/api/internet/whois`,
  URL_SHORTENER: `${API_BASE_URL}/api/internet/url-shortener`,
  WEBSITE_SCREENSHOT: `${API_BASE_URL}/api/internet/website-screenshot`,
  
  // SEO endpoints
  META_TITLE_DESCRIPTION: `${API_BASE_URL}/api/seo/meta-title-description`,
  KEYWORD_DENSITY: `${API_BASE_URL}/api/seo/keyword-density`,
  ROBOTS_TXT: `${API_BASE_URL}/api/seo/robots-txt-generator`,
  SITEMAP_VALIDATOR: `${API_BASE_URL}/api/seo/sitemap-validator`,
  PAGE_SPEED_CHECKLIST: `${API_BASE_URL}/api/seo/page-speed-checklist`,
  OG_IMAGE_PREVIEW: `${API_BASE_URL}/api/seo/og-image-preview`,
  BROKEN_IMAGE_FINDER: `${API_BASE_URL}/api/seo/broken-image-finder`,
  UTM_LINK_BUILDER: `${API_BASE_URL}/api/seo/utm-link-builder`,
  DOMAIN_AGE: `${API_BASE_URL}/api/seo/domain-age-checker`,
  TECH_STACK_DETECTOR: `${API_BASE_URL}/api/seo/tech-stack-detector`,
  PAGE_SEO: `${API_BASE_URL}/api/seo/page-seo-analyzer`,
  
  // Social endpoints
  HASHTAG_GENERATOR: `${API_BASE_URL}/api/social/hashtag-generator`,
  BIO_GENERATOR: `${API_BASE_URL}/api/social/bio-generator`,
  CAPTION_FORMATTER: `${API_BASE_URL}/api/social/caption-formatter`,
  LINE_BREAK_GENERATOR: `${API_BASE_URL}/api/social/line-break-generator`,
  LINK_IN_BIO: `${API_BASE_URL}/api/social/link-in-bio`,
  MEME_GENERATOR: `${API_BASE_URL}/api/social/meme-generator`,
  POST_GENERATOR: `${API_BASE_URL}/api/social/post-generator`,
  EMOJI_SUGGESTER: `${API_BASE_URL}/api/social/emoji-suggester`,
  ANALYTICS: `${API_BASE_URL}/api/social/analytics`,
  CONTENT_CALENDAR: `${API_BASE_URL}/api/social/content-calendar`,
  
  // Text endpoints
  WORD_COUNTER: `${API_BASE_URL}/api/text/word-counter`,
  CASE_CONVERTER: `${API_BASE_URL}/api/text/case-converter`,
  MARKDOWN_HTML: `${API_BASE_URL}/api/text/markdown-to-html`,
  REMOVE_SPACES: `${API_BASE_URL}/api/text/remove-spaces`,
  LINE_SORTER: `${API_BASE_URL}/api/text/line-sorter`,
  DUPLICATE_REMOVER: `${API_BASE_URL}/api/text/duplicate-remover`,
  TEXT_SUMMARIZER: `${API_BASE_URL}/api/text/text-summarizer`,
  TEXT_DIFF: `${API_BASE_URL}/api/text/text-diff`,
  
  // ZIP endpoints
  CREATE_ZIP: `${API_BASE_URL}/api/zip/create`,
  EXTRACT_ZIP: `${API_BASE_URL}/api/zip/extract`,
  PASSWORD_ZIP: `${API_BASE_URL}/api/zip/password`,
  COMPRESSION_ZIP: `${API_BASE_URL}/api/zip/compression-test`,
  SPLIT_ZIP: `${API_BASE_URL}/api/zip/split`,
  MERGE_ZIP: `${API_BASE_URL}/api/zip/merge`,
  ZIP_INFO: `${API_BASE_URL}/api/zip/info`,
  TO_7Z: `${API_BASE_URL}/api/zip/to-7z`,
  TO_TAR: `${API_BASE_URL}/api/zip/to-tar`,
  REPAIR_ZIP: `${API_BASE_URL}/api/zip/repair`,
};

export default API_BASE_URL;
