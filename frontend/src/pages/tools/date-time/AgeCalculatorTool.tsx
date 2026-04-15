import { useState } from "react";
import { Calendar, Gift } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "220 80% 55%";

const AgeCalculatorTool = () => {
  const [birthDate, setBirthDate] = useState("");
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [age, setAge] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalWeeks: number;
    totalMonths: number;
    nextBirthday: number;
  } | null>(null);

  const calculateAge = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (birth > target) {
      setAge(null);
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor(
      (target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    // Next birthday
    const thisYearBirthday = new Date(
      target.getFullYear(),
      birth.getMonth(),
      birth.getDate()
    );
    let nextBirthday: Date;
    if (thisYearBirthday > target) {
      nextBirthday = thisYearBirthday;
    } else {
      nextBirthday = new Date(
        target.getFullYear() + 1,
        birth.getMonth(),
        birth.getDate()
      );
    }
    const daysUntilBirthday = Math.ceil(
      (nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
    );

    setAge({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      nextBirthday: daysUntilBirthday,
    });
  };

  return (
    <ToolLayout
      title="Age Calculator"
      description="Calculate your exact age from your birthdate"
      category="Date & Time Tools"
      categoryPath="/category/date-time"
    >
      <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
        {/* Input Section */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="birth-date" className="mb-2 block text-xs sm:text-sm font-medium">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input-tool pl-10 sm:pl-12 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="target-date" className="mb-2 block text-xs sm:text-sm font-medium">
              Target Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="input-tool pl-10 sm:pl-12 text-sm"
              />
            </div>
          </div>
        </div>

        <button onClick={calculateAge} className="btn-primary w-full text-sm sm:text-base py-3 sm:py-4">
          <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
          Calculate Age
        </button>

        {/* Results */}
        {age && (
          <div className="space-y-6">
            {/* Main Age */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Your age is</p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                <AgeUnit value={age.years} label="Years" />
                <span className="text-2xl sm:text-4xl font-light text-muted-foreground hidden sm:block">:</span>
                <AgeUnit value={age.months} label="Months" />
                <span className="text-2xl sm:text-4xl font-light text-muted-foreground hidden sm:block">:</span>
                <AgeUnit value={age.days} label="Days" />
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <StatBox label="Total Days" value={age.totalDays.toLocaleString()} />
              <StatBox label="Total Weeks" value={age.totalWeeks.toLocaleString()} />
              <StatBox label="Total Months" value={age.totalMonths.toLocaleString()} />
              <StatBox
                label="Next Birthday in"
                value={`${age.nextBirthday} days`}
                icon={<Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
              />
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

const AgeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center min-w-[60px]">
    <p className="text-3xl sm:text-5xl font-bold text-primary">{value}</p>
    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{label}</p>
  </div>
);

const StatBox = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 sm:gap-4 rounded-lg border border-border bg-card p-3 sm:p-4">
    {icon && (
      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
        {icon}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
      <p className="text-lg sm:text-xl font-semibold truncate">{value}</p>
    </div>
  </div>
);

export default AgeCalculatorTool;
