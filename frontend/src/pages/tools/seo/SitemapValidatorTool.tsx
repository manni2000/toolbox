import { useState } from "react";
import { Copy, Check, FileText, Upload, Download, Globe, AlertCircle, CheckCircle, XCircle, Loader } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

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
    <ToolLayout
      title="Sitemap Validator"
      description="Validate and analyze XML sitemats for SEO compliance and best practices"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sitemap Validator</h3>
              <p className="text-sm text-muted-foreground">
                Validate XML sitemats for SEO compliance and technical issues
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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

            <button
              onClick={validateSitemap}
              disabled={isValidating || (!sitemapUrl && !sitemapContent)}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="rounded-xl border border-border bg-card p-6">
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
          </div>
        )}

        {/* Issues Section */}
        {issues.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Validation Results</h3>
              <button
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
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
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
        </div>
      </div>
    </ToolLayout>
  );
};

export default SitemapValidatorTool;
