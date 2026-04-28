import { useState } from "react";
import { Copy, Check, Percent, Sparkles, Calculator, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "145 70% 45%";

const PercentageCalculatorTool = () => {
  const toolSeoData = getToolSeoMetadata('percentage-calculator');
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

  const getPlaceholders = () => {
    switch (mode) {
      case "whatIsPercent":
        return { a: "e.g., 25", b: "e.g., 100" };
      case "percentOf":
        return { a: "e.g., 20", b: "e.g., 200" };
      case "increase":
      case "decrease":
        return { a: "e.g., 15", b: "e.g., 100" };
    }
  };

  const labels = getLabels();
  const placeholders = getPlaceholders();

  return (
    <>
      {CategorySEO.Education(
        toolSeoData?.title || "Percentage Calculator",
        toolSeoData?.description || "Calculate percentages in multiple ways",
        "percentage-calculator"
      )}
      <ToolLayout
      title="Percentage Calculator"
      description="Calculate percentages in multiple ways"
      category="Education Tools"
      categoryPath="/category/education"
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
              <Percent className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Percentage Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate percentages in multiple ways with instant results
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">percentage calculator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">percent calculator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">calculate percent</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">percentage finder</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="block text-sm font-medium mb-4">Calculation Type</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {modes.map((m) => (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(m.id as "whatIsPercent" | "percentOf" | "increase" | "decrease")}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  mode === m.id
                    ? "text-white shadow-lg"
                    : "bg-muted hover:bg-muted/80"
                }`}
                style={{
                  background:
                    mode === m.id
                      ? `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`
                      : undefined,
                }}
              >
                {m.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">{labels.a}</label>
              <div className="relative">
                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={valueA}
                  onChange={(e) => setValueA(e.target.value)}
                  placeholder={placeholders.a}
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{labels.b}</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={valueB}
                  onChange={(e) => setValueB(e.target.value)}
                  placeholder={placeholders.b}
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculate}
            className="w-full mt-6 rounded-lg text-white px-4 py-3 font-medium transition-colors"
            style={{
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            }}
          >
            <Percent className="inline h-4 w-4 mr-2" />
            Calculate
          </motion.button>
        </motion.div>

        {/* Enhanced Result Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                  <TrendingUp className="h-4 w-4" />
                  Calculation Result
                </div>
                <p className="text-3xl font-bold" style={{ color: `hsl(${categoryColor})` }}>
                  {result}
                </p>
              </div>
            </div>

            {/* Copy Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg bg-muted px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy result
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <div className="mt-8">
        <ToolFAQ faqs={[
          {
            question: "What is a percentage calculator?",
            answer: "A percentage calculator helps you perform various percentage calculations including finding what percentage one number is of another, calculating percentage increases/decreases, and finding a percentage of a given number."
          },
          {
            question: "How does the percentage calculator work?",
            answer: "Select a calculation type from the dropdown menu. Enter the required values in the input fields. Click 'Calculate' to get instant results. The calculator automatically applies the correct percentage formulas based on your selection."
          },
          {
            question: "What is the percentage formula?",
            answer: "The basic formula is: (Part / Whole) × 100 = Percentage. For example, if you scored 80 out of 100, the percentage is (80/100) × 100 = 80%."
          },
          {
            question: "How do I calculate percentage increase?",
            answer: "Percentage increase = ((New Value - Original Value) / Original Value) × 100. This shows how much a value has grown relative to its original value."
          },
          {
            question: "What is percentage decrease?",
            answer: "Percentage decrease = ((Original Value - New Value) / Original Value) × 100. This shows how much a value has reduced relative to its original value."
          },
          {
            question: "Can I calculate X is what % of Y?",
            answer: "Yes, use the 'X is what % of Y' mode. Enter X as the part and Y as the whole. The formula is (X / Y) × 100 to find what percentage X is of Y."
          },
          {
            question: "How do I calculate a percentage of a number?",
            answer: "Use the 'X% of Y' mode. Enter the percentage and the number. Multiply the number by the percentage divided by 100: (Percentage / 100) × Number."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default PercentageCalculatorTool;
