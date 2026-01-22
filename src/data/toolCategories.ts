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
      { id: "qr-generator", name: "QR Code Generator", description: "Generate QR codes from URLs or text", path: "/qr-code-generator", isAvailable: true },
      { id: "qr-scanner", name: "QR Code Scanner", description: "Scan and decode QR codes from images", path: "/qr-code-scanner", isAvailable: true },
      { id: "image-converter", name: "Image Format Converter", description: "Convert between JPG, PNG, WEBP formats", path: "/image-converter", isAvailable: true },
      { id: "image-compressor", name: "Image Compressor", description: "Compress images while maintaining quality", path: "/image-compressor", isAvailable: true },
      { id: "image-resize", name: "Image Resize Tool", description: "Resize images to any dimension", path: "/image-resize", isAvailable: true },
      { id: "image-crop", name: "Image Crop Tool", description: "Crop images with custom dimensions", path: "/image-crop", isAvailable: true },
      { id: "background-remover", name: "Background Remover", description: "Remove background from images", path: "/background-remover", isAvailable: true },
      { id: "image-to-pdf", name: "Image to PDF", description: "Convert multiple images to PDF document", path: "/image-to-pdf", isAvailable: true },
      { id: "image-to-word", name: "Image to Word", description: "Convert images to Word with OCR", path: "/image-to-word", isAvailable: true },
      { id: "base64-image", name: "Image ↔ Base64", description: "Convert images to/from Base64", path: "/image-base64", isAvailable: true },
      { id: "image-dpi", name: "Image DPI Checker", description: "Check image DPI and print sizes", path: "/image-dpi-checker", isAvailable: true },
      { id: "exif-viewer", name: "EXIF Metadata Viewer", description: "View photo metadata and camera info", path: "/exif-viewer", isAvailable: true },
      { id: "favicon-generator", name: "Favicon Generator", description: "Create favicons from images", path: "/favicon-generator", isAvailable: true },
    ],
  },
  {
    id: "pdf",
    name: "PDF Tools",
    description: "Merge, split, protect PDF documents",
    icon: FileText,
    color: "0 70% 50%",
    tools: [
      { id: "pdf-merge", name: "PDF Merge", description: "Combine multiple PDFs into one", path: "/pdf-merge", isAvailable: true },
      { id: "pdf-split", name: "PDF Split", description: "Extract pages from PDF", path: "/pdf-split", isAvailable: true },
      { id: "pdf-to-jpg", name: "PDF to JPG", description: "Convert PDF pages to images", path: "/pdf-to-jpg", isAvailable: true },
      { id: "pdf-to-word", name: "PDF to Word", description: "Convert PDF to editable Word document", path: "/pdf-to-word", isAvailable: true },
      { id: "pdf-to-powerpoint", name: "PDF to PowerPoint", description: "Convert PDF to PowerPoint slides", path: "/pdf-to-powerpoint", isAvailable: true },
      { id: "pdf-to-excel", name: "PDF to Excel", description: "Extract tables from PDF to Excel", path: "/pdf-to-excel", isAvailable: true },
      { id: "word-to-pdf", name: "Word to PDF", description: "Convert Word documents to PDF", path: "/word-to-pdf", isAvailable: true },
      { id: "powerpoint-to-pdf", name: "PowerPoint to PDF", description: "Convert presentations to PDF", path: "/powerpoint-to-pdf", isAvailable: true },
      { id: "html-to-pdf", name: "HTML to PDF", description: "Convert web pages to PDF", path: "/html-to-pdf", isAvailable: true },
      { id: "pdf-password", name: "PDF Password Protector", description: "Add password to PDF files", path: "/pdf-password", isAvailable: true },
      { id: "pdf-unlock", name: "PDF Unlocker", description: "Remove password from PDFs", path: "/pdf-unlock", isAvailable: true },
      { id: "pdf-remove-pages", name: "PDF Page Remover", description: "Remove specific pages from PDF", path: "/pdf-page-remover", isAvailable: true },
      { id: "pdf-rotate", name: "PDF Rotate Pages", description: "Rotate PDF pages", path: "/pdf-rotate", isAvailable: true },
    ],
  },
  {
    id: "video",
    name: "Video Tools",
    description: "Convert, trim, and process video files",
    icon: Video,
    color: "350 80% 55%",
    tools: [
      { id: "video-downloader", name: "Video Downloader", description: "Download from YouTube, Instagram, Facebook", path: "/video-downloader", isAvailable: true },
      { id: "video-to-audio", name: "Video to Audio", description: "Extract audio from video files", path: "/video-to-audio", isAvailable: true },
      { id: "video-trim", name: "Video Trim", description: "Cut and trim video clips", path: "/video-trim", isAvailable: true },
      { id: "video-speed", name: "Video Speed Controller", description: "Change video playback speed", path: "/video-speed", isAvailable: true },
      { id: "video-thumbnail", name: "Video Thumbnail Generator", description: "Extract thumbnails from videos", path: "/video-thumbnail", isAvailable: true },
      { id: "video-resolution", name: "Video Resolution Converter", description: "Change video resolution", path: "/video-resolution", isAvailable: true },
    ],
  },
  {
    id: "audio",
    name: "Audio Tools",
    description: "Convert and process audio files",
    icon: Music,
    color: "290 80% 55%",
    tools: [
      { id: "audio-converter", name: "Audio Format Converter", description: "Convert between MP3, WAV, AAC formats", path: "/audio-converter", isAvailable: true },
      { id: "speech-to-text", name: "Speech to Text", description: "Convert audio to text with language support", path: "/speech-to-text", isAvailable: true },
      { id: "audio-trimmer", name: "Audio Trimmer", description: "Cut and trim audio files", path: "/audio-trimmer", isAvailable: true },
      { id: "audio-merger", name: "Audio Merger", description: "Merge multiple audio files into one", path: "/audio-merger", isAvailable: true },
      { id: "audio-speed", name: "Audio Speed Changer", description: "Change speed from 0.5x to 2x with pitch control", path: "/audio-speed", isAvailable: true },
    ],
  },
  {
    id: "text",
    name: "Text Tools",
    description: "Word count, case conversion, formatting",
    icon: Type,
    color: "280 80% 50%",
    tools: [
      { id: "word-counter", name: "Word & Character Counter", description: "Count words, characters, sentences", path: "/word-counter", isAvailable: true },
      { id: "case-converter", name: "Case Converter", description: "Convert text case (upper, lower, title)", path: "/case-converter", isAvailable: true },
      { id: "color-converter", name: "Color Converter", description: "Convert between HEX, RGB, HSL", path: "/color-converter", isAvailable: true },
      { id: "remove-spaces", name: "Remove Extra Spaces", description: "Clean up extra whitespace from text", path: "/remove-spaces", isAvailable: true },
      { id: "line-sorter", name: "Line Sorter", description: "Sort lines alphabetically or numerically", path: "/line-sorter", isAvailable: true },
      { id: "duplicate-remover", name: "Duplicate Line Remover", description: "Remove duplicate lines from text", path: "/duplicate-remover", isAvailable: true },
      { id: "markdown-html", name: "Markdown → HTML", description: "Convert Markdown to HTML", path: "/markdown-to-html", isAvailable: true },
      { id: "text-summarizer", name: "Text Summarizer", description: "Extract key sentences from text", path: "/text-summarizer", isAvailable: true },
      { id: "text-diff", name: "Text Diff Checker", description: "Compare two texts and find differences", path: "/text-diff", isAvailable: true },
      { id: "meme-generator", name: "Meme Generator", description: "Create memes with custom text", path: "/meme-generator", isAvailable: true },
    ],
  },
  {
    id: "security",
    name: "Security Tools",
    description: "Password generators, hash tools, encoding",
    icon: Shield,
    color: "0 80% 55%",
    tools: [
      { id: "password-generator", name: "Password Generator", description: "Generate secure random passwords", path: "/password-generator", isAvailable: true },
      { id: "password-strength", name: "Password Strength Checker", description: "Check how strong your password is", path: "/password-strength", isAvailable: true },
      { id: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA1, SHA256 hashes", path: "/hash-generator", isAvailable: true },
      { id: "base64-tool", name: "Base64 Encode/Decode", description: "Encode or decode Base64 strings", path: "/base64-encoder", isAvailable: true },
      { id: "uuid-generator", name: "UUID Generator", description: "Generate unique UUIDs", path: "/uuid-generator", isAvailable: true },
    ],
  },
  {
    id: "date-time",
    name: "Date & Time",
    description: "Calculators for dates, age, working days",
    icon: Calendar,
    color: "45 90% 50%",
    tools: [
      { id: "date-difference", name: "Date Difference Calculator", description: "Calculate days between two dates", path: "/date-difference", isAvailable: true },
      { id: "age-calculator", name: "Age Calculator", description: "Calculate exact age from birthdate", path: "/age-calculator", isAvailable: true },
      { id: "working-days", name: "Working Days Calculator", description: "Calculate business days between dates", path: "/working-days-calculator", isAvailable: true },
      { id: "countdown", name: "Countdown Timer", description: "Create countdown to any date", path: "/countdown-timer", isAvailable: true },
    ],
  },
  {
    id: "dev",
    name: "Developer Tools",
    description: "JSON formatter, regex tester, JWT decoder",
    icon: Code,
    color: "210 80% 55%",
    tools: [
      { id: "json-formatter", name: "JSON Formatter", description: "Format and validate JSON", path: "/json-formatter", isAvailable: true },
      { id: "regex-tester", name: "Regex Tester", description: "Test regular expressions", path: "/regex-tester", isAvailable: true },
      { id: "jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JWT tokens", path: "/jwt-decoder", isAvailable: true },
      { id: "url-encoder", name: "URL Encoder/Decoder", description: "Encode or decode URLs", path: "/url-encoder", isAvailable: true },
      { id: "url-shortener", name: "URL Shortener", description: "Generate short URL codes", path: "/url-shortener", isAvailable: true },
      { id: "lorem-generator", name: "Lorem Ipsum Generator", description: "Generate placeholder text", path: "/lorem-ipsum-generator", isAvailable: true },
      { id: "sitemap-generator", name: "Sitemap Generator", description: "Create XML sitemaps", path: "/sitemap-generator", isAvailable: true },
      { id: "robots-checker", name: "Robots.txt Checker", description: "Validate robots.txt files", path: "/robots-txt-checker", isAvailable: true },
      { id: "cron-generator", name: "Cron Expression Generator", description: "Build cron schedule expressions", path: "/cron-generator", isAvailable: true },
      { id: "http-header", name: "HTTP Header Checker", description: "Check HTTP response headers", path: "/http-header-checker", isAvailable: true },
      { id: "website-screenshot", name: "Website Screenshot", description: "Capture website screenshots", path: "/website-screenshot", isAvailable: true },
    ],
  },
  {
    id: "internet",
    name: "Internet Tools",
    description: "IP lookup, DNS, SSL checker",
    icon: Globe,
    color: "200 80% 50%",
    tools: [
      { id: "ip-lookup", name: "IP Address Lookup", description: "Get info about any IP address", path: "/ip-lookup", isAvailable: true },
      { id: "user-agent", name: "User-Agent Parser", description: "Parse browser user-agent strings", path: "/user-agent-parser", isAvailable: true },
      { id: "dns-lookup", name: "DNS Lookup", description: "Query DNS records for domains", path: "/dns-lookup", isAvailable: true },
      { id: "ssl-checker", name: "SSL Certificate Checker", description: "Check SSL validity and expiry", path: "/ssl-checker", isAvailable: true },
      { id: "website-ping", name: "Website Ping Test", description: "Test website availability", path: "/website-ping", isAvailable: true },
    ],
  },
  {
    id: "education",
    name: "Education Tools",
    description: "Calculators, converters for students",
    icon: GraduationCap,
    color: "150 60% 45%",
    tools: [
      { id: "scientific-calculator", name: "Scientific Calculator", description: "Advanced calculator with trig and log functions", path: "/scientific-calculator", isAvailable: true },
      { id: "percentage-calc", name: "Percentage Calculator", description: "Calculate percentages easily", path: "/percentage-calculator", isAvailable: true },
      { id: "unit-converter", name: "Unit Converter", description: "Convert length, weight, temperature", path: "/unit-converter", isAvailable: true },
    ],
  },
  {
    id: "finance",
    name: "Finance Tools",
    description: "EMI, GST, salary calculators",
    icon: DollarSign,
    color: "140 70% 40%",
    tools: [
      { id: "emi-calculator", name: "EMI Calculator", description: "Calculate loan EMI payments", path: "/emi-calculator", isAvailable: true },
      { id: "gst-calculator", name: "GST Calculator", description: "Calculate GST amounts", path: "/gst-calculator", isAvailable: true },
    ],
  },
  {
    id: "zip",
    name: "ZIP Tools",
    description: "Create and extract ZIP archives",
    icon: Archive,
    color: "35 90% 50%",
    tools: [
      { id: "create-zip", name: "Create ZIP", description: "Create ZIP from multiple files", path: "/create-zip", isAvailable: true },
      { id: "extract-zip", name: "Extract ZIP", description: "Extract files from ZIP archive", path: "/extract-zip", isAvailable: true },
      { id: "password-zip", name: "Password-Protected ZIP", description: "Create encrypted ZIP archives", path: "/password-zip", isAvailable: true },
      { id: "compression-zip", name: "Compression Level ZIP", description: "ZIP with custom compression", path: "/compression-zip", isAvailable: true },
    ],
  },
  {
    id: "social",
    name: "Social Media",
    description: "Hashtag generators, bio tools",
    icon: Share2,
    color: "330 80% 55%",
    tools: [
      { id: "hashtag-generator", name: "Hashtag Generator", description: "Generate relevant hashtags", path: "/hashtag-generator", isAvailable: true },
      { id: "whatsapp-status", name: "WhatsApp Status Generator", description: "Create perfect WhatsApp status images", path: "/whatsapp-status-generator", isAvailable: true },
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
