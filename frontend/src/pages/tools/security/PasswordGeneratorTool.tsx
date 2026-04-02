import { useState } from "react";
import { Copy, Check, RefreshCw, Shield, Eye, EyeOff, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "0 80% 55%";

const PasswordGeneratorTool = () => {
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
        {/* Password Display */}
        <div className="rounded-xl border border-border bg-card p-6">
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
        </div>

        {/* Options */}
        <div className="space-y-6">
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
        </div>

        <button onClick={generatePassword} className="btn-primary w-full">
          <RefreshCw className="h-5 w-5" />
          Generate Password
        </button>
      </div>
    </ToolLayout>
  );
};

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

export default PasswordGeneratorTool;
