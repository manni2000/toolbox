import { useState } from 'react';
import { Copy, Check, Mail, AlertTriangle, Shield, CheckCircle, Calendar } from 'lucide-react';
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";

interface BreachData {
  name: string;
  date: string;
  data_type: string;
}

interface BreachResult {
  email: string;
  breaches_found: number;
  breaches: BreachData[];
  recommendations: string[];
}

export default function DataBreachEmailCheckerTool() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<BreachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkBreaches = async () => {
    if (!email.trim() || !email.includes('@')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/security/data-breach-check/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Error checking breaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `Data Breach Analysis\n` +
      `Email: ${result.email}\n` +
      `Breaches Found: ${result.breaches_found}\n\n` +
      `Breach Details:\n${result.breaches.map(b => `• ${b.name} (${b.date}) - ${b.data_type}`).join('\n')}\n\n` +
      `Recommendations:\n${result.recommendations.map(r => '• ' + r).join('\n')}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBreachSeverity = (count: number) => {
    if (count === 0) return { color: 'text-green-600 bg-green-50 border-green-200', label: 'Secure' };
    if (count <= 2) return { color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Low Risk' };
    if (count <= 5) return { color: 'text-red-600 bg-red-50 border-red-200', label: 'High Risk' };
    return { color: 'text-red-700 bg-red-100 border-red-300', label: 'Critical' };
  };

  return (
    <ToolLayout
      title="Data Breach Email Checker"
      description="Check if your email has been exposed in known data breaches"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Email Analysis</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Enter the email address to check for breaches</p>
            </div>

            <button 
              onClick={checkBreaches} 
              disabled={!email.trim() || !email.includes('@') || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Checking...' : 'Check Breaches'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Breach Summary */}
            <div className={`rounded-xl border p-6 ${getBreachSeverity(result.breaches_found).color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {result.breaches_found === 0 ? 
                    <CheckCircle className="h-8 w-8 text-green-600" /> :
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  }
                  <div>
                    <p className="text-xl font-bold">{getBreachSeverity(result.breaches_found).label}</p>
                    <p className="text-sm opacity-75">
                      {result.breaches_found} breach{result.breaches_found !== 1 ? 'es' : ''} found
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.breaches_found === 0 ? 'bg-green-600 text-white' :
                    result.breaches_found <= 2 ? 'bg-orange-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {result.breaches_found} Breaches
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

            {/* Breach Details */}
            {result.breaches.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Breach Details</h3>
                <div className="space-y-3">
                  {result.breaches.map((breach, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{breach.name}</h4>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {breach.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {breach.data_type}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Security Recommendations</h3>
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
          <h3 className="text-lg font-semibold mb-4">Data Breach Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">🚨 Common Breach Types</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Credential Stuffing:</strong> Stolen passwords reused</li>
                <li>• <strong>Phishing Attacks:</strong> Deceptive email campaigns</li>
                <li>• <strong>Malware Infections:</strong> Keyloggers and spyware</li>
                <li>• <strong>Database Leaks:</strong> Company server breaches</li>
                <li>• <strong>Third-Party Breaches:</strong> Partner company exposures</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Protection Measures</h4>
              <ul className="text-sm space-y-1">
                <li>• Use unique passwords for each account</li>
                <li>• Enable two-factor authentication (2FA)</li>
                <li>• Monitor account activity regularly</li>
                <li>• Use password managers</li>
                <li>• Update security questions</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">What To Do After a Breach</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>1. <strong>Change Passwords:</strong> Update affected accounts immediately</p>
              <p>2. <strong>Enable 2FA:</strong> Add an extra layer of security</p>
              <p>3. <strong>Monitor Credit:</strong> Check for identity theft signs</p>
              <p>4. <strong>Alert Contacts:</strong> Inform about potential spam</p>
              <p>5. <strong>Stay Vigilant:</strong> Watch for phishing attempts</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Note:</strong> This tool checks against known breach databases. 
              Always take immediate action if your email appears in any breach, even if it's old.
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
