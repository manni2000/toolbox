import { useState, useRef, useEffect } from "react";
import { Download, Link as LinkIcon, RefreshCw, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { ProcessingState } from "@/components/ProcessingState";
import { EmptyState, NoData } from "@/components/EmptyState";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";

const QRGeneratorToolEnhanced = () => {
  const [text, setText] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validateInput = (value: string) => {
    if (!value.trim()) {
      setError("");
      return false;
    }
    if (value.length > 1000) {
      setError("Text is too long (max 1000 characters)");
      return false;
    }
    setError("");
    return true;
  };

  const generateQRCode = async () => {
    if (!validateInput(text)) {
      setQrCodeUrl("");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrCodeUrl(url);
      setError("");
    } catch (error) {
      console.error("Error generating QR code:", error);
      setError("Failed to generate QR code. Please try again.");
      toast.error({
        title: "Generation Failed",
        description: "Could not generate QR code. Please check your input.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateQRCode();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [text, size, fgColor, bgColor]);

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.downloaded("qrcode.png");
  };

  const handleReset = () => {
    setText("");
    setSize(300);
    setFgColor("#000000");
    setBgColor("#ffffff");
    setQrCodeUrl("");
    setError("");
  };

  return (
    <>
      {CategorySEO.Image(
        "QR Code Generator - Free Online QR Code Maker",
        "Generate custom QR codes from any URL or text instantly. Free, fast, and customizable with color and size options. No signup required."
      )}
      
      <ToolLayout
        title="QR Code Generator"
        description="Generate QR codes from any URL or text instantly with custom colors and sizes"
        category="Image Tools"
        categoryPath="/category/image"
      >
        <main id="main-content" className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Configure QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <EnhancedInput
                id="qr-text"
                label="URL or Text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or text..."
                error={error}
                success={!error && text.trim().length > 0}
                required
                tooltip="Enter any text or URL to generate a QR code"
                hint={`${text.length}/1000 characters`}
                aria-label="Text or URL for QR code"
              />

              <div>
                <Label htmlFor="qr-size" className="mb-2 block">
                  Size: {size}px
                </Label>
                <input
                  id="qr-size"
                  type="range"
                  min="100"
                  max="500"
                  step="10"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full"
                  aria-label="QR code size slider"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>100px</span>
                  <span>500px</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fg-color" className="mb-2 block">
                    Foreground Color
                  </Label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="fg-color"
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border cursor-pointer"
                      aria-label="QR code foreground color picker"
                    />
                    <span className="text-xs font-mono text-muted-foreground min-w-[70px]">
                      {fgColor}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bg-color" className="mb-2 block">
                    Background Color
                  </Label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border cursor-pointer"
                      aria-label="QR code background color picker"
                    />
                    <span className="text-xs font-mono text-muted-foreground min-w-[70px]">
                      {bgColor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateQRCode}
                  disabled={!text.trim() || isGenerating}
                  className="flex-1"
                  aria-label="Generate QR code"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  aria-label="Reset all settings"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview & Download</CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating && (
                <ProcessingState
                  isProcessing={true}
                  message="Generating QR code..."
                />
              )}

              {!isGenerating && !qrCodeUrl && !text.trim() && (
                <NoData message="Enter text or URL to generate a QR code" />
              )}

              {!isGenerating && qrCodeUrl && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8">
                    <img
                      src={qrCodeUrl}
                      alt="Generated QR Code"
                      className="rounded-lg shadow-lg"
                      style={{ width: size, height: size }}
                    />
                  </div>

                  <Button
                    onClick={downloadQRCode}
                    className="w-full"
                    size="lg"
                    aria-label="Download QR code as PNG"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    PNG format • {size}×{size}px • Transparent background available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </ToolLayout>
    </>
  );
};

export default QRGeneratorToolEnhanced;
