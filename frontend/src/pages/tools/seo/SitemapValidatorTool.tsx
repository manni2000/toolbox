import { useState } from "react";
import { Copy, Check, FileText, Upload, Download, Globe, AlertCircle, CheckCircle, XCircle, Loader, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "25 90% 50%";

interface SitemapIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  url?: string;
}

interface SitemapStats {
  totalUrls: number;
  validUrls: number;
  invalidUrls: number;
  fileSize: string;
  lastModified?: string;
}

const SitemapValidatorTool = () => {
  const toolSeoData = getToolSeoMetadata('sitemap-validator');
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [sitemapContent, setSitemapContent] = useState("");
  const [issues, setIssues] = useState<SitemapIssue[]>([]);
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const validateSitemap = async () => {
    setIsValidating(true);
    setIssues([]);
    setStats(null);

    try {
      let content = sitemapContent;
      
      // If URL is provided, fetch the sitemap
      if (sitemapUrl && !sitemapContent) {
        const response = await fetch(sitemapUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
        }
        content = await response.text();
      }

      if (!content.trim()) {
        setIssues([{ type: 'error', message: 'Sitemap content is empty' }]);
        setIsValidating(false);
        return;
      }

      const validationIssues: SitemapIssue[] = [];
      const urlRegex = /<loc>(.*?)<\/loc>/g;
      const urls = content.match(urlRegex) || [];
      const cleanUrls = urls.map(url => url.replace(/<loc>|<\/loc>/g, ''));
      
      // Basic XML structure validation
      if (!content.includes('<?xml')) {
        validationIssues.push({ type: 'warning', message: 'Missing XML declaration' });
      }
      
      if (!content.includes('<urlset')) {
        validationIssues.push({ type: 'error', message: 'Missing <urlset> root element' });
      }
      
      if (!content.includes('</urlset>')) {
        validationIssues.push({ type: 'error', message: 'Missing closing </urlset> tag' });
      }

      // Validate URLs
      let validUrlCount = 0;
      let invalidUrlCount = 0;
      
      cleanUrls.forEach((url, index) => {
        try {
          new URL(url);
          validUrlCount++;
        } catch {
          invalidUrlCount++;
          validationIssues.push({
            type: 'error',
            message: `Invalid URL format: ${url}`,
            url
          });
        }

        // Check for common issues
        if (url.length > 2048) {
          validationIssues.push({
            type: 'warning',
            message: `URL too long (${url.length} characters)`,
            url
          });
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          validationIssues.push({
            type: 'warning',
            message: 'URL should use HTTP or HTTPS protocol',
            url
          });
        }
      });

      // Check sitemap size
      const fileSize = new Blob([content]).size;
      const fileSizeMB = fileSize / (1024 * 1024);
      
      if (fileSizeMB > 50) {
        validationIssues.push({
          type: 'error',
          message: `Sitemap too large: ${fileSizeMB.toFixed(2)}MB (limit: 50MB)`
        });
      }

      if (urls.length > 50000) {
        validationIssues.push({
          type: 'warning',
          message: `Too many URLs: ${urls.length} (limit: 50,000)`
        });
      }

      // Check for required elements
      if (urls.length === 0) {
        validationIssues.push({
          type: 'error',
          message: 'No URLs found in sitemap'
        });
      }

      // Check for lastmod dates
      const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/g;
      const lastmodMatches = content.match(lastmodRegex);
      
      if (lastmodMatches && lastmodMatches.length < urls.length * 0.8) {
        validationIssues.push({
          type: 'info',
          message: `Consider adding lastmod dates (${lastmodMatches.length}/${urls.length} URLs have them)`
        });
      }

      // Set stats
      setStats({
        totalUrls: urls.length,
        validUrls: validUrlCount,
        invalidUrls: invalidUrlCount,
        fileSize: `${(fileSize / 1024).toFixed(2)} KB`
      });

      setIssues(validationIssues);

    } catch (error) {
      setIssues([{
        type: 'error',
        message: error instanceof Error ? error.message : 'Validation failed'
      }]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSitemapContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      sitemapUrl,
      stats,
      issues: issues.map(issue => ({
        type: issue.type,
        message: issue.message,
        url: issue.url
      }))
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap-validation-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <>
      {CategorySEO.SEO(
        toolSeoData?.title || "Sitemap Validator",
        toolSeoData?.description || "Validate and analyze XML sitemaps for SEO compliance and best practices",
        "sitemap-validator"
      )}
      <ToolLayout
      title="Sitemap Validator"
      description="Validate and analyze XML sitemaps for SEO compliance and best practices"
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
              <Globe className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Sitemap Validator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Validate XML sitemaps for SEO compliance and technical issues.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">sitemap validator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">xml sitemap</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">sitemap check</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">seo sitemap</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sitemap URL</label>
              <input
                type="url"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                placeholder="https://yoursite.com/sitemap.xml"
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Or Upload Sitemap File</label>
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload sitemap.xml
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {sitemapContent && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Sitemap file uploaded successfully
                </p>
              </div>
            )}

            <motion.button
              onClick={validateSitemap}
              disabled={isValidating || (!sitemapUrl && !sitemapContent)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              {isValidating ? (
                <>
                  <Loader className="inline h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="inline h-4 w-4 mr-2" />
                  Validate Sitemap
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Section */}
        {stats && (
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <h3 className="font-semibold mb-4">Sitemap Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.totalUrls}</div>
                <div className="text-sm text-muted-foreground">Total URLs</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-500">{stats.validUrls}</div>
                <div className="text-sm text-muted-foreground">Valid URLs</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-red-500">{stats.invalidUrls}</div>
                <div className="text-sm text-muted-foreground">Invalid URLs</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.fileSize}</div>
                <div className="text-sm text-muted-foreground">File Size</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Issues Section */}
        {issues.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Validation Results</h3>
              <button
                type="button"
                title="Download validation report"
                aria-label="Download validation report"
                onClick={downloadReport}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{issue.message}</p>
                      {issue.url && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                          {issue.url}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
            Sitemap Best Practices
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">✅ Guidelines</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep sitemap under 50MB</li>
                <li>• Maximum 50,000 URLs per sitemap</li>
                <li>• Use absolute URLs</li>
                <li>• Include lastmod dates</li>
                <li>• Validate XML syntax</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🔍 Common Issues</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Invalid URL formats</li>
                <li>• Missing XML declaration</li>
                <li>• URLs longer than 2048 chars</li>
                <li>• Non-HTTP/HTTPS protocols</li>
                <li>• Malformed XML structure</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            What is Sitemap Validation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Sitemap validation checks XML sitemaps for errors and ensures they follow proper format. Valid sitemaps help search engines discover and index your website's pages more efficiently.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your sitemap URL or upload file</li>
            <li>The tool validates XML structure</li>
            <li>Checks for common errors and warnings</li>
            <li>Get recommendations for improvement</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Validation Checks</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• XML syntax validation</li>
                <li>• URL format checking</li>
                <li>• Last modified dates</li>
                <li>• Priority values</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">SEO Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Better crawling</li>
                <li>• Faster indexing</li>
                <li>• Error prevention</li>
                <li>• Search visibility</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is an XML sitemap?",
            answer: "An XML sitemap lists all important pages on your website, helping search engines discover and index them. It includes URLs, last modified dates, change frequency, and priority."
          },
          {
            question: "Where should I put my sitemap?",
            answer: "Place sitemap.xml in your website's root directory. Submit it to Google Search Console and Bing Webmaster Tools. Also reference it in robots.txt."
          },
          {
            question: "How often should I update my sitemap?",
            answer: "Update your sitemap whenever you add, remove, or significantly change pages. For dynamic sites, use automated sitemap generation to keep it current."
          },
          {
            question: "What's the difference between priority and change frequency?",
            answer: "Priority indicates page importance (0.0-1.0) relative to other pages. Change frequency suggests how often the page updates (always, daily, weekly, monthly). These are hints to crawlers."
          },
          {
            question: "Do I need a sitemap for a small site?",
            answer: "Even small sites benefit from sitemaps. They ensure all pages are discovered, help with new sites, and provide valuable metadata to search engines about your content."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default SitemapValidatorTool;
