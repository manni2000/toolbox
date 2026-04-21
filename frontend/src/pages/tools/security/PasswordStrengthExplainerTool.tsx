import { useState } from 'react';
import { Copy, Check, Shield, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Sparkles, Settings } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "0 80% 55%";

interface PasswordAnalysis {
  strength: string;
  score: number;
  color: string;
  feedback: string[];
  suggestions: string[];
}

export default function PasswordStrengthExplainerTool() {
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyzePassword = async () => {
    if (!password.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/security/password-strength-explainer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data: PasswordAnalysis = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      // console.error('Error analyzing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!analysis) return;
    const text = `Password Strength Analysis\n` +
      `Password: ${password.replace(/./g, '*')}\n` +
      `Strength: ${analysis.strength}\n` +
      `Score: ${analysis.score}/7\n\n` +
      `Feedback:\n${analysis.feedback.map(f => '• ' + f).join('\n')}\n\n` +
      `Suggestions:\n${analysis.suggestions.map(s => '• ' + s).join('\n')}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Strong':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Weak':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Very Weak':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'Very Strong':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'Strong':
        return <CheckCircle className="h-8 w-8 text-blue-600" />;
      case 'Weak':
        return <AlertTriangle className="h-8 w-8 text-orange-600" />;
      case 'Very Weak':
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Shield className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <>
      {CategorySEO.Security(
        "Password Strength Explainer",
        "Analyze password strength with detailed feedback and suggestions",
        "password-strength-explainer"
      )}
      <ToolLayout
      title="Password Strength Explainer"
      description="Analyze password strength with detailed feedback and suggestions"
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
              <h2 className="text-2xl font-bold">Password Strength Explainer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Analyze password strength with detailed feedback and suggestions
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
          <h3 className="text-lg font-semibold mb-4">Password Analysis</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Password to Analyze</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to analyze"
                  className="input-tool w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 flex -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Your password is processed locally and never stored</p>
            </div>

            <motion.button
              onClick={analyzePassword} 
              disabled={!password.trim() || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Analyzing...' : 'Analyze Password'}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Strength Summary */}
            <div className={`rounded-xl border p-6 ${getStrengthColor(analysis.strength)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStrengthIcon(analysis.strength)}
                  <div>
                    <p className="text-xl font-bold">{analysis.strength}</p>
                    <p className="text-sm opacity-75">
                      Score: {analysis.score}/7
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.strength === 'Very Strong' ? 'bg-green-600 text-white' :
                    analysis.strength === 'Strong' ? 'bg-blue-600 text-white' :
                    analysis.strength === 'Weak' ? 'bg-orange-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {analysis.score}/7
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
                {copied ? 'Copied!' : 'Copy Analysis'}
              </button>
            </div>

            {/* Feedback */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <h3 className="text-lg font-semibold mb-4">Strength Feedback</h3>
              <div className="space-y-2">
                {analysis.feedback.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    {item.startsWith('✅') ? 
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /> :
                      item.startsWith('⚠️') ?
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" /> :
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    }
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <h3 className="text-lg font-semibold mb-4">Improvement Suggestions</h3>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
                    <p className="text-sm">{suggestion}</p>
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
          <h3 className="text-lg font-semibold mb-4">Password Security Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Strong Password Features</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Length:</strong> 12+ characters recommended</li>
                <li>• <strong>Complexity:</strong> Mix of character types</li>
                <li>• <strong>Uniqueness:</strong> Avoid common patterns</li>
                <li>• <strong>No Personal Info:</strong> Avoid names, dates, words</li>
                <li>• <strong>Regular Updates:</strong> Change periodically</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">🚫 Weak Password Risks</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Short Length:</strong> Easy to brute force</li>
                <li>• <strong>Common Words:</strong> Dictionary attacks</li>
                <li>• <strong>Personal Data:</strong> Social engineering</li>
                <li>• <strong>Reused Passwords:</strong> Credential stuffing</li>
                <li>• <strong>Sequential Patterns:</strong> Predictable sequences</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Password Creation Tips</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>• Use passphrases: "correct-horse-battery-staple"</p>
              <p>• Mix languages: combine words from different languages</p>
              <p>• Use acronyms: create from memorable phrases</p>
              <p>• Add numbers/symbols: substitute letters creatively</p>
              <p>• Use password managers: generate and store securely</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
            <div className="text-sm">
              <strong>Security Note:</strong> Never share your passwords or write them down in plain text. 
              Use reputable password managers to store and generate strong passwords.
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
            <Shield className="h-5 w-5 text-blue-500" />
            What is Password Strength Explained?
          </h3>
          <p className="text-muted-foreground mb-4">
            Password strength explained breaks down the factors that make passwords secure or vulnerable. It educates on entropy, cracking methods, and best practices, helping you understand why certain password choices are safer than others.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter a password to analyze</li>
            <li>The tool explains each strength factor</li>
            <li>Shows cracking time estimates</li>
            <li>Provides improvement recommendations</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Strength Concepts</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Entropy calculation</li>
                <li>• Cracking methods</li>
                <li>• Pattern analysis</li>
                <li>• Character variety</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Educational Value</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Understand risks</li>
                <li>• Learn best practices</li>
                <li>• Improve habits</li>
                <li>• Security awareness</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is password entropy?",
            answer: "Entropy measures the randomness and unpredictability of a password. Higher entropy means more possible combinations, making passwords exponentially harder to crack through brute force."
          },
          {
            question: "How are cracking times calculated?",
            answer: "Cracking times estimate how long it would take to guess a password using current hardware and techniques. Times vary based on password length, complexity, and attacker resources."
          },
          {
            question: "Why are patterns dangerous?",
            answer: "Patterns (like substituting letters with numbers) reduce entropy because they're predictable. Attackers use pattern dictionaries, making patterned passwords much easier to crack than truly random ones."
          },
          {
            question: "What's the role of character variety?",
            answer: "Each character type (uppercase, lowercase, numbers, symbols) expands the character set. More character types mean exponentially more combinations, significantly increasing password strength."
          },
          {
            question: "How does length affect cracking time?",
            answer: "Cracking time grows exponentially with length. Each additional character multiplies the combinations by the character set size. Going from 8 to 12 characters can increase cracking time by millions of years."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};
