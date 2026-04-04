import { useState } from "react";
import { Copy, Check, Calculator, TrendingUp, Sparkles, DollarSign, Calendar, Percent, Target } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "145 70% 45%";

const CompoundInterestTool = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState<"years" | "months">("years");
  const [frequency, setFrequency] = useState("12"); // Monthly by default
  const [copied, setCopied] = useState(false);

  const frequencies = [
    { value: "1", label: "Annually" },
    { value: "2", label: "Semi-Annually" },
    { value: "4", label: "Quarterly" },
    { value: "12", label: "Monthly" },
    { value: "52", label: "Weekly" },
    { value: "365", label: "Daily" },
  ];

  const calculate = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const n = parseFloat(frequency);
    let t = parseFloat(time);

    if (isNaN(P) || isNaN(r) || isNaN(n) || isNaN(t) || P <= 0 || r <= 0 || t <= 0) {
      return null;
    }

    if (timeUnit === "months") {
      t = t / 12;
    }

    // A = P(1 + r/n)^(nt)
    const amount = P * Math.pow(1 + r / n, n * t);
    const interest = amount - P;

    return {
      principal: P,
      totalInterest: interest,
      finalAmount: amount,
      effectiveRate: (Math.pow(1 + r / n, n) - 1) * 100,
    };
  };

  const result = calculate();

  const handleCopy = async () => {
    if (!result) return;
    const text = `Principal: $${result.principal.toLocaleString()}\nTotal Interest: $${result.totalInterest.toFixed(2)}\nFinal Amount: $${result.finalAmount.toFixed(2)}\nEffective Annual Rate: ${result.effectiveRate.toFixed(2)}%`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Compound Interest Calculator"
      description="Calculate compound interest with different compounding frequencies"
      category="Education Tools"
      categoryPath="/category/education"
    >
      <div className="mx-auto max-w-4xl space-y-6">
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
              <TrendingUp className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Compound Interest Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate compound interest and watch your money grow over time
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Principal Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Annual Interest Rate</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Period</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3"
                  />
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value as "years" | "months")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-sm text-muted-foreground"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Compounding Frequency</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {frequencies.map((f) => (
                  <motion.button
                    key={f.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFrequency(f.value)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      frequency === f.value
                        ? "text-white shadow-lg"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    style={{
                      background:
                        frequency === f.value
                          ? `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`
                          : undefined,
                    }}
                  >
                    {f.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Main Result Display */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-8 text-center shadow-lg">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10"
              />
              <div className="relative">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Final Amount
                </div>
                <p className="text-5xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                  ${result.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  After {time} {timeUnit === "years" ? "years" : "months"} at {rate}% APR
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid gap-4 sm:grid-cols-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Principal</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${result.principal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Interest</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Effective Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.effectiveRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Copy Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg bg-muted px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy results
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Formula Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-gradient-to-r from-blue-50 to-purple-50 p-6"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900 mb-2">Formula Used:</p>
              <p className="font-mono text-sm text-blue-800 bg-white/50 rounded px-3 py-2 mb-3">
                A = P(1 + r/n)^(nt)
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Where:</strong></p>
                <p>• A = Final amount</p>
                <p>• P = Principal amount</p>
                <p>• r = Annual interest rate (decimal)</p>
                <p>• n = Compounding frequency per year</p>
                <p>• t = Time in years</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default CompoundInterestTool;
