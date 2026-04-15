import { useState } from "react";
import { Copy, Check, FileText, Download, Shield, Globe, Settings, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

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
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Shield className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Robots.txt Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create professional robots.txt files to control search engine access.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Presets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            <h3 className="font-semibold">Quick Presets</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'basic', label: 'Basic Website' },
              { id: 'blog', label: 'WordPress Blog' },
              { id: 'ecommerce', label: 'E-commerce' }
            ].map((preset, index) => (
              <motion.button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Rules Configuration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              <h3 className="font-semibold">Crawler Rules</h3>
            </div>
            <motion.button
              type="button"
              onClick={addRule}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              Add Rule
            </motion.button>
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
        </motion.div>

        {/* Additional Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            Additional Settings
          </h3>
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
        </motion.div>

        {/* Generate Button */}
        <motion.button
          type="button"
          onClick={generateRobotsTxt}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-lg px-4 py-3 font-medium transition-colors text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          <FileText className="inline h-4 w-4 mr-2" />
          Generate robots.txt
        </motion.button>

        {/* Generated Output */}
        {generatedRobots && (
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
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
          </motion.div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default RobotsTxtTool;
