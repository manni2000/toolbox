import { useState } from "react";
import { Copy, Check, Calculator, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "35 85% 55%";

const EMICalculatorTool = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureType, setTenureType] = useState<"months" | "years">("years");
  const [result, setResult] = useState<{
    emi: number;
    totalInterest: number;
    totalPayment: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const P = parseFloat(principal);
    const R = parseFloat(rate) / 12 / 100; // Monthly rate
    let N = parseFloat(tenure);
    
    if (isNaN(P) || isNaN(R) || isNaN(N) || P <= 0 || R <= 0 || N <= 0) {
      setResult(null);
      return;
    }

    if (tenureType === "years") {
      N = N * 12;
    }

    // EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    setResult({
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    });
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `EMI: ₹${result.emi.toLocaleString()}\nTotal Interest: ₹${result.totalInterest.toLocaleString()}\nTotal Payment: ₹${result.totalPayment.toLocaleString()}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="EMI Calculator"
      description="Calculate loan EMI payments"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Inputs */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Loan Amount (₹)
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="e.g., 1000000"
              className="input-tool"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Interest Rate (% per year)
            </label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g., 8.5"
              className="input-tool"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Loan Tenure
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                placeholder="e.g., 5"
                className="input-tool flex-1"
              />
              <select
                value={tenureType}
                onChange={(e) => setTenureType(e.target.value as "months" | "years")}
                title="Loan tenure unit"
                aria-label="Loan tenure unit"
                className="input-tool w-28"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full">
          <Calculator className="h-5 w-5" />
          Calculate EMI
        </button>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
              <p className="text-sm text-muted-foreground">Monthly EMI</p>
              <p className="mt-2 text-4xl font-bold text-primary">
                ₹{result.emi.toLocaleString()}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="mt-1 text-xl font-semibold">
                  ₹{result.totalInterest.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Payment</p>
                <p className="mt-1 text-xl font-semibold">
                  ₹{result.totalPayment.toLocaleString()}
                </p>
              </div>
            </div>

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
      </div>
    </ToolLayout>
  );
};

export default EMICalculatorTool;
