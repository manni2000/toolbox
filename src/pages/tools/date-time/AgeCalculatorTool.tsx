import { useState } from "react";
import { Calendar, Gift } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

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
      category="Date & Time"
      categoryPath="/category/date-time"
    >
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Input Section */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input-tool pl-12"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Target Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="input-tool pl-12"
              />
            </div>
          </div>
        </div>

        <button onClick={calculateAge} className="btn-primary w-full">
          <Gift className="h-5 w-5" />
          Calculate Age
        </button>

        {/* Results */}
        {age && (
          <div className="space-y-6">
            {/* Main Age */}
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Your age is</p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <AgeUnit value={age.years} label="Years" />
                <span className="text-4xl font-light text-muted-foreground">:</span>
                <AgeUnit value={age.months} label="Months" />
                <span className="text-4xl font-light text-muted-foreground">:</span>
                <AgeUnit value={age.days} label="Days" />
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <StatBox label="Total Days" value={age.totalDays.toLocaleString()} />
              <StatBox label="Total Weeks" value={age.totalWeeks.toLocaleString()} />
              <StatBox label="Total Months" value={age.totalMonths.toLocaleString()} />
              <StatBox
                label="Next Birthday in"
                value={`${age.nextBirthday} days`}
                icon={<Gift className="h-5 w-5 text-primary" />}
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

const AgeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <p className="text-5xl font-bold text-primary">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
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
  <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
    {icon && (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
    )}
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

export default AgeCalculatorTool;
