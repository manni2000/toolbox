import { Link } from "react-router-dom";
import { Wrench, Heart } from "lucide-react";
import { toolCategories } from "@/data/toolCategories";

const Footer = () => {
  // Get top tools from each major category for display
  const popularTools = [
    { name: "QR Code Generator", path: "/qr-code-generator" },
    { name: "Image to PDF", path: "/image-to-pdf" },
    { name: "PDF to Word", path: "/pdf-to-word" },
    { name: "Background Remover", path: "/background-remover" },
    { name: "Video Downloader", path: "/video-downloader" },
    { name: "Invoice Generator", path: "/invoice-generator" },
  ];

  const pdfTools = [
    { name: "PDF Merge", path: "/pdf-merge" },
    { name: "PDF Split", path: "/pdf-split" },
    { name: "PDF to JPG", path: "/pdf-to-jpg" },
    { name: "PDF to Word", path: "/pdf-to-word" },
    { name: "PDF to PowerPoint", path: "/pdf-to-powerpoint" },
    { name: "PDF to Excel", path: "/pdf-to-excel" },
    { name: "Word to PDF", path: "/word-to-pdf" },
    { name: "PowerPoint to PDF", path: "/powerpoint-to-pdf" },
    { name: "HTML to PDF", path: "/html-to-pdf" },
    { name: "PDF Password Protector", path: "/pdf-password" },
    { name: "PDF Unlocker", path: "/pdf-unlock" },
    { name: "PDF Page Remover", path: "/pdf-page-remover" },
    { name: "PDF Rotate Pages", path: "/pdf-rotate" },
  ];

  const seoTools = [
    { name: "Meta Title & Description Generator", path: "/meta-title-description-generator" },
    { name: "Keyword Density Checker", path: "/keyword-density-checker" },
    { name: "Robots.txt Generator", path: "/robots-txt-generator" },
    { name: "Sitemap Validator", path: "/sitemap-validator" },
    { name: "Page Speed Checklist Generator", path: "/page-speed-checklist-generator" },
    { name: "OG Image Preview Tool", path: "/og-image-preview-tool" },
    { name: "Broken Image Finder", path: "/broken-image-finder" },
    { name: "UTM Link Builder", path: "/utm-link-builder" },
    { name: "Domain Age Checker", path: "/domain-age-checker" },
    { name: "Website Tech Stack Detector", path: "/tech-stack-detector" },
    { name: "Page SEO Analyzer", path: "/page-seo-analyzer" },
  ];

  const zipTools = [
    { name: "Create ZIP", path: "/create-zip" },
    { name: "Extract ZIP", path: "/extract-zip" },
    { name: "Password-Protected ZIP", path: "/password-zip" },
    { name: "Compression Level ZIP", path: "/compression-zip" },
  ];

  const audioTools = [
    { name: "Audio Converter", path: "/audio-converter" },
    { name: "Speech to Text", path: "/speech-to-text" },
    { name: "Audio Trimmer", path: "/audio-trimmer" },
    { name: "Audio Merger", path: "/audio-merger" },
    { name: "Audio Speed Changer", path: "/audio-speed" },
  ];

  const securityTools = [
    { name: "Password Generator", path: "/password-generator" },
    { name: "Password Strength Checker", path: "/password-strength" },
    { name: "Hash Generator", path: "/hash-generator" },
    { name: "Base64 Encoder", path: "/base64-encoder" },
    { name: "UUID Generator", path: "/uuid-generator" },
    { name: "Password Strength Explainer", path: "/password-strength-explainer" },
    { name: "Data Breach Email Checker", path: "/data-breach-email-checker" },
    { name: "File Hash Comparison", path: "/file-hash-comparison" },
    { name: "EXIF Location Remover", path: "/exif-location-remover" },
    { name: "Text Redaction", path: "/text-redaction" },
    { name: "QR Phishing Scanner", path: "/qr-phishing-scanner" },
    { name: "Secure Notes", path: "/secure-notes" },
    { name: "URL Reputation Checker", path: "/url-reputation-checker" },
  ];

  const internetTools = [
    { name: "IP Address Lookup", path: "/ip-lookup" },
    { name: "User-Agent Parser", path: "/user-agent-parser" },
    { name: "DNS Lookup", path: "/dns-lookup" },
    { name: "SSL Certificate Checker", path: "/ssl-checker" },
    { name: "Website Ping Test", path: "/website-ping" },
  ];

  const imageTools = [
    { name: "QR Code Generator", path: "/qr-code-generator" },
    { name: "QR Code Scanner", path: "/qr-code-scanner" },
    { name: "Image Compressor", path: "/image-compressor" },
    { name: "Image Converter", path: "/image-converter" },
    { name: "Image Resize", path: "/image-resize" },
    { name: "Image Crop", path: "/image-crop" },
    { name: "Background Remover", path: "/background-remover" },
    { name: "Image to PDF", path: "/image-to-pdf" },
    { name: "Image to Word", path: "/image-to-word" },
    { name: "Image DPI Checker", path: "/image-dpi-checker" },
    { name: "Favicon Generator", path: "/favicon-generator" },
    { name: "EXIF Viewer", path: "/exif-viewer" },
  ];

  const financeTools = [
    { name: "EMI Calculator", path: "/emi-calculator" },
    { name: "GST Calculator", path: "/gst-calculator" },
    { name: "Salary Calculator", path: "/salary-calculator" },
    { name: "Currency Converter", path: "/currency-converter" },
    { name: "Startup Burn Rate Calculator", path: "/startup-burn-rate-calculator" },
    { name: "SaaS Pricing Calculator", path: "/saas-pricing-calculator" },
    { name: "EMI Comparison", path: "/emi-comparison" },
    { name: "Tax Slab Analyzer", path: "/tax-slab-analyzer" },
    { name: "Invoice Generator", path: "/invoice-generator" },
    { name: "Profit Margin Calculator", path: "/profit-margin-calculator" },
    { name: "Freelancer Rate Calculator", path: "/freelancer-rate-calculator" },
    { name: "Salary Breakup Generator", path: "/salary-breakup-generator" },
    { name: "Budget Planner", path: "/budget-planner" },
    { name: "Stock CAGR Calculator", path: "/stock-cagr-calculator" },
  ];

  const devTools = [
    { name: "JSON Formatter", path: "/json-formatter" },
    { name: "Regex Tester", path: "/regex-tester" },
    { name: "JWT Decoder", path: "/jwt-decoder" },
    { name: "URL Encoder", path: "/url-encoder" },
    { name: "Color Palettes Generator", path: "/color-palettes" },
    { name: "Lorem Ipsum Generator", path: "/lorem-ipsum-generator" },
    { name: "Cron Generator", path: "/cron-generator" },
    { name: "HTTP Header Checker", path: "/http-header-checker" },
    { name: "Website Screenshot", path: "/website-screenshot" },
    { name: "Token Calculator", path: "/token-calculator" },
  ];

  const educationTools = [
    { name: "Scientific Calculator", path: "/scientific-calculator" },
    { name: "CGPA to Percentage", path: "/cgpa-to-percentage" },
    { name: "LCM HCF Calculator", path: "/lcm-hcf-calculator" },
    { name: "Percentage Calculator", path: "/percentage-calculator" },
    { name: "Unit Converter", path: "/unit-converter" },
    { name: "Compound Interest", path: "/compound-interest-calculator" },
    { name: "Simple Interest", path: "/simple-interest-calculator" },
    { name: "Study Timetable Generator", path: "/study-timetable-generator" },
    { name: "World Time", path: "/world-time" },
  ];

  const socialMediaTools = [
    { name: "Hashtag Generator", path: "/hashtag-generator" },
    { name: "Bio Generator", path: "/bio-generator" },
    { name: "Caption Formatter", path: "/caption-formatter" },
    { name: "Line Break Generator", path: "/line-break-generator" },
    { name: "Link-in-Bio", path: "/link-in-bio" },
    { name: "WhatsApp Status Generator", path: "/whatsapp-status-generator" },
  ];

  const textTools = [
    { name: "Word Counter", path: "/word-counter" },
    { name: "Case Converter", path: "/case-converter" },
    { name: "Text Diff", path: "/text-diff" },
    { name: "Markdown to HTML", path: "/markdown-to-html" },
    { name: "Remove Spaces", path: "/remove-spaces" },
    { name: "Line Sorter", path: "/line-sorter" },
    { name: "Duplicate Remover", path: "/duplicate-remover" },
    { name: "Text Summarizer", path: "/text-summarizer" },
  ];

  const categories = toolCategories.slice(0, 8).map(cat => ({
    name: cat.name,
    path: `/category/${cat.id}`
  }));

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        {/* Top Section - Brand + Popular Tools */}
        <div className="grid gap-8 sm:grid-cols-2 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Tool<span className="gradient-text">Box</span>
              </span>
            </Link>
            <p className="max-w-md text-sm text-muted-foreground">
              100+ free online tools for images, PDFs, videos, text, and more. 
              No signup required. 100% browser-based.
            </p>
          </div>

          {/* Popular Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Popular Tools</h4>
            <ul className="space-y-2">
              {popularTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-t border-border pt-8">

          {/* PDF Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">PDF Tools</h4>
            <ul className="space-y-2">
              {pdfTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Image Tools</h4>
            <ul className="space-y-2">
              {imageTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Security Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Security Tools</h4>
            <ul className="space-y-2">
              {securityTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Finance Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Finance Tools</h4>
            <ul className="space-y-2">
              {financeTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Developer Tools</h4>
            <ul className="space-y-2">
              {devTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Education Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Education Tools</h4>
            <ul className="space-y-2">
              {educationTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Audio Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Audio Tools</h4>
            <ul className="space-y-2">
              {audioTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Internet Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Internet Tools</h4>
            <ul className="space-y-2">
              {internetTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SEO Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">SEO Tools</h4>
            <ul className="space-y-2">
              {seoTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ZIP Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">ZIP Tools</h4>
            <ul className="space-y-2">
              {zipTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Social Media Tools</h4>
            <ul className="space-y-2">
              {socialMediaTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Text Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Text Tools</h4>
            <ul className="space-y-2">
              {textTools.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Categories Row */}
        <div className="mt-10 border-t border-border pt-8">
          <h4 className="mb-4 text-sm font-semibold">All Categories</h4>
          <div className="flex flex-wrap gap-2">
            {toolCategories.map(cat => (
              <Link 
                key={cat.id}
                to={`/category/${cat.id}`} 
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dailytools247. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-destructive" /> for everyone
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
