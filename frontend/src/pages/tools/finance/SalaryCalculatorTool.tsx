import { useState } from "react";
import { Calculator, ArrowRightLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "35 85% 55%";

const SalaryCalculatorTool = () => {
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
    <ToolLayout
      title="Salary Calculator"
      description="Convert salary between hourly, daily, weekly, monthly, and yearly"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Input */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="salary-amount" className="mb-2 block text-sm font-medium">Salary Amount (₹)</label>
            <input
              id="salary-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="input-tool"
            />
          </div>
          <div>
            <label htmlFor="pay-period" className="mb-2 block text-sm font-medium">Pay Period</label>
            <select
              id="pay-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="input-tool"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Work Hours */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hours-per-week" className="mb-2 block text-sm font-medium">Hours per Week</label>
            <input
              id="hours-per-week"
              type="number"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              placeholder="40"
              className="input-tool"
            />
          </div>
          <div>
            <label htmlFor="days-per-week" className="mb-2 block text-sm font-medium">Days per Week</label>
            <input
              id="days-per-week"
              type="number"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
              placeholder="5"
              className="input-tool"
            />
          </div>
        </div>

        {/* Results */}
        {parseFloat(amount) > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Salary Breakdown</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {periods.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 transition-all ${
                    period === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="text-sm text-muted-foreground">{p.label}</p>
                  <p className="mt-1 text-xl font-bold">
                    {formatCurrency(salaries[p.id])}
                  </p>
                  {p.id === period && (
                    <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Input
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h4 className="mb-3 font-semibold">Work Schedule Assumptions</h4>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <p>• {hoursPerWeek} hours/week</p>
                <p>• {daysPerWeek} days/week</p>
                <p>• 52 weeks/year</p>
                <p>• {(parseFloat(hoursPerWeek) / parseFloat(daysPerWeek)).toFixed(1)} hours/day</p>
                <p>• 12 months/year</p>
                <p>• {(parseFloat(daysPerWeek) * 52).toFixed(0)} working days/year</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!amount && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <Calculator className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              Enter a salary amount to see conversions
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SalaryCalculatorTool;
