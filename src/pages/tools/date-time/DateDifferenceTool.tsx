import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

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
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Inputs */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-tool pl-12"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-tool pl-12"
              />
            </div>
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full">
          <Clock className="h-5 w-5" />
          Calculate Difference
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Main Result */}
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Time between dates</p>
              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                <TimeUnit value={result.years} label="Years" />
                <span className="text-3xl font-light text-muted-foreground hidden sm:block">:</span>
                <TimeUnit value={result.months} label="Months" />
                <span className="text-3xl font-light text-muted-foreground hidden sm:block">:</span>
                <TimeUnit value={result.days} label="Days" />
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Total Days" value={result.totalDays.toLocaleString()} />
              <StatCard label="Total Weeks" value={result.totalWeeks.toLocaleString()} />
              <StatCard label="Total Hours" value={result.totalHours.toLocaleString()} />
              <StatCard label="Total Minutes" value={result.totalMinutes.toLocaleString()} />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <p className="text-4xl font-bold text-primary">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-card p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-semibold">{value}</p>
  </div>
);

export default DateDifferenceTool;
