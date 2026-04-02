import { useState } from "react";
import { Copy, Check, Receipt, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "35 85% 55%";

const GSTCalculatorTool = () => {
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [calcType, setCalcType] = useState<"addGST" | "removeGST">("addGST");
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const amt = parseFloat(amount);
    const rate = parseFloat(gstRate);
    
    if (isNaN(amt) || isNaN(rate)) return null;

    if (calcType === "addGST") {
      const gstAmount = (amt * rate) / 100;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      const total = amt + gstAmount;
      return { base: amt, gst: gstAmount, cgst, sgst, total };
    } else {
      const base = (amt * 100) / (100 + rate);
      const gstAmount = amt - base;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return { base, gst: gstAmount, cgst, sgst, total: amt };
    }
  };

  const result = calculate();

  const handleCopy = async () => {
    if (!result) return;
    const text = `Base Amount: ₹${result.base.toFixed(2)}\nGST (${gstRate}%): ₹${result.gst.toFixed(2)}\nCGST (${parseFloat(gstRate)/2}%): ₹${result.cgst.toFixed(2)}\nSGST (${parseFloat(gstRate)/2}%): ₹${result.sgst.toFixed(2)}\nTotal: ₹${result.total.toFixed(2)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gstRates = ["0", "5", "12", "18", "28"];

  return (
    <ToolLayout
      title="GST Calculator"
      description="Calculate GST, CGST, and SGST amounts"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-xl space-y-6">
        {/* Calculation Type */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCalcType("addGST")}
            className={`rounded-lg p-4 text-sm font-medium transition-all ${
              calcType === "addGST"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Add GST to Amount
          </button>
          <button
            onClick={() => setCalcType("removeGST")}
            className={`rounded-lg p-4 text-sm font-medium transition-all ${
              calcType === "removeGST"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Remove GST from Amount
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            {calcType === "addGST" ? "Amount (excluding GST)" : "Amount (including GST)"}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              className="input-tool pl-10"
            />
          </div>
        </div>

        {/* GST Rate */}
        <div>
          <label className="mb-2 block text-sm font-medium">GST Rate</label>
          <div className="flex flex-wrap gap-2">
            {gstRates.map((rate) => (
              <button
                key={rate}
                onClick={() => setGstRate(rate)}
                className={`rounded-lg px-6 py-3 font-medium transition-all ${
                  gstRate === rate
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="space-y-3">
                <ResultRow label="Base Amount" value={result.base} />
                <ResultRow label={`CGST (${parseFloat(gstRate)/2}%)`} value={result.cgst} />
                <ResultRow label={`SGST (${parseFloat(gstRate)/2}%)`} value={result.sgst} />
                <div className="my-2 border-t border-border" />
                <ResultRow label={`Total GST (${gstRate}%)`} value={result.gst} highlight />
                <ResultRow label="Total Amount" value={result.total} highlight primary />
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
                  Copy breakdown
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

const ResultRow = ({ 
  label, 
  value, 
  highlight = false,
  primary = false 
}: { 
  label: string; 
  value: number; 
  highlight?: boolean;
  primary?: boolean;
}) => (
  <div className={`flex items-center justify-between ${highlight ? "font-semibold" : ""}`}>
    <span className={primary ? "text-primary" : ""}>{label}</span>
    <span className={primary ? "text-primary text-xl" : ""}>₹{value.toFixed(2)}</span>
  </div>
);

export default GSTCalculatorTool;
