import React, { useState } from 'react';
import { Copy, Check, Calculator, DollarSign, Clock, Target, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "35 85% 55%";

interface RateResult {
  hourly_rate: number;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  yearly_rate: number;
  annual_income: number;
  effective_hourly: number;
}

export default function FreelancerRateCalculatorTool() {
  const [desiredIncome, setDesiredIncome] = useState('');
  const [workHours, setWorkHours] = useState('40');
  const [workWeeks, setWorkWeeks] = useState('48');
  const [businessExpenses, setBusinessExpenses] = useState('20');
  const [vacationWeeks, setVacationWeeks] = useState('4');
  const [sickDays, setSickDays] = useState('5');
  const [result, setResult] = useState<RateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateRates = async () => {
    if (!desiredIncome) return;

    setLoading(true);
    try {
      // Calculate locally (no backend needed)
      const income = parseFloat(desiredIncome);
      const hoursPerWeek = parseFloat(workHours);
      const weeksPerYear = parseFloat(workWeeks);
      const expensesPercent = parseFloat(businessExpenses) / 100;
      const vacWeeks = parseFloat(vacationWeeks);
      const sickDaysPerYear = parseFloat(sickDays);
      
      // Calculate billable weeks
      const sickWeeks = sickDaysPerYear / 5; // Convert sick days to weeks
      const billableWeeks = weeksPerYear - vacWeeks - sickWeeks;
      const billableHours = billableWeeks * hoursPerWeek;
      
      // Calculate total income needed (including business expenses)
      const totalIncomeNeeded = income / (1 - expensesPercent);
      
      // Calculate rates
      const hourlyRate = totalIncomeNeeded / billableHours;
      const dailyRate = hourlyRate * hoursPerWeek;
      const weeklyRate = hourlyRate * hoursPerWeek;
      const monthlyRate = (totalIncomeNeeded / 12);
      const yearlyRate = totalIncomeNeeded;
      
      // Calculate effective hourly rate (actual hours worked)
      const totalWorkHours = weeksPerYear * hoursPerWeek;
      const effectiveHourly = totalIncomeNeeded / totalWorkHours;

      setResult({
        hourly_rate: hourlyRate,
        daily_rate: dailyRate,
        weekly_rate: weeklyRate,
        monthly_rate: monthlyRate,
        yearly_rate: yearlyRate,
        annual_income: income,
        effective_hourly: effectiveHourly
      });
    } catch (error) {
      // console.error('Error calculating rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `Freelancer Rate Calculator\n` +
      `Desired Annual Income: ${formatCurrency(result.annual_income)}\n` +
      `Hourly Rate: ${formatCurrency(result.hourly_rate)}\n` +
      `Daily Rate: ${formatCurrency(result.daily_rate)}\n` +
      `Weekly Rate: ${formatCurrency(result.weekly_rate)}\n` +
      `Monthly Rate: ${formatCurrency(result.monthly_rate)}\n` +
      `Yearly Rate: ${formatCurrency(result.yearly_rate)}\n` +
      `Effective Hourly Rate: ${formatCurrency(result.effective_hourly)}\n\n` +
      `Experience Level: ${getExperienceLevel(result.hourly_rate)}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRateColor = (rate: number) => {
    if (rate >= 100) return 'text-green-600';
    if (rate >= 50) return 'text-blue-600';
    if (rate >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getExperienceLevel = (rate: number) => {
    if (rate >= 150) return 'Expert Level';
    if (rate >= 75) return 'Senior Level';
    if (rate >= 40) return 'Mid Level';
    return 'Junior Level';
  };

  return (
    <ToolLayout
      title="Freelancer Rate Calculator"
      description="Calculate your optimal freelance rates based on income goals and business expenses"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Rate Calculation</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="desiredIncome" className="block text-sm font-medium mb-2">Desired Annual Income ($)</label>
              <input
                id="desiredIncome"
                type="number"
                value={desiredIncome}
                onChange={(e) => setDesiredIncome(e.target.value)}
                placeholder="80000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Take-home income after expenses</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="businessExpenses" className="block text-sm font-medium mb-2">Business Expenses (%)</label>
              <input
                id="businessExpenses"
                type="number"
                value={businessExpenses}
                onChange={(e) => setBusinessExpenses(e.target.value)}
                placeholder="20"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Software, insurance, taxes, etc.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="workHours" className="block text-sm font-medium mb-2">Work Hours per Week</label>
              <select
                id="workHours"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                className="input-tool w-full"
              >
                <option value="20">20 hours (Part-time)</option>
                <option value="30">30 hours</option>
                <option value="40">40 hours (Full-time)</option>
                <option value="50">50 hours</option>
                <option value="60">60 hours</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="workWeeks" className="block text-sm font-medium mb-2">Work Weeks per Year</label>
              <select
                id="workWeeks"
                value={workWeeks}
                onChange={(e) => setWorkWeeks(e.target.value)}
                className="input-tool w-full"
              >
                <option value="40">40 weeks</option>
                <option value="44">44 weeks</option>
                <option value="48">48 weeks</option>
                <option value="50">50 weeks</option>
                <option value="52">52 weeks</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="vacationWeeks" className="block text-sm font-medium mb-2">Vacation Weeks per Year</label>
              <select
                id="vacationWeeks"
                value={vacationWeeks}
                onChange={(e) => setVacationWeeks(e.target.value)}
                className="input-tool w-full"
              >
                <option value="0">0 weeks</option>
                <option value="2">2 weeks</option>
                <option value="4">4 weeks</option>
                <option value="6">6 weeks</option>
                <option value="8">8 weeks</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="sickDays" className="block text-sm font-medium mb-2">Sick Days per Year</label>
              <select
                id="sickDays"
                value={sickDays}
                onChange={(e) => setSickDays(e.target.value)}
                className="input-tool w-full"
              >
                <option value="0">0 days</option>
                <option value="5">5 days</option>
                <option value="10">10 days</option>
                <option value="15">15 days</option>
                <option value="20">20 days</option>
              </select>
            </div>
          </div>

          <button
            onClick={calculateRates} 
            disabled={!desiredIncome || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating...' : 'Calculate Rates'}
          </button>
        </div>

        {/* Error Alert */}
        {desiredIncome && parseFloat(desiredIncome) <= 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Income must be greater than 0</span>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Hourly Rate */}
            <div className={`rounded-xl border border-border p-6 ${
              result.hourly_rate >= 100 ? 'bg-green-50 border-green-200' :
              result.hourly_rate >= 50 ? 'bg-blue-50 border-blue-200' :
              result.hourly_rate >= 25 ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommended Hourly Rate</p>
                  <p className={`text-3xl font-bold mt-1 ${getRateColor(result.hourly_rate)}`}>
                    {formatCurrency(result.hourly_rate)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getExperienceLevel(result.hourly_rate)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-white border">
                    {result.effective_hourly.toFixed(0)}/hr effective
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Results'}
              </button>
            </div>

            {/* Rate Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Daily Rate</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.daily_rate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {workHours} hours per day
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Weekly Rate</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.weekly_rate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {parseFloat(workHours)} hours × {parseFloat(workWeeks) - parseFloat(vacationWeeks) - (parseFloat(sickDays) / 5)} weeks
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Rate</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.monthly_rate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average per month
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Yearly Target</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.yearly_rate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Including {businessExpenses}% expenses
                  </p>
                </div>
              </div>
            </div>

            {/* Work Summary */}
            <div className="rounded-xl border border-border bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Income Summary</h3>
                  <div className="mt-2 text-sm text-blue-800">
                    <p>• Desired Take-Home: {formatCurrency(result.annual_income)}</p>
                    <p>• Business Expenses: {businessExpenses}% ({formatCurrency(result.yearly_rate - result.annual_income)})</p>
                    <p>• Total Revenue Target: {formatCurrency(result.yearly_rate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Freelance Rate Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Experience Levels</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Junior Level</span>
                  <span className="font-medium text-red-600">$25-50/hr</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Mid Level</span>
                  <span className="font-medium text-orange-600">$50-75/hr</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Senior Level</span>
                  <span className="font-medium text-blue-600">$75-150/hr</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Expert Level</span>
                  <span className="font-medium text-green-600">$150+/hr</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Rate Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Include all business expenses (20-30% typical)</li>
                <li>• Account for non-billable time and admin work</li>
                <li>• Consider your experience and market demand</li>
                <li>• Review and adjust rates annually</li>
                <li>• Build in emergency fund and retirement savings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            What is Freelance Rate Calculation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Freelance rate calculation helps determine appropriate hourly or project-based rates that cover your business expenses, taxes, savings, and desired income. It ensures you charge enough to be profitable while remaining competitive in the market.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your desired annual income target</li>
            <li>Add your business expenses (software, equipment, etc.)</li>
            <li>Set your working hours per week</li>
            <li>View calculated hourly, daily, weekly, and monthly rates</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Rate Calculation</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Annual income target</li>
                <li>• Business expenses included</li>
                <li>• Working hours considered</li>
                <li>• Multiple rate formats</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Rate Factors</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Experience level</li>
                <li>• Market demand</li>
                <li>• Skill specialization</li>
                <li>• Client budget range</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How do I determine my annual income target?",
            answer: "Calculate your personal expenses, add savings goals, then add business costs. A common formula: Personal Expenses + Savings + Business Costs + Taxes = Target Income."
          },
          {
            question: "What expenses should I include?",
            answer: "Include software subscriptions, hardware, internet, office space, insurance, accounting, marketing, self-employment taxes, and a buffer for unexpected costs."
          },
          {
            question: "How much should I save as a freelancer?",
            answer: "Aim for 20-30% of your income for savings and investments. This provides financial security and covers periods between projects."
          },
          {
            question: "Should I charge hourly or project-based?",
            answer: "Hourly is better for ongoing work with variable scope. Project-based works well for defined deliverables. Choose based on project type and client preference."
          },
          {
            question: "How do I account for non-billable time?",
            "answer": "Include time for admin, marketing, learning, and business development in your hourly rate. Non-billable time typically adds 20-30% to your billable rate."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
  );
}
