import { useState, useRef, useEffect } from "react";
import { Download, Upload, RefreshCw, Sparkles, Image as ImageIcon, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const categoryColor = "142 76% 36%";

const ShadowAdderTool = () => {
  const toolSeoData = getToolSeoMetadata('shadow-adder');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(20);
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(10);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOpacity, setShadowOpacity] = useState(0.3);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [previewUrl, processedUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error({
        title: "Invalid File",
        description: "Please upload an image file.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
      });
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl("");
  };

  const addShadow = async () => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Parse shadow color with opacity
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        const shadowColorRgba = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;

        // Add shadow
        ctx.shadowColor = shadowColorRgba;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Convert to blob and set as processed URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setProcessedUrl(url);
          }
          setIsProcessing(false);
        }, 'image/png');
      };
      img.src = previewUrl;
    } catch (error) {
      console.error("Error adding shadow:", error);
      toast.error({
        title: "Processing Failed",
        description: "Could not add shadow to image. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (image) {
      addShadow();
    }
  }, [shadowBlur, shadowOffsetX, shadowOffsetY, shadowColor, shadowOpacity]);

  const downloadImage = () => {
    if (!processedUrl) return;

    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `shadow-added-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success({
      title: "Download Started",
      description: "Your image with shadow is being downloaded.",
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      handleImageUpload({ target: input } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {CategorySEO.Ecommerce(
        toolSeoData?.title || "Shadow Adder",
        toolSeoData?.description || "Add professional shadows to product images",
        "shadow-adder"
      )}
      <ToolLayout
        title={toolSeoData?.title || "Shadow Adder"}
        description={toolSeoData?.description || "Add professional shadows to product images"}
        category="E-commerce Tools"
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
              <ImageIcon className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Professional Shadow Adder</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add professional drop shadows to product images for e-commerce. Customize blur, offset, opacity, and color for perfect product presentations.
              </p>
            </div>
          </div>
        </motion.div>
        {/* Upload Section */}
        {!image && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
              <CardContent className="pt-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your image here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button type="button">Select Image</Button>
              </div>
            </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Editor Section */}
        {image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: `hsl(${categoryColor})` }} />
                    Shadow Settings
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Shadow Blur: {shadowBlur}px</Label>
                  <Slider
                    value={[shadowBlur]}
                    onValueChange={(value) => setShadowBlur(value[0])}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horizontal Offset: {shadowOffsetX}px</Label>
                  <Slider
                    value={[shadowOffsetX]}
                    onValueChange={(value) => setShadowOffsetX(value[0])}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vertical Offset: {shadowOffsetY}px</Label>
                  <Slider
                    value={[shadowOffsetY]}
                    onValueChange={(value) => setShadowOffsetY(value[0])}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shadow Opacity: {Math.round(shadowOpacity * 100)}%</Label>
                  <Slider
                    value={[shadowOpacity]}
                    onValueChange={(value) => setShadowOpacity(value[0])}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shadow Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={shadowColor}
                      onChange={(e) => setShadowColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={shadowColor}
                      onChange={(e) => setShadowColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => document.getElementById('image-upload')?.click()} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                  <Button onClick={addShadow} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Apply Shadow
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-500" />
                    Preview
                  </CardTitle>
                </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <ProcessingState isProcessing={true} message="Adding shadow to your image..." />
                ) : processedUrl ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={processedUrl}
                        alt="Preview with shadow"
                        className="w-full h-auto max-h-[500px] object-contain bg-checkerboard"
                      />
                    </div>
                    <Button onClick={downloadImage} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    icon={<ImageIcon className="w-8 h-8 text-muted-foreground" />}
                    title="No preview available"
                    description="Upload an image to see the shadow effect"
                  />
                )}
              </CardContent>
            </Card>
            </motion.div>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </motion.div>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Shadow Adder Explained
          </h3>
          <p className="text-muted-foreground mb-4">
            Add professional drop shadows to product images to create depth and dimension. Perfect for e-commerce product photos, marketing materials, and design projects.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Customizable Blur</h5>
              <p className="text-sm text-blue-800">Adjust shadow blur for soft or sharp edges</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Offset Control</h5>
              <p className="text-sm text-green-800">Fine-tune horizontal and vertical shadow position</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-1">Opacity Settings</h5>
              <p className="text-sm text-purple-800">Control shadow transparency for subtle effects</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-semibold text-orange-900 mb-1">Color Customization</h5>
              <p className="text-sm text-orange-800">Choose any shadow color to match your brand</p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-8">
          <ToolFAQ faqs={[
            {
              question: "What image formats are supported?",
              answer: "We support PNG, JPG, JPEG, WebP, and GIF formats. The output is always PNG to support transparency and maintain image quality."
            },
            {
              question: "Will the shadow affect image quality?",
              answer: "No, the shadow is added as an effect without degrading the original image quality. The output maintains the original resolution."
            },
            {
              question: "Can I use this for product photos?",
              answer: "Absolutely. This tool is perfect for e-commerce product photos. The professional shadow effect adds depth and makes products look more appealing."
            },
            {
              question: "What's the best shadow settings for products?",
              answer: "For product photos: blur 15-25px, vertical offset 5-15px, horizontal offset 0-5px, opacity 20-40%. This creates a natural, professional look."
            },
            {
              question: "Is my image data private?",
              answer: "Yes, all processing happens locally in your browser. Your images are never uploaded to any server and are not stored."
            }
          ]} />
        </div>
      </div>
    </ToolLayout>
    </>
  );
};

export default ShadowAdderTool;
