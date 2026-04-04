import { useState } from "react";
import { Shield, Check, X, AlertTriangle, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "0 80% 55%";

const PasswordStrengthTool = () => {
  const [password, setPassword] = useState("");

  const analyze = () => {
    if (!password) return null;

    const checks = {
      length8: password.length >= 8,
      length12: password.length >= 12,
      length16: password.length >= 16,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
      noRepeating: !/(.)\1{2,}/.test(password),
      noSequential: !/(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password),
      noCommon: !/(password|123456|qwerty|admin|letmein|welcome|monkey|dragon|master|iloveyou)/i.test(password),
    };

    let score = 0;
    if (checks.length8) score += 1;
    if (checks.length12) score += 1;
    if (checks.length16) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.symbols) score += 2;
    if (checks.noRepeating) score += 1;
    if (checks.noSequential) score += 1;
    if (checks.noCommon) score += 1;

    let strength: { label: string; color: string; bgColor: string; percent: number };
    if (score <= 3) {
      strength = { label: "Very Weak", color: "text-destructive", bgColor: "bg-destructive", percent: 20 };
    } else if (score <= 5) {
      strength = { label: "Weak", color: "text-orange-500", bgColor: "bg-orange-500", percent: 40 };
    } else if (score <= 7) {
      strength = { label: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500", percent: 60 };
    } else if (score <= 9) {
      strength = { label: "Strong", color: "text-blue-500", bgColor: "bg-blue-500", percent: 80 };
    } else {
      strength = { label: "Very Strong", color: "text-primary", bgColor: "bg-primary", percent: 100 };
    }

    // Estimate crack time (very rough)
    const charsetSize = (checks.lowercase ? 26 : 0) + (checks.uppercase ? 26 : 0) + (checks.numbers ? 10 : 0) + (checks.symbols ? 32 : 0);
    const combinations = Math.pow(charsetSize || 26, password.length);
    const attemptsPerSecond = 10000000000; // 10 billion
    const seconds = combinations / attemptsPerSecond / 2;
    
    let crackTime: string;
    if (seconds < 1) crackTime = "Instantly";
    else if (seconds < 60) crackTime = `${Math.round(seconds)} seconds`;
    else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`;
    else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`;
    else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`;
    else if (seconds < 31536000 * 100) crackTime = `${Math.round(seconds / 31536000)} years`;
    else crackTime = "Centuries";

    return { checks, strength, crackTime };
  };

  const result = analyze();

  return (
    <ToolLayout
      title="Password Strength Checker"
      description="Analyze how strong your password is"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-xl space-y-6">
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
              <h2 className="text-2xl font-bold">Password Strength Checker</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Analyze how strong your password is with detailed security checks
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="mb-2 block text-sm font-medium">Enter Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to analyze..."
            className="input-tool font-mono"
          />
        </motion.div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Strength Meter */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <div className="text-center">
                <Shield className={`mx-auto h-16 w-16 ${result.strength.color}`} />
                <h3 className={`mt-4 text-2xl font-bold ${result.strength.color}`}>
                  {result.strength.label}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Estimated crack time: <span className="font-semibold">{result.crackTime}</span>
                </p>
              </div>
              <div className="mt-6">
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${result.strength.bgColor}`}
                    style={{ width: `${result.strength.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Checks */}
            <div className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <h4 className="text-sm font-semibold text-muted-foreground">Security Checks</h4>
              <CheckItem passed={result.checks.length8} label="At least 8 characters" />
              <CheckItem passed={result.checks.length12} label="At least 12 characters" />
              <CheckItem passed={result.checks.uppercase} label="Contains uppercase letters" />
              <CheckItem passed={result.checks.lowercase} label="Contains lowercase letters" />
              <CheckItem passed={result.checks.numbers} label="Contains numbers" />
              <CheckItem passed={result.checks.symbols} label="Contains special characters" />
              <CheckItem passed={result.checks.noRepeating} label="No repeating characters (aaa)" />
              <CheckItem passed={result.checks.noSequential} label="No sequential patterns (123, abc)" />
              <CheckItem passed={result.checks.noCommon} label="Not a common password" />
            </div>
          </motion.div>
        )}

        {!password && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center"
          >
            <Shield className="mx-auto h-12 w-12" style={{ color: `hsl(${categoryColor} / 0.5)` }} />
            <p className="mt-4 text-muted-foreground">
              Enter a password above to check its strength
            </p>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
};

const CheckItem = ({ passed, label }: { passed: boolean; label: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
    {passed ? (
      <Check className="h-5 w-5 text-primary" />
    ) : (
      <X className="h-5 w-5 text-destructive" />
    )}
    <span className={passed ? "" : "text-muted-foreground"}>{label}</span>
  </div>
);

export default PasswordStrengthTool;
