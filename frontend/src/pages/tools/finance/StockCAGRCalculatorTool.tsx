import React, { useState } from 'react';
import { Copy, Check, Calculator, TrendingUp, Target, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "35 85% 55%";

interface CAGRResult {
  initial_value: number;
  final_value: number;
  years: number;
  cagr: number;
  total_return: number;
  performance: string;
  color: string;
  analysis: {
    absolute_gain: number;
    annualized_gain: number;
    investment_multiple: number;
  };
}

export default function StockCAGRCalculatorTool() {
  const [initialValue, setInitialValue] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<CAGRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateCAGR = async () => {
    if (!initialValue || !finalValue || !years) return;

    setLoading(true);
    try {
      const initial = parseFloat(initialValue);
      const final = parseFloat(finalValue);
      const yearsNum = parseFloat(years);

      if (initial <= 0 || final <= 0 || yearsNum <= 0) {
        alert('All values must be greater than 0');
        return;
      }

      // Calculate CAGR
      const cagr = ((final / initial) ** (1 / yearsNum) - 1) * 100;
      
      // Calculate total return
      const totalReturn = ((final - initial) / initial) * 100;

      // Generate analysis
      let performance = 'Negative';
      let color = 'red';
      
      if (cagr > 15) {
        performance = 'Excellent';
        color = 'green';
      } else if (cagr > 10) {
        performance = 'Good';
        color = 'blue';
      } else if (cagr > 5) {
        performance = 'Moderate';
        color = 'orange';
      } else if (cagr > 0) {
        performance = 'Low';
        color = 'yellow';
      }

      setResult({
        initial_value: initial,
        final_value: final,
        years: yearsNum,
        cagr,
        total_return: totalReturn,
        performance,
        color,
        analysis: {
          absolute_gain: final - initial,
          annualized_gain: (final - initial) / yearsNum,
          investment_multiple: final / initial
        }
      });
    } catch (error) {
      console.error('Error calculating CAGR:', error);
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
    const text = `CAGR Analysis\n` +
      `Initial Value: ${formatCurrency(result.initial_value)}\n` +
      `Final Value: ${formatCurrency(result.final_value)}\n` +
      `Investment Period: ${result.years} years\n` +
      `CAGR: ${result.cagr.toFixed(2)}%\n` +
      `Total Return: ${result.total_return.toFixed(2)}%\n` +
      `Performance: ${result.performance}\n\n` +
      `Analysis:\n` +
      `Absolute Gain: ${formatCurrency(result.analysis.absolute_gain)}\n` +
      `Annualized Gain: ${formatCurrency(result.analysis.annualized_gain)}\n` +
      `Investment Multiple: ${result.analysis.investment_multiple.toFixed(2)}x`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPerformanceColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'orange': return 'text-orange-600';
      case 'yellow': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  return (
    <ToolLayout
      title="Stock CAGR Calculator"
      description="Calculate Compound Annual Growth Rate for your investments"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Investment Details</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Initial Investment ($)</label>
              <input
                type="number"
                value={initialValue}
                onChange={(e) => setInitialValue(e.target.value)}
                placeholder="10000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Starting amount</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Final Value ($)</label>
              <input
                type="number"
                value={finalValue}
                onChange={(e) => setFinalValue(e.target.value)}
                placeholder="15000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Ending amount</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Investment Period (Years)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="5"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Number of years</p>
            </div>
          </div>

          <button
            onClick={calculateCAGR} 
            disabled={!initialValue || !finalValue || !years || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating...' : 'Calculate CAGR'}
          </button>
        </div>

        {/* Error Alert */}
        {(initialValue && parseFloat(initialValue) <= 0) || 
         (finalValue && parseFloat(finalValue) <= 0) || 
         (years && parseFloat(years) <= 0) ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>All values must be greater than 0</span>
          </div>
        ) : null}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* CAGR Result */}
            <div className={`rounded-xl border border-border p-6 ${
              result.color === 'green' ? 'bg-green-50 border-green-200' :
              result.color === 'blue' ? 'bg-blue-50 border-blue-200' :
              result.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              result.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compound Annual Growth Rate</p>
                  <p className={`text-3xl font-bold mt-1 ${getPerformanceColor(result.color)}`}>
                    {result.cagr.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Performance: {result.performance}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.color === 'green' ? 'bg-green-600 text-white' :
                  result.color === 'blue' ? 'bg-blue-600 text-white' :
                  result.color === 'orange' ? 'bg-orange-600 text-white' :
                  result.color === 'yellow' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {result.performance}
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

            {/* Investment Analysis */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Total Return</p>
                  <p className="text-2xl font-bold mt-2">
                    {result.total_return.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(result.analysis.absolute_gain)} gain
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Investment Multiple</p>
                  <p className="text-2xl font-bold mt-2">
                    {result.analysis.investment_multiple.toFixed(2)}x
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your money multiplied by
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial Investment</span>
                    <span className="font-medium">{formatCurrency(result.initial_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Value</span>
                    <span className="font-medium">{formatCurrency(result.final_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Period</span>
                    <span className="font-medium">{result.years} years</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Absolute Gain</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(result.analysis.absolute_gain)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annualized Gain</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(result.analysis.annualized_gain)}/year
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Multiple</span>
                    <span className="font-medium">{result.analysis.investment_multiple.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className={`rounded-xl border border-border p-6 ${
              result.color === 'green' ? 'bg-green-50 border-green-200' :
              result.color === 'blue' ? 'bg-blue-50 border-blue-200' :
              result.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              result.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <Target className={`h-5 w-5 mt-0.5 ${getPerformanceColor(result.color)}`} />
                <div>
                  <h3 className={`font-semibold ${
                    result.color === 'green' ? 'text-green-900' :
                    result.color === 'blue' ? 'text-blue-900' :
                    result.color === 'orange' ? 'text-orange-900' :
                    result.color === 'yellow' ? 'text-yellow-900' :
                    'text-red-900'
                  }`}>Performance Insights</h3>
                  <div className={`mt-2 text-sm space-y-1 ${
                    result.color === 'green' ? 'text-green-800' :
                    result.color === 'blue' ? 'text-blue-800' :
                    result.color === 'orange' ? 'text-orange-800' :
                    result.color === 'yellow' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {result.cagr > 15 && <p>• Exceptional performance! Outperforming most professional investors.</p>}
                    {result.cagr > 10 && result.cagr <= 15 && <p>• Excellent returns! Better than market average.</p>}
                    {result.cagr > 5 && result.cagr <= 10 && <p>• Good performance. Solid returns for the risk taken.</p>}
                    {result.cagr > 0 && result.cagr <= 5 && <p>• Modest gains. Consider reviewing your investment strategy.</p>}
                    {result.cagr <= 0 && <p>• Negative returns. Time to reassess your investment approach.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">About CAGR</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">What is CAGR?</h4>
              <p className="text-sm text-muted-foreground">
                Compound Annual Growth Rate (CAGR) measures the mean annual growth rate of an investment over a specified time period longer than one year.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Formula</h4>
              <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                CAGR = ((Final Value / Initial Value)^(1/Years) - 1) × 100
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Performance Benchmarks</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-green-600">Excellent (&gt;15%)</p>
                <p className="text-muted-foreground">Outstanding performance</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-blue-600">Good (10-15%)</p>
                <p className="text-muted-foreground">Above average returns</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-orange-600">Moderate (5-10%)</p>
                <p className="text-muted-foreground">Decent performance</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-red-600">Poor (&lt;5%)</p>
                <p className="text-muted-foreground">Below expectations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
