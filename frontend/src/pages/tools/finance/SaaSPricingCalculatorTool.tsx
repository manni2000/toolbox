import React, { useState } from 'react';
import { Copy, Check, Calculator, DollarSign, Users, Zap, AlertCircle } from 'lucide-react';
import ToolLayout from "@/components/layout/ToolLayout";

interface SaaSResult {
  monthly_price: number;
  annual_price: number;
  monthly_customers: number;
  annual_customers: number;
  monthly_revenue: number;
  annual_revenue: number;
  ltv: number;
  cac: number;
  ltv_cac_ratio: number;
}

export default function SaaSPricingCalculatorTool() {
  const [basePrice, setBasePrice] = useState('');
  const [pricingModel, setPricingModel] = useState<'monthly' | 'annual'>('monthly');
  const [expectedCustomers, setExpectedCustomers] = useState('');
  const [annualDiscount, setAnnualDiscount] = useState('20');
  const [churnRate, setChurnRate] = useState('5');
  const [cac, setCac] = useState('');
  const [result, setResult] = useState<SaaSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculatePricing = async () => {
    if (!basePrice || !expectedCustomers || !cac) return;

    setLoading(true);
    try {
      // Calculate locally (no backend needed)
      const price = parseFloat(basePrice);
      const customers = parseFloat(expectedCustomers);
      const discount = parseFloat(annualDiscount) / 100;
      const churn = parseFloat(churnRate) / 100;
      const customerAcquisitionCost = parseFloat(cac);

      const monthlyPrice = price;
      const annualPrice = monthlyPrice * 12 * (1 - discount);
      
      const monthlyCustomers = customers;
      const annualCustomers = customers * 12;
      
      const monthlyRevenue = monthlyPrice * monthlyCustomers;
      const annualRevenue = annualPrice * customers;
      
      // Calculate LTV (Lifetime Value)
      const avgCustomerLifetimeMonths = 1 / churn;
      const ltv = monthlyPrice * avgCustomerLifetimeMonths;
      
      const ltvCacRatio = ltv / customerAcquisitionCost;

      setResult({
        monthly_price: monthlyPrice,
        annual_price: annualPrice,
        monthly_customers: monthlyCustomers,
        annual_customers: annualCustomers,
        monthly_revenue: monthlyRevenue,
        annual_revenue: annualRevenue,
        ltv,
        cac: customerAcquisitionCost,
        ltv_cac_ratio: ltvCacRatio
      });
    } catch (error) {
      console.error('Error calculating pricing:', error);
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
    const text = `SaaS Pricing Calculator\n` +
      `Monthly Price: ${formatCurrency(result.monthly_price)}\n` +
      `Annual Price: ${formatCurrency(result.annual_price)}\n` +
      `Expected Monthly Customers: ${result.monthly_customers}\n` +
      `Expected Annual Customers: ${result.annual_customers}\n` +
      `Monthly Revenue: ${formatCurrency(result.monthly_revenue)}\n` +
      `Annual Revenue: ${formatCurrency(result.annual_revenue)}\n` +
      `Customer Lifetime Value (LTV): ${formatCurrency(result.ltv)}\n` +
      `Customer Acquisition Cost (CAC): ${formatCurrency(result.cac)}\n` +
      `LTV:CAC Ratio: ${result.ltv_cac_ratio.toFixed(2)}:1`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLTVCACColor = (ratio: number) => {
    if (ratio >= 3) return 'text-green-600';
    if (ratio >= 2) return 'text-blue-600';
    if (ratio >= 1) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLTVCACBadge = (ratio: number) => {
    if (ratio >= 3) return { text: 'Excellent', color: 'bg-green-600 text-white' };
    if (ratio >= 2) return { text: 'Good', color: 'bg-blue-600 text-white' };
    if (ratio >= 1) return { text: 'Fair', color: 'bg-orange-600 text-white' };
    return { text: 'Poor', color: 'bg-red-600 text-white' };
  };

  return (
    <ToolLayout
      title="SaaS Pricing Calculator"
      description="Calculate optimal pricing, revenue projections, and unit economics"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Pricing Model Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Base Monthly Price ($)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="29"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Price per user per month</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Expected Monthly Customers</label>
              <input
                type="number"
                value={expectedCustomers}
                onChange={(e) => setExpectedCustomers(e.target.value)}
                placeholder="100"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Projected active customers</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Annual Discount (%)</label>
              <input
                type="number"
                value={annualDiscount}
                onChange={(e) => setAnnualDiscount(e.target.value)}
                placeholder="20"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Discount for annual billing</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Monthly Churn Rate (%)</label>
              <input
                type="number"
                value={churnRate}
                onChange={(e) => setChurnRate(e.target.value)}
                placeholder="5"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Customer cancellation rate</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Customer Acquisition Cost ($)</label>
              <input
                type="number"
                value={cac}
                onChange={(e) => setCac(e.target.value)}
                placeholder="200"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Cost to acquire one customer</p>
            </div>
          </div>

          <button 
            onClick={calculatePricing} 
            disabled={!basePrice || !expectedCustomers || !cac || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating...' : 'Calculate Pricing'}
          </button>
        </div>

        {/* Error Alert */}
        {(basePrice && parseFloat(basePrice) <= 0) || 
         (expectedCustomers && parseFloat(expectedCustomers) <= 0) || 
         (cac && parseFloat(cac) <= 0) ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>All values must be greater than 0</span>
          </div>
        ) : null}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* LTV:CAC Ratio */}
            <div className={`rounded-xl border border-border p-6 ${
              result.ltv_cac_ratio >= 3 ? 'bg-green-50 border-green-200' :
              result.ltv_cac_ratio >= 2 ? 'bg-blue-50 border-blue-200' :
              result.ltv_cac_ratio >= 1 ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">LTV:CAC Ratio</p>
                  <p className={`text-3xl font-bold mt-1 ${getLTVCACColor(result.ltv_cac_ratio)}`}>
                    {result.ltv_cac_ratio.toFixed(2)}:1
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getLTVCACBadge(result.ltv_cac_ratio).text} unit economics
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLTVCACBadge(result.ltv_cac_ratio).color}`}>
                  {getLTVCACBadge(result.ltv_cac_ratio).text}
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

            {/* Pricing Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Price</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.monthly_price)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Per user per month</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Annual Price</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.annual_price)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {annualDiscount}% discount applied
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.monthly_revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.monthly_customers} customers
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Annual Revenue</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(result.annual_revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.annual_customers} customer-years
                  </p>
                </div>
              </div>
            </div>

            {/* Unit Economics */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Unit Economics Analysis</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer Lifetime Value</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(result.ltv)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer Acquisition Cost</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(result.cac)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Profit per Customer</span>
                    <span className="font-medium">
                      {formatCurrency(result.ltv - result.cac)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Customer Lifetime</span>
                    <span className="font-medium">
                      {(1 / (parseFloat(churnRate) / 100)).toFixed(1)} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payback Period</span>
                    <span className="font-medium">
                      {(result.cac / result.monthly_price).toFixed(1)} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue per Customer</span>
                    <span className="font-medium">
                      {formatCurrency(result.monthly_price * 12)} annually
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className={`rounded-xl border border-border p-6 ${
              result.ltv_cac_ratio >= 3 ? 'bg-green-50 border-green-200' :
              result.ltv_cac_ratio >= 2 ? 'bg-blue-50 border-blue-200' :
              result.ltv_cac_ratio >= 1 ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <Zap className={`h-5 w-5 mt-0.5 ${getLTVCACColor(result.ltv_cac_ratio)}`} />
                <div>
                  <h3 className={`font-semibold ${
                    result.ltv_cac_ratio >= 3 ? 'text-green-900' :
                    result.ltv_cac_ratio >= 2 ? 'text-blue-900' :
                    result.ltv_cac_ratio >= 1 ? 'text-orange-900' :
                    'text-red-900'
                  }`}>Unit Economics Insights</h3>
                  <div className={`mt-2 text-sm space-y-1 ${
                    result.ltv_cac_ratio >= 3 ? 'text-green-800' :
                    result.ltv_cac_ratio >= 2 ? 'text-blue-800' :
                    result.ltv_cac_ratio >= 1 ? 'text-orange-800' :
                    'text-red-800'
                  }`}>
                    {result.ltv_cac_ratio >= 3 && <p>• Excellent unit economics! Highly scalable business model.</p>}
                    {result.ltv_cac_ratio >= 2 && result.ltv_cac_ratio < 3 && <p>• Good unit economics. Room for optimization.</p>}
                    {result.ltv_cac_ratio >= 1 && result.ltv_cac_ratio < 2 && <p>• Fair unit economics. Consider pricing or retention improvements.</p>}
                    {result.ltv_cac_ratio < 1 && <p>• Poor unit economics. Immediate action required on pricing or acquisition costs.</p>}
                    <p>• Payback period: {(result.cac / result.monthly_price).toFixed(1)} months</p>
                    <p>• Customer lifetime: {(1 / (parseFloat(churnRate) / 100)).toFixed(1)} months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">SaaS Pricing Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">LTV:CAC Benchmarks</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Excellent</span>
                  <span className="font-medium text-green-600">&gt;3:1</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Good</span>
                  <span className="font-medium text-blue-600">2-3:1</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Fair</span>
                  <span className="font-medium text-orange-600">1-2:1</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Poor</span>
                  <span className="font-medium text-red-600">&lt;1:1</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Pricing Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Aim for LTV:CAC ratio of 3:1 or higher</li>
                <li>• Keep payback period under 12 months</li>
                <li>• Annual discounts should be 15-20%</li>
                <li>• Monitor churn rate monthly</li>
                <li>• Test pricing with customer segments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
