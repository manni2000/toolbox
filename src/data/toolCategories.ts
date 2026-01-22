import {
  Image,
  FileText,
  Video,
  Music,
  Archive,
  Type,
  Calendar,
  Shield,
  Eye,
  GraduationCap,
  Globe,
  Share2,
  DollarSign,
  Code,
  LucideIcon,
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  isAvailable: boolean;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  tools: Tool[];
}

export const toolCategories: ToolCategory[] = [
  {
    id: "image",
    name: "Image Tools",
    description: "Convert, compress, resize images and more",
    icon: Image,
    color: "173 80% 40%",
    tools: [
      { id: "qr-generator", name: "QR Code Generator", description: "Generate QR codes from URLs or text", path: "/tools/image/qr-generator", isAvailable: true },
      { id: "qr-scanner", name: "QR Code Scanner", description: "Scan and decode QR codes from images", path: "/tools/image/qr-scanner", isAvailable: true },
      { id: "image-converter", name: "Image Format Converter", description: "Convert between JPG, PNG, WEBP formats", path: "/tools/image/converter", isAvailable: true },
      { id: "image-compressor", name: "Image Compressor", description: "Compress images while maintaining quality", path: "/tools/image/compressor", isAvailable: true },
      { id: "image-resize", name: "Image Resize Tool", description: "Resize images to any dimension", path: "/tools/image/resize", isAvailable: true },
      { id: "image-crop", name: "Image Crop Tool", description: "Crop images with custom dimensions", path: "/tools/image/crop", isAvailable: true },
      { id: "background-remover", name: "Background Remover", description: "Remove background from images", path: "/tools/image/background-remover", isAvailable: true },
      { id: "whatsapp-status", name: "WhatsApp Status Generator", description: "Create perfect WhatsApp status images", path: "/tools/image/whatsapp-status", isAvailable: true },
      { id: "base64-image", name: "Image ↔ Base64", description: "Convert images to/from Base64", path: "/tools/image/base64", isAvailable: true },
      { id: "image-dpi", name: "Image DPI Checker", description: "Check image DPI and print sizes", path: "/tools/image/dpi-checker", isAvailable: true },
      { id: "exif-viewer", name: "EXIF Metadata Viewer", description: "View photo metadata and camera info", path: "/tools/image/exif-viewer", isAvailable: true },
      { id: "favicon-generator", name: "Favicon Generator", description: "Create favicons from images", path: "/tools/image/favicon", isAvailable: true },
    ],
  },
  {
    id: "pdf",
    name: "PDF Tools",
    description: "Merge, split, protect PDF documents",
    icon: FileText,
    color: "0 70% 50%",
    tools: [
      { id: "pdf-merge", name: "PDF Merge", description: "Combine multiple PDFs into one", path: "/tools/pdf/merge", isAvailable: true },
      { id: "pdf-split", name: "PDF Split", description: "Extract pages from PDF", path: "/tools/pdf/split", isAvailable: true },
      { id: "pdf-to-image", name: "PDF to Image", description: "Convert PDF pages to images", path: "/tools/pdf/to-image", isAvailable: true },
      { id: "pdf-password", name: "PDF Password Protector", description: "Add password to PDF files", path: "/tools/pdf/password", isAvailable: true },
      { id: "pdf-unlock", name: "PDF Unlocker", description: "Remove password from PDFs", path: "/tools/pdf/unlock", isAvailable: true },
      { id: "pdf-remove-pages", name: "PDF Page Remover", description: "Remove specific pages from PDF", path: "/tools/pdf/remove-pages", isAvailable: true },
      { id: "pdf-rotate", name: "PDF Rotate Pages", description: "Rotate PDF pages", path: "/tools/pdf/rotate", isAvailable: true },
    ],
  },
  {
    id: "video",
    name: "Video Tools",
    description: "Convert, trim, and process video files",
    icon: Video,
    color: "350 80% 55%",
    tools: [
      { id: "video-downloader", name: "Video Downloader", description: "Download from YouTube, Instagram, Facebook", path: "/tools/video/downloader", isAvailable: true },
      { id: "video-to-audio", name: "Video to Audio", description: "Extract audio from video files", path: "/tools/video/to-audio", isAvailable: true },
      { id: "video-trim", name: "Video Trim", description: "Cut and trim video clips", path: "/tools/video/trim", isAvailable: true },
      { id: "video-speed", name: "Video Speed Controller", description: "Change video playback speed", path: "/tools/video/speed", isAvailable: true },
      { id: "video-thumbnail", name: "Video Thumbnail Generator", description: "Extract thumbnails from videos", path: "/tools/video/thumbnail", isAvailable: true },
      { id: "video-resolution", name: "Video Resolution Converter", description: "Change video resolution", path: "/tools/video/resolution", isAvailable: true },
    ],
  },
  {
    id: "audio",
    name: "Audio Tools",
    description: "Convert and process audio files",
    icon: Music,
    color: "290 80% 55%",
    tools: [
      { id: "audio-converter", name: "Audio Format Converter", description: "Convert between MP3, WAV, AAC formats", path: "/tools/audio/converter", isAvailable: true },
    ],
  },
  {
    id: "text",
    name: "Text Tools",
    description: "Word count, case conversion, formatting",
    icon: Type,
    color: "280 80% 50%",
    tools: [
      { id: "word-counter", name: "Word & Character Counter", description: "Count words, characters, sentences", path: "/tools/text/word-counter", isAvailable: true },
      { id: "case-converter", name: "Case Converter", description: "Convert text case (upper, lower, title)", path: "/tools/text/case-converter", isAvailable: true },
      { id: "remove-spaces", name: "Remove Extra Spaces", description: "Clean up extra whitespace from text", path: "/tools/text/remove-spaces", isAvailable: true },
      { id: "line-sorter", name: "Line Sorter", description: "Sort lines alphabetically or numerically", path: "/tools/text/line-sorter", isAvailable: true },
      { id: "duplicate-remover", name: "Duplicate Line Remover", description: "Remove duplicate lines from text", path: "/tools/text/duplicate-remover", isAvailable: true },
      { id: "markdown-html", name: "Markdown → HTML", description: "Convert Markdown to HTML", path: "/tools/text/markdown-html", isAvailable: true },
      { id: "text-summarizer", name: "Text Summarizer", description: "Extract key sentences from text", path: "/tools/text/summarizer", isAvailable: true },
      { id: "text-diff", name: "Text Diff Checker", description: "Compare two texts and find differences", path: "/tools/text/diff", isAvailable: true },
      { id: "meme-generator", name: "Meme Generator", description: "Create memes with custom text", path: "/tools/text/meme-generator", isAvailable: true },
    ],
  },
  {
    id: "security",
    name: "Security Tools",
    description: "Password generators, hash tools, encoding",
    icon: Shield,
    color: "0 80% 55%",
    tools: [
      { id: "password-generator", name: "Password Generator", description: "Generate secure random passwords", path: "/tools/security/password-generator", isAvailable: true },
      { id: "password-strength", name: "Password Strength Checker", description: "Check how strong your password is", path: "/tools/security/password-strength", isAvailable: true },
      { id: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA1, SHA256 hashes", path: "/tools/security/hash-generator", isAvailable: true },
      { id: "base64-tool", name: "Base64 Encode/Decode", description: "Encode or decode Base64 strings", path: "/tools/security/base64", isAvailable: true },
      { id: "uuid-generator", name: "UUID Generator", description: "Generate unique UUIDs", path: "/tools/security/uuid-generator", isAvailable: true },
    ],
  },
  {
    id: "date-time",
    name: "Date & Time",
    description: "Calculators for dates, age, working days",
    icon: Calendar,
    color: "45 90% 50%",
    tools: [
      { id: "date-difference", name: "Date Difference Calculator", description: "Calculate days between two dates", path: "/tools/date-time/date-difference", isAvailable: true },
      { id: "age-calculator", name: "Age Calculator", description: "Calculate exact age from birthdate", path: "/tools/date-time/age-calculator", isAvailable: true },
      { id: "working-days", name: "Working Days Calculator", description: "Calculate business days between dates", path: "/tools/date-time/working-days", isAvailable: true },
      { id: "countdown", name: "Countdown Timer", description: "Create countdown to any date", path: "/tools/date-time/countdown", isAvailable: true },
    ],
  },
  {
    id: "dev",
    name: "Developer Tools",
    description: "JSON formatter, regex tester, JWT decoder",
    icon: Code,
    color: "210 80% 55%",
    tools: [
      { id: "json-formatter", name: "JSON Formatter", description: "Format and validate JSON", path: "/tools/dev/json-formatter", isAvailable: true },
      { id: "regex-tester", name: "Regex Tester", description: "Test regular expressions", path: "/tools/dev/regex-tester", isAvailable: true },
      { id: "jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JWT tokens", path: "/tools/dev/jwt-decoder", isAvailable: true },
      { id: "url-encoder", name: "URL Encoder/Decoder", description: "Encode or decode URLs", path: "/tools/dev/url-encoder", isAvailable: true },
      { id: "url-shortener", name: "URL Shortener", description: "Generate short URL codes", path: "/tools/dev/url-shortener", isAvailable: true },
      { id: "color-converter", name: "Color Converter", description: "Convert between HEX, RGB, HSL", path: "/tools/dev/color-converter", isAvailable: true },
      { id: "lorem-generator", name: "Lorem Ipsum Generator", description: "Generate placeholder text", path: "/tools/dev/lorem-generator", isAvailable: true },
      { id: "sitemap-generator", name: "Sitemap Generator", description: "Create XML sitemaps", path: "/tools/dev/sitemap-generator", isAvailable: true },
      { id: "robots-checker", name: "Robots.txt Checker", description: "Validate robots.txt files", path: "/tools/dev/robots-checker", isAvailable: true },
      { id: "cron-generator", name: "Cron Expression Generator", description: "Build cron schedule expressions", path: "/tools/dev/cron-generator", isAvailable: true },
      { id: "http-header", name: "HTTP Header Checker", description: "Check HTTP response headers", path: "/tools/dev/http-header", isAvailable: true },
      { id: "website-screenshot", name: "Website Screenshot", description: "Capture website screenshots", path: "/tools/dev/website-screenshot", isAvailable: true },
    ],
  },
  {
    id: "internet",
    name: "Internet Tools",
    description: "IP lookup, DNS, SSL checker",
    icon: Globe,
    color: "200 80% 50%",
    tools: [
      { id: "ip-lookup", name: "IP Address Lookup", description: "Get info about any IP address", path: "/tools/internet/ip-lookup", isAvailable: true },
      { id: "user-agent", name: "User-Agent Parser", description: "Parse browser user-agent strings", path: "/tools/internet/user-agent", isAvailable: true },
      { id: "dns-lookup", name: "DNS Lookup", description: "Query DNS records for domains", path: "/tools/internet/dns-lookup", isAvailable: true },
      { id: "ssl-checker", name: "SSL Certificate Checker", description: "Check SSL validity and expiry", path: "/tools/internet/ssl-checker", isAvailable: true },
      { id: "website-ping", name: "Website Ping Test", description: "Test website availability", path: "/tools/internet/ping", isAvailable: true },
    ],
  },
  {
    id: "education",
    name: "Education Tools",
    description: "Calculators, converters for students",
    icon: GraduationCap,
    color: "150 60% 45%",
    tools: [
      { id: "percentage-calc", name: "Percentage Calculator", description: "Calculate percentages easily", path: "/tools/education/percentage-calculator", isAvailable: true },
      { id: "cgpa-percentage", name: "CGPA to Percentage", description: "Convert CGPA to percentage", path: "/tools/education/cgpa-percentage", isAvailable: true },
      { id: "unit-converter", name: "Unit Converter", description: "Convert length, weight, temperature", path: "/tools/education/unit-converter", isAvailable: true },
      { id: "roman-numerals", name: "Roman Numerals Converter", description: "Convert to/from Roman numerals", path: "/tools/education/roman-numerals", isAvailable: true },
    ],
  },
  {
    id: "finance",
    name: "Finance Tools",
    description: "EMI, GST, salary calculators",
    icon: DollarSign,
    color: "140 70% 40%",
    tools: [
      { id: "emi-calculator", name: "EMI Calculator", description: "Calculate loan EMI payments", path: "/tools/finance/emi-calculator", isAvailable: true },
      { id: "gst-calculator", name: "GST Calculator", description: "Calculate GST amounts", path: "/tools/finance/gst-calculator", isAvailable: true },
      { id: "salary-calculator", name: "Salary Calculator", description: "Calculate in-hand salary", path: "/tools/finance/salary-calculator", isAvailable: true },
      { id: "tip-calculator", name: "Tip Calculator", description: "Calculate tip amounts", path: "/tools/finance/tip-calculator", isAvailable: true },
    ],
  },
  {
    id: "zip",
    name: "ZIP Tools",
    description: "Create and extract ZIP archives",
    icon: Archive,
    color: "35 90% 50%",
    tools: [
      { id: "create-zip", name: "Create ZIP", description: "Create ZIP from multiple files", path: "/tools/zip/create", isAvailable: true },
      { id: "extract-zip", name: "Extract ZIP", description: "Extract files from ZIP archive", path: "/tools/zip/extract", isAvailable: true },
      { id: "password-zip", name: "Password-Protected ZIP", description: "Create encrypted ZIP archives", path: "/tools/zip/password", isAvailable: true },
      { id: "compression-zip", name: "Compression Level ZIP", description: "ZIP with custom compression", path: "/tools/zip/compression", isAvailable: true },
    ],
  },
  {
    id: "social",
    name: "Social Media",
    description: "Hashtag generators, bio tools",
    icon: Share2,
    color: "330 80% 55%",
    tools: [
      { id: "hashtag-generator", name: "Hashtag Generator", description: "Generate relevant hashtags", path: "/tools/social/hashtag-generator", isAvailable: true },
      { id: "bio-generator", name: "Bio Generator", description: "Create social media bios", path: "/tools/social/bio-generator", isAvailable: true },
      { id: "line-break", name: "Line Break Generator", description: "Add line breaks for Instagram", path: "/tools/social/line-break", isAvailable: true },
    ],
  },
  {
    id: "viewers",
    name: "File Viewers",
    description: "View JSON, CSV, XML files",
    icon: Eye,
    color: "260 70% 55%",
    tools: [
      { id: "json-viewer", name: "JSON Viewer", description: "View and explore JSON files", path: "/tools/viewers/json", isAvailable: true },
      { id: "csv-viewer", name: "CSV Viewer", description: "View CSV data as table", path: "/tools/viewers/csv", isAvailable: true },
    ],
  },
];

export const getAllTools = (): Tool[] => {
  return toolCategories.flatMap(category => category.tools);
};

export const getToolById = (id: string): Tool | undefined => {
  return getAllTools().find(tool => tool.id === id);
};

export const getCategoryById = (id: string): ToolCategory | undefined => {
  return toolCategories.find(category => category.id === id);
};
