import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, X, Sparkles, Sun, Sliders } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "142 76% 36%";

const ImageColorEnhancerTool = () => {
  const toolSeoData = getToolSeoMetadata('image-color-enhancer');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
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
    // Reset filters
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
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

      // Apply filters
      ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
      ctx.drawImage(img, 0, 0);

      const url = canvas.toDataURL('image/png');
      setProcessedUrl(url);
      setIsProcessing(false);

      toast({
        title: 'Color Enhanced',
        description: 'Image colors have been enhanced',
      });
    };

    img.src = previewUrl;
  };

  const downloadImage = () => {
    if (!processedUrl) return;

    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `enhanced-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download Started',
      description: 'Your enhanced image is being downloaded',
    });
  };

  const resetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    if (selectedFile && previewUrl) {
      processImage();
    }
  };

  return (
    <>
      {CategorySEO.Ecommerce(
        toolSeoData?.title || "Image Color Enhancer",
        toolSeoData?.description || "Enhance colors in product photos",
        "image-color-enhancer"
      )}
      <ToolLayout
      title="Image Color Enhancer"
      description="Enhance colors in product photos"
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
                <Sun className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Product Photo Color Enhancer</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enhance and adjust colors in product photos. Improve brightness, contrast, and saturation for professional-looking images.
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

          {/* Color Controls */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sliders className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                Color Adjustments
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Brightness: {brightness > 0 ? '+' : ''}{brightness}%</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Contrast: {contrast > 0 ? '+' : ''}{contrast}%</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Saturation: {saturation > 0 ? '+' : ''}{saturation}%</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Upload className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Apply Enhancements
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>
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
                Enhanced Result
              </h3>
              <div className="space-y-4">
                <img src={processedUrl} alt="Enhanced" className="max-w-full h-auto rounded-lg mx-auto max-h-64 object-contain" />
                <button
                  onClick={downloadImage}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Enhanced Image
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
              <Sun className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              What is Color Enhancement?
            </h3>
            <p className="text-muted-foreground mb-4">
              Color enhancement adjusts brightness, contrast, and saturation to make product photos more vibrant and appealing. This helps attract customers and improves product presentation.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Enhancement Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Brightness control</li>
                  <li>• Contrast adjustment</li>
                  <li> Saturation boost</li>
                  <li>• Real-time preview</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Best Practices</h5>
                  <ul className="text-sm text-green-800 space-y-1">
                  <li>• Don't over-enhance</li>
                  <li>• Keep colors accurate</li>
                  <li>• Test on various devices</li>
                  <li>• Maintain consistency</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <ToolFAQ faqs={[
              {
                question: "How can I make my product photos look professional?",
                answer: "Use color enhancement to adjust brightness, contrast, and saturation. Ensure colors are accurate to the actual product. Avoid over-processing which can look unnatural."
              },
              {
                question: "What's the ideal brightness for product photos?",
                answer: "Aim for natural-looking brightness. Usually +5-15% brightness enhancement works well for most product photos without making them look artificial."
              },
              {
                question: "Should I increase contrast for all images?",
                answer: "Not always. Increase contrast only if the image looks flat or washed out. For already high-contrast images, reducing it may look better."
              },
              {
                question: "How much saturation should I use?",
                answer: "Moderate saturation (+10-20%) makes colors pop without looking artificial. Avoid high saturation which can make products look unrealistic."
              },
              {
                question: "Can I use enhanced images on all marketplaces?",
                answer: "Yes, enhanced images work on all marketplaces. Just ensure they meet the platform's size and format requirements and accurately represent the product."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default ImageColorEnhancerTool;
