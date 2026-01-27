import { useState } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, TrendingUp, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      title="CGPA to Percentage Calculator"
      description="Convert your CGPA to percentage with different grading scales"
      category="Education Tools"
      categoryPath="/category/education"
    >
      <Card className="mx-auto max-w-md p-6">
        <div className="space-y-6">
          {/* CGPA Input */}
          <div>
            <label className="mb-2 block text-sm font-medium">CGPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              placeholder="Enter your CGPA (e.g., 8.5)"
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Scale Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">Grading Scale</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="10">10.0 Scale (Most Common)</option>
              <option value="5">5.0 Scale</option>
              <option value="4">4.0 Scale (GPA)</option>
              <option value="custom">Custom Scale</option>
            </select>
          </div>

          {/* Custom Scale Input */}
          {scale === "custom" && (
            <div>
              <label className="mb-2 block text-sm font-medium">Custom Scale Maximum</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="20"
                value={scale === "custom" ? "" : scale}
                onChange={(e) => setScale(e.target.value)}
                placeholder="Enter scale maximum (e.g., 8.0)"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Calculate Button */}
          <Button
            onClick={calculatePercentage}
            disabled={!cgpa}
            className="w-full"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Percentage
          </Button>

          {/* Reset Button */}
          <Button
            onClick={reset}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          {/* Results */}
          {percentage !== null && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
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
          <div className="text-xs text-muted-foreground space-y-2">
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
        </div>
      </Card>
    </ToolLayout>
  );
};

export default CGPAToPercentageTool;
