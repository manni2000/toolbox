import { useState } from 'react';
import { Copy, Check, Shield, Globe, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";

interface URLReputation {
  url: string;
  reputation: string;
  risk_score: number;
  color: string;
  factors: string[];
  domain_age_days: number;
  recommendations: [];
}

export default function URLReputationCheckerTool() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<URLReputation | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkReputation = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/security/url-reputation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Error checking URL reputation:', error);
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
    <ToolLayout
      title="URL Reputation Checker"
      description="Check website reputation and identify potentially malicious URLs"
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
      </div>
    </ToolLayout>
  );
}
