import React, { useState } from 'react';
import { Copy, Check, Calculator, DollarSign, FileText, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "35 85% 55%";

interface SalaryBreakupResult {
  ctc: number;
  earnings: {
    basic_salary: number;
    hra: number;
    other_allowances: number;
    total_earnings: number;
  };
  deductions: {
    provident_fund: number;
    esi: number;
    professional_tax: number;
    income_tax: number;
    total_deductions: number;
  };
  employer_contributions: {
    provident_fund: number;
    esi: number;
    total: number;
  };
  take_home_salary: number;
  effective_tax_rate: number;
  monthly_take_home: number;
}

export default function SalaryBreakupGeneratorTool() {
  const [ctc, setCtc] = useState('');
  const [result, setResult] = useState<SalaryBreakupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateBreakup = async () => {
    if (!ctc) return;

    setLoading(true);
    try {
      const ctcNum = parseFloat(ctc);
      
      if (ctcNum <= 0) {
        alert('CTC must be greater than 0');
        return;
      }

      // Default salary structure
      const basicPercent = 40; // Basic is typically 40% of CTC
      const hraPercent = 40;    // HRA is typically 40% of Basic
      const otherPercent = 20;   // Other allowances
      
      const basic = (ctcNum * basicPercent) / 100;
      const hra = (basic * hraPercent) / 100;
      const otherAllowances = ctcNum - basic - hra;

      // Calculate statutory deductions
      const pfEmployee = Math.min(basic * 0.12, 1800); // 12% of basic, max 1800
      const pfEmployer = Math.min(basic * 0.12, 1800);
      const esiEmployee = (basic + otherAllowances) <= 21000 ? Math.min((basic + otherAllowances) * 0.0075, 112.5) : 0;
      const esiEmployer = (basic + otherAllowances) <= 21000 ? Math.min((basic + otherAllowances) * 0.0325, 487.5) : 0;
      
      // Professional tax (Delhi rates)
      const professionalTax = ctcNum > 10000 ? 200 : 0;
      
      // Calculate taxable income
      const taxableIncome = basic + hra + otherAllowances;
      
      // Calculate income tax (simplified Old Regime)
      let incomeTax = 0;
      if (taxableIncome > 250000) {
        if (taxableIncome <= 500000) {
          incomeTax = (taxableIncome - 250000) * 0.05;
        } else if (taxableIncome <= 1000000) {
          incomeTax = 12500 + (taxableIncome - 500000) * 0.20;
        } else {
          incomeTax = 112500 + (taxableIncome - 1000000) * 0.30;
        }
      }
      
      // Add cess
      const cess = incomeTax * 0.04;
      const totalTax = incomeTax + cess;
      
      // Calculate take-home salary
      const totalDeductions = pfEmployee + esiEmployee + professionalTax + totalTax;
      const takeHome = taxableIncome - totalDeductions;

      setResult({
        ctc: ctcNum,
        earnings: {
          basic_salary: basic,
          hra: hra,
          other_allowances: otherAllowances,
          total_earnings: basic + hra + otherAllowances
        },
        deductions: {
          provident_fund: pfEmployee,
          esi: esiEmployee,
          professional_tax: professionalTax,
          income_tax: totalTax,
          total_deductions: totalDeductions
        },
        employer_contributions: {
          provident_fund: pfEmployer,
          esi: esiEmployer,
          total: pfEmployer + esiEmployer
        },
        take_home_salary: takeHome,
        effective_tax_rate: (totalTax / taxableIncome) * 100,
        monthly_take_home: takeHome / 12
      });
    } catch (error) {
      console.error('Error generating salary breakup:', error);
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
    const text = `Salary Breakup for CTC ${formatCurrency(result.ctc)}\n` +
      `Basic Salary: ${formatCurrency(result.earnings.basic_salary)}\n` +
      `HRA: ${formatCurrency(result.earnings.hra)}\n` +
      `Other Allowances: ${formatCurrency(result.earnings.other_allowances)}\n` +
      `Total Earnings: ${formatCurrency(result.earnings.total_earnings)}\n` +
      `Total Deductions: ${formatCurrency(result.deductions.total_deductions)}\n` +
      `Take Home Salary: ${formatCurrency(result.take_home_salary)}\n` +
      `Monthly Take Home: ${formatCurrency(result.monthly_take_home)}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Salary Breakup Generator"
      description="Generate detailed salary breakup with deductions and take-home pay"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Annual CTC (₹)</label>
              <input
                type="number"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                placeholder="1200000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Cost to Company per year</p>
            </div>

            <button
              onClick={generateBreakup} 
              disabled={!ctc || loading}
              className="btn-primary w-full"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Salary Breakup'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {ctc && parseFloat(ctc) <= 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>CTC must be greater than 0</span>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Take-Home</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(result.monthly_take_home)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    After all deductions
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Annual Take-Home</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(result.take_home_salary)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((result.take_home_salary / result.ctc) * 100).toFixed(1)}% of CTC
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

            {/* Earnings Breakdown */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                  <span>Basic Salary</span>
                  <span className="font-medium">{formatCurrency(result.earnings.basic_salary)}</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                  <span>HRA</span>
                  <span className="font-medium">{formatCurrency(result.earnings.hra)}</span>
                </div>
                <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                  <span>Other Allowances</span>
                  <span className="font-medium">{formatCurrency(result.earnings.other_allowances)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-100 rounded-lg font-bold">
                  <span>Total Earnings</span>
                  <span>{formatCurrency(result.earnings.total_earnings)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Deductions Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                  <span>Provident Fund (Employee)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(result.deductions.provident_fund)}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                  <span>ESI</span>
                  <span className="font-medium text-red-600">-{formatCurrency(result.deductions.esi)}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                  <span>Professional Tax</span>
                  <span className="font-medium text-red-600">-{formatCurrency(result.deductions.professional_tax)}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                  <span>Income Tax (incl. cess)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(result.deductions.income_tax)}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-100 rounded-lg font-bold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">-{formatCurrency(result.deductions.total_deductions)}</span>
                </div>
              </div>
            </div>

            {/* Employer Contributions */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Employer Contributions</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Provident Fund (Employer)</span>
                    <span className="font-medium">{formatCurrency(result.employer_contributions.provident_fund)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ESI (Employer)</span>
                    <span className="font-medium">{formatCurrency(result.employer_contributions.esi)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold">Total Employer Cost</span>
                    <span className="font-bold">{formatCurrency(result.employer_contributions.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Insights */}
            <div className="rounded-xl border border-border bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Tax Insights</h3>
                  <ul className="mt-2 space-y-1 text-sm text-blue-800">
                    <li>• Effective tax rate: {result.effective_tax_rate.toFixed(2)}%</li>
                    <li>• You take home {((result.take_home_salary / result.ctc) * 100).toFixed(1)}% of your CTC</li>
                    <li>• Total cost to company: {formatCurrency(result.ctc + result.employer_contributions.total)}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Salary Components Explained</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Earnings Components</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>Basic Salary:</strong> 40% of CTC, base pay</li>
                <li>• <strong>HRA:</strong> 40% of Basic, for housing</li>
                <li>• <strong>Other Allowances:</strong> Travel, medical, etc.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Statutory Deductions</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>PF:</strong> 12% of Basic (max ₹1800)</li>
                <li>• <strong>ESI:</strong> 0.75% (max ₹112.5)</li>
                <li>• <strong>Professional Tax:</strong> Varies by state</li>
                <li>• <strong>Income Tax:</strong> As per tax slabs</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Tax Regimes</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Old Regime</p>
                <p className="text-muted-foreground">Higher rates, deductions allowed</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">New Regime</p>
                <p className="text-muted-foreground">Lower rates, no deductions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
