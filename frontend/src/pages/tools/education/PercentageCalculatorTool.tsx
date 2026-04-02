import { useState } from "react";
import { Copy, Check, Percent, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "145 70% 45%";

const PercentageCalculatorTool = () => {
  const [mode, setMode] = useState<"whatIsPercent" | "percentOf" | "increase" | "decrease">("whatIsPercent");
  const [valueA, setValueA] = useState("");
  const [valueB, setValueB] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const a = parseFloat(valueA);
    const b = parseFloat(valueB);

    if (isNaN(a) || isNaN(b)) {
      setResult(null);
      return;
    }

    let res: number;
    switch (mode) {
      case "whatIsPercent":
        res = (a / b) * 100;
        setResult(`${a} is ${res.toFixed(2)}% of ${b}`);
        break;
      case "percentOf":
        res = (a / 100) * b;
        setResult(`${a}% of ${b} = ${res.toFixed(2)}`);
        break;
      case "increase":
        res = b + (b * a) / 100;
        setResult(`${b} increased by ${a}% = ${res.toFixed(2)}`);
        break;
      case "decrease":
        res = b - (b * a) / 100;
        setResult(`${b} decreased by ${a}% = ${res.toFixed(2)}`);
        break;
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes = [
    { id: "whatIsPercent", label: "X is what % of Y?" },
    { id: "percentOf", label: "X% of Y is what?" },
    { id: "increase", label: "Y increased by X%" },
    { id: "decrease", label: "Y decreased by X%" },
  ];

  const getLabels = () => {
    switch (mode) {
      case "whatIsPercent":
        return { a: "Value X", b: "Value Y" };
      case "percentOf":
        return { a: "Percentage X", b: "Value Y" };
      case "increase":
      case "decrease":
        return { a: "Percentage X", b: "Value Y" };
    }
  };

  const labels = getLabels();

  return (
    <ToolLayout
      title="Percentage Calculator"
      description="Calculate percentages easily"
      category="Education Tools"
      categoryPath="/category/education"
    >
      <div className="mx-auto max-w-xl space-y-6">
        {/* Mode Selection */}
        <div className="grid gap-2 sm:grid-cols-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as typeof mode); setResult(null); }}
              className={`rounded-lg border p-4 text-sm font-medium transition-all ${
                mode === m.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">{labels.a}</label>
            <input
              type="number"
              value={valueA}
              onChange={(e) => setValueA(e.target.value)}
              placeholder="Enter value..."
              className="input-tool"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">{labels.b}</label>
            <input
              type="number"
              value={valueB}
              onChange={(e) => setValueB(e.target.value)}
              placeholder="Enter value..."
              className="input-tool"
            />
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full">
          <Percent className="h-5 w-5" />
          Calculate
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">Result</p>
            <p className="mt-2 text-2xl font-bold">{result}</p>
            <button
              onClick={handleCopy}
              className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground mx-auto"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy result
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PercentageCalculatorTool;
