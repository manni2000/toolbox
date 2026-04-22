import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, X, Sparkles, Layers, Palette } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "142 76% 36%";

const WhiteBackgroundAdderTool = () => {
  const toolSeoData = getToolSeoMetadata('white-background-adder');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid image file (JPG, PNG, WebP)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    setProcessedUrl('');
  };

  const processImage = () => {
    if (!selectedFile || !previewUrl) {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill with white background first
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image on top
      ctx.drawImage(img, 0, 0);

      const url = canvas.toDataURL('image/png');
      setProcessedUrl(url);
      setIsProcessing(false);

      toast({
        title: 'Background Added',
        description: 'White background has been added to your image',
      });
    };

    img.src = previewUrl;
  };

  const downloadImage = () => {
    if (!processedUrl) return;

    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `white-bg-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download Started',
      description: 'Your image with white background is being downloaded',
    });
  };

  return (
    <>
      {CategorySEO.Ecommerce(
        toolSeoData?.title || "White Background Adder",
        toolSeoData?.description || "Add white background to product images",
        "white-background-adder"
      )}
      <ToolLayout
        title={toolSeoData?.title || "White Background Adder"}
        description={toolSeoData?.description || "Add white background to product images"}
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
                <Layers className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">White Background Creator</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add a clean white background to your product images. Perfect for e-commerce listings and professional presentations.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              Upload Image
            </h3>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP up to 10MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg mx-auto max-h-64 object-contain" />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                      setProcessedUrl('');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Process Button */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg"
            >
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Upload className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Add White Background
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Preview */}
          {processedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                Result
              </h3>
              <div className="space-y-4">
                <img src={processedUrl} alt="With White Background" className="max-w-full h-auto rounded-lg mx-auto max-h-64 object-contain bg-white" />
                <button
                  onClick={downloadImage}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </button>
              </div>
            </motion.div>
          )}

          {/* Tool Definition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Palette className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              What is White Background Addition?
            </h3>
            <p className="text-muted-foreground mb-4">
              Adding a white background to product images creates a clean, professional look essential for e-commerce platforms. It ensures consistent presentation across all marketplaces.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Background Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pure white background</li>
                  <li>• Maintains image quality</li>
                  <li>• PNG output format</li>
                  <li>• Fast processing</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Platform Benefits</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Amazon compliance</li>
                  <li>• Marketplace ready</li>
                  <li>• Professional look</li>
                  <li>• Consistent branding</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <ToolFAQ faqs={[
              {
                question: "Why do product images need white backgrounds?",
                answer: "Most e-commerce platforms like Amazon, eBay, and Flipkart require white backgrounds for product images. It creates a clean, professional look and focuses attention on the product."
              },
              {
                question: "Will this work with transparent PNGs?",
                answer: "Yes, transparent PNGs work perfectly. The tool will fill the transparent areas with white while preserving the product image."
              },
              {
                question: "What image formats are supported?",
                answer: "We support JPG, PNG, and WebP formats. The output is always PNG to maintain quality and support transparency if needed."
              },
              {
                question: "Will the image quality be affected?",
                answer: "No, the original image quality is preserved. We only add a white background layer without compressing or altering the original image data."
              },
              {
                question: "Can I use this for non-product images?",
                answer: "Absolutely. You can add white backgrounds to any image for presentations, documents, or design projects where a clean background is needed."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default WhiteBackgroundAdderTool;
