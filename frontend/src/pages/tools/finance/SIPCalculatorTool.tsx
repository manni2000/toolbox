import { useState } from "react";
import { Copy, Check, Calculator, Sparkles, TrendingUp, IndianRupee, Calendar, Percent, Target, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { PresetOption, PresetButtonGroup } from "@/components/ui/preset-button-group";
import { InteractiveSlider } from "@/components/ui/interactive-slider";
import { FormulaCard } from "@/components/ui/formula-card";
import { FinanceChart, generateGrowthData, generatePieData } from "@/components/ui/finance-chart";
import { EnhancedDownload, downloadText, downloadJSON } from "@/components/EnhancedDownload";
import SimilarTools from "@/components/SimilarTools";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "145 85% 55%";

const formatIndianCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const SIPCalculatorTool = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(10);
  const [copied, setCopied] = useState(false);

  // Preset investment scenarios
  const presets: PresetOption[] = [
    { label: "Conservative", value: { amount: 3000, rate: 8, years: 15 }, icon: PiggyBank, description: "Low risk, long term" },
    { label: "Moderate", value: { amount: 5000, rate: 12, years: 10 }, icon: Target, description: "Balanced approach" },
    { label: "Aggressive", value: { amount: 10000, rate: 15, years: 7 }, icon: TrendingUp, description: "High risk, short term" },
  ];

  const handlePresetSelect = (value: { amount: number; rate: number; years: number }) => {
    setMonthlyInvestment(value.amount);
    setAnnualRate(value.rate);
    setYears(value.years);
  };

  const calculate = () => {
    const P = monthlyInvestment;
    const r = annualRate / 100 / 12; // Monthly rate
    const n = years * 12; // Total months
    
    if (P <= 0 || r < 0 || n <= 0) return null;

    // SIP calculation: A = P × [{(1 + r)^n – 1} / r] × (1 + r)
    const amount = r === 0 ? P * n : P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = P * n;
    const wealthGain = amount - totalInvested;

    return {
      amount: Math.round(amount),
      totalInvested: Math.round(totalInvested),
      wealthGain: Math.round(wealthGain),
    };
  };

  const result = calculate();
  const chartData = result ? generateGrowthData(0, annualRate, years, monthlyInvestment).map(item => ({
    ...item,
    invested: item.year * monthlyInvestment * 12
  })) : [];
  const pieData = result ? generatePieData([
    { label: "Total Invested", value: result.totalInvested },
    { label: "Wealth Gain", value: result.wealthGain },
  ]) : [];

  const handleCopy = async () => {
    if (!result) return;
    const text = `Total Invested: ${formatIndianCurrency(result.totalInvested)}\nWealth Gain: ${formatIndianCurrency(result.wealthGain)}\nFinal Amount: ${formatIndianCurrency(result.amount)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const text = `SIP Calculator Results\n\nInvestment Details:\nMonthly Investment: ₹${monthlyInvestment.toLocaleString()}\nAnnual Return Rate: ${annualRate}%\nInvestment Period: ${years} years\n\nResults:\nTotal Amount Invested: ₹${result.totalInvested.toLocaleString()}\nWealth Gain: ₹${result.wealthGain.toLocaleString()}\nFinal Amount: ₹${result.amount.toLocaleString()}\nTotal Returns: ${((result.wealthGain / result.totalInvested) * 100).toFixed(2)}%\n\nCalculated on ${new Date().toLocaleDateString()}`;
    downloadText(text, `sip-calculation-${Date.now()}.txt`, 'text/plain');
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const data = {
      calculationType: 'SIP Calculator',
      inputs: {
        monthlyInvestment,
        annualReturnRate: annualRate + '%',
        investmentPeriod: years + ' years',
      },
      results: {
        totalInvested: result.totalInvested,
        wealthGain: result.wealthGain,
        finalAmount: result.amount,
        totalReturns: ((result.wealthGain / result.totalInvested) * 100).toFixed(2) + '%',
      },
      calculatedAt: new Date().toISOString(),
    };
    downloadJSON(data, `sip-calculation-${Date.now()}.json`);
  };

  return (
    <ToolLayout
      title="SIP Calculator"
      description="Calculate Systematic Investment Plan returns"
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
              <h2 className="text-2xl font-bold">SIP Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate your Systematic Investment Plan returns with wealth gain analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Preset Investment Scenarios */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
            Quick Investment Strategies
          </h3>
          <PresetButtonGroup
            options={presets}
            onSelect={handlePresetSelect}
            categoryColor={categoryColor}
            columns={3}
            variant="default"
          />
        </motion.div>

        {/* Interactive Sliders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <Calculator className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
            Investment Parameters
          </h3>
          
          <div className="space-y-6">
            <InteractiveSlider
              label="Monthly Investment"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={500}
              max={100000}
              step={500}
              prefix="₹"
              categoryColor={categoryColor}
              formatValue={(val) => `₹${val.toLocaleString()}`}
              description="Amount invested monthly"
            />

            <InteractiveSlider
              label="Expected Annual Return"
              value={annualRate}
              onChange={setAnnualRate}
              min={1}
              max={30}
              step={0.5}
              suffix="% p.a."
              categoryColor={categoryColor}
              description="Expected rate of return"
            />

            <InteractiveSlider
              label="Investment Period"
              value={years}
              onChange={setYears}
              min={1}
              max={30}
              step={1}
              suffix=" years"
              categoryColor={categoryColor}
              description="Total investment duration"
            />
          </div>
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Main Final Amount Display */}
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
                <p className="text-sm font-medium text-muted-foreground mb-2">Final Amount</p>
                <p className="text-5xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                  {formatIndianCurrency(result.amount)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  After {years} years of investment
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
                    <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatIndianCurrency(result.totalInvested)}
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
                    <p className="text-sm font-medium text-muted-foreground">Wealth Gain</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatIndianCurrency(result.wealthGain)}
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
                    <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {((result.wealthGain / result.totalInvested) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg bg-muted px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
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
              </motion.button>

              <EnhancedDownload
                options={[
                  { label: 'Download Report', format: 'txt', action: handleDownload },
                  { label: 'Export Data', format: 'json', action: handleDownloadJSON },
                ]}
                primaryLabel="Download"
                showCopy={false}
                variant="default"
              />
            </div>

            {/* Investment Growth Charts */}
            {chartData.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                <FinanceChart
                  data={chartData}
                  type="line"
                  title="Investment Growth"
                  description="Year-by-year growth projection"
                  dataKey="sip"
                  xAxisKey="year"
                  categoryColor={categoryColor}
                  height={250}
                  formatValue={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  additionalLines={[
                    { dataKey: 'invested', color: 'hsl(215 70% 45%)', name: 'Total Invested' }
                  ]}
                />

                <FinanceChart
                  data={pieData}
                  type="pie"
                  title="Investment Distribution"
                  description="Total Invested vs Wealth Gain"
                  dataKey="value"
                  categoryColor={categoryColor}
                  height={250}
                  formatValue={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Formula Card */}
        <FormulaCard
          title="SIP Calculation Formula"
          formula="A = P × [{(1 + r)^n – 1} / r] × (1 + r)"
          variables={[
            { symbol: 'A', description: 'Final amount', example: '₹11,61,695' },
            { symbol: 'P', description: 'Monthly investment amount', example: '₹5,000' },
            { symbol: 'r', description: 'Monthly interest rate (annual rate / 12 / 100)', example: '0.01 for 12% p.a.' },
            { symbol: 'n', description: 'Total number of monthly investments', example: '120 months' },
          ]}
          example={{
            description: 'Monthly SIP of ₹5,000 at 12% for 10 years',
            calculation: 'r = 12 / 12 / 100 = 0.01\nn = 10 × 12 = 120\nA = 5,000 × [{(1 + 0.01)¹²⁰ – 1} / 0.01] × (1 + 0.01)',
            result: '₹11,61,695 total amount',
          }}
          categoryColor={categoryColor}
          defaultExpanded={false}
        />
      </div>

      {/* FAQ Section */}
      <ToolFAQ />
      <SimilarTools currentToolSlug="sip-calculator" />
    </ToolLayout>
  );
};

export default SIPCalculatorTool;
