import { useState } from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

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
    <>
      {CategorySEO.DateTime(
        "Working Days Calculator",
        "Calculate business days between two dates, excluding weekends",
        "working-days-calculator"
      )}
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            What is Working Days Calculation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Working days calculation determines the number of business days between two dates, excluding weekends (Saturday and Sunday). This is essential for project planning, payroll calculations, and business timeline estimates.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Select the start date for your calculation</li>
            <li>Select the end date for your calculation</li>
            <li>Choose to include or exclude weekends</li>
            <li>Click calculate to see working days breakdown</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Calculation Metrics</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Total calendar days</li>
                <li>• Working days (Mon-Fri)</li>
                <li>• Weekend days (Sat-Sun)</li>
                <li>• Optional weekend inclusion</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Business Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Project scheduling</li>
                <li>• Payroll periods</li>
                <li>• Contract deadlines</li>
                <li>• Leave calculations</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Are public holidays excluded?",
            answer: "No, public holidays are not excluded as they vary by region and country. The calculator only excludes weekends (Saturday and Sunday) by default."
          },
          {
            question: "Can I include weekends in the calculation?",
            answer: "Yes, you can toggle the option to include weekends. This will count all days between the dates, including Saturdays and Sundays."
          },
          {
            question: "What counts as a weekend?",
            answer: "Weekends are typically Saturday and Sunday in most regions. This is the standard business calendar used globally."
          },
          {
            question: "How are working days calculated?",
            answer: "Working days are calculated by counting all days between the start and end dates, then subtracting weekend days (Saturdays and Sundays)."
          },
          {
            question: "Can I use this for payroll calculations?",
            answer: "Yes, this is commonly used for payroll. However, you should manually subtract any public holidays specific to your region for accurate results."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default WorkingDaysTool;
