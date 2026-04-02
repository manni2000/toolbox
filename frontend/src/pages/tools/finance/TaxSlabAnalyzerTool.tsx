import { useState } from 'react';
import { Copy, Check, Calculator, DollarSign, FileText, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";

const categoryColor = "35 85% 55%";

interface TaxSlab {
  range: string;
  rate: string;
  taxable_amount: number;
  tax: number;
}

interface TaxResult {
  income: number;
  regime: string;
  age_group: string;
  slab_details: TaxSlab[];
  tax_before_cess: number;
  cess_amount: number;
  total_tax: number;
  effective_rate: number;
}

export default function TaxSlabAnalyzerTool() {
  const [income, setIncome] = useState('');
  const [regime, setRegime] = useState<'old' | 'new'>('old');
  const [ageGroup, setAgeGroup] = useState<'regular' | 'senior' | 'super_senior'>('regular');
  const [result, setResult] = useState<TaxResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyzeTax = async () => {
    if (!income) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/finance/tax-slab-analyzer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          income: parseFloat(income),
          regime,
          age_group: ageGroup
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Error analyzing tax:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `Tax Slab Analysis\n` +
      `Income: ${formatCurrency(result.income)}\n` +
      `Regime: ${result.regime}\n` +
      `Age Group: ${result.age_group}\n` +
      `Tax Before Cess: ${formatCurrency(result.tax_before_cess)}\n` +
      `Cess Amount: ${formatCurrency(result.cess_amount)}\n` +
      `Total Tax: ${formatCurrency(result.total_tax)}\n` +
      `Effective Tax Rate: ${result.effective_rate.toFixed(2)}%\n\n` +
      `Tax Slabs:\n${result.slab_details.map((slab, index) => 
        `${index + 1}. ${slab.range}: ${slab.rate} (${formatCurrency(slab.tax)})`
      ).join('\n')}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTaxBracketColor = (rate: string) => {
    const rateNum = parseFloat(rate);
    if (rateNum === 0) return 'text-green-600';
    if (rateNum <= 10) return 'text-blue-600';
    if (rateNum <= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <ToolLayout
      title="Tax Slab Analyzer"
      description="Calculate your tax liability under different tax regimes"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Tax Calculation Details</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="annual-income" className="block text-sm font-medium mb-2">Annual Income (₹)</label>
              <input
                id="annual-income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="1000000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Total yearly income</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="tax-regime" className="block text-sm font-medium mb-2">Tax Regime</label>
              <select
                id="tax-regime"
                value={regime}
                onChange={(e) => setRegime(e.target.value as 'old' | 'new')}
                className="input-tool w-full"
              >
                <option value="old">Old Regime</option>
                <option value="new">New Regime</option>
              </select>
              <p className="text-xs text-muted-foreground">Choose tax calculation method</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="age-group" className="block text-sm font-medium mb-2">Age Group</label>
              <select
                id="age-group"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as 'regular' | 'senior' | 'super_senior')}
                className="input-tool w-full"
              >
                <option value="regular">Regular (Below 60)</option>
                <option value="senior">Senior (60-80)</option>
                <option value="super_senior">Super Senior (Above 80)</option>
              </select>
              <p className="text-xs text-muted-foreground">Age-based tax benefits</p>
            </div>
          </div>

          <button
            onClick={analyzeTax} 
            disabled={!income || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating...' : 'Calculate Tax'}
          </button>
        </div>

        {/* Error Alert */}
        {income && parseFloat(income) <= 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Income must be greater than 0</span>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Tax Summary */}
            <div className="rounded-xl border border-border bg-gradient-to-r from-blue-50 to-purple-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tax Liability</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {formatCurrency(result.total_tax)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Effective rate: {result.effective_rate.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-white border">
                    {regime === 'old' ? 'Old Regime' : 'New Regime'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Take-home: {formatCurrency(result.income - result.total_tax)}
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

            {/* Tax Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Tax Before Cess</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.tax_before_cess)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Base tax amount</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Cess Amount</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.cess_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">4% health & education cess</p>
                </div>
              </div>
            </div>

            {/* Tax Slabs */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Tax Slab Breakdown</h3>
              <div className="space-y-3">
                {result.slab_details.map((slab, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{slab.range}</p>
                      <p className="text-sm text-muted-foreground">
                        Taxable: {formatCurrency(slab.taxable_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getTaxBracketColor(slab.rate)}`}>
                        {slab.rate}
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(slab.tax)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Insights */}
            <div className="rounded-xl border border-border bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Tax Insights</h3>
                  <div className="mt-2 text-sm text-blue-800 space-y-1">
                    <p>• You're paying {result.effective_rate.toFixed(2)}% effective tax rate</p>
                    <p>• Take-home income: {formatCurrency(result.income - result.total_tax)}</p>
                    <p>• Consider tax-saving investments under {regime === 'old' ? 'old regime with deductions' : 'new regime with lower rates'}</p>
                    {result.effective_rate > 30 && <p>• High tax bracket. Maximize deductions and exemptions.</p>}
                    {result.effective_rate < 10 && <p>• Low tax bracket. Focus on growth investments.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Tax Regime Comparison</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Old Regime</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Higher tax rates but more deductions</li>
                <li>• Section 80C, 80D, HRA exemptions</li>
                <li>• Standard deduction ₹50,000</li>
                <li>• Better for high deduction individuals</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">New Regime</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Lower tax rates, no deductions</li>
                <li>• Standard deduction ₹75,000</li>
                <li>• Simplified tax calculation</li>
                <li>• Better for low/no deduction individuals</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Tax Slabs (Old Regime)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Up to ₹2.5L</p>
                <p className="text-muted-foreground">0% tax</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">₹2.5L - ₹5L</p>
                <p className="text-muted-foreground">5% tax</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">₹5L - ₹10L</p>
                <p className="text-muted-foreground">20% tax</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Above ₹10L</p>
                <p className="text-muted-foreground">30% tax</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
