import { useState } from 'react';
import { Copy, Check, Calculator, TrendingUp, DollarSign, Target, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "35 85% 55%";

interface BurnRateResult {
  monthly_expenses: number;
  monthly_revenue: number;
  burn_rate: number;
  runway_months: number;
  recommendations: string[];
}

export default function StartupBurnRateCalculatorTool() {
  const toolSeoData = getToolSeoMetadata('startup-burn-rate-calculator');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [currentCash, setCurrentCash] = useState('');
  const [result, setResult] = useState<BurnRateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateBurnRate = async () => {
    if (!monthlyExpenses || !monthlyRevenue || !currentCash) return;

    setLoading(true);
    try {
      // Calculate burn rate locally (no backend needed)
      const expenses = parseFloat(monthlyExpenses);
      const revenue = parseFloat(monthlyRevenue);
      const cash = parseFloat(currentCash);
      
      const burnRate = expenses - revenue;
      const runwayMonths = burnRate > 0 ? cash / burnRate : Infinity;

      const recommendations: string[] = [];
      if (burnRate > 0) {
        recommendations.push("Consider reducing expenses to extend runway");
        recommendations.push("Focus on increasing revenue streams");
        if (runwayMonths < 6) {
          recommendations.push("URGENT: Seek immediate funding or pivot business model");
        } else if (runwayMonths < 12) {
          recommendations.push("Start fundraising preparations");
        }
      } else {
        recommendations.push("Great! You're profitable. Consider reinvesting in growth");
        recommendations.push("Explore scaling opportunities");
      }

      setResult({
        monthly_expenses: expenses,
        monthly_revenue: revenue,
        burn_rate: burnRate,
        runway_months: Math.round(runwayMonths * 10) / 10,
        recommendations
      });
    } catch (error) {
      // console.error('Error calculating burn rate:', error);
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
    const text = `Startup Burn Rate Analysis\n` +
      `Monthly Expenses: ${formatCurrency(result.monthly_expenses)}\n` +
      `Monthly Revenue: ${formatCurrency(result.monthly_revenue)}\n` +
      `Burn Rate: ${formatCurrency(Math.abs(result.burn_rate))} ${result.burn_rate > 0 ? '(burning)' : '(profit)'}\n` +
      `Cash Runway: ${result.runway_months === Infinity ? 'Infinite (profitable)' : result.runway_months.toFixed(1) + ' months'}\n\n` +
      `Recommendations:\n${result.recommendations.map(r => '• ' + r).join('\n')}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRunwayColor = (months: number) => {
    if (months === Infinity || months > 24) return 'text-green-600';
    if (months > 12) return 'text-blue-600';
    if (months > 6) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRunwayBadge = (months: number) => {
    if (months === Infinity) return { text: 'Profitable', color: 'bg-green-600 text-white' };
    if (months > 24) return { text: 'Excellent', color: 'bg-green-600 text-white' };
    if (months > 12) return { text: 'Good', color: 'bg-blue-600 text-white' };
    if (months > 6) return { text: 'Warning', color: 'bg-orange-600 text-white' };
    return { text: 'Critical', color: 'bg-red-600 text-white' };
  };

  return (
    <>
      {CategorySEO.Finance(
        toolSeoData?.title || "Startup Burn Rate Calculator",
        toolSeoData?.description || "Calculate your startup's burn rate and cash runway",
        "startup-burn-rate-calculator"
      )}
      <ToolLayout
      title="Startup Burn Rate Calculator"
      description="Calculate your startup's burn rate and cash runway"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Financial Metrics</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Monthly Expenses ($)</label>
              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                placeholder="50000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Total monthly costs</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Monthly Revenue ($)</label>
              <input
                type="number"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(e.target.value)}
                placeholder="30000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Total monthly income</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Current Cash ($)</label>
              <input
                type="number"
                value={currentCash}
                onChange={(e) => setCurrentCash(e.target.value)}
                placeholder="500000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Available cash reserves</p>
            </div>
          </div>

          <button
            onClick={calculateBurnRate} 
            disabled={!monthlyExpenses || !monthlyRevenue || !currentCash || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating...' : 'Calculate Burn Rate'}
          </button>
        </div>

        {/* Error Alert */}
        {(monthlyExpenses && parseFloat(monthlyExpenses) <= 0) || 
         (monthlyRevenue && parseFloat(monthlyRevenue) < 0) || 
         (currentCash && parseFloat(currentCash) <= 0) ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Expenses and cash must be greater than 0, revenue can be 0 or more</span>
          </div>
        ) : null}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Burn Rate & Runway */}
            <div className={`rounded-xl border border-border p-6 ${
              result.runway_months === Infinity || result.runway_months > 24 ? 'bg-green-50 border-green-200' :
              result.runway_months > 12 ? 'bg-blue-50 border-blue-200' :
              result.runway_months > 6 ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Burn Rate</p>
                  <p className={`text-3xl font-bold mt-1 ${
                    result.burn_rate > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {result.burn_rate > 0 ? '-' : '+'}{formatCurrency(Math.abs(result.burn_rate))}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.burn_rate > 0 ? 'Burning cash' : 'Generating profit'}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRunwayBadge(result.runway_months).color}`}>
                    {getRunwayBadge(result.runway_months).text}
                  </div>
                  <p className={`text-sm font-medium mt-2 ${getRunwayColor(result.runway_months)}`}>
                    {result.runway_months === Infinity ? 'Infinite' : result.runway_months.toFixed(1)} months runway
                  </p>
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

            {/* Financial Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                  <p className="text-2xl font-bold mt-2 text-red-600">
                    {formatCurrency(result.monthly_expenses)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Cash outflow</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold mt-2 text-green-600">
                    {formatCurrency(result.monthly_revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Cash inflow</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Current Cash</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(currentCash ? parseFloat(currentCash) : 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Available reserves</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cash Flow Analysis */}
            <div className={`rounded-xl border border-border p-6 ${
              result.burn_rate > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <TrendingUp className={`h-5 w-5 mt-0.5 ${
                  result.burn_rate > 0 ? 'text-orange-600' : 'text-green-600'
                }`} />
                <div>
                  <h3 className={`font-semibold ${
                    result.burn_rate > 0 ? 'text-orange-900' : 'text-green-900'
                  }`}>Cash Flow Analysis</h3>
                  <div className={`mt-2 text-sm space-y-1 ${
                    result.burn_rate > 0 ? 'text-orange-800' : 'text-green-800'
                  }`}>
                    {result.burn_rate > 0 ? (
                      <>
                        <p>• You're burning {formatCurrency(result.burn_rate)} per month</p>
                        <p>• At this rate, cash will last {result.runway_months.toFixed(1)} months</p>
                        <p>• Consider cost-cutting measures or revenue acceleration</p>
                      </>
                    ) : (
                      <>
                        <p>• Congratulations! You're generating profit</p>
                        <p>• Monthly profit: {formatCurrency(Math.abs(result.burn_rate))}</p>
                        <p>• Consider reinvesting for growth or expansion</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Burn Rate Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Runway Categories</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Profitable</span>
                  <span className="font-medium text-green-600">Infinite</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Excellent</span>
                  <span className="font-medium text-green-600">&gt;24 months</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Good</span>
                  <span className="font-medium text-blue-600">12-24 months</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Warning</span>
                  <span className="font-medium text-orange-600">6-12 months</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Critical</span>
                  <span className="font-medium text-red-600">&lt;6 months</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Startup Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Monitor burn rate weekly, not monthly</li>
                <li>• Always have 6+ months runway minimum</li>
                <li>• Cut costs early, not when desperate</li>
                <li>• Focus on revenue, not just funding</li>
                <li>• Plan fundraising 6 months before needed</li>
              </ul>
            </div>
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
            <TrendingUp className="h-5 w-5 text-blue-500" />
            What is Startup Burn Rate?
          </h3>
          <p className="text-muted-foreground mb-4">
            Burn rate is the rate at which a startup spends its cash reserves before generating positive cash flow. It measures monthly cash depletion and helps determine how long the company can survive (runway) before needing additional funding.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your monthly expenses (salaries, rent, software, etc.)</li>
            <li>Input monthly revenue if you have any</li>
            <li>The tool calculates gross and net burn rate</li>
            <li>View runway analysis and fundraising timeline</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Burn Metrics</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Gross burn (total expenses)</li>
                <li>• Net burn (expenses - revenue)</li>
                <li>• Runway (months of cash)</li>
                <li>• Fundraising timeline</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Startup Health</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Healthy: 12+ months runway</li>
                <li>• Warning: 6-12 months</li>
                <li>• Critical: &lt;6 months</li>
                <li>• Fundraising timeline</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is the difference between gross and net burn?",
            answer: "Gross burn is total monthly expenses. Net burn is expenses minus revenue. Net burn shows actual cash depletion. Use net burn for runway calculations."
          },
          {
            question: "How much runway should a startup have?",
            answer: "Aim for 12+ months runway minimum. This gives time to iterate, raise funds, or reach profitability. Start fundraising when you have 6 months left."
          },
          {
            question: "How do I reduce my burn rate?",
            answer: "Reduce non-essential expenses, negotiate vendor contracts, use contractors instead of full-time hires where possible, delay office space, and focus on revenue-generating activities."
          },
          {
            question: "When should I start fundraising?",
            answer: "Start fundraising 6 months before you run out of money. The process typically takes 3-6 months. Don't wait until you're desperate - investors prefer growing companies."
          },
          {
            question: "Does burn rate include salaries?",
            answer: "Yes, burn rate includes all cash expenses: salaries, rent, software, marketing, and any other operating costs. It's the total cash leaving your bank account monthly."
          }
        ]} />
        </div>
    </ToolLayout>
      </>
  );
}
