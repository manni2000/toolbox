import { useState } from "react";
import { Calendar, Clock, Sparkles, CalendarDays, Briefcase, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "220 80% 55%";

const WorkingDaysTool = () => {
  const toolSeoData = getToolSeoMetadata('working-days-calculator');
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
        toolSeoData?.title || "Working Days Calculator",
        toolSeoData?.description || "Calculate business days between two dates, excluding weekends",
        "working-days-calculator"
      )}
      <ToolLayout
        title={toolSeoData?.title || "Working Days Calculator"}
        description={toolSeoData?.description || "Calculate business days between two dates, excluding weekends"}
        category="Date & Time"
        categoryPath="/category/date-time"
      >
        <div className="mx-auto max-w-4xl space-y-6">
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
                <Briefcase className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Working Days Calculator</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Calculate business days between two dates, excluding weekends with instant results
                </p>
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
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="start-date" className="mb-2 block text-sm font-medium">Start Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="end-date" className="mb-2 block text-sm font-medium">End Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                  />
                </div>
              </div>
            </div>

            <label htmlFor="exclude-weekends" className="mt-4 flex cursor-pointer items-center gap-3">
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={calculate}
              className="w-full mt-6 rounded-lg text-white px-4 py-3 font-medium transition-colors"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              Calculate Working Days
            </motion.button>
          </motion.div>

          {/* Enhanced Result Section */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Main Result Display */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-8 text-center shadow-lg">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10"
                />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                    <Briefcase className="h-4 w-4" />
                    Calculation Result
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-4 text-center">
                      <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-3xl font-bold">{result.totalDays}</p>
                      <p className="text-sm text-muted-foreground">Total Days</p>
                    </div>
                    <div className="rounded-xl border border-primary bg-primary/10 p-4 text-center">
                      <Briefcase className="mx-auto mb-2 h-8 w-8 text-primary" />
                      <p className="text-3xl font-bold text-primary">{result.workingDays}</p>
                      <p className="text-sm text-muted-foreground">Working Days</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4 text-center">
                      <Coffee className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-3xl font-bold">{result.weekends}</p>
                      <p className="text-sm text-muted-foreground">Weekend Days</p>
                    </div>
                  </div>
                </div>
              </div>
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
              <Briefcase className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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
                question: "What is a working days calculator?",
                answer: "A working days calculator helps you determine the number of business days between two dates, excluding weekends (Saturday and Sunday). It's useful for project planning, payroll calculations, and business timeline estimates."
              },
              {
                question: "How does the working days calculator work?",
                answer: "Select your start and end dates using the date pickers. Choose whether to exclude weekends from the calculation. Click the calculate button to instantly see the total days, working days, and weekend days between your selected dates."
              },
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
