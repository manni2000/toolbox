import { useState } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, Plus, RotateCcw, Hash, Sparkles, Target, Trash2, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "145 70% 45%";

const LCMHCFTool = () => {
  const toolSeoData = getToolSeoMetadata('lcm-hcf-calculator');
  const [numbers, setNumbers] = useState<string[]>(["", ""]);
  const [lcm, setLcm] = useState<number | null>(null);
  const [hcf, setHcf] = useState<number | null>(null);
  const [gcdSteps, setGcdSteps] = useState<string[]>([]);
  const { toast } = useToast();

  const addNumberInput = () => {
    if (numbers.length < 10) {
      setNumbers([...numbers, ""]);
    } else {
      toast({
        title: "Maximum Limit",
        description: "Maximum 10 numbers allowed",
        variant: "destructive",
      });
    }
  };

  const removeNumberInput = (index: number) => {
    if (numbers.length > 2) {
      const newNumbers = numbers.filter((_, i) => i !== index);
      setNumbers(newNumbers);
    }
  };

  const updateNumber = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  const calculateGCD = (a: number, b: number): { gcd: number; steps: string[] } => {
    const steps: string[] = [];
    let x = Math.abs(a);
    let y = Math.abs(b);
    
    steps.push(`GCD(${x}, ${y})`);
    
    while (y !== 0) {
      const quotient = Math.floor(x / y);
      const remainder = x % y;
      steps.push(`${x} = ${y} × ${quotient} + ${remainder}`);
      x = y;
      y = remainder;
    }
    
    steps.push(`GCD = ${x}`);
    return { gcd: x, steps };
  };

  const calculateLCM = (a: number, b: number): number => {
    return Math.abs(a * b) / calculateGCD(a, b).gcd;
  };

  const calculate = () => {
    const validNumbers = numbers
      .map(n => parseFloat(n))
      .filter(n => !isNaN(n) && n > 0);

    if (validNumbers.length < 2) {
      toast({
        title: "Invalid Input",
        description: "Please enter at least 2 valid positive numbers",
        variant: "destructive",
      });
      return;
    }

    // Calculate GCD for all numbers
    let currentGcd = validNumbers[0];
    let allSteps: string[] = [];

    for (let i = 1; i < validNumbers.length; i++) {
      const result = calculateGCD(currentGcd, validNumbers[i]);
      currentGcd = result.gcd;
      if (i === 1) {
        allSteps = result.steps;
      } else {
        allSteps.push(`GCD(${currentGcd}, ${validNumbers[i]})`);
        allSteps.push(`GCD = ${currentGcd}`);
      }
    }

    // Calculate LCM for all numbers
    let currentLcm = validNumbers[0];
    for (let i = 1; i < validNumbers.length; i++) {
      currentLcm = calculateLCM(currentLcm, validNumbers[i]);
    }

    setHcf(currentGcd);
    setLcm(currentLcm);
    setGcdSteps(allSteps);
  };

  const reset = () => {
    setNumbers(["", ""]);
    setLcm(null);
    setHcf(null);
    setGcdSteps([]);
  };

  return (
    <>
      {CategorySEO.Education(
        toolSeoData?.title || "LCM HCF Calculator Online",
        toolSeoData?.description || "Calculate Least Common Multiple (LCM) and Highest Common Factor (HCF) of multiple numbers",
        "lcm-hcf-calculator"
      )}
      <ToolLayout
      title="LCM HCF Calculator Online"
      description="Calculate Least Common Multiple (LCM) and Highest Common Factor (HCF) of multiple numbers"
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
              <Hash className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">LCM HCF Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate Least Common Multiple (LCM) and Highest Common Factor (HCF) of multiple numbers with step-by-step solutions
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4">Enter Numbers</label>
              <div className="space-y-3">
                {numbers.map((number, index) => (
                  <motion.div 
                    key={index} 
                    className="flex gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <div className="relative flex-1">
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="number"
                        value={number}
                        onChange={(e) => updateNumber(index, e.target.value)}
                        placeholder={`Number ${index + 1}`}
                        className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 text-lg font-medium"
                      />
                    </div>
                    {numbers.length > 2 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeNumberInput(index)}
                        className="rounded-lg bg-red-100 p-3 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addNumberInput}
                className="w-full mt-4 rounded-lg bg-muted px-4 py-3 font-medium hover:bg-muted/80 transition-colors"
                disabled={numbers.length >= 10}
              >
                <Plus className="inline h-4 w-4 mr-2" />
                Add More Numbers
              </motion.button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculate}
                disabled={numbers.filter(n => n).length < 2}
                className="rounded-lg text-white px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
              >
                <Calculator className="inline h-4 w-4 mr-2" />
                Calculate LCM & HCF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="rounded-lg bg-muted px-4 py-3 font-medium hover:bg-muted/80 transition-colors"
              >
                <RotateCcw className="inline h-4 w-4 mr-2" />
                Reset
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Results Section */}
        {(lcm !== null || hcf !== null) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-300"
                />
                <div className="relative text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-blue-800 mb-2">
                    <BookOpen className="h-4 w-4" />
                    LCM
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    {lcm?.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    Least Common Multiple
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-lg"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-green-200 to-green-300"
                />
                <div className="relative text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-800 mb-2">
                    <Hash className="h-4 w-4" />
                    HCF / GCD
                  </div>
                  <div className="text-4xl font-bold text-green-600">
                    {hcf?.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600 mt-2">
                    Highest Common Factor
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Enhanced GCD Steps */}
        {gcdSteps.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-gradient-to-r from-gray-50 to-gray-100 p-6"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <Hash className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-3">GCD Calculation Steps</h3>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="space-y-2">
                    {gcdSteps.map((step, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="text-sm font-mono text-gray-700"
                      >
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-gradient-to-r from-blue-50 to-purple-50 p-6"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-blue-900 mb-3">Key Concepts</p>
              <div className="space-y-2 text-blue-700">
                <p><strong>LCM (Least Common Multiple):</strong> The smallest positive integer that is divisible by all given numbers.</p>
                <p><strong>HCF/GCD (Highest Common Factor):</strong> The largest positive integer that divides each of the integers.</p>
                <p><strong>Formula:</strong> LCM(a,b) = |a × b| / GCD(a,b)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-500" />
            What are LCM and HCF?
          </h3>
          <p className="text-muted-foreground mb-4">
            LCM (Least Common Multiple) and HCF (Highest Common Factor), also known as GCD (Greatest Common Divisor), are fundamental mathematical concepts. LCM finds the smallest number divisible by given numbers, while HCF finds the largest number that divides them exactly.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter two or more numbers</li>
            <li>Click calculate to find LCM and HCF</li>
            <li>View the step-by-step calculation process</li>
            <li>Understand the mathematical relationship</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Mathematical Concepts</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• LCM: Smallest common multiple</li>
                <li>• HCF/GCD: Largest common factor</li>
                <li>• Relationship: LCM × HCF = a × b</li>
                <li>• Prime factorization method</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Fraction simplification</li>
                <li>• Solving word problems</li>
                <li>• Period calculations</li>
                <li>• Number theory</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is the difference between LCM and HCF?",
            answer: "LCM (Least Common Multiple) is the smallest number that all given numbers divide into evenly. HCF (Highest Common Factor) is the largest number that divides all given numbers evenly."
          },
          {
            question: "How are LCM and HCF related?",
            answer: "For two numbers a and b: LCM(a,b) × HCF(a,b) = a × b. This relationship helps verify calculations and understand the mathematical connection."
          },
          {
            question: "What methods are used for calculation?",
            answer: "Common methods include prime factorization, division method, and using the relationship formula. The tool shows step-by-step calculations for learning."
          },
          {
            question: "Can I calculate LCM/HCF for more than 2 numbers?",
            answer: "Yes, you can add multiple numbers and calculate LCM and HCF for all of them simultaneously. The tool handles any number of inputs."
          },
          {
            question: "Why are LCM and HCF important?",
            answer: "They're essential for simplifying fractions, solving ratio problems, finding common periods in time-based scenarios, and are foundational in number theory and algebra."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default LCMHCFTool;
