import { useState } from "react";
import { Calculator, TrendingUp, Target, Calendar, Percent, IndianRupee, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "35 85% 55%";

const formatIndianCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const MutualFundCalculatorTool = () => {
  const toolSeoData = getToolSeoMetadata('mutual-fund-calculator');
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("12");
  const [timePeriod, setTimePeriod] = useState("10");
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const monthlyAmount = parseFloat(monthlyInvestment);
    const annualReturn = parseFloat(expectedReturn) / 100;
    const years = parseFloat(timePeriod);
    
    if (isNaN(monthlyAmount) || isNaN(annualReturn) || isNaN(years)) return null;

    const monthlyReturn = annualReturn / 12;
    const months = years * 12;
    
    // Future Value of SIP: P × [{(1 + r)^n - 1} / r] × (1 + r)
    const futureValue = monthlyAmount * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn);
    const totalInvestment = monthlyAmount * months;
    const totalReturns = futureValue - totalInvestment;

    return {
      totalInvestment,
      totalReturns,
      futureValue,
      wealthGain: ((futureValue - totalInvestment) / totalInvestment) * 100
    };
  };

  const result = calculate();

  const handleCopy = async () => {
    if (!result) return;
    const text = `Monthly Investment: ${formatIndianCurrency(result.totalInvestment)}\nTotal Returns: ${formatIndianCurrency(result.totalReturns)}\nFuture Value: ${formatIndianCurrency(result.futureValue)}\nWealth Gain: ${result.wealthGain.toFixed(2)}%`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {CategorySEO.Finance(
        toolSeoData?.title || "Mutual Fund SIP Calculator",
        toolSeoData?.description || "Calculate returns on Systematic Investment Plan (SIP) investments",
        "mutual-fund-calculator"
      )}
      <ToolLayout
      title="Mutual Fund SIP Calculator"
      description="Calculate returns on Systematic Investment Plan (SIP) investments"
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
              <TrendingUp className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Mutual Fund SIP Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate returns on Systematic Investment Plan (SIP) with compound interest
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">sip calculator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">mutual fund</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">systematic investment</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">sip returns</span>
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
              <label className="block text-sm font-medium mb-2">Monthly Investment (SIP)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(e.target.value)}
                  placeholder="e.g., 5000"
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
                  <Target className="h-4 w-4" />
                  Future Value
                </div>
                <p className="text-5xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                  {formatIndianCurrency(result.futureValue)}
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
                    <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatIndianCurrency(result.totalInvestment)}
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
                      {formatIndianCurrency(result.totalReturns)}
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
              <p className="font-medium text-blue-900 mb-2">SIP Formula Used:</p>
              <p className="font-mono text-sm text-blue-800 bg-white/50 rounded px-3 py-2 mb-3">
                FV = P × [((1 + r)^n - 1) / r] × (1 + r)
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Where:</strong></p>
                <p>• FV = Future Value</p>
                <p>• P = Monthly Investment (SIP amount)</p>
                <p>• r = Monthly rate of interest (annual rate / 12)</p>
                <p>• n = Number of months (years × 12)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Empty State */}
        {!monthlyInvestment && (
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
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Start Your SIP Journey
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter your monthly investment amount to see the power of compounding
            </p>
          </motion.div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            What is Mutual Fund Investment?
          </h3>
          <p className="text-muted-foreground mb-4">
            Mutual fund investment pools money from multiple investors to purchase securities like stocks, bonds, and money market instruments. It offers diversification, professional management, and is suitable for investors seeking exposure to various asset classes.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your monthly investment amount</li>
            <li>Set the expected annual return rate</li>
            <li>Choose the investment duration</li>
            <li>View the maturity amount and wealth gained</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Mutual Fund Types</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Equity funds (high risk/return)</li>
                <li>• Debt funds (lower risk)</li>
                <li>• Hybrid funds (balanced)</li>
                <li>• Index funds (passive)</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Investment Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Professional management</li>
                <li>• Diversification</li>
                <li>• Liquidity</li>
                <li>• Tax efficiency</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is the difference between equity and debt funds?",
            answer: "Equity funds invest in stocks for higher growth potential but higher risk. Debt funds invest in bonds for stable returns with lower risk. Choose based on your risk appetite."
          },
          {
            question: "How do I choose a mutual fund?",
            answer: "Consider factors like your risk tolerance, investment horizon, financial goals, and fund performance history. Consult a financial advisor for personalized recommendations."
          },
          {
            question: "What are the tax implications?",
            answer: "Equity funds held over 1 year qualify for long-term capital gains tax (10% above ₹1 lakh). Debt funds have different tax rules based on holding period."
          },
          {
            question: "What is NAV in mutual funds?",
            answer: "NAV (Net Asset Value) is the per-unit price of a mutual fund. It's calculated by dividing total assets by total outstanding units and is published daily."
          },
          {
            question: "Can I redeem my mutual funds anytime?",
            answer: "Yes, most mutual funds offer high liquidity. However, some funds may have exit loads for early redemption. Check the fund's exit load structure before investing."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default MutualFundCalculatorTool;
