import { useState } from "react";
import { Download, Globe, FileText, Link, Code } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const HTMLToPDFTool = () => {
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [mode, setMode] = useState<"url" | "html">("url");

  return (
    <ToolLayout
      title="HTML to PDF"
      description="Convert web pages or HTML code to PDF documents"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
          <div className="flex gap-4">
            <Globe className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <h4 className="font-semibold text-primary">
                Backend Processing Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                HTML to PDF conversion requires server-side rendering.
                Enable Lovable Cloud for full functionality.
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("url")}
            className={`flex-1 rounded-xl p-4 transition-all ${
              mode === "url"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Link className="mx-auto mb-2 h-6 w-6" />
            <div className="font-medium">From URL</div>
            <div className={`text-xs ${mode === "url" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              Enter a webpage URL
            </div>
          </button>
          <button
            onClick={() => setMode("html")}
            className={`flex-1 rounded-xl p-4 transition-all ${
              mode === "html"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Code className="mx-auto mb-2 h-6 w-6" />
            <div className="font-medium">From HTML</div>
            <div className={`text-xs ${mode === "html" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              Paste HTML code
            </div>
          </button>
        </div>

        {mode === "url" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Website URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <h3 className="mb-3 font-semibold">Conversion Options</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Page Size</label>
                  <select className="input-field w-full" disabled>
                    <option>A4</option>
                    <option>Letter</option>
                    <option>Legal</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Orientation</label>
                  <select className="input-field w-full" disabled>
                    <option>Portrait</option>
                    <option>Landscape</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">HTML Code</label>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<html>
<head>
  <title>My Document</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>Your content here...</p>
</body>
</html>"
                className="input-field min-h-[300px] w-full font-mono text-sm"
              />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="mb-3 font-semibold">Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Renders CSS and JavaScript
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Supports custom headers and footers
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Handles multi-page content
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Preserves hyperlinks
            </li>
          </ul>
        </div>

        <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
          <Download className="h-5 w-5" />
          Convert to PDF
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Enable backend integration for HTML to PDF conversion
        </p>
      </div>
    </ToolLayout>
  );
};

export default HTMLToPDFTool;
