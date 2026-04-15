import { useState } from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "220 80% 55%";

const DateDifferenceTool = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalWeeks: number;
    totalHours: number;
    totalMinutes: number;
  } | null>(null);

  const calculate = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setResult(null);
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffTime / (1000 * 60));

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
    });
  };

  return (
    <ToolLayout
      title="Date Difference Calculator"
      description="Calculate the difference between two dates"
      category="Date & Time"
      categoryPath="/category/date-time"
    >
      <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
        {/* Inputs */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="start-date" className="mb-2 block text-xs sm:text-sm font-medium">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-tool pl-10 sm:pl-12 text-sm"
                aria-label="Start date for calculation"
              />
            </div>
          </div>
          <div>
            <label htmlFor="end-date" className="mb-2 block text-xs sm:text-sm font-medium">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-tool pl-10 sm:pl-12 text-sm"
                aria-label="End date for calculation"
              />
            </div>
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full text-sm sm:text-base py-3 sm:py-4">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Calculate Difference
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Main Result */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Time between dates</p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                <TimeUnit value={result.years} label="Years" />
                <span className="text-2xl sm:text-3xl font-light text-muted-foreground hidden sm:block">:</span>
                <TimeUnit value={result.months} label="Months" />
                <span className="text-2xl sm:text-3xl font-light text-muted-foreground hidden sm:block">:</span>
                <TimeUnit value={result.days} label="Days" />
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <StatCard label="Total Days" value={result.totalDays.toLocaleString()} />
              <StatCard label="Total Weeks" value={result.totalWeeks.toLocaleString()} />
              <StatCard label="Total Hours" value={result.totalHours.toLocaleString()} />
              <StatCard label="Total Minutes" value={result.totalMinutes.toLocaleString()} />
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <ToolFAQ />
    </ToolLayout>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center min-w-[60px]">
    <p className="text-2xl sm:text-4xl font-bold text-primary">{value}</p>
    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{label}</p>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
    <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 text-lg sm:text-2xl font-semibold truncate">{value}</p>
  </div>
);

export default DateDifferenceTool;
