import { useState } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, TrendingUp, RotateCcw, Sparkles, Award, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "145 70% 45%";

const CGPAToPercentageTool = () => {
  const [cgpa, setCgpa] = useState("");
  const [scale, setScale] = useState("10"); // 10.0 scale is most common
  const [percentage, setPercentage] = useState<number | null>(null);
  const [grade, setGrade] = useState<string>("");
  const { toast } = useToast();

  const calculatePercentage = () => {
    const cgpaValue = parseFloat(cgpa);
    
    if (isNaN(cgpaValue) || cgpaValue < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid CGPA value",
        variant: "destructive",
      });
      return;
    }

    const scaleValue = parseFloat(scale);
    let percentageValue: number;

    if (scaleValue === 10) {
      percentageValue = cgpaValue * 9.5;
    } else if (scaleValue === 5) {
      percentageValue = cgpaValue * 19;
    } else if (scaleValue === 4) {
      percentageValue = cgpaValue * 25;
    } else {
      // Custom scale formula
      percentageValue = (cgpaValue / scaleValue) * 100;
    }

    setPercentage(Math.round(percentageValue * 100) / 100);

    // Determine grade
    if (scaleValue === 10) {
      if (cgpaValue >= 9.0) setGrade("O - Outstanding");
      else if (cgpaValue >= 8.0) setGrade("A+ - Excellent");
      else if (cgpaValue >= 7.0) setGrade("A - Very Good");
      else if (cgpaValue >= 6.0) setGrade("B+ - Good");
      else if (cgpaValue >= 5.5) setGrade("B - Average");
      else if (cgpaValue >= 4.0) setGrade("C - Pass");
      else setGrade("F - Fail");
    } else if (scaleValue === 4) {
      if (cgpaValue >= 3.7) setGrade("A");
      else if (cgpaValue >= 3.3) setGrade("B+");
      else if (cgpaValue >= 3.0) setGrade("B");
      else if (cgpaValue >= 2.7) setGrade("C+");
      else if (cgpaValue >= 2.3) setGrade("C");
      else if (cgpaValue >= 2.0) setGrade("D");
      else setGrade("F");
    } else {
      if (percentageValue >= 90) setGrade("Excellent");
      else if (percentageValue >= 80) setGrade("Very Good");
      else if (percentageValue >= 70) setGrade("Good");
      else if (percentageValue >= 60) setGrade("Average");
      else if (percentageValue >= 50) setGrade("Pass");
      else setGrade("Fail");
    }
  };

  const reset = () => {
    setCgpa("");
    setScale("10");
    setPercentage(null);
    setGrade("");
  };

  return (
    <ToolLayout
      title="CGPA to Percentage Converter"
      description="Convert CGPA to percentage and determine grades"
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
              <Calculator className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">CGPA to Percentage Converter</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert your CGPA to percentage and determine your grade instantly
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
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">CGPA Value</label>
              <input
                type="number"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="Enter your CGPA (e.g., 8.5)"
                step="0.01"
                min="0"
                max="10"
                className="w-full rounded-lg bg-muted px-4 py-3 text-lg font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CGPA Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                className="w-full rounded-lg bg-muted px-4 py-3"
              >
                <option value="10">10.0 Scale</option>
                <option value="5">5.0 Scale</option>
                <option value="4">4.0 Scale</option>
                <option value="custom">Custom Scale</option>
              </select>
            </div>
            {scale === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-2">Custom Scale Value</label>
                <input
                  type="number"
                  value={scale !== "custom" ? scale : ""}
                  onChange={(e) => setScale(e.target.value)}
                  placeholder="Enter scale value"
                  min="1"
                  max="20"
                  className="w-full rounded-lg bg-muted px-4 py-3"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={calculatePercentage}
              className="flex items-center gap-2 rounded-lg text-white px-6 py-3 font-medium transition-colors"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <TrendingUp className="h-4 w-4" />
              Convert
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              className="flex items-center gap-2 rounded-lg bg-muted px-6 py-3 font-medium hover:bg-muted/80"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </motion.button>
          </div>

          {/* Results */}
          {percentage !== null && (
            <div className="mt-6 rounded-lg bg-primary/10 border border-primary/20 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Percentage:</span>
                  <span className="text-lg font-bold text-primary">{percentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Grade:</span>
                  <span className="text-lg font-bold text-primary">{grade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CGPA:</span>
                  <span className="text-lg font-bold">{cgpa}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scale:</span>
                  <span className="text-lg font-bold">
                    {scale === "custom" ? "Custom" : `${scale}.0`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Common Conversion Formulas:</strong>
                <ul className="mt-1 space-y-1">
                  <li>10.0 Scale: Percentage = CGPA × 9.5</li>
                  <li>5.0 Scale: Percentage = CGPA × 19</li>
                  <li>4.0 Scale: Percentage = CGPA × 25</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default CGPAToPercentageTool;
