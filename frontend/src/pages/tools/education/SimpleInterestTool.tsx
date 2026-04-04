import { useState } from "react";
import { Copy, Check, TrendingUp, Sparkles, DollarSign, Calendar, Percent, Target } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "145 70% 45%";

const SimpleInterestTool = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState<"years" | "months">("years");
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    let t = parseFloat(time);

    if (isNaN(P) || isNaN(r) || isNaN(t) || P <= 0 || r <= 0 || t <= 0) {
      return null;
    }

    if (timeUnit === "months") {
      t = t / 12;
    }

    // SI = P × r × t
    const interest = P * r * t;
    const amount = P + interest;

    return {
      principal: P,
      interest,
      amount,
      rate: parseFloat(rate),
      time: t,
    };
  };

  const result = calculate();

  const handleCopy = async () => {
    if (!result) return;
    const text = `Principal: $${result.principal.toLocaleString()}\nSimple Interest: $${result.interest.toFixed(2)}\nTotal Amount: $${result.amount.toFixed(2)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Simple Interest Calculator"
      description="Calculate simple interest on principal amount"
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
              <h2 className="text-2xl font-bold">Simple Interest Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate simple interest on your principal amount instantly
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
          </div>
        </motion.div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Main Result */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Total Amount
              </div>
              <p className="mt-2 text-4xl font-bold text-primary">
                ${result.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Principal"
                value={`$${result.principal.toLocaleString()}`}
              />
              <ResultCard
                label="Simple Interest"
                value={`$${result.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                highlight
              />
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="mx-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy results
                </>
              )}
            </button>
          </div>
        )}

        {/* Formula Info */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm font-medium">Formula Used:</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            SI = P × r × t
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Where: SI = Simple Interest, P = Principal, r = Annual rate (decimal), t = Time in years
          </p>
        </div>

        {/* Comparison Note */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium">💡 Simple vs Compound Interest</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Simple interest is calculated only on the principal amount. Unlike compound interest, it doesn't earn "interest on interest" — making it easier to calculate but typically yielding less over time.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

const ResultCard = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className={`rounded-lg border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={`mt-1 text-xl font-semibold ${highlight ? "text-primary" : ""}`}>
      {value}
    </p>
  </div>
);

export default SimpleInterestTool;
