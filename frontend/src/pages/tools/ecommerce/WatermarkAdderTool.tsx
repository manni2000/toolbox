import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, Type, X, Sparkles, Droplets, Move } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "142 76% 36%";

const WatermarkAdderTool = () => {
  const toolSeoData = getToolSeoMetadata('watermark-adder');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right');
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

    if (!watermarkText.trim()) {
      toast({
        title: 'No Watermark Text',
        description: 'Please enter watermark text',
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

      ctx.drawImage(img, 0, 0);

      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity / 100})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let x, y;
      const padding = 20;

      switch (position) {
        case 'top-left':
          x = padding;
          y = padding;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          break;
        case 'top-right':
          x = canvas.width - padding;
          y = padding;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          break;
        case 'bottom-right':
          x = canvas.width - padding;
          y = canvas.height - padding;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          break;
        case 'center':
          x = canvas.width / 2;
          y = canvas.height / 2;
          break;
      }

      ctx.fillText(watermarkText, x, y);

      const url = canvas.toDataURL('image/png');
      setProcessedUrl(url);
      setIsProcessing(false);

      toast({
        title: 'Watermark Added',
        description: 'Watermark has been added to your image',
      });
    };

    img.src = previewUrl;
  };

  const downloadImage = () => {
    if (!processedUrl) return;

    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `watermarked-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download Started',
      description: 'Your watermarked image is being downloaded',
    });
  };

  return (
    <>
      {CategorySEO.Ecommerce(
        toolSeoData?.title || "Watermark Adder",
        toolSeoData?.description || "Add watermarks to protect product images",
        "watermark-adder"
      )}
      <ToolLayout
      title="Watermark Adder"
      description="Add watermarks to protect product images"
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
                <Droplets className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Product Image Watermarking</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add custom text watermarks to protect your product images. Customize position, size, and opacity for professional results.
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

          {/* Watermark Settings */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                Watermark Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text (e.g., © Your Brand)"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Opacity: {opacity}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`px-3 py-2 text-xs rounded-md border transition-all ${
                          position === pos
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {pos.replace('-', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

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
                      Add Watermark
                    </>
                  )}
                </button>
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
                Result
              </h3>
              <div className="space-y-4">
                <img src={processedUrl} alt="Watermarked" className="max-w-full h-auto rounded-lg mx-auto max-h-64 object-contain" />
                <button
                  onClick={downloadImage}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Watermarked Image
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
              <Droplets className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              What is Image Watermarking?
            </h3>
            <p className="text-muted-foreground mb-4">
              Image watermarking adds a visible text overlay to images to protect intellectual property and brand identity. It helps prevent unauthorized use while maintaining image quality.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Watermark Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Custom text watermarks</li>
                  <li>• Adjustable font size</li>
                  <li>• Position control</li>
                  <li>• Opacity settings</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Product protection</li>
                  <li>• Brand visibility</li>
                  <li>• Copyright notice</li>
                  <li>• Portfolio protection</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <ToolFAQ faqs={[
              {
                question: "Should I watermark my product images?",
                answer: "Watermarks help prevent image theft but may affect customer trust. Use subtle, transparent watermarks that don't distract from the product."
              },
              {
                question: "Can I use my brand logo as watermark?",
                answer: "Currently, we support text-based watermarks. For logo watermarks, you can add your logo as a transparent PNG overlay using image editing software."
              },
              {
                question: "What's the best watermark position?",
                answer: "Bottom-right or center positions are common for product images. Choose a position that doesn't cover important product details."
              },
              {
                question: "What opacity should I use?",
                answer: "30-50% opacity is ideal for watermarks - visible enough to protect your brand but subtle enough not to interfere with the product image."
              },
              {
                question: "Can I remove watermarks later?",
                answer: "Watermarks added to the image are permanent. Always keep your original unwatermarked images for future use."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default WatermarkAdderTool;
