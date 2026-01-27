import { useState } from "react";
import { Copy, Check, TrendingUp } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

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
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>

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
