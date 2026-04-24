import { useState } from "react";
import { Calculator, Sparkles, DollarSign, Percent, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { toast } from "@/lib/toast";
import ToolFAQ from "@/components/ToolFAQ";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryColor = "142 76% 36%";

const EcommerceCalculatorTool = () => {
  const toolSeoData = getToolSeoMetadata('ecommerce-calculator');
  
  // GST Calculator
  const [gstAmount, setGstAmount] = useState(0);
  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] = useState<'exclusive' | 'inclusive'>('exclusive');

  // Margin Calculator
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  // EMI Calculator
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(12);
  const [tenure, setTenure] = useState(12);

  // Results
  const [gstResult, setGstResult] = useState({ baseAmount: 0, gst: 0, total: 0 });
  const [marginResult, setMarginResult] = useState({ profit: 0, marginPercent: 0, markupPercent: 0 });
  const [emiResult, setEmiResult] = useState({ emi: 0, totalInterest: 0, totalAmount: 0 });

  const calculateGST = () => {
    if (gstType === 'exclusive') {
      const gst = (gstAmount * gstRate) / 100;
      const total = gstAmount + gst;
      setGstResult({ baseAmount: gstAmount, gst, total });
    } else {
      const baseAmount = (gstAmount * 100) / (100 + gstRate);
      const gst = gstAmount - baseAmount;
      setGstResult({ baseAmount, gst, total: gstAmount });
    }
  };

  const calculateMargin = () => {
    const profit = sellingPrice - costPrice;
    const marginPercent = costPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    const markupPercent = costPrice > 0 ? (profit / costPrice) * 100 : 0;
    setMarginResult({ profit, marginPercent, markupPercent });
  };

  const calculateEMI = () => {
    const monthlyRate = interestRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - principal;
    setEmiResult({ emi, totalInterest, totalAmount });
  };

  return (
    <>
      {CategorySEO.Ecommerce(
        toolSeoData?.title || "GST-Margin/EMI Calculator",
        toolSeoData?.description || "Calculate GST, profit margins, and EMI for your business",
        "ecommerce-calculator"
      )}
      <ToolLayout
      title={toolSeoData?.title || "GST-Margin/EMI Calculator"}
      description={toolSeoData?.description || "Calculate GST, profit margins, and EMI for your business"}
      category="Ecommerce Tools"
      categoryPath="/category/ecommerce"
      >
      <div className="space-y-8">
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
              <h2 className="text-2xl font-bold">All-in-One Business Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculate GST, profit margins, markup, and EMI for your e-commerce business. Essential tools for pricing, tax compliance, and financial planning.
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <Tabs defaultValue="gst" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gst">GST Calculator</TabsTrigger>
              <TabsTrigger value="margin">Margin Calculator</TabsTrigger>
              <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
            </TabsList>

            {/* GST Calculator */}
            <TabsContent value="gst">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  GST Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={gstAmount}
                    onChange={(e) => setGstAmount(Number(e.target.value))}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>GST Rate (%)</Label>
                  <Input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    min={0}
                    max={28}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Calculation Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="exclusive"
                        checked={gstType === 'exclusive'}
                        onChange={(e) => setGstType(e.target.value as 'exclusive' | 'inclusive')}
                        className="h-4 w-4"
                      />
                      <span>Add GST (Exclusive)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="inclusive"
                        checked={gstType === 'inclusive'}
                        onChange={(e) => setGstType(e.target.value as 'exclusive' | 'inclusive')}
                        className="h-4 w-4"
                      />
                      <span>Remove GST (Inclusive)</span>
                    </label>
                  </div>
                </div>

                <Button onClick={calculateGST} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate GST
                </Button>

                {gstResult.total > 0 && (
                  <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                    <div className="flex justify-between">
                      <span>Base Amount:</span>
                      <span className="font-semibold">₹{gstResult.baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST Amount:</span>
                      <span className="font-semibold">₹{gstResult.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>₹{gstResult.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
              </motion.div>
            </TabsContent>

            {/* Margin Calculator */}
            <TabsContent value="margin">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Margin Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Cost Price (₹)</Label>
                  <Input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    placeholder="Enter cost price"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Selling Price (₹)</Label>
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    placeholder="Enter selling price"
                  />
                </div>

                <Button onClick={calculateMargin} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Margin
                </Button>

                {marginResult.profit !== 0 && (
                  <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                    <div className={`flex justify-between ${marginResult.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Profit/Loss:</span>
                      <span className="font-semibold">₹{marginResult.profit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Margin:</span>
                      <span className="font-semibold">{marginResult.marginPercent.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Markup:</span>
                      <span className="font-semibold">{marginResult.markupPercent.toFixed(2)}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
              </motion.div>
            </TabsContent>

            {/* EMI Calculator */}
            <TabsContent value="emi">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  EMI Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Loan Amount (₹)</Label>
                  <Input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    placeholder="Enter loan amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interest Rate (% per annum)</Label>
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    min={0}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tenure (months)</Label>
                  <Input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    min={1}
                  />
                </div>

                <Button onClick={calculateEMI} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate EMI
                </Button>

                {emiResult.emi > 0 && (
                  <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                    <div className="flex justify-between">
                      <span>Monthly EMI:</span>
                      <span className="font-semibold">₹{emiResult.emi.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-semibold">₹{emiResult.totalInterest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total Amount:</span>
                      <span>₹{emiResult.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Business Calculators Explained
          </h3>
          <p className="text-muted-foreground mb-4">
            These calculators help e-commerce businesses with essential financial calculations including GST tax, profit margins, and loan EMI planning.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">GST Calculator</h5>
              <p className="text-sm text-blue-800">Calculate GST exclusive or inclusive amounts for tax compliance</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Margin Calculator</h5>
              <p className="text-sm text-green-800">Calculate profit margin and markup for pricing strategies</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-1">EMI Calculator</h5>
              <p className="text-sm text-purple-800">Plan loan repayments with monthly installment calculations</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          <ToolFAQ faqs={[
            {
              question: "What is the difference between exclusive and inclusive GST?",
              answer: "Exclusive GST adds tax to the base amount (Price + GST). Inclusive GST removes tax from the total amount to find the base (Total - GST). Use exclusive for pricing, inclusive for analyzing billed amounts."
            },
            {
              question: "How do I calculate profit margin vs markup?",
              answer: "Profit margin is (Profit / Selling Price) × 100 - shows profit as percentage of revenue. Markup is (Profit / Cost Price) × 100 - shows profit as percentage of cost. Margin is better for understanding actual profitability."
            },
            {
              question: "What is the EMI formula used?",
              answer: "We use the standard reducing balance method: EMI = P × r × (1+r)^n / ((1+r)^n-1), where P is principal, r is monthly interest rate, and n is tenure in months."
            },
            {
              question: "What GST rates are common in India?",
              answer: "Standard GST rates are 5%, 12%, 18%, and 28%. Most goods fall under 18%. Essential items are 0-5%, luxury goods are 28%. Services are typically 18%."
            },
            {
              question: "Can I use these calculators for commercial purposes?",
              answer: "Yes, these calculators provide accurate results for business use. However, for official tax filings, consult with a certified accountant or use government-approved tools."
            }
          ]} />
        </div>
      </div>
    </ToolLayout>
    </>
  );
};

export default EcommerceCalculatorTool;
