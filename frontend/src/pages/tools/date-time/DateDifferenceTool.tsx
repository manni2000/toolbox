import { useState } from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "220 80% 55%";

const DateDifferenceTool = () => {
  const toolSeoData = getToolSeoMetadata('date-difference');
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
    <>
      {CategorySEO.DateTime(
        toolSeoData?.title || "Date Difference Calculator",
        toolSeoData?.description || "Calculate the difference between two dates",
        "date-difference"
      )}
      <ToolLayout
        title={toolSeoData?.title || "Date Difference Calculator"}
        description={toolSeoData?.description || "Calculate difference between two dates"}
        category="Date & Time"
        categoryPath="/category/date-time"
      >
        <div className="space-y-6">
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
                <TimeUnit value={result?.years || 0} label="Years" />
                <span className="text-2xl sm:text-3xl font-light text-muted-foreground hidden sm:block">:</span>
                <TimeUnit value={result?.months || 0} label="Months" />
                <span className="text-2xl sm:text-3xl font-light text-muted-foreground hidden sm:block">:</span>
                <TimeUnit value={result?.days || 0} label="Days" />
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <StatCard label="Total Days" value={result.totalDays?.toLocaleString() || "0"} />
              <StatCard label="Total Weeks" value={result.totalWeeks?.toLocaleString() || "0"} />
              <StatCard label="Total Hours" value={result.totalHours?.toLocaleString() || "0"} />
              <StatCard label="Total Minutes" value={result.totalMinutes?.toLocaleString() || "0"} />
            </div>
          </div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 mt-5"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            What is Date Difference?
          </h3>
          <p className="text-muted-foreground mb-4">
            Date difference calculation determines the exact time elapsed between two dates. It provides comprehensive breakdowns in years, months, days, hours, minutes, and seconds, useful for project planning, age calculations, or tracking durations.
          </p>

          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Select the start date using the date picker</li>
            <li>Select the end date for your calculation</li>
            <li>Click calculate to compute the difference</li>
            <li>View results in multiple time units</li>
          </ol>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Difference Metrics</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Years, months, days</li>
                <li>• Total days</li>
                <li>• Total hours</li>
                <li>• Business days</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Project duration</li>
                <li>• Event planning</li>
                <li>• Contract periods</li>
                <li>• Age calculation</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          {/* FAQ Section */}
          <ToolFAQ faqs={[
            {
              question: "What is a date difference calculator?",
              answer: "A date difference calculator determines the exact time elapsed between two dates. It provides comprehensive breakdowns in years, months, days, hours, minutes, and seconds."
            },
            {
              question: "How does the date difference calculator work?",
              answer: "Select the start and end dates using the date pickers. Click calculate to compute the difference. View results in multiple time units including years, months, days, hours, and minutes."
            },
            {
              question: "How accurate is the date difference calculation?",
              answer: "The calculation is precise, accounting for leap years, varying month lengths, and exact time differences between the two dates."
            },
            {
              question: "Can I calculate difference for past dates?",
              answer: "Yes, you can calculate the difference between any two dates, whether both are in the past, future, or one in each."
            },
            {
              question: "What are business days?",
              answer: "Business days typically exclude weekends (Saturday and Sunday). This helps calculate working days between dates for business purposes."
            },
            {
              question: "Does order of dates matter?",
              answer: "The tool automatically handles date order. If the end date is before the start date, it will show a negative difference or swap the dates."
            },
            {
              question: "Can I include time in the calculation?",
              answer: "Currently, the tool calculates date differences. For time-specific calculations, you may need a tool that includes time components."
            }
          ]} />
        </div>
      </ToolLayout>
      </>
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
