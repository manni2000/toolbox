import { useState } from "react";
import { Calculator, ArrowRightLeft, Sparkles, Clock, Calendar, TrendingUp, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "35 85% 55%";

const SalaryCalculatorTool = () => {
  const toolSeoData = getToolSeoMetadata('salary-calculator');
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"hourly" | "daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [daysPerWeek, setDaysPerWeek] = useState("5");

  const periods = [
    { id: "hourly", label: "Hourly" },
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ] as const;

  const calculateSalaries = () => {
    const value = parseFloat(amount) || 0;
    const hours = parseFloat(hoursPerWeek) || 40;
    const days = parseFloat(daysPerWeek) || 5;
    
    const hoursPerDay = hours / days;
    const weeksPerYear = 52;
    const monthsPerYear = 12;

    let hourlyRate: number;

    switch (period) {
      case "hourly":
        hourlyRate = value;
        break;
      case "daily":
        hourlyRate = value / hoursPerDay;
        break;
      case "weekly":
        hourlyRate = value / hours;
        break;
      case "monthly":
        hourlyRate = (value * monthsPerYear) / (weeksPerYear * hours);
        break;
      case "yearly":
        hourlyRate = value / (weeksPerYear * hours);
        break;
      default:
        hourlyRate = 0;
    }

    return {
      hourly: hourlyRate,
      daily: hourlyRate * hoursPerDay,
      weekly: hourlyRate * hours,
      monthly: (hourlyRate * hours * weeksPerYear) / monthsPerYear,
      yearly: hourlyRate * hours * weeksPerYear,
    };
  };

  const salaries = calculateSalaries();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <>
      {CategorySEO.Finance(
        toolSeoData?.title || "Salary Calculator",
        toolSeoData?.description || "Convert salary between hourly, daily, weekly, monthly, and yearly",
        "salary-calculator"
      )}
      <ToolLayout
      breadcrumbTitle="Salary Calculator"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="space-y-6">
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
              <h2 className="text-2xl font-bold">Salary Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert salary between hourly, daily, weekly, monthly, and yearly with precision
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">salary calculator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">salary converter</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">hourly salary</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">monthly salary</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Salary Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pay Period</label>
                <div className="relative">
                  <ArrowRightLeft className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as typeof period)}
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 appearance-none"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Hours per Week</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    placeholder="40"
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Days per Week</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(e.target.value)}
                    placeholder="5"
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Results Section */}
        {parseFloat(amount) > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Salary Breakdown</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {periods.map((p, index) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative overflow-hidden rounded-xl border p-6 transition-all shadow-lg hover:shadow-xl ${
                    period === p.id
                      ? "border-opacity-50"
                      : "border-border bg-card"
                  }`}
                  style={{
                    background: period === p.id 
                      ? `linear-gradient(135deg, hsl(${categoryColor} / 0.1) 0%, hsl(${categoryColor} / 0.05) 100%)`
                      : undefined,
                    borderColor: period === p.id ? `hsl(${categoryColor})` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-muted-foreground">{p.label}</p>
                    {p.id === period && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium" style={{ color: `hsl(${categoryColor})` }}>
                        Input
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold" style={{ color: period === p.id ? `hsl(${categoryColor})` : undefined }}>
                    {formatCurrency(salaries[p.id])}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Work Schedule Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-gradient-to-r from-blue-50 to-purple-50 p-6"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-3">Work Schedule Assumptions</h4>
                  <div className="grid gap-2 text-sm text-blue-700 sm:grid-cols-3">
                    <p>• {hoursPerWeek} hours/week</p>
                    <p>• {daysPerWeek} days/week</p>
                    <p>• 52 weeks/year</p>
                    <p>• {(parseFloat(hoursPerWeek) / parseFloat(daysPerWeek)).toFixed(1)} hours/day</p>
                    <p>• 12 months/year</p>
                    <p>• {(parseFloat(daysPerWeek) * 52).toFixed(0)} working days/year</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Empty State */}
        {!amount && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10 p-12 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4"
            >
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Ready to Calculate Your Salary
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter a salary amount to see conversions across different time periods
            </p>
          </motion.div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calculator className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            What is a Salary Calculator?
          </h3>
          <p className="text-muted-foreground mb-4">
            A salary calculator helps you convert between different pay periods including hourly, daily, weekly, monthly, and yearly rates. It's useful for job seekers, employers, and freelancers to understand salary equivalents across different time frames.
          </p>

          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your salary amount in any pay period</li>
            <li>Select the pay period type (hourly, daily, weekly, monthly, or yearly)</li>
            <li>Optionally adjust hours per week and days per week</li>
            <li>Instantly see your salary converted to all other pay periods</li>
          </ol>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-semibold text-orange-900 mb-1">Conversion Features</h5>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Hourly to yearly</li>
                <li>• Monthly to hourly</li>
                <li>• Weekly to daily</li>
                <li>• Custom work hours</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Job offer comparisons</li>
                <li>• Rate negotiations</li>
                <li>• Freelance pricing</li>
                <li>• Budget planning</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-8">
        <ToolFAQ faqs={[
          {
            question: "What is a salary calculator?",
            answer: "A salary calculator helps you convert between different pay periods including hourly, daily, weekly, monthly, and yearly rates. It's useful for job seekers, employers, and freelancers to understand salary equivalents across different time frames."
          },
          {
            question: "How does the salary calculator work?",
            answer: "Enter your salary amount in any pay period and select the period type. The calculator automatically converts it to all other pay periods using standard work week assumptions. You can also customize hours per week and days per week for accurate calculations."
          },
          {
            question: "How are hourly and yearly rates calculated?",
            answer: "Hourly to yearly assumes standard working hours (40 hours/week, 52 weeks/year). Yearly = Hourly × 2080. Adjust hours for different work arrangements."
          },
          {
            question: "Should I include benefits in salary calculation?",
            answer: "Base salary excludes benefits. Total compensation includes salary + benefits + perks. Use total compensation for accurate job comparisons."
          },
          {
            question: "What is the standard work week?",
            answer: "Standard full-time work week is 40 hours (8 hours/day, 5 days/week). Some jobs use different schedules, which should be reflected in calculations."
          },
          {
            question: "How do I calculate hourly rate from annual salary?",
            answer: "Hourly Rate = Annual Salary / (Hours per week × 52). For ₹12,00,000/year at 40 hours/week: ₹12,00,000 / 2080 = ₹577/hour."
          },
          {
            question: "Does this account for taxes?",
            answer: "No, this shows gross salary before taxes. Net (take-home) pay will be lower after income tax, social security, and other deductions."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
    </>
  );
};

export default SalaryCalculatorTool;
