import { useState } from "react";
import { Calculator, TrendingUp, Target, Calendar, Percent, IndianRupee, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "35 85% 55%";

const LumpsumCalculatorTool = () => {
  const [principalAmount, setPrincipalAmount] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("12");
  const [timePeriod, setTimePeriod] = useState("10");
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const principal = parseFloat(principalAmount);
    const annualReturn = parseFloat(expectedReturn) / 100;
    const years = parseFloat(timePeriod);
    
    if (isNaN(principal) || isNaN(annualReturn) || isNaN(years)) return null;

    // Future Value of Lumpsum: P × (1 + r)^n
    const futureValue = principal * Math.pow(1 + annualReturn, years);
    const totalReturns = futureValue - principal;
    const wealthGain = ((futureValue - principal) / principal) * 100;

    return {
      principal,
      totalReturns,
      futureValue,
      wealthGain
    };
  };

  const result = calculate();

  const handleCopy = async () => {
    if (!result) return;
    const text = `Principal Amount: ₹${result.principal.toFixed(2)}\nTotal Returns: ₹${result.totalReturns.toFixed(2)}\nFuture Value: ₹${result.futureValue.toFixed(2)}\nWealth Gain: ${result.wealthGain.toFixed(2)}%`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Lumpsum Calculator"
      description="Calculate returns on one-time lumpsum investments"
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
              <Target className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Lumpsum Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate returns on one-time lumpsum investments with compound interest
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
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  placeholder="e.g., 100000"
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Expected Annual Return</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                    placeholder="e.g., 12"
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Period (Years)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3"
                  />
                </div>
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
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                  <TrendingUp className="h-4 w-4" />
                  Future Value
                </div>
                <p className="text-5xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                  ₹{result.futureValue.toFixed(2)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  After {timePeriod} years with {expectedReturn}% annual return
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
                    <IndianRupee className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Principal Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{result.principal.toFixed(2)}
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
                    <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{result.totalReturns.toFixed(2)}
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
                    <p className="text-sm font-medium text-muted-foreground">Wealth Gain</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.wealthGain.toFixed(2)}%
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
                    <Target className="h-4 w-4 text-primary" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
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
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900 mb-2">Lumpsum Formula Used:</p>
              <p className="font-mono text-sm text-blue-800 bg-white/50 rounded px-3 py-2 mb-3">
                FV = P × (1 + r)^n
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Where:</strong></p>
                <p>• FV = Future Value</p>
                <p>• P = Principal Amount (initial investment)</p>
                <p>• r = Annual rate of interest (as decimal)</p>
                <p>• n = Number of years</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Empty State */}
        {!principalAmount && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10 p-12 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4"
            >
              <Target className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Start Your Investment Journey
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter your lumpsum investment amount to see the power of compounding
            </p>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
};

export default LumpsumCalculatorTool;
