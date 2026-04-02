import { useState } from "react";
import { Clock, Copy, Check, Info, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "210 80% 55%";

const CronGeneratorTool = () => {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [copied, setCopied] = useState(false);

  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const presets = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Every day at midnight", value: "0 0 * * *" },
    { label: "Every Monday at 9am", value: "0 9 * * 1" },
    { label: "First of every month", value: "0 0 1 * *" },
    { label: "Every weekday at 8am", value: "0 8 * * 1-5" },
  ];

  const applyPreset = (value: string) => {
    const parts = value.split(" ");
    setMinute(parts[0]);
    setHour(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const describeExpression = () => {
    const parts: string[] = [];

    if (minute === "*" && hour === "*") {
      parts.push("Every minute");
    } else if (minute === "0" && hour === "*") {
      parts.push("Every hour");
    } else if (minute !== "*" && hour !== "*") {
      parts.push(`At ${hour}:${minute.padStart(2, "0")}`);
    } else if (minute !== "*") {
      parts.push(`At minute ${minute}`);
    }

    if (dayOfMonth !== "*") {
      parts.push(`on day ${dayOfMonth}`);
    }
    if (month !== "*") {
      const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      parts.push(`in ${months[parseInt(month)] || month}`);
    }
    if (dayOfWeek !== "*") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      if (dayOfWeek.includes("-")) {
        const [start, end] = dayOfWeek.split("-");
        parts.push(`on ${days[parseInt(start)]} to ${days[parseInt(end)]}`);
      } else {
        parts.push(`on ${days[parseInt(dayOfWeek)] || dayOfWeek}`);
      }
    }

    return parts.join(" ") || "Custom schedule";
  };

  return (
    <ToolLayout
      title="Cron Expression Generator"
      description="Build and understand cron schedule expressions"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
        {/* Result Display */}
        <div className="rounded-xl border border-primary bg-primary/10 p-6">
          <div className="mb-2 text-sm text-muted-foreground">Generated Expression</div>
          <div className="flex items-center justify-between">
            <code className="font-mono text-2xl font-bold text-primary">{expression}</code>
            <button onClick={handleCopy} className="btn-secondary">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {describeExpression()}
          </p>
        </div>

        {/* Presets */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Quick Presets</h3>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => applyPreset(preset.value)}
                className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Field Inputs */}
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            { label: "Minute", value: minute, setter: setMinute, help: "0-59 or *" },
            { label: "Hour", value: hour, setter: setHour, help: "0-23 or *" },
            { label: "Day (Month)", value: dayOfMonth, setter: setDayOfMonth, help: "1-31 or *" },
            { label: "Month", value: month, setter: setMonth, help: "1-12 or *" },
            { label: "Day (Week)", value: dayOfWeek, setter: setDayOfWeek, help: "0-6 (Sun-Sat) or *" },
          ].map((field) => {
            const inputId = `cron-${field.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

            return (
              <div key={field.label} className="rounded-xl border border-border bg-card p-4">
                <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
                  {field.label}
                </label>
                <input
                  id={inputId}
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.help}
                  className="input-field w-full text-center font-mono"
                />
                <p className="mt-1 text-center text-xs text-muted-foreground">{field.help}</p>
              </div>
            );
          })}
        </div>

        {/* Reference */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Info className="h-5 w-5" />
            Cron Syntax Reference
          </h3>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium">Special Characters:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li><code className="text-primary">*</code> - Any value</li>
                <li><code className="text-primary">,</code> - Value list (1,3,5)</li>
                <li><code className="text-primary">-</code> - Range (1-5)</li>
                <li><code className="text-primary">/</code> - Step (*/5 = every 5)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Examples:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li><code className="text-primary">*/15 * * * *</code> - Every 15 min</li>
                <li><code className="text-primary">0 */2 * * *</code> - Every 2 hours</li>
                <li><code className="text-primary">0 9-17 * * 1-5</code> - Hourly 9-5 weekdays</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CronGeneratorTool;
