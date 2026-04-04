import { useState } from "react";
import { Copy, Check, Calculator, Sparkles, TrendingUp, IndianRupee, Calendar, Percent } from "lucide-react";
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
              <Calculator className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">EMI Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate your loan EMI payments with detailed interest breakdown
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
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Loan Amount</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="e.g., 1000000"
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Interest Rate</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g., 8.5"
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Loan Tenure</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3"
                />
                <select
                  value={tenureType}
                  onChange={(e) => setTenureType(e.target.value as "months" | "years")}
                  title="Loan tenure unit"
                  aria-label="Loan tenure unit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-sm text-muted-foreground"
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculate}
            className="w-full mt-6 rounded-lg text-white px-4 py-3 font-medium transition-colors"
            style={{
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            }}
          >
            <Calculator className="inline h-4 w-4 mr-2" />
            Calculate EMI
          </motion.button>
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Main EMI Display */}
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
                <p className="text-sm font-medium text-muted-foreground mb-2">Monthly EMI</p>
                <p className="text-5xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                  ₹{result.emi.toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  For {tenure} {tenureType === "years" ? "years" : "months"}
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Interest</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{result.totalInterest.toLocaleString()}
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
                    <IndianRupee className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Payment</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{result.totalPayment.toLocaleString()}
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
      </div>
    </ToolLayout>
  );
};

export default EMICalculatorTool;
