import { useState, useRef, useEffect } from "react";
import { Download, RefreshCw, Sparkles, Barcode as BarcodeIcon, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import JsBarcode from "jsbarcode";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { ProcessingState } from "@/components/ProcessingState";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "@/lib/toast";
import ToolFAQ from "@/components/ToolFAQ";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categoryColor = "142 76% 36%";

type BarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14' | 'MSI' | 'pharmacode';
type FormatState = BarcodeFormat | '';

const BarcodeGeneratorTool = () => {
  const toolSeoData = getToolSeoMetadata('barcode-generator');
  const [text, setText] = useState("");
  const [format, setFormat] = useState<FormatState>('');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [barcodeUrl, setBarcodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateBarcode = () => {
    if (!text.trim()) {
      // setError("Please enter text to generate barcode");
      setBarcodeUrl("");
      return;
    }

    if (!format) {
      setError("Please select a barcode format");
      setBarcodeUrl("");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      JsBarcode(canvas, text, {
        format: format,
        width: width,
        height: height,
        displayValue: displayValue,
        lineColor: "#000000",
        background: "#ffffff",
        margin: 10,
      });

      const url = canvas.toDataURL('image/png');
      setBarcodeUrl(url);
    } catch (err) {
      console.error("Error generating barcode:", err);
      setError("Failed to generate barcode. Please check your input format.");
      toast.error({
        title: "Generation Failed",
        description: "Could not generate barcode. Please check your input.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateBarcode();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [text, format, width, height, displayValue]);

  const downloadBarcode = () => {
    if (!barcodeUrl) return;

    const link = document.createElement('a');
    link.href = barcodeUrl;
    link.download = `barcode-${format}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success({
      title: "Download Started",
      description: "Your barcode is being downloaded.",
    });
  };

  const formats: { value: BarcodeFormat; label: string; description: string }[] = [
    { value: 'CODE128', label: 'CODE128', description: 'Most common, supports all ASCII characters' },
    { value: 'CODE39', label: 'CODE39', description: 'Alphanumeric, widely used in logistics' },
    { value: 'EAN13', label: 'EAN-13', description: '13-digit product barcode (retail)' },
    { value: 'EAN8', label: 'EAN-8', description: '8-digit product barcode (small packages)' },
    { value: 'UPC', label: 'UPC', description: '12-digit barcode (North America retail)' },
    { value: 'ITF14', label: 'ITF-14', description: '14-digit barcode (shipping containers)' },
    { value: 'MSI', label: 'MSI', description: 'Numeric only, used in warehouses' },
    { value: 'pharmacode', label: 'Pharmacode', description: 'Pharmaceutical industry' },
  ];

  return (
    <>
      {CategorySEO.Ecommerce(
        toolSeoData?.title || "Barcode Generator",
        toolSeoData?.description || "Generate barcodes for products and inventory",
        "barcode-generator"
      )}
      <ToolLayout
      title="Barcode Generator"
      description="Generate barcodes for products and inventory"
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
              <BarcodeIcon className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Professional Barcode Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate industry-standard barcodes for products, inventory, and packaging. Supports multiple formats including CODE128, EAN, UPC, and more.
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarcodeIcon className="w-5 h-5" style={{ color: `hsl(${categoryColor})` }} />
                Barcode Settings
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="barcode-text">Barcode Text</Label>
              <Input
                id="barcode-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or numbers"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode-format">Barcode Format</Label>
              <Select value={format} onValueChange={(value: BarcodeFormat) => setFormat(value)}>
                <SelectTrigger id="barcode-format">
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{f.label}</span>
                        <span className="text-xs text-muted-foreground">{f.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bar Width: {width}px</Label>
                <Input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Height: {height}px</Label>
                <Input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="display-value"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="display-value" className="cursor-pointer">
                Display text below barcode
              </Label>
            </div>

            <Button onClick={generateBarcode} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Barcode
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                Preview
              </CardTitle>
            </CardHeader>
          <CardContent>
            {isGenerating ? (
              <ProcessingState isProcessing={true} message="Generating barcode..." />
            ) : barcodeUrl ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-8 flex justify-center bg-white">
                  <img
                    src={barcodeUrl}
                    alt="Generated barcode"
                    className="max-w-full h-auto"
                  />
                </div>
                <Button onClick={downloadBarcode} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Barcode
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={<BarcodeIcon className="w-8 h-8 text-muted-foreground" />}
                title="No barcode generated"
                description="Enter text and click generate to create a barcode"
              />
            )}
          </CardContent>
        </Card>
        </motion.div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            What is a Barcode?
          </h3>
          <p className="text-muted-foreground mb-4">
            A barcode is a machine-readable representation of data in a visual format. It's widely used in retail, inventory management, and product identification systems to track items efficiently.
          </p>
          
          <h4 className="font-semibold mb-2">Supported Barcode Formats</h4>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">CODE128</h5>
              <p className="text-sm text-blue-800">Most common, supports all ASCII characters</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">EAN-13</h5>
              <p className="text-sm text-green-800">13-digit product barcode for retail</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-1">UPC</h5>
              <p className="text-sm text-purple-800">12-digit barcode for North America</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-semibold text-orange-900 mb-1">CODE39</h5>
              <p className="text-sm text-orange-800">Alphanumeric, used in logistics</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          <ToolFAQ faqs={[
            {
              question: "What barcode format should I use?",
              answer: "CODE128 is the most versatile and widely used format. It supports all ASCII characters and is suitable for most applications. For retail products, use EAN-13 (international) or UPC (North America)."
            },
            {
              question: "Can I print these barcodes?",
              answer: "Yes, the generated barcodes are high-resolution and print-ready. Download as PNG and print at any size. Ensure you test print to verify scannability."
            },
            {
              question: "What size should my barcode be?",
              answer: "Minimum 2cm height for reliable scanning. For retail, follow GS1 standards. The width adjusts automatically based on the data length."
            },
            {
              question: "Are these barcodes scannable?",
              answer: "Yes, all barcodes are generated according to official specifications and are fully scannable by standard barcode scanners and smartphone apps."
            },
            {
              question: "Can I use barcodes for inventory?",
              answer: "Absolutely. These barcodes are perfect for inventory management, product labeling, and tracking systems."
            }
          ]} />
        </div>
      </div>
    </ToolLayout>
    </>
  );
};

export default BarcodeGeneratorTool;
