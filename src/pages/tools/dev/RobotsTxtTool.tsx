import { useState } from "react";
import { FileText, Copy, Check, AlertCircle } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const RobotsTxtTool = () => {
  const [input, setInput] = useState(`User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /

Sitemap: https://example.com/sitemap.xml`);
  const [analysis, setAnalysis] = useState<{ type: "info" | "warning" | "error"; message: string }[]>([]);

  const analyze = () => {
    const results: { type: "info" | "warning" | "error"; message: string }[] = [];
    const lines = input.split("\n");
    let hasUserAgent = false;
    let hasSitemap = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;

      if (trimmed.toLowerCase().startsWith("user-agent:")) {
        hasUserAgent = true;
        const agent = trimmed.split(":")[1]?.trim();
        if (agent === "*") {
          results.push({ type: "info", message: `Line ${index + 1}: Applies to all bots (User-agent: *)` });
        } else if (agent) {
          results.push({ type: "info", message: `Line ${index + 1}: Specific rule for ${agent}` });
        }
      } else if (trimmed.toLowerCase().startsWith("disallow:")) {
        const path = trimmed.split(":")[1]?.trim();
        if (path === "/") {
          results.push({ type: "warning", message: `Line ${index + 1}: Blocking all pages (Disallow: /)` });
        } else if (path) {
          results.push({ type: "info", message: `Line ${index + 1}: Blocking ${path}` });
        }
      } else if (trimmed.toLowerCase().startsWith("allow:")) {
        const path = trimmed.split(":")[1]?.trim();
        results.push({ type: "info", message: `Line ${index + 1}: Allowing ${path || "/"}` });
      } else if (trimmed.toLowerCase().startsWith("sitemap:")) {
        hasSitemap = true;
        const url = trimmed.split("Sitemap:")[1]?.trim() || trimmed.split("sitemap:")[1]?.trim();
        if (url?.startsWith("http")) {
          results.push({ type: "info", message: `Line ${index + 1}: Sitemap found at ${url}` });
        } else {
          results.push({ type: "error", message: `Line ${index + 1}: Invalid sitemap URL` });
        }
      } else if (trimmed.toLowerCase().startsWith("crawl-delay:")) {
        const delay = trimmed.split(":")[1]?.trim();
        results.push({ type: "info", message: `Line ${index + 1}: Crawl delay set to ${delay} seconds` });
      } else {
        results.push({ type: "error", message: `Line ${index + 1}: Unknown directive "${trimmed.split(":")[0]}"` });
      }
    });

    if (!hasUserAgent) {
      results.unshift({ type: "error", message: "Missing User-agent directive" });
    }
    if (!hasSitemap) {
      results.push({ type: "warning", message: "Consider adding a Sitemap directive for better indexing" });
    }

    setAnalysis(results);
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Robots.txt Checker"
      description="Validate and analyze your robots.txt file"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium">Robots.txt Content</label>
            <button onClick={handleCopy} className="btn-secondary text-sm">
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-field h-48 w-full resize-none font-mono text-sm"
            placeholder="Paste your robots.txt content here..."
          />
        </div>

        <button onClick={analyze} className="btn-primary w-full">
          <FileText className="h-5 w-5" />
          Analyze
        </button>

        {analysis.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Analysis Results</h3>
            <div className="space-y-2">
              {analysis.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg p-3 text-sm ${
                    item.type === "error"
                      ? "bg-destructive/10 text-destructive"
                      : item.type === "warning"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{item.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Common Directives:</strong>
          <ul className="mt-2 space-y-1">
            <li><code className="text-primary">User-agent:</code> - Specifies which bot the rules apply to</li>
            <li><code className="text-primary">Disallow:</code> - Blocks access to specified paths</li>
            <li><code className="text-primary">Allow:</code> - Allows access to specified paths</li>
            <li><code className="text-primary">Sitemap:</code> - Points to your XML sitemap</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
};

export default RobotsTxtTool;
