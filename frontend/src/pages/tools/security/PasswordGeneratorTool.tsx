import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Shield, Eye, EyeOff, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "0 80% 55%";

interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleOption = ({ label, checked, onChange }: ToggleOptionProps) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded border-border accent-primary"
    />
    <span className="text-sm">{label}</span>
  </label>
);

function PasswordGeneratorTool() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const generatePassword = () => {
    let chars = "";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const ambiguous = "0O1lI";

    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (excludeAmbiguous) {
      chars = chars.split("").filter(c => !ambiguous.includes(c)).join("");
    }

    if (!chars) {
      setPassword("");
      return;
    }

    let result = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }

    setPassword(result);
  };

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = (): { label: string; color: string; percent: number } => {
    if (!password) return { label: "None", color: "bg-muted", percent: 0 };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-destructive", percent: 25 };
    if (score <= 4) return { label: "Fair", color: "bg-yellow-500", percent: 50 };
    if (score <= 5) return { label: "Good", color: "bg-blue-500", percent: 75 };
    return { label: "Strong", color: "bg-green-500", percent: 100 };
  };

  const strength = getStrength();

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure random passwords instantly"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-2xl space-y-8">
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
              <h2 className="text-2xl font-bold">Password Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate secure random passwords with customizable options
              </p>
            </div>
          </div>
        </motion.div>

        {/* Password Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              readOnly
              placeholder="Click generate to create password"
              className="input-tool pr-24 font-mono text-lg"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <button
                onClick={handleCopy}
                disabled={!password}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Strength Meter */}
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Strength</span>
              <span className="font-medium">{strength.label}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${strength.color}`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <div className="mb-2 flex justify-between">
              <label htmlFor="password-length" className="text-sm font-medium">Length</label>
              <span className="text-sm text-muted-foreground">{length} characters</span>
            </div>
            <input
              id="password-length"
              type="range"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleOption
              label="Uppercase (A-Z)"
              checked={includeUppercase}
              onChange={setIncludeUppercase}
            />
            <ToggleOption
              label="Lowercase (a-z)"
              checked={includeLowercase}
              onChange={setIncludeLowercase}
            />
            <ToggleOption
              label="Numbers (0-9)"
              checked={includeNumbers}
              onChange={setIncludeNumbers}
            />
            <ToggleOption
              label="Symbols (!@#$%)"
              checked={includeSymbols}
              onChange={setIncludeSymbols}
            />
          </div>

          <ToggleOption
            label="Exclude ambiguous characters (0, O, l, 1, I)"
            checked={excludeAmbiguous}
            onChange={setExcludeAmbiguous}
          />
        </motion.div>

        <motion.button 
          onClick={generatePassword} 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2 text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          <RefreshCw className="h-5 w-5" />
          Generate Password
        </motion.button>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            What is Password Generation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Password generation creates strong, random passwords that are difficult to guess or crack. This is essential for securing accounts, protecting sensitive data, and maintaining good security practices across all your online services.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Set password length requirements</li>
            <li>Choose character types (letters, numbers, symbols)</li>
            <li>The tool generates random passwords</li>
            <li>Copy and use your secure password</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Generation Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Customizable length</li>
                <li>• Character selection</li>
                <li>• Avoid ambiguous chars</li>
                <li>• Multiple generation</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Security Best Practices</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Use unique passwords</li>
                <li>• Minimum 12 characters</li>
                <li>• Mix character types</li>
                <li>• Use password managers</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What makes a password strong?",
            answer: "Strong passwords are long (12+ characters), use a mix of uppercase, lowercase, numbers, and symbols, avoid common words or patterns, and are unique for each account."
          },
          {
            question: "How long should my password be?",
            answer: "Minimum 12 characters is recommended. For high-security accounts, 16+ characters provide significantly better security against brute-force attacks."
          },
          {
            question: "Should I use special characters?",
            answer: "Yes, special characters significantly increase password strength by expanding the character set. However, ensure the systems you use support them."
          },
          {
            question: "Can I remember these complex passwords?",
            answer: "Strong passwords are hard to remember. Use a reputable password manager to securely store them. Never write passwords down or reuse them across accounts."
          },
          {
            question: "Are randomly generated passwords better?",
            answer: "Yes, randomly generated passwords are more secure than human-created ones because they lack patterns, words, or personal information that could make them easier to guess."
          }
        ]} />
      </div>
    </ToolLayout>
  );
};

export default PasswordGeneratorTool;
