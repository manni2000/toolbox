import { useState } from "react";
import { Copy, Check, Receipt, Sparkles, Calculator, Target, TrendingUp, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { formatIndianCurrency } from "@/lib/number-formatting";

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
    const text = `Base Amount: ${formatIndianCurrency(result.base)}\nGST (${gstRate}%): ${formatIndianCurrency(result.gst)}\nCGST (${parseFloat(gstRate)/2}%): ${formatIndianCurrency(result.cgst)}\nSGST (${parseFloat(gstRate)/2}%): ${formatIndianCurrency(result.sgst)}\nTotal: ${formatIndianCurrency(result.total)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gstRates = ["0", "5", "12", "18", "28"];

  return (
    <ToolLayout
      title="GST Calculator"
      description="Calculate GST, CGST, and SGST amounts with precision"
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
              <Receipt className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">GST Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate GST, CGST, and SGST amounts with precision for Indian tax system
              </p>
            </div>
          </div>
        </motion.div>

        {/* Calculation Type Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="block text-sm font-medium mb-4">Calculation Type</label>
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCalcType("addGST")}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                calcType === "addGST"
                  ? "text-white shadow-lg"
                  : "bg-muted hover:bg-muted/80"
              }`}
              style={{
                background:
                  calcType === "addGST"
                    ? `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`
                    : undefined,
              }}
            >
              <Calculator className="inline h-4 w-4 mr-2" />
              Add GST
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCalcType("removeGST")}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                calcType === "removeGST"
                  ? "text-white shadow-lg"
                  : "bg-muted hover:bg-muted/80"
              }`}
              style={{
                background:
                  calcType === "removeGST"
                    ? `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`
                    : undefined,
              }}
            >
              <Target className="inline h-4 w-4 mr-2" />
              Remove GST
            </motion.button>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                {calcType === "addGST" ? "Base Amount" : "Total Amount (Including GST)"}
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-4">GST Rate</label>
              <div className="grid grid-cols-5 gap-3">
                {gstRates.map((rate) => (
                  <motion.button
                    key={rate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGstRate(rate)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      gstRate === rate
                        ? "text-white shadow-lg"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    style={{
                      background:
                        gstRate === rate
                          ? `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`
                          : undefined,
                    }}
                  >
                    {rate}%
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
            transition={{ delay: 0.3 }}
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
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                  <TrendingUp className="h-4 w-4" />
                  Total Amount
                </div>
                <p className="text-5xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                  {formatIndianCurrency(result.total)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Including GST at {gstRate}%
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
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Base Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatIndianCurrency(result.base)}
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
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total GST ({gstRate}%)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatIndianCurrency(result.gst)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CGST/SGST Breakdown */}
            <div className="rounded-xl border border-border bg-gradient-to-r from-orange-50 to-yellow-50 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="text-center">
                  <p className="text-sm font-medium text-orange-800 mb-2">CGST ({parseFloat(gstRate)/2}%)</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatIndianCurrency(result.cgst)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-yellow-800 mb-2">SGST ({parseFloat(gstRate)/2}%)</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatIndianCurrency(result.sgst)}
                  </p>
                </div>
              </div>
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
                    Copy breakdown
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

export default GSTCalculatorTool;
