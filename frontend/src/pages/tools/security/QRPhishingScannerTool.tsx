import { useState } from 'react';
import { Copy, Check, QrCode, AlertTriangle, Shield, CheckCircle, XCircle, Sparkles, Settings } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "0 80% 55%";

interface QRAnalysis {
  qr_data: string;
  risk_level: string;
  risk_score: number;
  color: string;
  warnings: string[];
  recommendations: string[];
}

export default function QRPhishingScannerTool() {
  const [qrData, setQrData] = useState('');
  const [result, setResult] = useState<QRAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyzeQR = async () => {
    if (!qrData.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/security/qr-phishing-scanner/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qr_data: qrData }),
      });

      if (response.ok) {
        const data: QRAnalysis = await response.json();
        setResult(data);
      }
    } catch (error) {
      // console.error('Error analyzing QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `QR Code Analysis\n` +
      `Data: ${result.qr_data}\n` +
      `Risk Level: ${result.risk_level}\n` +
      `Risk Score: ${result.risk_score}/10\n\n` +
      `Warnings:\n${result.warnings.map(w => '• ' + w).join('\n')}\n\n` +
      `Recommendations:\n${result.recommendations.map(r => '• ' + r).join('\n')}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'High':
        return <XCircle className="h-8 w-8 text-red-600" />;
      case 'Medium':
        return <AlertTriangle className="h-8 w-8 text-orange-600" />;
      case 'Low':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      default:
        return <Shield className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <>
      {CategorySEO.Security(
        "QR Phishing Scanner",
        "Scan QR codes for phishing and other security risks",
        "qr-phishing-scanner"
      )}
      <ToolLayout
      title="QR Phishing Scanner"
      description="Scan QR codes for phishing and other security risks"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">QR Code Analysis</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">QR Code Data</label>
              <textarea
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder="Enter or paste QR code data here..."
                className="input-tool w-full min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">Enter the raw data from a QR code to analyze its content</p>
            </div>

            <button
              onClick={analyzeQR} 
              disabled={!qrData.trim() || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              {loading ? 'Analyzing...' : 'Analyze QR Code'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Risk Summary */}
            <div className={`rounded-xl border p-6 ${getRiskColor(result.risk_level)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRiskIcon(result.risk_level)}
                  <div>
                    <p className="text-xl font-bold">{result.risk_level} Risk</p>
                    <p className="text-sm opacity-75">
                      Risk Score: {result.risk_score}/10
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.risk_level === 'High' ? 'bg-red-600 text-white' :
                    result.risk_level === 'Medium' ? 'bg-orange-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {result.risk_level}
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

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-600">⚠️ Warnings</h3>
                <div className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          <h3 className="text-lg font-semibold mb-4">QR Code Safety Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">🚨 Common QR Code Risks</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Phishing:</strong> Redirects to fake login pages</li>
                <li>• <strong>Malware:</strong> Links to malicious downloads</li>
                <li>• <strong>Scams:</strong> Fake promotions and giveaways</li>
                <li>• <strong>Data Theft:</strong> Collects personal information</li>
                <li>• <strong>Location Tracking:</strong> Tracks user movements</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Safety Tips</h4>
              <ul className="text-sm space-y-1">
                <li>• Verify the source before scanning</li>
                <li>• Use a QR scanner with security features</li>
                <li>• Check for HTTPS in URLs</li>
                <li>• Avoid scanning codes from unknown sources</li>
                <li>• Use security software to scan links</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">What To Do If Scammed</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>1. <strong>Change Passwords:</strong> Update all affected accounts</p>
              <p>2. <strong>Monitor Accounts:</strong> Look for unauthorized activity</p>
              <p>3. <strong>Contact Bank:</strong> Report any financial fraud</p>
              <p>4. <strong>Report Scam:</strong> Inform authorities and platforms</p>
              <p>5. <strong>Educate Others:</strong> Share your experience to warn others</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Important:</strong> Always use caution when scanning QR codes. 
              Be aware of potential risks and verify the source before taking action.
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
            What is QR Phishing Scanning?
          </h3>
          <p className="text-muted-foreground mb-4">
            QR phishing scanning analyzes QR codes to detect malicious URLs before you scan them. This protects against QR code phishing attacks where malicious codes direct you to fake login pages, malware downloads, or scam sites.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload or paste a QR code image</li>
            <li>The tool extracts the embedded URL</li>
            <li>Checks URL against threat databases</li>
            <li>View safety status and analysis</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Threat Detection</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Malicious URL detection</li>
                <li>• Phishing identification</li>
                <li>• Reputation checking</li>
                <li>• Domain analysis</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Protection Tips</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Verify before scanning</li>
                <li>• Check official sources</li>
                <li>• Be suspicious of offers</li>
                <li>• Use secure scanners</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How can QR codes be malicious?",
            answer: "Malicious QR codes can direct you to phishing sites, download malware, steal credentials, or make unwanted payments. Attackers place them in public places to trick people into scanning them."
          },
          {
            question: "What happens if I scan a malicious QR code?",
            answer: "Scanning a malicious QR code can open a phishing site in your browser, download malware, or execute other attacks. Always verify QR codes before scanning, especially from unknown sources."
          },
          {
            question: "Can the tool detect all malicious QR codes?",
            answer: "The tool checks against known threat databases and analyzes URL patterns. However, new threats may not be detected yet. Always exercise caution even if a QR code scans as safe."
          },
          {
            question: "What should I do if a QR code is flagged?",
            answer: "Don't scan it. If you already did, close any opened pages immediately, scan your device for malware, and change any passwords you entered. Report the malicious QR code if possible."
          },
          {
            question: "Are all QR codes from businesses safe?",
            answer: "Not necessarily. Attackers can create fake QR codes that appear to be from legitimate businesses. Always verify the source and scan before trusting QR codes, especially in public places."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
}
