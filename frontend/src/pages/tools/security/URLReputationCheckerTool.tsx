import { useState } from 'react';
import { Copy, Check, Shield, Globe, AlertTriangle, CheckCircle, XCircle, Sparkles, Settings } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "0 80% 55%";

interface URLReputation {
  url: string;
  reputation: string;
  risk_score: number;
  color: string;
  factors: string[];
  domain_age_days: number;
  recommendations: string[];
}

export default function URLReputationCheckerTool() {
  const toolSeoData = getToolSeoMetadata('url-reputation-checker');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<URLReputation | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkReputation = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.URL_REPUTATION_CHECKER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.result) {
        setResult(data.result);
      } else {
        setError(data.error || 'Failed to check URL reputation');
      }
    } catch (err) {
      // console.error('Error checking URL reputation:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getReputationIcon = (reputation: string) => {
    switch (reputation) {
      case 'Safe':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Suspicious':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'Dangerous':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getReputationColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'orange':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDomainAge = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `URL Reputation Analysis\n` +
      `URL: ${result.url}\n` +
      `Reputation: ${result.reputation}\n` +
      `Risk Score: ${result.risk_score}/10\n` +
      `Domain Age: ${formatDomainAge(result.domain_age_days)}\n` +
      `Risk Factors: ${result.factors.length > 0 ? result.factors.join(', ') : 'None'}\n\n` +
      `Recommendations:\n${result.recommendations.map(r => '• ' + r).join('\n')}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {CategorySEO.Security(
        toolSeoData?.title || "URL Reputation Checker",
        toolSeoData?.description || "Check website reputation and identify potentially malicious URLs",
        "url-reputation-checker"
      )}
      <ToolLayout
      title={toolSeoData?.title || "URL Reputation Checker"}
      description={toolSeoData?.description || "Check website reputation and identify potentially malicious URLs"}
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">URL Analysis</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-tool w-full font-mono"
              />
              <p className="text-xs text-muted-foreground">Enter the complete URL including http:// or https://</p>
            </div>

            <button
              onClick={checkReputation} 
              disabled={!url.trim() || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Analyzing...' : 'Check Reputation'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Reputation Result */}
            <div className={`rounded-xl border p-6 ${getReputationColor(result.color)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getReputationIcon(result.reputation)}
                  <div>
                    <p className="text-xl font-bold">{result.reputation}</p>
                    <p className="text-sm opacity-75">
                      Risk Score: {result.risk_score}/10
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.color === 'green' ? 'bg-green-600 text-white' :
                    result.color === 'orange' ? 'bg-orange-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {result.reputation}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Results'}
              </button>
            </div>

            {/* URL Analysis */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">URL Analysis</h3>
              <div className="p-3 bg-muted rounded-lg">
                <code className="text-sm break-all">{result.url}</code>
              </div>
            </div>

            {/* Risk Factors */}
            {result.factors.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-600">⚠️ Risk Factors</h3>
                <div className="space-y-2">
                  {result.factors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Domain Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Domain Age</p>
                  <p className="text-2xl font-bold mt-2">{formatDomainAge(result.domain_age_days)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.domain_age_days < 90 ? 'Recently registered' : 'Established domain'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Security Status</p>
                  <p className="text-2xl font-bold mt-2">
                    {url.startsWith('https://') ? 'HTTPS' : 'HTTP'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {url.startsWith('https://') ? 'Encrypted connection' : 'Unencrypted connection'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Safety Recommendations</h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">URL Safety Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">🚨 Warning Signs</h4>
              <ul className="text-sm space-y-1">
                <li>• HTTP instead of HTTPS</li>
                <li>• Recently registered domains</li>
                <li>• IP addresses instead of domains</li>
                <li>• Suspicious keywords</li>
                <li>• Poor website design</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Safe Indicators</h4>
              <ul className="text-sm space-y-1">
                <li>• HTTPS encryption</li>
                <li>• Established domain age</li>
                <li>• Professional design</li>
                <li>• Clear contact information</li>
                <li>• Positive user reviews</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Common URL Threats</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>• <strong>Phishing:</strong> Fake websites stealing credentials</p>
              <p>• <strong>Malware:</strong> Sites distributing malicious software</p>
              <p>• <strong>Scams:</strong> Fraudulent schemes and fake offers</p>
              <p>• <strong>Spam:</strong> Unwanted promotional content</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Important:</strong> This tool provides basic reputation analysis. 
              Always exercise caution when visiting unknown websites, especially those requesting 
              personal information or downloads.
            </div>
          </div>
        </div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            What is URL Reputation Checking?
          </h3>
          <p className="text-muted-foreground mb-4">
            URL reputation checking evaluates whether a website URL is safe or potentially malicious. It checks against blacklists, analyzes domain reputation, and flags phishing, malware, or scam sites to protect you from online threats.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter a URL to check</li>
            <li>The tool queries reputation databases</li>
 <li>Analyzes domain and URL characteristics</li>
            <li>View safety rating and details</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Threat Detection</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Phishing detection</li>
                <li>• Malware blacklists</li>
                <li>• Scam identification</li>
                <li>• Reputation scoring</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Safety Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Avoid malicious sites</li>
                <li>• Protect from phishing</li>
                <li>• Safe browsing</li>
                <li>• Risk awareness</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What databases are checked?",
            answer: "URLs are checked against known phishing blacklists, malware distribution sites, scam databases, and security reputation services. Multiple sources provide comprehensive threat intelligence."
          },
          {
            question: "What makes a URL suspicious?",
            answer: "Suspicious indicators include: recently registered domains, misleading domain names (typosquatting), poor reputation, hosting in high-risk countries, or known association with malicious activity."
          },
          {
            question: "Can safe URLs be flagged incorrectly?",
            answer: "Yes, false positives can occur. New sites or those with similar names to blacklisted domains might be flagged. Always verify through multiple sources if concerned."
          },
          {
            question: "How often is reputation data updated?",
            answer: "Reputation databases are updated continuously as new threats are discovered. However, there may be a delay between a site becoming malicious and it being added to blacklists."
          },
          {
            question: "Should I avoid all flagged sites?",
            answer: "Yes, exercise extreme caution with flagged sites. If you must visit, ensure your antivirus is updated, don't download anything, and never enter credentials or personal information."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
}
