import { useState } from "react";
import { Calculator, TrendingUp, Target, Calendar, Percent, IndianRupee, Sparkles, PiggyBank, BadgeIndianRupee, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { PresetOption, PresetButtonGroup } from "@/components/ui/preset-button-group";
import { InteractiveSlider } from "@/components/ui/interactive-slider";
import { FormulaCard } from "@/components/ui/formula-card";
import { FinanceChart, generateGrowthData } from "@/components/ui/finance-chart";
import { EnhancedDownload, downloadJSON, downloadText } from "@/components/EnhancedDownload";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "35 85% 55%";

const formatIndianCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const LumpsumCalculatorTool = () => {
  const [principalAmount, setPrincipalAmount] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [copied, setCopied] = useState(false);

  const presets: PresetOption[] = [
    { label: "Starter", value: { amount: 100000, rate: 10, years: 5 }, icon: PiggyBank, description: "5 years" },
    { label: "Balanced", value: { amount: 500000, rate: 12, years: 10 }, icon: BadgeIndianRupee, description: "10 years" },
    { label: "Long Term", value: { amount: 1000000, rate: 14, years: 15 }, icon: Landmark, description: "15 years" },
  ];

  const handlePresetSelect = (value: { amount: number; rate: number; years: number }) => {
    setPrincipalAmount(value.amount);
    setExpectedReturn(value.rate);
    setTimePeriod(value.years);
  };

  const calculate = () => {
    const principal = principalAmount;
    const annualReturn = expectedReturn / 100;
    const years = timePeriod;
    
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
  const chartData = result ? generateGrowthData(principalAmount, expectedReturn, timePeriod) : [];

  const handleCopy = async () => {
    if (!result) return;
    const text = `Principal Amount: ${formatIndianCurrency(result.principal)}\nTotal Returns: ${formatIndianCurrency(result.totalReturns)}\nFuture Value: ${formatIndianCurrency(result.futureValue)}\nWealth Gain: ${result.wealthGain.toFixed(2)}%`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const text = `Lumpsum Calculator Results\n\nInvestment Details:\nPrincipal: ₹${principalAmount.toLocaleString()}\nExpected Return: ${expectedReturn}% per annum\nTime Period: ${timePeriod} years\n\nResults:\nFuture Value: ₹${Math.round(result.futureValue).toLocaleString()}\nTotal Returns: ₹${Math.round(result.totalReturns).toLocaleString()}\nWealth Gain: ${result.wealthGain.toFixed(2)}%\n\nCalculated on ${new Date().toLocaleDateString()}`;
    downloadText(text, `lumpsum-calculation-${Date.now()}.txt`, "text/plain");
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const data = {
      calculationType: "Lumpsum Calculator",
      inputs: {
        principalAmount,
        expectedReturn: `${expectedReturn}% p.a.`,
        timePeriod: `${timePeriod} years`,
      },
      results: {
        futureValue: result.futureValue,
        totalReturns: result.totalReturns,
        wealthGain: result.wealthGain,
      },
      calculatedAt: new Date().toISOString(),
    };
    downloadJSON(data, `lumpsum-calculation-${Date.now()}.json`);
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

        {/* Input Section with Sliders and Presets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Preset Scenarios */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
              Quick Scenarios
            </h3>
            <PresetButtonGroup
              options={presets}
              onSelect={handlePresetSelect}
              categoryColor={categoryColor}
              columns={3}
              variant="compact"
            />
          </div>

          {/* Interactive Sliders */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
              <Calculator className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
              Investment Parameters
            </h3>
            
            <div className="space-y-6">
              <InteractiveSlider
                label="Principal Amount"
                value={principalAmount}
                onChange={setPrincipalAmount}
                min={10000}
                max={10000000}
                step={10000}
                prefix="₹"
                categoryColor={categoryColor}
                formatValue={(val) => `₹${val.toLocaleString()}`}
                description="Initial investment amount"
              />

              <InteractiveSlider
                label="Expected Annual Return"
                value={expectedReturn}
                onChange={setExpectedReturn}
                min={1}
                max={30}
                step={0.5}
                suffix="%"
                categoryColor={categoryColor}
                description="Expected annual rate of return"
              />

              <InteractiveSlider
                label="Time Period"
                value={timePeriod}
                onChange={setTimePeriod}
                min={1}
                max={30}
                step={1}
                suffix=" years"
                categoryColor={categoryColor}
                description="Investment duration"
              />
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
                    <p className="text-sm font-medium text-muted-foreground">Principal Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatIndianCurrency(result.principal)}
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
            <div className="flex justify-center gap-3">
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

              <EnhancedDownload
                options={[
                  { label: 'Download Report', format: 'txt', action: handleDownloadPDF },
                  { label: 'Export Data', format: 'json', action: handleDownloadJSON },
                ]}
                primaryLabel="Download"
                showCopy={false}
                variant="default"
              />
            </div>

            {/* Growth Visualization Chart */}
            {chartData.length > 0 && (
              <FinanceChart
                data={chartData}
                type="area"
                title="Investment Growth Over Time"
                description={`Growth projection at ${expectedReturn}% annual return`}
                dataKey="lumpsum"
                xAxisKey="name"
                categoryColor={categoryColor}
                height={300}
                formatValue={(val) => `₹${(val / 1000).toFixed(0)}K`}
              />
            )}
          </motion.div>
        )}

        {/* Enhanced Formula Info */}
        <FormulaCard
          title="Lumpsum Investment Formula"
          formula="FV = P × (1 + r)ⁿ"
          variables={[
            { symbol: 'FV', description: 'Future Value of investment', example: '₹1,00,000' },
            { symbol: 'P', description: 'Principal Amount (initial investment)', example: '₹50,000' },
            { symbol: 'r', description: 'Annual rate of interest (as decimal)', example: '0.12 for 12%' },
            { symbol: 'n', description: 'Number of years', example: '10 years' },
          ]}
          example={{
            description: 'Invest ₹1,00,000 at 12% annual return for 10 years',
            calculation: 'FV = 1,00,000 × (1 + 0.12)¹⁰ = 1,00,000 × 3.1058',
            result: '₹3,10,585',
          }}
          categoryColor={categoryColor}
          defaultExpanded={false}
        />

        {/* Enhanced Empty State */}
        {principalAmount <= 0 && (
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
              Adjust the principal amount slider to see the power of compounding
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
            <PiggyBank className="h-5 w-5 text-blue-500" />
            What is Lumpsum Investment?
          </h3>
          <p className="text-muted-foreground mb-4">
            Lumpsum investment is a one-time investment of a significant amount rather than regular small investments. It's suitable when you have a large sum available and want to invest it immediately to benefit from compounding over a longer period.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your one-time investment amount</li>
            <li>Set the expected annual return rate</li>
            <li>Choose the investment tenure in years</li>
            <li>View the maturity amount and wealth gained</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Lumpsum Benefits</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Longer compounding period</li>
                <li>• Higher growth potential</li>
                <li>• No regular commitment</li>
                <li>• Simple management</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Bonus deployment</li>
                <li>• Inheritance investment</li>
                <li>• Retirement corpus</li>
                <li>• Sale proceeds</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "When should I choose lumpsum over SIP?",
            answer: "Choose lumpsum when you have a large sum available (bonus, inheritance) and market conditions are favorable. SIP is better for regular income and rupee cost averaging."
          },
          {
            question: "Is lumpsum better than SIP?",
            answer: "Lumpsum can generate higher returns if invested at the right time due to longer compounding period. However, SIP reduces timing risk through rupee cost averaging."
          },
          {
            question: "How does compounding work in lumpsum?",
            answer: "With lumpsum, your entire amount starts compounding immediately. Over long periods, this can generate significantly higher wealth compared to phased investments."
          },
          {
            question: "What is the ideal time for lumpsum investment?",
            answer: "The ideal time is when markets are undervalued or when you have a lumpsum available. However, timing the market is difficult, so consider your risk tolerance."
          },
          {
            question: "Can I convert lumpsum to SIP?",
            answer: "Yes, you can invest a lumpsum in a mutual fund and start systematic withdrawal plans (SWP) or systematic transfer plans (STP) to manage your investments systematically."
          }
        ]} />
      </div>
    </div>
    </ToolLayout>
  );
};

export default LumpsumCalculatorTool;
