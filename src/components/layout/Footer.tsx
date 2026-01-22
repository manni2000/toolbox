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
    { name: "Password Generator", path: "/password-generator" },
  ];

  const pdfTools = [
    { name: "PDF Merge", path: "/pdf-merge" },
    { name: "PDF Split", path: "/pdf-split" },
    { name: "PDF to JPG", path: "/pdf-to-jpg" },
    { name: "PDF to Word", path: "/pdf-to-word" },
    { name: "Word to PDF", path: "/word-to-pdf" },
    { name: "HTML to PDF", path: "/html-to-pdf" },
  ];

  const imageTools = [
    { name: "Image Compressor", path: "/image-compressor" },
    { name: "Image Converter", path: "/image-converter" },
    { name: "Image to PDF", path: "/image-to-pdf" },
    { name: "Background Remover", path: "/background-remover" },
    { name: "QR Code Generator", path: "/qr-code-generator" },
    { name: "Favicon Generator", path: "/favicon-generator" },
  ];

  const devTools = [
    { name: "JSON Formatter", path: "/json-formatter" },
    { name: "Base64 Encoder", path: "/base64-encoder" },
    { name: "URL Encoder", path: "/url-encoder" },
    { name: "JWT Decoder", path: "/jwt-decoder" },
    { name: "Regex Tester", path: "/regex-tester" },
    { name: "Cron Generator", path: "/cron-generator" },
  ];

  const educationTools = [
    { name: "Unit Converter", path: "/unit-converter" },
    { name: "Scientific Calculator", path: "/scientific-calculator" },
    { name: "Percentage Calculator", path: "/percentage-calculator" },
    { name: "EMI Calculator", path: "/emi-calculator" },
    { name: "GST Calculator", path: "/gst-calculator" },
    { name: "Age Calculator", path: "/age-calculator" },
  ];

  const socialMediaTools = [
    { name: "Hashtag Generator", path: "/hashtag-generator" },
    { name: "Video Downloader", path: "/video-downloader" },
    { name: "Video Thumbnail", path: "/video-thumbnail" },
    { name: "WhatsApp Status", path: "/whatsapp-status-saver" },
    { name: "Meme Generator", path: "/meme-generator" },
    { name: "QR Code Generator", path: "/qr-code-generator" },
  ];

  const textTools = [
    { name: "Word Counter", path: "/word-counter" },
    { name: "Case Converter", path: "/case-converter" },
    { name: "Text Diff", path: "/text-diff" },
    { name: "Markdown to HTML", path: "/markdown-to-html" },
    { name: "Remove Spaces", path: "/remove-spaces" },
    { name: "Color Converter", path: "/color-converter" },
  ];

  const categories = toolCategories.slice(0, 8).map(cat => ({
    name: cat.name,
    path: `/category/${cat.id}`
  }));

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        {/* Main Footer Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Tool<span className="gradient-text">Box</span>
              </span>
            </Link>
            <p className="max-w-md text-sm text-muted-foreground">
              50+ free online tools for images, PDFs, videos, text, and more. 
              No signup required. 100% browser-based.
            </p>
            <div className="flex gap-3">
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
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ToolBox. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-destructive" /> for everyone
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
