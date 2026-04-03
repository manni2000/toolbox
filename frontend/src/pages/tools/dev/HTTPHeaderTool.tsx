import { useState } from "react";
import { Globe, AlertCircle, Server, Sparkles, Copy, Check, Download, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";

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
      const response = await fetch(API_URLS.HTTP_HEADER_CHECKER, {
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
      console.error('Error checking headers:', err);
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
        {/* URL Input */}
        <div className="rounded-xl border border-border bg-card p-6">
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
        </div>

        {/* Check Button */}
        <button
          onClick={checkHeaders}
          disabled={!url.trim() || isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
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
        </button>

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
          <div className="space-y-4">
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
              <div className="rounded-xl border border-border bg-card p-6">
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
              </div>
            )}

            {/* All Headers */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">All Response Headers</h3>
              <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
                {Object.entries(result.headers).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row gap-2 p-2 bg-muted rounded hover:bg-muted/80 transition-colors">
                    <span className="text-primary font-medium min-w-[200px]">{key}:</span>
                    <span className="text-muted-foreground break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Tips */}
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <h4 className="font-semibold mb-4">Security Header Best Practices</h4>
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
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default HTTPHeaderTool;
