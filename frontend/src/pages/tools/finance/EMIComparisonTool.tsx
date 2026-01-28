import { useState } from 'react';
import { Copy, Check, Calculator, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import ToolLayout from "@/components/layout/ToolLayout";

interface EMIResult {
  principal: number;
  rate: number;
  tenure: number;
  emi: number;
  total_interest: number;
  total_amount: number;
}

export default function EMIComparisonTool() {
  const [loanAmount, setLoanAmount] = useState('');
  const [loan1Rate, setLoan1Rate] = useState('');
  const [loan1Tenure, setLoan1Tenure] = useState('');
  const [loan2Rate, setLoan2Rate] = useState('');
  const [loan2Tenure, setLoan2Tenure] = useState('');
  const [loan3Rate, setLoan3Rate] = useState('');
  const [loan3Tenure, setLoan3Tenure] = useState('');
  const [results, setResults] = useState<EMIResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateEMI = (principal: number, rate: number, tenure: number): EMIResult => {
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;
    
    return {
      principal,
      rate,
      tenure,
      emi,
      total_interest: totalInterest,
      total_amount: totalAmount
    };
  };

  const compareLoans = async () => {
    if (!loanAmount || !loan1Rate || !loan1Tenure) return;

    setLoading(true);
    try {
      const principal = parseFloat(loanAmount);
      const loanResults: EMIResult[] = [];

      // Loan 1
      if (loan1Rate && loan1Tenure) {
        loanResults.push(calculateEMI(
          principal,
          parseFloat(loan1Rate),
          parseFloat(loan1Tenure)
        ));
      }

      // Loan 2
      if (loan2Rate && loan2Tenure) {
        loanResults.push(calculateEMI(
          principal,
          parseFloat(loan2Rate),
          parseFloat(loan2Tenure)
        ));
      }

      // Loan 3
      if (loan3Rate && loan3Tenure) {
        loanResults.push(calculateEMI(
          principal,
          parseFloat(loan3Rate),
          parseFloat(loan3Tenure)
        ));
      }

      setResults(loanResults);
    } catch (error) {
      console.error('Error comparing loans:', error);
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
    if (results.length === 0) return;
    const text = `EMI Comparison Results\n` +
      `Loan Amount: ${formatCurrency(results[0].principal)}\n\n` +
      results.map((result, index) => 
        `Loan ${index + 1}:\n` +
        `  Interest Rate: ${result.rate}%\n` +
        `  Tenure: ${result.tenure} years\n` +
        `  EMI: ${formatCurrency(result.emi)}\n` +
        `  Total Interest: ${formatCurrency(result.total_interest)}\n` +
        `  Total Amount: ${formatCurrency(result.total_amount)}\n`
      ).join('\n');
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBestLoan = () => {
    if (results.length === 0) return null;
    return results.reduce((best, current) => 
      current.total_amount < best.total_amount ? current : best
    );
  };

  return (
    <ToolLayout
      title="EMI Comparison Calculator"
      description="Compare multiple loan options to find the best EMI deal"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Loan Amount ($)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="100000"
                className="input-tool w-full"
              />
              <p className="text-xs text-muted-foreground">Principal amount to borrow</p>
            </div>

            {/* Loan Options */}
            <div className="space-y-6">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  Loan Option 1
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      value={loan1Rate}
                      onChange={(e) => setLoan1Rate(e.target.value)}
                      placeholder="8.5"
                      step="0.1"
                      className="input-tool w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Tenure (Years)</label>
                    <input
                      type="number"
                      value={loan1Tenure}
                      onChange={(e) => setLoan1Tenure(e.target.value)}
                      placeholder="20"
                      className="input-tool w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  Loan Option 2
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      value={loan2Rate}
                      onChange={(e) => setLoan2Rate(e.target.value)}
                      placeholder="9.0"
                      step="0.1"
                      className="input-tool w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Tenure (Years)</label>
                    <input
                      type="number"
                      value={loan2Tenure}
                      onChange={(e) => setLoan2Tenure(e.target.value)}
                      placeholder="15"
                      className="input-tool w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  Loan Option 3
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      value={loan3Rate}
                      onChange={(e) => setLoan3Rate(e.target.value)}
                      placeholder="7.5"
                      step="0.1"
                      className="input-tool w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Tenure (Years)</label>
                    <input
                      type="number"
                      value={loan3Tenure}
                      onChange={(e) => setLoan3Tenure(e.target.value)}
                      placeholder="25"
                      className="input-tool w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={compareLoans} 
              disabled={!loanAmount || !loan1Rate || !loan1Tenure || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {loading ? 'Comparing...' : 'Compare Loans'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {(loanAmount && parseFloat(loanAmount) <= 0) || 
         (loan1Rate && parseFloat(loan1Rate) <= 0) ||
         (loan1Tenure && parseFloat(loan1Tenure) <= 0) ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>All values must be greater than 0</span>
          </div>
        ) : null}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-6">
            {/* Best Loan Highlight */}
            {getBestLoan() && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Best Loan Option</h3>
                    <p className="text-sm text-green-800 mt-1">
                      Lowest total payment: {formatCurrency(getBestLoan()!.total_amount)}
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Comparison Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comparison Results</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {results.map((result, index) => {
                  const isBest = getBestLoan()?.principal === result.principal && 
                                getBestLoan()?.rate === result.rate && 
                                getBestLoan()?.tenure === result.tenure;
                  return (
                    <div key={index} className={`rounded-xl border border-border bg-card p-6 relative ${
                      isBest ? 'ring-2 ring-green-500 border-green-500' : ''
                    }`}>
                      {isBest && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          BEST
                        </div>
                      )}
                      <div className="text-center">
                        <h4 className="font-semibold mb-4">Loan {index + 1}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                            <p className="text-lg font-bold">{result.rate}%</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Tenure</p>
                            <p className="text-lg font-bold">{result.tenure} years</p>
                          </div>
                          
                          <div className="pt-3 border-t border-border">
                            <p className="text-sm text-muted-foreground">Monthly EMI</p>
                            <p className="text-xl font-bold text-blue-600">
                              {formatCurrency(result.emi)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Total Interest</p>
                            <p className="text-lg font-bold text-orange-600">
                              {formatCurrency(result.total_interest)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Total Payment</p>
                            <p className="text-lg font-bold">
                              {formatCurrency(result.total_amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Comparison */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Loan Option</th>
                      <th className="text-right py-2">Interest Rate</th>
                      <th className="text-right py-2">Tenure</th>
                      <th className="text-right py-2">Monthly EMI</th>
                      <th className="text-right py-2">Total Interest</th>
                      <th className="text-right py-2">Total Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-2 font-medium">Loan {index + 1}</td>
                        <td className="text-right">{result.rate}%</td>
                        <td className="text-right">{result.tenure} years</td>
                        <td className="text-right font-medium">{formatCurrency(result.emi)}</td>
                        <td className="text-right text-orange-600">{formatCurrency(result.total_interest)}</td>
                        <td className="text-right font-bold">{formatCurrency(result.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Savings Analysis */}
            {results.length > 1 && (
              <div className="rounded-xl border border-border bg-blue-50 p-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Savings Analysis</h3>
                    <div className="mt-2 text-sm text-blue-800">
                      <p>• Best option saves {formatCurrency(
                        Math.max(...results.map(r => r.total_amount)) - 
                        Math.min(...results.map(r => r.total_amount))
                      )} compared to worst option</p>
                      <p>• EMI difference: {formatCurrency(
                        Math.max(...results.map(r => r.emi)) - 
                        Math.min(...results.map(r => r.emi))
                      )} per month</p>
                      <p>• Consider both monthly affordability and total cost</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">EMI Comparison Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Factors to Consider</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Monthly EMI affordability</li>
                <li>• Total interest cost over tenure</li>
                <li>• Loan tenure and age considerations</li>
                <li>• Prepayment charges and flexibility</li>
                <li>• Processing fees and other costs</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">EMI Formula</h4>
              <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Where P = Principal, r = Monthly rate, n = Number of months
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
