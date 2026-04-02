import { useState } from "react";
import { Copy, Check, Calculator, TrendingUp, Sparkles } from "lucide-react";
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
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Principal */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Principal Amount ($)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g., 10000"
            className="input-tool"
          />
        </div>

        {/* Rate and Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g., 5"
              className="input-tool"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Time Period
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 5"
                className="input-tool flex-1"
              />
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value as "years" | "months")}
                className="input-tool w-28"
                aria-label="Time unit selection"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compounding Frequency */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Compounding Frequency
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {frequencies.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`rounded-lg border p-3 text-sm font-medium transition-all ${
                  frequency === f.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Main Result */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Final Amount
              </div>
              <p className="mt-2 text-4xl font-bold text-primary">
                ${result.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid gap-4 sm:grid-cols-3">
              <ResultCard
                label="Principal"
                value={`$${result.principal.toLocaleString()}`}
              />
              <ResultCard
                label="Total Interest"
                value={`$${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                highlight
              />
              <ResultCard
                label="Effective Annual Rate"
                value={`${result.effectiveRate.toFixed(2)}%`}
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
            A = P(1 + r/n)^(nt)
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Where: A = Final amount, P = Principal, r = Annual rate, n = Compounding frequency, t = Time in years
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

export default CompoundInterestTool;
