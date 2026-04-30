import { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw, Bell, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "220 80% 55%";

const CountdownTimerTool = () => {
  const toolSeoData = getToolSeoMetadata('countdown-timer');
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("00:00");
  const [eventName, setEventName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    if (!isRunning || !targetDate) return;

    const target = new Date(`${targetDate}T${targetTime}`);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        setIsRunning(false);
        // Play sound or notification could be added here
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, total: diff });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, targetDate, targetTime]);

  const start = () => {
    if (targetDate) setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  };

  const quickSetMinutes = (mins: number) => {
    const target = new Date(Date.now() + mins * 60 * 1000);
    setTargetDate(target.toISOString().split("T")[0]);
    setTargetTime(target.toTimeString().slice(0, 5));
  };

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <p className="text-4xl font-bold tabular-nums md:text-6xl">{String(value).padStart(2, "0")}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <>
      {CategorySEO.DateTime(
        toolSeoData?.title || "Countdown Timer",
        toolSeoData?.description || "Create a countdown to any date and time",
        "countdown-timer"
      )}
      <ToolLayout
      breadcrumbTitle="Countdown Timer"
      category="Date & Time"
      categoryPath="/category/date-time"
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
              <Clock className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Countdown Timer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a countdown to any date and time with real-time updates
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">countdown timer</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">timer countdown</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">countdown clock</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">event countdown</span>
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
          {/* Event Name */}
          <div>
            <label htmlFor="eventName" className="mb-2 block text-sm font-medium">Event Name (Optional)</label>
            <input
              id="eventName"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g., New Year 2025, My Birthday..."
              className="w-full rounded-lg bg-muted px-4 py-3 text-lg font-medium"
            />
          </div>

          {/* Date & Time */}
          <div className="grid gap-6 sm:grid-cols-2 mt-4">
            <div>
              <label htmlFor="targetDate" className="mb-2 block text-sm font-medium">Target Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div>
              <label htmlFor="targetTime" className="mb-2 block text-sm font-medium">Target Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="targetTime"
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                />
              </div>
            </div>
          </div>

          {/* Quick Timers */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Quick timers:</span>
            {[5, 10, 15, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => quickSetMinutes(mins)}
                className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/80"
              >
                {mins} min
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-6">
            {!isRunning ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={start}
                className="btn-primary flex-1"
              >
                <Play className="h-5 w-5" />
                Start
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={pause}
                className="btn-secondary flex-1"
              >
                <Pause className="h-5 w-5" />
                Pause
              </motion.button>
            )}
            <button type="button" onClick={reset} className="btn-secondary" aria-label="Reset countdown" title="Reset countdown">
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Countdown Display */}
        {(isRunning || timeLeft.total > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {eventName && (
              <h2 className="text-center text-2xl font-bold">{eventName}</h2>
            )}
            <div className="grid grid-cols-4 gap-3">
              <TimeBlock value={timeLeft.days} label="Days" />
              <TimeBlock value={timeLeft.hours} label="Hours" />
              <TimeBlock value={timeLeft.minutes} label="Minutes" />
              <TimeBlock value={timeLeft.seconds} label="Seconds" />
            </div>
          </motion.div>
        )}

        {timeLeft.total === 0 && !isRunning && targetDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary bg-primary/10 p-6 text-center"
          >
            <Bell className="mx-auto mb-2 h-12 w-12 text-primary" />
            <p className="text-xl font-bold">Time's Up!</p>
            {eventName && <p className="text-muted-foreground">{eventName}</p>}
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
            <Clock className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            What is a Countdown Timer?
          </h3>
          <p className="text-muted-foreground mb-4">
            A countdown timer counts down the time remaining until a specific date and time. It's perfect for tracking events, deadlines, product launches, or any occasion where you need to know exactly how much time is left.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Set your target date and time for the event</li>
            <li>Optionally name your event for easy identification</li>
            <li>Start the countdown to begin tracking</li>
            <li>The timer updates in real-time showing days, hours, minutes, seconds</li>
            <li>Get notified when the countdown reaches zero</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Timer Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Real-time updates</li>
                <li>• Event naming</li>
                <li>• Visual countdown display</li>
                <li>• Time's up notification</li>
              </ul>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Event countdowns</li>
                <li>• Deadline tracking</li>
                <li>• Product launches</li>
                <li>• Holiday countdowns</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is a countdown timer?",
            answer: "A countdown timer counts down the time remaining until a specific date and time. It's perfect for tracking events, deadlines, product launches, or any occasion where you need to know exactly how much time is left."
          },
          {
            question: "How does the countdown timer work?",
            answer: "Set your target date and time using the date and time pickers. Optionally name your event. Click start to begin the countdown. The timer updates in real-time showing days, hours, minutes, and seconds remaining."
          },
          {
            question: "Does the timer work when I close the browser?",
            answer: "The timer requires the page to be open to update. If you close the browser, the timer will stop. However, you can set a target date and reopen the page to see the remaining time."
          },
          {
            question: "Can I set multiple countdowns?",
            answer: "Currently, the tool supports one active countdown at a time. You can reset and create new countdowns as needed."
          },
          {
            question: "Will I get an alarm when time's up?",
            answer: "When the countdown reaches zero, a visual notification appears on the screen. Audio notifications may require browser permissions."
          },
          {
            question: "How precise is the countdown?",
            answer: "The countdown updates every second with precise time calculation, accounting for your local timezone."
          },
          {
            question: "Can I share my countdown?",
            answer: "You can share the target date and event name with others. They can then set up the same countdown on their device."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default CountdownTimerTool;
