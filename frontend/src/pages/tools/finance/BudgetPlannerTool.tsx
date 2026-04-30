import React, { useState } from 'react';
import { Copy, Check, Calculator, Wallet, Target, TrendingUp, AlertCircle, Trash2, Plus, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "35 85% 55%";

interface Expense {
  category: string;
  amount: number;
  percentage?: number;
}

interface BudgetResult {
  income: number;
  total_expenses: number;
  savings: number;
  savings_rate: number;
  budget_health: string;
  color: string;
  recommendation: string;
  expense_breakdown: Expense[];
  rule_50_30_20: {
    needs: number;
    wants: number;
    savings: number;
    analysis: string;
  };
}

export default function BudgetPlannerTool() {
  const toolSeoData = getToolSeoMetadata('budget-planner');
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const addExpense = () => {
    if (newCategory && newAmount) {
      setExpenses([...expenses, {
        category: newCategory,
        amount: parseFloat(newAmount)
      }]);
      setNewCategory('');
      setNewAmount('');
    }
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const analyzeBudget = async () => {
    if (!income || expenses.length === 0) return;

    setLoading(true);
    try {
      const incomeNum = parseFloat(income);
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const savings = incomeNum - totalExpenses;
      const savingsRate = (savings / incomeNum) * 100;

      // Budget analysis
      let budgetHealth = 'Fair';
      let color = 'orange';
      let recommendation = 'You are breaking even. Try to reduce expenses or increase income.';
      
      if (savingsRate >= 20) {
        budgetHealth = 'Excellent';
        color = 'green';
        recommendation = 'Great job! You are saving well. Consider investing your savings.';
      } else if (savingsRate >= 10) {
        budgetHealth = 'Good';
        color = 'blue';
        recommendation = 'Good savings rate. Look for opportunities to increase it to 20%.';
      } else if (savingsRate < 0) {
        budgetHealth = 'Deficit';
        color = 'red';
        recommendation = 'You are spending more than you earn. Review and cut expenses immediately.';
      }

      // 50/30/20 rule analysis
      let needsPercentage = 0;
      let wantsPercentage = 0;
      
      expenses.forEach(exp => {
        const category = exp.category.toLowerCase();
        if (['rent', 'mortgage', 'utilities', 'groceries', 'transport', 'insurance'].some(keyword => category.includes(keyword))) {
          needsPercentage += (exp.amount / incomeNum) * 100;
        } else {
          wantsPercentage += (exp.amount / incomeNum) * 100;
        }
      });

      const expenseBreakdown = expenses.map(exp => ({
        category: exp.category,
        amount: exp.amount,
        percentage: (exp.amount / incomeNum) * 100
      }));

      setResult({
        income: incomeNum,
        total_expenses: totalExpenses,
        savings,
        savings_rate: savingsRate,
        budget_health: budgetHealth,
        color,
        recommendation,
        expense_breakdown: expenseBreakdown,
        rule_50_30_20: {
          needs: Math.round(needsPercentage),
          wants: Math.round(wantsPercentage),
          savings: Math.round(savingsRate),
          analysis: 'Ideal: 50% Needs, 30% Wants, 20% Savings'
        }
      });
    } catch (error) {
      // console.error('Error analyzing budget:', error);
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
    const text = `Budget Analysis\n` +
      `Monthly Income: ${formatCurrency(result.income)}\n` +
      `Total Expenses: ${formatCurrency(result.total_expenses)}\n` +
      `Savings: ${formatCurrency(result.savings)} (${result.savings_rate.toFixed(1)}%)\n` +
      `Budget Health: ${result.budget_health}\n\n` +
      `Expense Breakdown:\n` +
      result.expense_breakdown.map(exp => 
        `${exp.category}: ${formatCurrency(exp.amount)} (${exp.percentage?.toFixed(1)}%)`
      ).join('\n');
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHealthColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'orange': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  return (
    <>
      {CategorySEO.Finance(
        toolSeoData?.title || "Budget Planner",
        toolSeoData?.description || "Create and analyze your monthly budget for better financial planning",
        "budget-planner"
      )}
      <ToolLayout
      breadcrumbTitle="Budget Planner"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="space-y-6">
        {/* Keyword Tags Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-muted/50 via-background to-muted/30 rounded-xl border border-border p-6"
        >
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
              <TrendingUp className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Budget Planner Free Online</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create and analyze your monthly budget for better financial planning.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">budget planner</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">monthly budget</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">expense tracker</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">budget calculator</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Income</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Income Amount (₹)</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="50000"
                  className="input-tool w-full"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
            
            {/* Add Expense Form */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category (e.g., Rent, Food)"
                className="input-tool flex-1"
              />
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Amount"
                className="input-tool w-32"
              />
              <button
                type="button"
                onClick={addExpense}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Expenses List */}
            {expenses.length > 0 && (
              <div className="space-y-2">
                {expenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{expense.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">{formatCurrency(expense.amount)}</span>
                      <button
                        type="button"
                        onClick={() => removeExpense(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label={`Remove ${expense.category} expense`}
                        title={`Remove ${expense.category} expense`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <button
          type="button"
          onClick={analyzeBudget} 
          disabled={!income || expenses.length === 0 || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          {loading ? 'Analyzing...' : 'Analyze Budget'}
        </button>

        {/* Error Alert */}
        {income && expenses.length > 0 && parseFloat(income) <= 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Income must be greater than 0</span>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Budget Health */}
            <div className={`rounded-xl border border-border p-6 ${
              result.color === 'green' ? 'bg-green-50 border-green-200' :
              result.color === 'blue' ? 'bg-blue-50 border-blue-200' :
              result.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <Target className={`h-5 w-5 mt-0.5 ${
                  result.color === 'green' ? 'text-green-600' :
                  result.color === 'blue' ? 'text-blue-600' :
                  result.color === 'orange' ? 'text-orange-600' :
                  'text-red-600'
                }`} />
                <div>
                  <h3 className={`font-semibold ${
                    result.color === 'green' ? 'text-green-900' :
                    result.color === 'blue' ? 'text-blue-900' :
                    result.color === 'orange' ? 'text-orange-900' :
                    'text-red-900'
                  }`}>Budget Health: {result.budget_health}</h3>
                  <p className={`mt-1 text-sm ${
                    result.color === 'green' ? 'text-green-800' :
                    result.color === 'blue' ? 'text-blue-800' :
                    result.color === 'orange' ? 'text-orange-800' :
                    'text-red-800'
                  }`}>{result.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(result.income)}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {formatCurrency(result.total_expenses)}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Savings</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {formatCurrency(result.savings)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.savings_rate.toFixed(1)}% of income
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Results'}
              </button>
            </div>

            {/* Expense Breakdown */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
              <div className="space-y-2">
                {result.expense_breakdown.map((expense, index) => (
                  <div key={index} className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{expense.category}</span>
                    <div className="text-right">
                      <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({expense.percentage?.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 50/30/20 Rule Analysis */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">50/30/20 Rule Analysis</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Needs (50%)</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(result.rule_50_30_20.needs)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wants (30%)</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {formatCurrency(result.rule_50_30_20.wants)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Savings (20%)</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(result.rule_50_30_20.savings)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-blue-800">{result.rule_50_30_20.analysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-8">
        <ToolFAQ faqs={[
          {
            question: "What is the 50/30/20 budgeting rule?",
            answer: "The 50/30/20 rule allocates 50% of income to needs (rent, groceries), 30% to wants (entertainment, dining), and 20% to savings and debt repayment."
          },
          {
            question: "How much should I save each month?",
            answer: "Financial experts recommend saving at least 20% of your income. The tool shows your actual savings rate and compares it to recommended guidelines."
          },
          {
            question: "Can I customize expense categories?",
            answer: "Yes, you can add any expense categories that fit your lifestyle. Common categories include rent, food, transportation, utilities, entertainment, and more."
          },
          {
            question: "What if my expenses exceed my income?",
            answer: "The tool will show a negative savings amount. This indicates you need to reduce expenses or increase income. Review your spending to identify areas for cuts."
          },
          {
            question: "How often should I update my budget?",
            answer: "Review and update your budget monthly or whenever your income or major expenses change. Regular tracking ensures you stay on top of your finances."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
}
