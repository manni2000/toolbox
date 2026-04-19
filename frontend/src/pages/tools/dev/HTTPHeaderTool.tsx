import { useState } from "react";
import { Globe, AlertCircle, Server, Sparkles, Copy, Check, Download, Loader2, RefreshCw, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "210 80% 55%";

interface HeaderResult {
  url: string;
  status: number;
  statusText: string;
  headers: { [key: string]: string };
  responseTime: string;
}

const HTTPHeaderTool = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const checkHeaders = async () => {
    if (!url.trim()) return;
    
    // Add protocol if missing
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.HTTP_HEADER_CHECKER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.result) {
        setResult(data.result);
      } else {
        setError(data.error || data.message || 'Failed to fetch headers');
      }
    } catch (err) {
      // console.error('Error checking headers:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500 bg-green-50 border-green-200';
    if (status >= 300 && status < 400) return 'text-blue-500 bg-blue-50 border-blue-200';
    if (status >= 400 && status < 500) return 'text-orange-500 bg-orange-50 border-orange-200';
    if (status >= 500) return 'text-red-500 bg-red-50 border-red-200';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  };

  const copyHeaders = async () => {
    if (!result) return;
    
    const headersText = Object.entries(result.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    await navigator.clipboard.writeText(headersText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHeaders = () => {
    if (!result) return;
    
    const headersText = `HTTP Headers for ${result.url}\n` +
      `Status: ${result.status} ${result.statusText}\n` +
      `Response Time: ${result.responseTime}\n\n` +
      Object.entries(result.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    
    const blob = new Blob([headersText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'http-headers.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importantHeaders = ['content-type', 'cache-control', 'x-frame-options', 'x-content-type-options', 
    'strict-transport-security', 'content-security-policy', 'server', 'set-cookie'];

  return (
    <ToolLayout
      title="HTTP Header Checker"
      description="Check HTTP response headers from any URL"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
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
              <h2 className="text-2xl font-bold">HTTP Header Checker</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Check HTTP response headers from any URL and analyze security headers
              </p>
            </div>
          </div>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="mb-3 block text-sm font-medium">Enter URL</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkHeaders()}
              placeholder="https://example.com"
              className="input-field w-full pl-12"
            />
          </div>
        </motion.div>

        {/* Check Button */}
        <motion.button
          onClick={checkHeaders}
          disabled={!url.trim() || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-colors disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking Headers...
            </>
          ) : (
            <>
              <Server className="h-5 w-5" />
              Check Headers
            </>
          )}
        </motion.button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Status Code */}
            <div className={`rounded-xl border p-4 ${getStatusColor(result.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{result.status}</div>
                  <div className="text-sm opacity-75">{result.statusText}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">Response Time</div>
                  <div className="opacity-75">{result.responseTime}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={checkHeaders}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={copyHeaders}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Headers'}
              </button>
              <button
                onClick={downloadHeaders}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>

            {/* Important Headers */}
            {Object.keys(result.headers).some(h => importantHeaders.includes(h.toLowerCase())) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <h3 className="mb-4 font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Important Security Headers
                </h3>
                <div className="space-y-2 font-mono text-sm">
                  {Object.entries(result.headers)
                    .filter(([key]) => importantHeaders.includes(key.toLowerCase()))
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row gap-2 p-2 bg-muted rounded">
                        <span className="text-primary font-medium min-w-[200px]">{key}:</span>
                        <span className="text-muted-foreground break-all">{value}</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* All Headers */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h3 className="mb-4 font-semibold">All Response Headers</h3>
              <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
                {Object.entries(result.headers).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row gap-2 p-2 bg-muted rounded hover:bg-muted/80 transition-colors">
                    <span className="text-primary font-medium min-w-[200px]">{key}:</span>
                    <span className="text-muted-foreground break-all">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Security Tips */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                Security Header Best Practices
              </h4>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <h5 className="font-medium text-foreground mb-2">✅ Recommended Headers</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• <code>Strict-Transport-Security</code></li>
                    <li>• <code>X-Frame-Options</code></li>
                    <li>• <code>X-Content-Type-Options</code></li>
                    <li>• <code>Content-Security-Policy</code></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-foreground mb-2">⚠️ Watch For</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Missing security headers</li>
                    <li>• Exposed server versions</li>
                    <li>• Weak cache policies</li>
                    <li>• Cookie security settings</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <div className="mt-8">
        <ToolFAQ faqs={[
          {
            question: "What are HTTP headers?",
            answer: "HTTP headers are key-value pairs sent between clients and servers. They contain metadata about the request or response, including content type, caching, authentication, and more."
          },
          {
            question: "Why inspect HTTP headers?",
            answer: "Header inspection helps debug API issues, verify security configurations, check CORS settings, analyze caching policies, and ensure proper content delivery."
          },
          {
            question: "What common headers should I check?",
            answer: "Important headers include Content-Type, Cache-Control, CORS headers (Access-Control-*), Security headers (CSP, X-Frame-Options), and authentication headers."
          },
          {
            question: "Can I inspect any URL?",
            answer: "You can inspect most public URLs. Some sites may block automated requests or require authentication. The tool makes a standard HTTP GET request."
          },
          {
            question: "What does response time indicate?",
            answer: "Response time measures how long the server took to respond. It helps identify performance issues, network latency, or server problems affecting your application."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
  );
};

export default HTTPHeaderTool;
