import { useState } from 'react';
import { Copy, Check, Mail, AlertTriangle, Shield, CheckCircle, Calendar, Sparkles, Settings } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "0 80% 55%";

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
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.DATA_BREACH_EMAIL_CHECKER}`, {
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
      // console.error('Error checking breaches:', error);
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
              <h2 className="text-2xl font-bold">Data Breach Email Checker</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Check if your email has been exposed in known data breaches
              </p>
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

            <motion.button
              onClick={checkBreaches} 
              disabled={!email.trim() || !email.includes('@') || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Checking...' : 'Check Breaches'}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
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
              <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
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
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <h3 className="text-lg font-semibold mb-4">Security Recommendations</h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Information Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
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
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
            <div className="text-sm">
              <strong>Note:</strong> This tool checks against known breach databases. 
              Always take immediate action if your email appears in any breach, even if it's old.
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
}
