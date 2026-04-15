import { useState } from 'react';
import { Copy, Check, Calculator, DollarSign, TrendingUp, Target, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "35 85% 55%";

interface MarginResult {
  revenue: number;
  cost: number;
  gross_profit: number;
  gross_margin: number;
  net_profit: number;
  net_margin: number;
  markup: number;
}

export default function ProfitMarginCalculatorTool() {
  const [revenue, setRevenue] = useState('');
  const [cost, setCost] = useState('');
  const [operatingExpenses, setOperatingExpenses] = useState('');
  const [result, setResult] = useState<MarginResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateMargins = async () => {
    if (!revenue || !cost) return;

    setLoading(true);
    try {
      // Calculate locally (no backend needed)
      const rev = parseFloat(revenue);
      const cogs = parseFloat(cost);
      const opex = parseFloat(operatingExpenses) || 0;
      
      const grossProfit = rev - cogs;
      const grossMargin = (grossProfit / rev) * 100;
      const netProfit = grossProfit - opex;
      const netMargin = (netProfit / rev) * 100;
      const markup = cogs > 0 ? ((rev - cogs) / cogs) * 100 : 0;

      setResult({
        revenue: rev,
        cost: cogs,
        gross_profit: grossProfit,
        gross_margin: grossMargin,
        net_profit: netProfit,
        net_margin: netMargin,
        markup: markup
      });
    } catch (error) {
      console.error('Error calculating margins:', error);
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
    const text = `Profit Margin Analysis\n` +
      `Revenue: ${formatCurrency(result.revenue)}\n` +
      `Cost of Goods Sold: ${formatCurrency(result.cost)}\n` +
      `Operating Expenses: ${formatCurrency(result.revenue - result.cost - result.net_profit)}\n\n` +
      `Gross Profit: ${formatCurrency(result.gross_profit)}\n` +
      `Gross Margin: ${result.gross_margin.toFixed(2)}%\n` +
      `Net Profit: ${formatCurrency(result.net_profit)}\n` +
      `Net Margin: ${result.net_margin.toFixed(2)}%\n` +
      `Markup: ${result.markup.toFixed(2)}%`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-600';
    if (margin >= 10) return 'text-blue-600';
    if (margin >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMarginBadge = (margin: number) => {
    if (margin >= 20) return { text: 'Excellent', color: 'bg-green-600 text-white' };
    if (margin >= 10) return { text: 'Good', color: 'bg-blue-600 text-white' };
    if (margin >= 5) return { text: 'Fair', color: 'bg-orange-600 text-white' };
    return { text: 'Poor', color: 'bg-red-600 text-white' };
  };

  const getIndustryBenchmark = (margin: number) => {
    if (margin >= 40) return 'High-margin industry (Software, SaaS)';
    if (margin >= 20) return 'Healthy margin (Services, Consulting)';
    if (margin >= 10) return 'Typical margin (Retail, Manufacturing)';
    return 'Low-margin industry (Grocery, Commodities)';
  };

  return (
    <ToolLayout
      title="Profit Margin Calculator"
      description="Calculate gross margin, net margin, and markup for your business"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Financial Data</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Revenue ($)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="100000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Total sales revenue</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Cost of Goods Sold ($)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="60000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Direct costs of production</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Operating Expenses ($)</label>
              <input
                type="number"
                value={operatingExpenses}
                onChange={(e) => setOperatingExpenses(e.target.value)}
                placeholder="20000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">SG&A, marketing, etc.</p>
            </div>
          </div>

          <button
            onClick={calculateMargins} 
            disabled={!revenue || !cost || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating...' : 'Calculate Margins'}
          </button>
        </div>

        {/* Error Alert */}
        {(revenue && parseFloat(revenue) <= 0) || 
         (cost && parseFloat(cost) < 0) || 
         (operatingExpenses && parseFloat(operatingExpenses) < 0) ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Revenue must be greater than 0, costs can be 0 or more</span>
          </div>
        ) : null}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Net Margin Highlight */}
            <div className={`rounded-xl border border-border p-6 ${
              result.net_margin >= 20 ? 'bg-green-50 border-green-200' :
              result.net_margin >= 10 ? 'bg-blue-50 border-blue-200' :
              result.net_margin >= 5 ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Profit Margin</p>
                  <p className={`text-3xl font-bold mt-1 ${getMarginColor(result.net_margin)}`}>
                    {result.net_margin.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getIndustryBenchmark(result.net_margin)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMarginBadge(result.net_margin).color}`}>
                    {getMarginBadge(result.net_margin).text}
                  </div>
                  <p className="text-sm font-medium mt-2">
                    Net Profit: {formatCurrency(result.net_profit)}
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

            {/* Margin Breakdown */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Gross Margin</p>
                  <p className={`text-2xl font-bold mt-2 ${getMarginColor(result.gross_margin)}`}>
                    {result.gross_margin.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(result.gross_profit)} gross profit
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Net Margin</p>
                  <p className={`text-2xl font-bold mt-2 ${getMarginColor(result.net_margin)}`}>
                    {result.net_margin.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(result.net_profit)} net profit
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Markup</p>
                  <p className="text-2xl font-bold mt-2 text-blue-600">
                    {result.markup.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Above cost price
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">{formatCurrency(result.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost of Goods Sold</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(result.cost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Profit</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(result.gross_profit)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operating Expenses</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(result.revenue - result.cost - result.net_profit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Profit</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(result.net_profit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profitability</span>
                    <span className={`font-medium ${getMarginColor(result.net_margin)}`}>
                      {result.net_margin >= 0 ? 'Profitable' : 'Loss'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profitability Insights */}
            <div className={`rounded-xl border border-border p-6 ${
              result.net_margin >= 10 ? 'bg-green-50 border-green-200' :
              result.net_margin >= 5 ? 'bg-blue-50 border-blue-200' :
              result.net_margin >= 0 ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <TrendingUp className={`h-5 w-5 mt-0.5 ${
                  result.net_margin >= 10 ? 'text-green-600' :
                  result.net_margin >= 5 ? 'text-blue-600' :
                  result.net_margin >= 0 ? 'text-orange-600' :
                  'text-red-600'
                }`} />
                <div>
                  <h3 className={`font-semibold ${
                    result.net_margin >= 10 ? 'text-green-900' :
                    result.net_margin >= 5 ? 'text-blue-900' :
                    result.net_margin >= 0 ? 'text-orange-900' :
                    'text-red-900'
                  }`}>Profitability Analysis</h3>
                  <div className={`mt-2 text-sm space-y-1 ${
                    result.net_margin >= 10 ? 'text-green-800' :
                    result.net_margin >= 5 ? 'text-blue-800' :
                    result.net_margin >= 0 ? 'text-orange-800' :
                    'text-red-800'
                  }`}>
                    {result.net_margin >= 20 && <p>• Excellent profitability! Well above industry standards.</p>}
                    {result.net_margin >= 10 && result.net_margin < 20 && <p>• Good profitability. Healthy business performance.</p>}
                    {result.net_margin >= 5 && result.net_margin < 10 && <p>• Moderate profitability. Room for improvement.</p>}
                    {result.net_margin >= 0 && result.net_margin < 5 && <p>• Low profitability. Consider cost optimization.</p>}
                    {result.net_margin < 0 && <p>• Operating at loss. Immediate action required.</p>}
                    <p>• Industry benchmark: {getIndustryBenchmark(result.net_margin)}</p>
                    <p>• Markup vs Margin: {result.markup.toFixed(1)}% markup = {result.gross_margin.toFixed(1)}% margin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Profit Margin Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Margin vs Markup</h4>
              <div className="space-y-1 text-sm">
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium">Margin = (Revenue - Cost) / Revenue × 100</p>
                  <p className="text-muted-foreground">Profit as percentage of selling price</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium">Markup = (Revenue - Cost) / Cost × 100</p>
                  <p className="text-muted-foreground">Profit as percentage of cost price</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Industry Benchmarks</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Software/SaaS</span>
                  <span className="font-medium text-green-600">40-80%</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Services</span>
                  <span className="font-medium text-blue-600">20-50%</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Manufacturing</span>
                  <span className="font-medium text-orange-600">10-20%</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Retail</span>
                  <span className="font-medium text-red-600">2-10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
