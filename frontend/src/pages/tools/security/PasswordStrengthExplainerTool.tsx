import React, { useState } from 'react';
import { Copy, Check, Shield, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import ToolLayout from "@/components/layout/ToolLayout";

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
      const response = await fetch('/api/security/password-strength-explainer/', {
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
      console.error('Error analyzing password:', error);
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
    <ToolLayout
      title="Password Strength Explainer"
      description="Analyze password strength with detailed feedback and suggestions"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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

            <button 
              onClick={analyzePassword} 
              disabled={!password.trim() || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Analyzing...' : 'Analyze Password'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
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
            <div className="rounded-xl border border-border bg-card p-6">
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
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Improvement Suggestions</h3>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Security Note:</strong> Never share your passwords or write them down in plain text. 
              Use reputable password managers to store and generate strong passwords.
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
