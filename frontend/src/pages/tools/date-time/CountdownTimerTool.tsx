import { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw, Bell } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const CountdownTimerTool = () => {
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
    <ToolLayout
      title="Countdown Timer"
      description="Create a countdown to any date and time"
      category="Date & Time"
      categoryPath="/category/date-time"
    >
      <div className="space-y-6">
        {/* Event Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">Event Name (Optional)</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g., New Year 2025, My Birthday..."
            className="input-field w-full"
          />
        </div>

        {/* Date & Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input-field w-full"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Target Time</label>
            <input
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Quick Timers */}
        <div className="flex flex-wrap gap-2">
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
        <div className="flex gap-3">
          {!isRunning ? (
            <button onClick={start} className="btn-primary flex-1">
              <Play className="h-5 w-5" />
              Start
            </button>
          ) : (
            <button onClick={pause} className="btn-secondary flex-1">
              <Pause className="h-5 w-5" />
              Pause
            </button>
          )}
          <button onClick={reset} className="btn-secondary">
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        {/* Countdown Display */}
        {(isRunning || timeLeft.total > 0) && (
          <div className="space-y-4">
            {eventName && (
              <h2 className="text-center text-2xl font-bold">{eventName}</h2>
            )}
            <div className="grid grid-cols-4 gap-3">
              <TimeBlock value={timeLeft.days} label="Days" />
              <TimeBlock value={timeLeft.hours} label="Hours" />
              <TimeBlock value={timeLeft.minutes} label="Minutes" />
              <TimeBlock value={timeLeft.seconds} label="Seconds" />
            </div>
          </div>
        )}

        {timeLeft.total === 0 && !isRunning && targetDate && (
          <div className="rounded-xl border border-primary bg-primary/10 p-6 text-center">
            <Bell className="mx-auto mb-2 h-12 w-12 text-primary" />
            <p className="text-xl font-bold">Time's Up!</p>
            {eventName && <p className="text-muted-foreground">{eventName}</p>}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CountdownTimerTool;
