import { useState } from "react";
import { Copy, Check, FileText, Download, Shield, Globe, Settings, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "25 90% 50%";

interface RobotRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

const RobotsTxtTool = () => {
  const [rules, setRules] = useState<RobotRule[]>([
    {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin/", "/private/", "/api/"]
    }
  ]);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [generatedRobots, setGeneratedRobots] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const addRule = () => {
    setRules([...rules, { userAgent: "", allow: [], disallow: [] }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof RobotRule, value: string | string[]) => {
    const updatedRules = [...rules];
    if (field === "allow" || field === "disallow") {
      const arrayValue = value as string[];
      updatedRules[index][field] = arrayValue;
    } else {
      updatedRules[index][field] = value as string;
    }
    setRules(updatedRules);
  };

  const addPath = (index: number, type: "allow" | "disallow") => {
    const updatedRules = [...rules];
    updatedRules[index][type].push("");
    setRules(updatedRules);
  };

  const removePath = (index: number, pathIndex: number, type: "allow" | "disallow") => {
    const updatedRules = [...rules];
    updatedRules[index][type] = updatedRules[index][type].filter((_, i) => i !== pathIndex);
    setRules(updatedRules);
  };

  const updatePath = (index: number, pathIndex: number, type: "allow" | "disallow", value: string) => {
    const updatedRules = [...rules];
    updatedRules[index][type][pathIndex] = value;
    setRules(updatedRules);
  };

  const generateRobotsTxt = () => {
    let robotsContent = "";

    // Add rules
    rules.forEach(rule => {
      if (rule.userAgent) {
        robotsContent += `User-agent: ${rule.userAgent}\n`;
        
        rule.allow.forEach(path => {
          if (path.trim()) {
            robotsContent += `Allow: ${path}\n`;
          }
        });
        
        rule.disallow.forEach(path => {
          if (path.trim()) {
            robotsContent += `Disallow: ${path}\n`;
          }
        });
        
        robotsContent += "\n";
      }
    });

    // Add crawl delay if specified
    if (crawlDelay) {
      robotsContent += `Crawl-delay: ${crawlDelay}\n\n`;
    }

    // Add sitemap if specified
    if (sitemapUrl) {
      robotsContent += `Sitemap: ${sitemapUrl}\n`;
    }

    setGeneratedRobots(robotsContent);
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadRobots = () => {
    const blob = new Blob([generatedRobots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadPreset = (preset: string) => {
    switch (preset) {
      case "basic":
        setRules([
          {
            userAgent: "*",
            allow: ["/"],
            disallow: ["/admin/", "/private/"]
          }
        ]);
        setSitemapUrl("");
        setCrawlDelay("");
        break;
      case "blog":
        setRules([
          {
            userAgent: "*",
            allow: ["/"],
            disallow: ["/wp-admin/", "/wp-includes/", "/wp-content/plugins/", "/author/", "/page/"]
          },
          {
            userAgent: "Googlebot",
            allow: ["/"],
            disallow: ["/wp-admin/", "/wp-includes/"]
          }
        ]);
        setSitemapUrl("https://yoursite.com/sitemap.xml");
        setCrawlDelay("1");
        break;
      case "ecommerce":
        setRules([
          {
            userAgent: "*",
            allow: ["/"],
            disallow: ["/admin/", "/checkout/", "/cart/", "/account/", "/api/"]
          },
          {
            userAgent: "Googlebot",
            allow: ["/"],
            disallow: ["/admin/", "/api/"]
          }
        ]);
        setSitemapUrl("https://yoursite.com/sitemap.xml");
        setCrawlDelay("1");
        break;
    }
    setGeneratedRobots("");
  };

  return (
    <ToolLayout
      title="Robots.txt Generator"
      description="Generate professional robots.txt files to control search engine crawling"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Robots.txt Generator</h3>
              <p className="text-sm text-muted-foreground">
                Create professional robots.txt files to control search engine access
              </p>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Quick Presets</h3>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => loadPreset("basic")}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
            >
              Basic Website
            </button>
            <button
              type="button"
              onClick={() => loadPreset("blog")}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
            >
              WordPress Blog
            </button>
            <button
              type="button"
              onClick={() => loadPreset("ecommerce")}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
            >
              E-commerce
            </button>
          </div>
        </div>

        {/* Rules Configuration */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Crawler Rules</h3>
            </div>
            <button
              type="button"
              onClick={addRule}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
            >
              Add Rule
            </button>
          </div>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={rule.userAgent}
                    onChange={(e) => updateRule(index, "userAgent", e.target.value)}
                    placeholder="User-agent (e.g., *, Googlebot)"
                    className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm"
                  />
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-600 ml-2"
                      aria-label="Remove rule"
                      title="Remove rule"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-600">Allow</span>
                      <button
                        type="button"
                        onClick={() => addPath(index, "allow")}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {rule.allow.map((path, pathIndex) => (
                        <div key={pathIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={path}
                            onChange={(e) => updatePath(index, pathIndex, "allow", e.target.value)}
                            placeholder="/path/"
                            className="flex-1 rounded-lg bg-muted px-3 py-1 text-sm"
                          />
                          {rule.allow.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePath(index, pathIndex, "allow")}
                              className="text-red-500 hover:text-red-600"
                              aria-label="Remove allow path"
                              title="Remove allow path"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-600">Disallow</span>
                      <button
                        type="button"
                        onClick={() => addPath(index, "disallow")}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {rule.disallow.map((path, pathIndex) => (
                        <div key={pathIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={path}
                            onChange={(e) => updatePath(index, pathIndex, "disallow", e.target.value)}
                            placeholder="/private/"
                            className="flex-1 rounded-lg bg-muted px-3 py-1 text-sm"
                          />
                          {rule.disallow.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePath(index, pathIndex, "disallow")}
                              className="text-red-500 hover:text-red-600"
                              aria-label="Remove disallow path"
                              title="Remove disallow path"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Additional Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sitemap URL (Optional)</label>
              <input
                type="text"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                placeholder="https://yoursite.com/sitemap.xml"
                className="w-full rounded-lg bg-muted px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Crawl Delay (Optional)</label>
              <input
                type="text"
                value={crawlDelay}
                onChange={(e) => setCrawlDelay(e.target.value)}
                placeholder="1 (seconds between requests)"
                className="w-full rounded-lg bg-muted px-4 py-3"
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={generateRobotsTxt}
          className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
        >
          <FileText className="inline h-4 w-4 mr-2" />
          Generate robots.txt
        </button>

        {/* Generated Output */}
        {generatedRobots && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated robots.txt</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy("robots", generatedRobots)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Copy robots.txt"
                  title="Copy robots.txt"
                >
                  {copied === "robots" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={downloadRobots}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Download robots.txt"
                  title="Download robots.txt"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                {generatedRobots}
              </pre>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Robots.txt Best Practices
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">✅ Do's</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Place robots.txt in root directory</li>
                <li>• Use specific paths over wildcards</li>
                <li>• Test with Google's robots.txt tester</li>
                <li>• Keep it simple and clear</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">❌ Don'ts</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Don't block CSS/JS files</li>
                <li>• Don't use comments in robots.txt</li>
                <li>• Don't allow sensitive directories</li>
                <li>• Don't forget to update sitemap</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default RobotsTxtTool;
