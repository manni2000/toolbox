import { useState } from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "220 80% 55%";

const WorkingDaysTool = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [result, setResult] = useState<{
    totalDays: number;
    workingDays: number;
    weekends: number;
  } | null>(null);

  const calculate = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setResult(null);
      return;
    }

    let totalDays = 0;
    let workingDays = 0;
    let weekends = 0;

    const current = new Date(start);
    while (current <= end) {
      totalDays++;
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends++;
      } else {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    setResult({ totalDays, workingDays, weekends });
  };

  return (
    <ToolLayout
      title="Working Days Calculator"
      description="Calculate business days between two dates, excluding weekends"
      category="Date & Time"
      categoryPath="/category/date-time"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start-date" className="mb-2 block text-sm font-medium">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="mb-2 block text-sm font-medium">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        <label htmlFor="exclude-weekends" className="flex cursor-pointer items-center gap-3">
          <input
            id="exclude-weekends"
            aria-label="Exclude weekends"
            type="checkbox"
            checked={excludeWeekends}
            onChange={(e) => setExcludeWeekends(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary"
          />
          <span className="text-sm">Exclude weekends (Saturday & Sunday)</span>
        </label>

        <button onClick={calculate} className="btn-primary w-full">
          <Calendar className="h-5 w-5" />
          Calculate Working Days
        </button>

        {result && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="text-3xl font-bold">{result.totalDays}</p>
              <p className="text-sm text-muted-foreground">Total Days</p>
            </div>
            <div className="rounded-xl border border-primary bg-primary/10 p-6 text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="text-3xl font-bold text-primary">{result.workingDays}</p>
              <p className="text-sm text-muted-foreground">Working Days</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-3xl font-bold">{result.weekends}</p>
              <p className="text-sm text-muted-foreground">Weekend Days</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Note:</strong> This calculator excludes Saturdays and 
          Sundays. Public holidays are not excluded as they vary by region.
        </div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default WorkingDaysTool;
