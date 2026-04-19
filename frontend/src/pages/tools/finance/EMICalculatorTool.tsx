import { useState } from "react";
import { Copy, Check, Calculator, Sparkles, TrendingUp, IndianRupee, Calendar, Percent, Home, Car, User } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { PresetOption, PresetButtonGroup } from "@/components/ui/preset-button-group";
import { InteractiveSlider } from "@/components/ui/interactive-slider";
import { FormulaCard } from "@/components/ui/formula-card";
import { FinanceChart, generateEMIData, generatePieData } from "@/components/ui/finance-chart";
import { EnhancedDownload, downloadText, downloadJSON } from "@/components/EnhancedDownload";
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

const EMICalculatorTool = () => {
  const [principal, setPrincipal] = useState(2500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(10);
  const [tenureType, setTenureType] = useState<"months" | "years">("years");
  const [copied, setCopied] = useState(false);

  // Preset loan scenarios
  const presets: PresetOption[] = [
    { label: "Home Loan", value: { amount: 2500000, rate: 8.5, years: 20 }, icon: Home, description: "20 years" },
    { label: "Car Loan", value: { amount: 800000, rate: 9.5, years: 5 }, icon: Car, description: "5 years" },
    { label: "Personal Loan", value: { amount: 300000, rate: 11.5, years: 3 }, icon: User, description: "3 years" },
  ];

  const handlePresetSelect = (value: { amount: number; rate: number; years: number }) => {
    setPrincipal(value.amount);
    setRate(value.rate);
    setTenure(value.years);
    setTenureType("years");
  };

  const calculate = () => {
    const P = principal;
    const R = rate / 12 / 100; // Monthly rate
    let N = tenure;
    
    if (P <= 0 || R <= 0 || N <= 0) return null;

    if (tenureType === "years") {
      N = N * 12;
    }

    // EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    };
  };

  const result = calculate();
  const months = tenureType === "years" ? tenure * 12 : tenure;
  const chartData = result ? generateEMIData(principal, rate / 12 / 100, months) : [];
  const pieData = result ? generatePieData([
    { label: "Principal", value: principal },
    { label: "Interest", value: result.totalInterest },
  ]) : [];

  const handleCopy = async () => {
    if (!result) return;
    const text = `EMI: ${formatIndianCurrency(result.emi)}\nTotal Interest: ${formatIndianCurrency(result.totalInterest)}\nTotal Payment: ${formatIndianCurrency(result.totalPayment)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const text = `EMI Calculator Results\n\nLoan Details:\nPrincipal: ₹${principal.toLocaleString()}\nInterest Rate: ${rate}% per annum\nTenure: ${tenure} ${tenureType}\n\nCalculated EMI:\nMonthly Payment: ₹${result.emi.toLocaleString()}\nTotal Interest: ₹${result.totalInterest.toLocaleString()}\nTotal Payment: ₹${result.totalPayment.toLocaleString()}\n\nCalculated on ${new Date().toLocaleDateString()}`;
    downloadText(text, `emi-calculation-${Date.now()}.txt`, 'text/plain');
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const data = {
      calculationType: 'EMI Calculator',
      inputs: {
        principal,
        interestRate: rate + '% p.a.',
        tenure: tenure + ' ' + tenureType,
      },
      results: {
        monthlyEMI: result.emi,
        totalInterest: result.totalInterest,
        totalPayment: result.totalPayment,
      },
      calculatedAt: new Date().toISOString(),
    };
    downloadJSON(data, `emi-calculation-${Date.now()}.json`);
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

        {/* Preset Loan Scenarios */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
            Quick Loan Types
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
            Loan Parameters
          </h3>
          
          <div className="space-y-6">
            <InteractiveSlider
              label="Loan Amount"
              value={principal}
              onChange={setPrincipal}
              min={100000}
              max={10000000}
              step={50000}
              prefix="₹"
              categoryColor={categoryColor}
              formatValue={(val) => `₹${(val / 100000).toFixed(1)}L`}
              description="Principal loan amount"
            />

            <InteractiveSlider
              label="Interest Rate (per annum)"
              value={rate}
              onChange={setRate}
              min={5}
              max={20}
              step={0.1}
              suffix="% p.a."
              categoryColor={categoryColor}
              description="Annual interest rate"
            />

            <div>
              <InteractiveSlider
                label="Loan Tenure"
                value={tenure}
                onChange={setTenure}
                min={1}
                max={tenureType === "years" ? 30 : 360}
                step={1}
                suffix={` ${tenureType}`}
                categoryColor={categoryColor}
                description="Loan repayment period"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setTenureType("years")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    tenureType === "years"
                      ? "text-white shadow-md"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  style={{
                    background:
                      tenureType === "years"
                        ? `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`
                        : undefined,
                  }}
                >
                  Years
                </button>
                <button
                  onClick={() => setTenureType("months")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    tenureType === "months"
                      ? "text-white shadow-md"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  style={{
                    background:
                      tenureType === "months"
                        ? `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`
                        : undefined,
                  }}
                >
                  Months
                </button>
              </div>
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
                  {formatIndianCurrency(result.emi)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  For {tenure} {tenureType}
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
                      {formatIndianCurrency(result.totalInterest)}
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
                      {formatIndianCurrency(result.totalPayment)}
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

            {/* Payment Breakdown Charts */}
            {chartData.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                <FinanceChart
                  data={chartData.slice(0, Math.min(chartData.length, 12))}
                  type="bar"
                  title="Payment Breakdown"
                  description="Principal vs Interest (First 12 months)"
                  dataKey="interest"
                  xAxisKey="name"
                  categoryColor={categoryColor}
                  height={250}
                  formatValue={(val) => `₹${(val / 1000).toFixed(0)}K`}
                  additionalLines={[
                    { dataKey: 'principal', color: 'hsl(145 70% 45%)', name: 'Principal' }
                  ]}
                />

                <FinanceChart
                  data={pieData}
                  type="pie"
                  title="Total Cost Distribution"
                  description="Principal vs Total Interest"
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
          title="EMI Calculation Formula"
          formula="EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ - 1)"
          variables={[
            { symbol: 'EMI', description: 'Equated Monthly Installment', example: '₹21,246' },
            { symbol: 'P', description: 'Principal loan amount', example: '₹25,00,000' },
            { symbol: 'r', description: 'Monthly interest rate (annual rate / 12 / 100)', example: '0.00708 for 8.5% p.a.' },
            { symbol: 'n', description: 'Total number of monthly installments', example: '240 months' },
          ]}
          example={{
            description: 'Loan of ₹25,00,000 at 8.5% for 20 years',
            calculation: 'r = 8.5 / 12 / 100 = 0.00708\nn = 20 × 12 = 240\nEMI = 25,00,000 × 0.00708 × (1.00708)²⁴⁰ / ((1.00708)²⁴⁰ - 1)',
            result: '₹21,246 per month',
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
          <Calculator className="h-5 w-5 text-blue-500" />
          What is EMI Calculation?
        </h3>
        <p className="text-muted-foreground mb-4">
          EMI (Equated Monthly Installment) is the fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMI calculators help you understand your monthly loan repayment before taking a loan, enabling better financial planning.
        </p>
        
        <h4 className="font-semibold mb-2">How It Works</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
          <li>Enter the loan amount (principal)</li>
          <li>Set the interest rate (annual percentage)</li>
          <li>Choose the loan tenure (in months or years)</li>
          <li>View the calculated EMI and total payment breakdown</li>
        </ol>
        
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-1">EMI Components</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Principal repayment</li>
              <li>• Interest payment</li>
              <li>• Total payment</li>
              <li>• Interest ratio</li>
            </ul>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Home loan planning</li>
              <li>• Car loan comparison</li>
              <li>• Personal loan budgeting</li>
              <li>• Loan affordability check</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <div className="mt-8">
        {/* FAQ Section */}
      <ToolFAQ faqs={[
        {
          question: "What is the EMI formula?",
          answer: "EMI = [P × R × (1+R)^N] / [(1+R)^N-1], where P = Principal, R = Monthly interest rate, N = Number of months. This calculates your fixed monthly payment."
        },
        {
          question: "How does interest rate affect EMI?",
          answer: "Higher interest rates increase your EMI and total payment. Even a 1% difference can significantly impact your total cost over the loan tenure."
        },
        {
          question: "What's the difference between reducing balance and flat rate?",
          answer: "Reducing balance calculates interest on remaining principal (lower cost). Flat rate calculates interest on original principal throughout (higher cost)."
        },
        {
          question: "Should I choose shorter or longer tenure?",
          answer: "Shorter tenure means higher EMI but lower total interest paid. Longer tenure means lower EMI but higher total interest. Choose based on your monthly budget."
        },
        {
          question: "Can I prepay my loan to reduce EMI?",
          answer: "Yes, prepayment reduces the principal, which can either reduce your EMI or shorten your tenure. Check with your lender for prepayment terms and charges."
        }
      ]} />
      </div>
    </ToolLayout>
  );
};

export default EMICalculatorTool;
