import { useState } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Delete, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "145 70% 45%";

// Define button componentsoutside the main component to prevent recreation on each render
const ScientificButton = ({ 
  label, 
  onClick, 
  className = "" 
}: { 
  label: string; 
  onClick: () => void; 
  className?: string;
}) => (
  <Button
    variant="outline"
    className={`h-12 text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground ${className}`}
    onClick={onClick}
  >
    {label}
  </Button>
);

const NumberButton = ({ 
  label, 
  onClick 
}: { 
  label: string; 
  onClick: () => void;
}) => (
  <Button
    variant="secondary"
    className="h-14 text-lg font-semibold"
    onClick={onClick}
  >
    {label}
  </Button>
);

const OperatorButton = ({ 
  label, 
  onClick 
}: { 
  label: string; 
  onClick: () => void;
}) => (
  <Button
    className="h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
    onClick={onClick}
  >
    {label}
  </Button>
);

const ScientificCalculatorTool = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isRadians, setIsRadians] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  const [lastAnswer, setLastAnswer] = useState<number>(0);

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  const handleNumber = (num: string) => {
    if (display === "0" || display === "Error") {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleKeywordInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Check for keyword constants
    const keywordMap: { [key: string]: string } = {
      'pi': Math.PI.toString(),
      'e': Math.E.toString(),
      'phi': ((1 + Math.sqrt(5)) / 2).toString(),
      'golden': ((1 + Math.sqrt(5)) / 2).toString(),
      'goldenratio': ((1 + Math.sqrt(5)) / 2).toString(),
      'sqrt2': Math.sqrt(2).toString(),
      'sqrt3': Math.sqrt(3).toString(),
      'c': '299792458',
      'light': '299792458',
      'lightspeed': '299792458',
      'g': '9.80665',
      'gravity': '9.80665',
      'avogadro': '6.02214076e23',
      'na': '6.02214076e23',
      'planck': '6.62607015e-34',
      'h': '6.62607015e-34',
      'ans': lastAnswer.toString(),
      'answer': lastAnswer.toString(),
    };

    // Check if input matches any keyword
    if (keywordMap[lowerInput]) {
      setDisplay(keywordMap[lowerInput]);
      return;
    }

    // Check if input contains any keyword
    for (const [keyword, value] of Object.entries(keywordMap)) {
      if (lowerInput.includes(keyword)) {
        const parts = lowerInput.split(keyword);
        if (parts[0] === '') {
          // Keyword at the beginning
          setDisplay(value + lowerInput.slice(keyword.length));
        } else {
          // Keyword in the middle or end
          setDisplay(parts[0] + value + (parts[1] || ''));
        }
        return;
      }
    }

    // If no keyword found, just set the display
    setDisplay(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEquals();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleOperator = (op: string) => {
    if (display === "Error") return;
    setExpression(expression + display + op);
    setDisplay("0");
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const handleEquals = () => {
    try {
      const fullExpression = expression + display;
      // Replace operators for eval
      const sanitized = fullExpression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");
      
      // Use Function constructor for safer evaluation
      const result = new Function(`return ${sanitized}`)();
      
      if (isNaN(result) || !isFinite(result)) {
        setDisplay("Error");
      } else {
        const formatted = Number(result.toPrecision(12)).toString();
        setDisplay(formatted);
        setLastAnswer(result);
      }
      setExpression("");
    } catch {
      setDisplay("Error");
      setExpression("");
    }
  };

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const handleScientific = (func: string) => {
    try {
      const num = parseFloat(display);
      let result: number;

      switch (func) {
        case "sin":
          result = isRadians ? Math.sin(num) : Math.sin(toRadians(num));
          break;
        case "cos":
          result = isRadians ? Math.cos(num) : Math.cos(toRadians(num));
          break;
        case "tan":
          result = isRadians ? Math.tan(num) : Math.tan(toRadians(num));
          break;
        case "asin":
          result = isRadians ? Math.asin(num) : toDegrees(Math.asin(num));
          break;
        case "acos":
          result = isRadians ? Math.acos(num) : toDegrees(Math.acos(num));
          break;
        case "atan":
          result = isRadians ? Math.atan(num) : toDegrees(Math.atan(num));
          break;
        case "log":
          result = Math.log10(num);
          break;
        case "ln":
          result = Math.log(num);
          break;
        case "sqrt":
          result = Math.sqrt(num);
          break;
        case "cbrt":
          result = Math.cbrt(num);
          break;
        case "square":
          result = num * num;
          break;
        case "cube":
          result = num * num * num;
          break;
        case "exp":
          result = Math.exp(num);
          break;
        case "abs":
          result = Math.abs(num);
          break;
        case "factorial":
          result = factorial(num);
          break;
        case "inv":
          result = 1 / num;
          break;
        case "percent":
          result = num / 100;
          break;
        case "negate":
          result = -num;
          break;
        default:
          result = num;
      }

      if (isNaN(result) || !isFinite(result)) {
        setDisplay("Error");
      } else {
        setDisplay(Number(result.toPrecision(12)).toString());
      }
    } catch {
      setDisplay("Error");
    }
  };

  const handleConstant = (constant: string) => {
    switch (constant) {
      case "pi":
        setDisplay(Math.PI.toString());
        break;
      case "e":
        setDisplay(Math.E.toString());
        break;
      case "ans":
        setDisplay(lastAnswer.toString());
        break;
      case "golden_ratio":
        setDisplay(((1 + Math.sqrt(5)) / 2).toString());
        break;
      case "sqrt2":
        setDisplay(Math.sqrt(2).toString());
        break;
      case "sqrt3":
        setDisplay(Math.sqrt(3).toString());
        break;
      case "light_speed":
        setDisplay("299792458"); // m/s
        break;
      case "gravity":
        setDisplay("9.80665"); // m/s²
        break;
      case "avogadro":
        setDisplay("6.02214076e23"); // mol⁻¹
        break;
      case "planck":
        setDisplay("6.62607015e-34"); // J⋅s
        break;
    }
  };

  const handleMemory = (action: string) => {
    const num = parseFloat(display);
    switch (action) {
      case "MC":
        setMemory(0);
        break;
      case "MR":
        setDisplay(memory.toString());
        break;
      case "M+":
        setMemory(memory + num);
        break;
      case "M-":
        setMemory(memory - num);
        break;
    }
  };

  const handlePower = () => {
    setExpression(expression + display + "**");
    setDisplay("0");
  };

  return (
    <>
      {CategorySEO.Education(
        "Scientific Calculator",
        "Perform advanced mathematical calculations with trigonometry, logarithms, and more",
        "scientific-calculator"
      )}
      <ToolLayout
      title="Scientific Calculator"
      description="Perform advanced mathematical calculations with trigonometry, logarithms, and more"
      category="Education Tools"
      categoryPath="/category/education"
    >
      <Card className="mx-auto max-w-lg p-6">
        {/* Display */}
        <div className="mb-4 rounded-lg bg-muted p-4">
          <div className="text-right text-sm text-muted-foreground h-5 overflow-hidden">
            {expression || " "}
          </div>
          <input
            type="text"
            value={display}
            onChange={(e) => handleKeywordInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full text-right text-3xl font-bold text-foreground bg-transparent border-none outline-none overflow-x-auto"
            placeholder="0"
          />
        </div>

        {/* Mode Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={isRadians ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRadians(true)}
            >
              RAD
            </Button>
            <Button
              variant={!isRadians ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRadians(false)}
            >
              DEG
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {memory !== 0 && <span className="mr-2">M: {memory}</span>}
          </div>
        </div>

        {/* Scientific Functions */}
        <div className="mb-2 grid grid-cols-5 gap-1">
          <ScientificButton label="sin" onClick={() => handleScientific("sin")} />
          <ScientificButton label="cos" onClick={() => handleScientific("cos")} />
          <ScientificButton label="tan" onClick={() => handleScientific("tan")} />
          <ScientificButton label="log" onClick={() => handleScientific("log")} />
          <ScientificButton label="ln" onClick={() => handleScientific("ln")} />
          
          <ScientificButton label="sin⁻¹" onClick={() => handleScientific("asin")} />
          <ScientificButton label="cos⁻¹" onClick={() => handleScientific("acos")} />
          <ScientificButton label="tan⁻¹" onClick={() => handleScientific("atan")} />
          <ScientificButton label="√" onClick={() => handleScientific("sqrt")} />
          <ScientificButton label="∛" onClick={() => handleScientific("cbrt")} />
          
          <ScientificButton label="x²" onClick={() => handleScientific("square")} />
          <ScientificButton label="x³" onClick={() => handleScientific("cube")} />
          <ScientificButton label="xʸ" onClick={handlePower} />
          <ScientificButton label="eˣ" onClick={() => handleScientific("exp")} />
          <ScientificButton label="n!" onClick={() => handleScientific("factorial")} />
          
          <ScientificButton label="1/x" onClick={() => handleScientific("inv")} />
          <ScientificButton label="|x|" onClick={() => handleScientific("abs")} />
          <ScientificButton label="%" onClick={() => handleScientific("percent")} />
          <ScientificButton label="±" onClick={() => handleScientific("negate")} />
          <ScientificButton label="ANS" onClick={() => handleConstant("ans")} />
        </div>

        {/* Memory Functions */}
        <div className="mb-2 grid grid-cols-4 gap-1">
          <ScientificButton label="MC" onClick={() => handleMemory("MC")} className="text-xs" />
          <ScientificButton label="MR" onClick={() => handleMemory("MR")} className="text-xs" />
          <ScientificButton label="M+" onClick={() => handleMemory("M+")} className="text-xs" />
          <ScientificButton label="M-" onClick={() => handleMemory("M-")} className="text-xs" />
        </div>

        {/* User Keyword Numbers & Calculator Numbers */}
        <div className="mb-2">
          <div className="text-xs text-muted-foreground mb-1">Quick Numbers & Constants</div>
          <div className="grid grid-cols-5 gap-1">
            <ScientificButton label="π" onClick={() => handleConstant("pi")} />
            <ScientificButton label="e" onClick={() => handleConstant("e")} />
            <ScientificButton label="φ" onClick={() => handleConstant("golden_ratio")} />
            <ScientificButton label="√2" onClick={() => handleConstant("sqrt2")} />
            <ScientificButton label="√3" onClick={() => handleConstant("sqrt3")} />
            
            <ScientificButton label="c" onClick={() => handleConstant("light_speed")} className="text-xs" />
            <ScientificButton label="g" onClick={() => handleConstant("gravity")} className="text-xs" />
            <ScientificButton label="Nₐ" onClick={() => handleConstant("avogadro")} className="text-xs" />
            <ScientificButton label="h" onClick={() => handleConstant("planck")} className="text-xs" />
            <ScientificButton label="ANS" onClick={() => handleConstant("ans")} />
          </div>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="destructive"
            className="h-14"
            onClick={handleClear}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="h-14"
            onClick={handleDelete}
          >
            <Delete className="h-5 w-5" />
          </Button>
          <ScientificButton label="±" onClick={() => handleScientific("negate")} className="h-14" />
          <OperatorButton label="÷" onClick={() => handleOperator("÷")} />

          <NumberButton label="7" onClick={() => handleNumber("7")} />
          <NumberButton label="8" onClick={() => handleNumber("8")} />
          <NumberButton label="9" onClick={() => handleNumber("9")} />
          <OperatorButton label="×" onClick={() => handleOperator("×")} />

          <NumberButton label="4" onClick={() => handleNumber("4")} />
          <NumberButton label="5" onClick={() => handleNumber("5")} />
          <NumberButton label="6" onClick={() => handleNumber("6")} />
          <OperatorButton label="−" onClick={() => handleOperator("−")} />

          <NumberButton label="1" onClick={() => handleNumber("1")} />
          <NumberButton label="2" onClick={() => handleNumber("2")} />
          <NumberButton label="3" onClick={() => handleNumber("3")} />
          <OperatorButton label="+" onClick={() => handleOperator("+")} />

          <NumberButton label="0" onClick={() => handleNumber("0")} />
          <NumberButton label="00" onClick={() => handleNumber("00")} />
          <NumberButton label="." onClick={handleDecimal} />
          <Button
            className="h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleEquals}
          >
            =
          </Button>
        </div>
      </Card>

      {/* FAQ Section */}
      <div className="mt-8">
        <ToolFAQ faqs={[
          {
            question: "What's the difference between basic and scientific calculators?",
            answer: "Basic calculators perform arithmetic (+, -, ×, ÷). Scientific calculators add trigonometry, logarithms, exponents, roots, and other advanced mathematical functions."
          },
          {
            question: "How do I use trigonometric functions?",
            answer: "Enter the angle value, then select sin, cos, or tan. Ensure you're using the correct angle mode (degrees or radians) for your calculation."
          },
          {
            question: "What do the memory functions do?",
            answer: "Memory functions (M+, M-, MR, MC) allow you to store values for later use. M+ adds to memory, M- subtracts from memory, MR recalls memory, and MC clears memory."
          },
          {
            question: "How do I calculate exponents?",
            answer: "Use the exponent button (usually x^y or ^) to raise a number to a power. For square roots, use the √ button. For other roots, use the exponent with fractions."
          },
          {
            question: "What is the difference between log and ln?",
            answer: "log typically means base-10 logarithm (common logarithm). ln means natural logarithm (base-e logarithm, where e ≈ 2.71828). They're used in different mathematical contexts."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default ScientificCalculatorTool;
