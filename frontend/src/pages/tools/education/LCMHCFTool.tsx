import { useState } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, Plus, RotateCcw, Hash, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";

const categoryColor = "145 70% 45%";

const LCMHCFTool = () => {
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
    <ToolLayout
      title="LCM HCF Calculator Online"
      description="Calculate Least Common Multiple (LCM) and Highest Common Factor (HCF) of multiple numbers"
      category="Education Tools"
      categoryPath="/category/education"
    >
      <Card className="mx-auto max-w-2xl p-6">
        <div className="space-y-6">
          {/* Number Inputs */}
          <div>
            <label className="mb-2 block text-sm font-medium">Enter Numbers</label>
            <div className="space-y-2">
              {numbers.map((number, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="number"
                    value={number}
                    onChange={(e) => updateNumber(index, e.target.value)}
                    placeholder={`Number ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {numbers.length > 2 && (
                    <Button
                      onClick={() => removeNumberInput(index)}
                      variant="outline"
                      size="sm"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              onClick={addNumberInput}
              variant="outline"
              className="w-full"
              disabled={numbers.length >= 10}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add More Numbers
            </Button>
          </div>

          {/* Calculate Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={calculate}
              disabled={numbers.filter(n => n).length < 2}
              className="w-full"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate LCM & HCF
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Results */}
          {(lcm !== null || hcf !== null) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-800 mb-1">LCM</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {lcm?.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Least Common Multiple
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-800 mb-1">HCF / GCD</div>
                  <div className="text-2xl font-bold text-green-600">
                    {hcf?.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Highest Common Factor
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GCD Steps */}
          {gcdSteps.length > 0 && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-800">GCD Calculation Steps</h3>
              </div>
              <div className="space-y-1">
                {gcdSteps.map((step, index) => (
                  <div key={index} className="text-xs font-mono text-gray-700">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              <strong>LCM (Least Common Multiple):</strong> The smallest positive integer that is divisible by all given numbers.
            </div>
            <div>
              <strong>HCF/GCD (Highest Common Factor/Greatest Common Divisor):</strong> The largest positive integer that divides each of the integers.
            </div>
            <div>
              <strong>Formula:</strong> LCM(a,b) = |a × b| / GCD(a,b)
            </div>
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
};

export default LCMHCFTool;
