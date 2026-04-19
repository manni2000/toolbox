import { useState } from "react";
import { Copy, Check, Calculator, Sparkles, TrendingUp, TrendingDown, IndianRupee, Calendar, Percent, Target, DollarSign } from "lucide-react";
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

const categoryColor = "262 80% 50%";

const formatIndianCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const ROICalculatorTool = () => {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [finalValue, setFinalValue] = useState(150000);
  const [years, setYears] = useState(3);
  const [months, setMonths] = useState(0);
  const [copied, setCopied] = useState(false);

  // Preset investment scenarios
  const presets: PresetOption[] = [
    { label: "Stock Investment", value: { initial: 50000, final: 75000, years: 2, months: 0 }, icon: TrendingUp, description: "50% return in 2 years" },
    { label: "Real Estate", value: { initial: 1000000, final: 1200000, years: 3, months: 6 }, icon: Target, description: "20% return in 3.5 years" },
    { label: "Fixed Deposit", value: { initial: 200000, final: 236000, years: 4, months: 0 }, icon: DollarSign, description: "6.5% annual return" },
  ];

  const handlePresetSelect = (value: { initial: number; final: number; years: number; months: number }) => {
    setInitialInvestment(value.initial);
    setFinalValue(value.final);
    setYears(value.years);
    setMonths(value.months);
  };

  const calculate = () => {
    if (initialInvestment <= 0 || finalValue <= 0 || (years === 0 && months === 0)) return null;

    const totalYears = years + (months / 12);
    
    // ROI calculation: ROI = [(Final Value - Initial Investment) / Initial Investment] × 100
    const absoluteGain = finalValue - initialInvestment;
    const roiPercentage = (absoluteGain / initialInvestment) * 100;
    
    // Annualized ROI: CAGR = (Final Value / Initial Investment)^(1/years) - 1
    const cagr = Math.pow(finalValue / initialInvestment, 1 / totalYears) - 1;
    const annualizedRoi = cagr * 100;

    return {
      absoluteGain: Math.round(absoluteGain * 100) / 100,
      roiPercentage: Math.round(roiPercentage * 100) / 100,
      annualizedRoi: Math.round(annualizedRoi * 100) / 100,
      cagr: Math.round(cagr * 10000) / 10000,
      totalYears: Math.round(totalYears * 100) / 100,
    };
  };

  const result = calculate();
  
  // Generate chart data showing investment growth over time
  const chartData = result ? generateGrowthData(initialInvestment, result.cagr * 100, result.totalYears) : [];
  
  const pieData = result ? generatePieData([
    { label: "Initial Investment", value: initialInvestment },
    { label: "Absolute Gain", value: result.absoluteGain },
  ]) : [];

  const handleCopy = async () => {
    if (!result) return;
    const text = `Initial Investment: ${formatIndianCurrency(initialInvestment)}\nFinal Value: ${formatIndianCurrency(finalValue)}\nAbsolute Gain: ${formatIndianCurrency(result.absoluteGain)}\nROI: ${result.roiPercentage}%\nAnnualized ROI: ${result.annualizedRoi}%`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const text = `ROI Calculator Results\n\nInvestment Details:\nInitial Investment: ₹${initialInvestment.toLocaleString()}\nFinal Value: ₹${finalValue.toLocaleString()}\nInvestment Period: ${years} years ${months} months\n\nResults:\nAbsolute Gain: ₹${result.absoluteGain.toLocaleString()}\nTotal ROI: ${result.roiPercentage}%\nAnnualized ROI (CAGR): ${result.annualizedRoi}%\nTotal Period: ${result.totalYears} years\n\nCalculated on ${new Date().toLocaleDateString()}`;
    downloadText(text, `roi-calculation-${Date.now()}.txt`, 'text/plain');
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const data = {
      calculationType: 'ROI Calculator',
      inputs: {
        initialInvestment,
        finalValue,
        investmentPeriod: `${years} years ${months} months`,
      },
      results: {
        absoluteGain: result.absoluteGain,
        totalROI: result.roiPercentage + '%',
        annualizedROI: result.annualizedRoi + '%',
        cagr: result.cagr,
        totalYears: result.totalYears,
      },
      calculatedAt: new Date().toISOString(),
    };
    downloadJSON(data, `roi-calculation-${Date.now()}.json`);
  };

  const isPositiveReturn = finalValue > initialInvestment;

  return (
    <ToolLayout
      title="ROI Calculator"
      description="Calculate Return on Investment and annualized returns"
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
              <h2 className="text-2xl font-bold">ROI Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate your Return on Investment with annualized CAGR analysis
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
            Quick Investment Scenarios
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
              label="Initial Investment"
              value={initialInvestment}
              onChange={setInitialInvestment}
              min={1000}
              max={10000000}
              step={1000}
              prefix="₹"
              categoryColor={categoryColor}
              formatValue={(val) => `₹${val.toLocaleString()}`}
              description="Amount initially invested"
            />

            <InteractiveSlider
              label="Final Value"
              value={finalValue}
              onChange={setFinalValue}
              min={1000}
              max={20000000}
              step={1000}
              prefix="₹"
              categoryColor={categoryColor}
              formatValue={(val) => `₹${val.toLocaleString()}`}
              description="Current or expected final value"
            />

            <div className="grid grid-cols-2 gap-4">
              <InteractiveSlider
                label="Years"
                value={years}
                onChange={setYears}
                min={0}
                max={30}
                step={1}
                suffix=" years"
                categoryColor={categoryColor}
                description="Investment years"
              />

              <InteractiveSlider
                label="Months"
                value={months}
                onChange={setMonths}
                min={0}
                max={11}
                step={1}
                suffix=" months"
                categoryColor={categoryColor}
                description="Additional months"
              />
            </div>
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
            {/* Main ROI Display */}
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
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isPositiveReturn ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <p className="text-sm font-medium text-muted-foreground">Total ROI</p>
                </div>
                <p className={`text-5xl font-bold ${isPositiveReturn ? 'text-green-600' : 'text-red-600'}`}>
                  {result.roiPercentage}%
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Over {result.totalYears} years
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
                    <p className="text-sm font-medium text-muted-foreground">Absolute Gain</p>
                    <p className={`text-2xl font-bold ${isPositiveReturn ? 'text-green-600' : 'text-red-600'}`}>
                      {formatIndianCurrency(result.absoluteGain)}
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
                    <p className="text-sm font-medium text-muted-foreground">Annualized ROI (CAGR)</p>
                    <p className={`text-2xl font-bold ${result.annualizedRoi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.annualizedRoi}%
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
                  title="Investment Growth Projection"
                  description="Growth based on calculated CAGR"
                  dataKey="lumpsum"
                  xAxisKey="year"
                  categoryColor={categoryColor}
                  height={250}
                  formatValue={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />

                <FinanceChart
                  data={pieData}
                  type="pie"
                  title="Investment Distribution"
                  description="Initial Investment vs Absolute Gain"
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
          title="ROI Calculation Formulas"
          formula="ROI = [(Final Value - Initial Investment) / Initial Investment] × 100"
          variables={[
            { symbol: 'ROI', description: 'Return on Investment percentage', example: '50%' },
            { symbol: 'CAGR', description: 'Compound Annual Growth Rate', example: '14.47%' },
            { symbol: 'Initial Investment', description: 'Amount initially invested', example: '₹1,00,000' },
            { symbol: 'Final Value', description: 'Current or expected final value', example: '₹1,50,000' },
            { symbol: 'Time Period', description: 'Investment duration in years', example: '2 years' },
          ]}
          example={{
            description: 'Investment of ₹1,00,000 becoming ₹1,50,000 in 2 years',
            calculation: 'ROI = [(1,50,000 - 1,00,000) / 1,00,000] × 100\nROI = [50,000 / 1,00,000] × 100\nROI = 50%\n\nCAGR = (1,50,000 / 1,00,000)^(1/2) - 1\nCAGR = 1.5^(0.5) - 1\nCAGR = 1.2247 - 1 = 0.2247\nAnnualized ROI = 22.47%',
            result: 'Total ROI: 50%, Annualized ROI: 22.47%',
          }}
          categoryColor={categoryColor}
          defaultExpanded={false}
        />
      </div>

      {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            What is ROI Calculation?
          </h3>
          <p className="text-muted-foreground mb-4">
            ROI (Return on Investment) measures the efficiency of an investment by comparing the profit or loss to the initial investment cost. It's expressed as a percentage and helps investors evaluate the performance of different investment opportunities.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter the initial investment amount</li>
            <li>Enter the final value or sale amount</li>
            <li>Optionally include the investment duration</li>
            <li>View the ROI percentage and absolute profit</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">ROI Metrics</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ROI percentage</li>
                <li>• Absolute profit/loss</li>
                <li>• Annualized ROI</li>
                <li>• Investment ratio</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Investment comparison</li>
                <li>• Business performance</li>
                <li>• Marketing analysis</li>
                <li>• Project evaluation</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is the ROI formula?",
            answer: "ROI = [(Final Value - Initial Investment) / Initial Investment] × 100. This gives you the percentage return on your investment."
          },
          {
            question: "What is a good ROI?",
            answer: "A good ROI depends on the investment type and risk. Generally, ROI above the market average (S&P 500 ~10%) is considered good for stocks. Higher risk investments should yield higher returns."
          },
          {
            question: "How do I calculate annualized ROI?",
            answer: "Annualized ROI accounts for investment time: [(Final Value / Initial Investment)^(1/n) - 1] × 100, where n is number of years invested."
          },
          {
            question: "Does ROI account for time?",
            answer: "Basic ROI doesn't account for time. A 10% return in 1 year is better than 10% in 10 years. Annualized ROI adjusts for time to enable fair comparison."
          },
          {
            question: "What's the difference between ROI and profit?",
            answer: "Profit is the absolute gain (Final - Initial). ROI is profit as a percentage of investment, allowing comparison across different investment sizes."
          }
        ]} />
        <SimilarTools currentToolSlug="roi-calculator" />
        </div>
    </ToolLayout>
  );
};

export default ROICalculatorTool;
