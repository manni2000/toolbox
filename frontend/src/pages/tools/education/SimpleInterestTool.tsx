import { useState } from "react";
import { Copy, Check, TrendingUp, Sparkles, DollarSign, Calendar, Percent, Target } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "145 70% 45%";

const SimpleInterestTool = () => {
  const toolSeoData = getToolSeoMetadata('simple-interest-calculator');
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
    <>
      {CategorySEO.Education(
        toolSeoData?.title || "Simple Interest Calculator",
        toolSeoData?.description || "Calculate simple interest on principal amount",
        "simple-interest-calculator"
      )}
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
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">simple interest</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">interest calculator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">loan interest</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">principal interest</span>
              </div>
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            What is Simple Interest?
          </h3>
          <p className="text-muted-foreground mb-4">
            Simple interest is interest calculated only on the original principal amount throughout the loan or investment period. Unlike compound interest, it doesn't earn interest on accumulated interest, making calculations straightforward but typically yielding less over time.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter the principal amount (initial loan/investment)</li>
            <li>Set the annual interest rate (percentage)</li>
            <li>Choose the time period (years or months)</li>
            <li>View the calculated simple interest and total amount</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Key Formula</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• SI = (P × R × T) / 100</li>
                <li>• P = Principal amount</li>
                <li>• R = Annual rate (%)</li>
                <li>• T = Time period</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Short-term loans</li>
                <li>• Basic investments</li>
                <li>• Financial education</li>
                <li>• Simple calculations</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What's the simple interest formula?",
            answer: "Simple Interest = (Principal × Rate × Time) / 100. For example, $1000 at 5% for 2 years = (1000 × 5 × 2) / 100 = $100."
          },
          {
            question: "When is simple interest used?",
            answer: "Simple interest is commonly used for short-term loans, car loans, some personal loans, and basic investment products where compounding isn't applied."
          },
          {
            question: "How does it differ from compound interest?",
            answer: "Simple interest is calculated only on the principal. Compound interest is calculated on principal plus accumulated interest, leading to exponential growth over time."
          },
          {
            question: "Can I calculate in months?",
            answer: "Yes, you can select time in months. The formula automatically adjusts: Time in years = months / 12 for accurate calculation."
          },
          {
            question: "Is simple interest better than compound?",
            answer: "For borrowers, simple interest is better as you pay less total interest. For investors, compound interest is better as you earn more through interest on interest."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
      </>
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
