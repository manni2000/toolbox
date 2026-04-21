import { useState } from "react";
import { Image as ImageIcon, X, RefreshCw, ArrowRight, FileImage, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "173 80% 40%";

const PNGToWebPConverter = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState(85);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    // Specifically check for PNG files
    if (!file.type.includes("png") && !file.name.toLowerCase().endsWith('.png')) {
      alert("Please upload a PNG file");
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setConvertedUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const convert = () => {
    if (!preview) return;
    setIsConverting(true);

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsConverting(false);
        return;
      }

      // Draw image (preserve transparency for WebP)
      ctx.drawImage(img, 0, 0);
      
      // Convert to WebP with specified quality
      const url = canvas.toDataURL("image/webp", quality / 100);
      setConvertedUrl(url);
      setIsConverting(false);
    };
    
    img.onerror = () => {
      alert("Failed to load image for conversion");
      setIsConverting(false);
    };
    
    img.src = preview;
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setConvertedUrl(null);
  };

  const getFileName = () => {
    if (!image) return "converted.webp";
    return image.name.replace(/\.[^/.]+$/, ".webp");
  };

  return (
    <ToolLayout
      title="PNG to WebP Converter"
      description="Convert PNG images to WebP format for better compression and web performance"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-8">
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
              <Zap className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Quick PNG to WebP Conversion</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert PNG images to modern WebP format for superior compression and faster web loading.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        {!image && (
          <ImageUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => {}}
            onFileSelect={handleFile}
            multiple={false}
            title="Drop PNG image here or click to browse"
            subtitle="Supports PNG files with transparency up to 10MB"
            accept="image/png"
          />
        )}

        {/* Preview and Convert */}
        {image && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">{image.name}</span>
                  <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {(image.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <button
                  onClick={reset}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                  title="Clear image and reset converter"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            </div>

            {/* Preview */}
            <motion.div className="relative overflow-hidden flex justify-center rounded-xl border border-border bg-muted/30 p-4">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-80 max-w-full rounded-lg object-contain relative z-10"
                />
              )}
            </motion.div>

            {/* Conversion Flow */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="rounded-lg bg-blue-500/10 px-4 py-2 font-medium text-blue-700 border border-blue-200">
                PNG
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <span className="rounded-lg bg-orange-500/10 px-4 py-2 font-medium text-orange-700 border border-orange-200">
                WebP
              </span>
            </div>

            {/* Quality Slider */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <div className="mb-3 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                </motion.div>
                <label className="text-sm font-semibold text-foreground">
                  WebP Quality: {quality}%
                </label>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setConvertedUrl(null);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                title="Adjust WebP compression quality (10-100%)"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Low (10%)</span>
                <span>Medium (50%)</span>
                <span>High (100%)</span>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {quality <= 30 && "Low quality - Maximum compression, smallest size"}
                  {quality > 30 && quality <= 70 && "Medium quality - Balanced compression and quality"}
                  {quality > 70 && "High quality - Best visual quality"}
                </p>
              </div>
            </div>

            {/* WebP Benefits */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <div className="mb-3 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                </motion.div>
                <h3 className="font-semibold text-foreground">Why Convert PNG to WebP?</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-sm text-muted-foreground">25-35% smaller than equivalent PNG</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Preserves transparency perfectly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm text-muted-foreground">Faster website loading times</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Perfect for PNG optimization</span>
                </div>
              </div>
            </div>

            {isConverting && (
              <div className="flex justify-center py-8">
                <ModernLoadingSpinner 
                  size="md" 
                  text="Converting to WebP..." 
                  color={`hsl(${categoryColor})`}
                />
              </div>
            )}

            {/* Convert Button */}
            {!isConverting && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={convert} 
                  disabled={isConverting}
                  className="btn-primary w-full"
                  style={{
                    background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                  }}
                  title="Convert PNG image to WebP format"
                >
                  <RefreshCw className="h-5 w-5" />
                  Convert PNG to WebP
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Download Section */}
        {convertedUrl && (
          <div id="download-section" className="flex justify-center">
            <EnhancedDownload
              data={convertedUrl}
              fileName={getFileName()}
              fileType="image"
              title="PNG Converted to WebP Successfully"
              description={`Your PNG image has been converted to WebP format at ${quality}% quality`}
              fileSize={image ? `${(image.size / 1024).toFixed(1)} KB` : 'Unknown size'}
            />
          </div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            What is PNG to WebP Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            PNG to WebP conversion transforms PNG images into WebP format. WebP is a modern image format that provides superior compression while maintaining quality, resulting in significantly smaller file sizes for web use.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PNG image</li>
            <li>Adjust the quality slider (optional)</li>
            <li>The tool converts it to WebP format</li>
            <li>Download the optimized WebP file</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">WebP Advantages</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 25-35% smaller than PNG</li>
                <li>• Supports transparency</li>
                <li>• Modern browser support</li>
                <li>• Better compression</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Web Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Website optimization</li>
                <li>• Faster page loads</li>
                <li>• Reduced bandwidth</li>
                <li>• Better SEO scores</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why use WebP instead of PNG?",
            answer: "WebP provides 25-35% smaller file sizes than PNG while maintaining similar quality. It supports transparency and is supported by all modern browsers, making it ideal for web optimization."
          },
          {
            question: "Does WebP support transparency?",
            answer: "Yes, WebP supports alpha channel transparency just like PNG. This makes it a direct replacement for PNG with better compression and smaller file sizes."
          },
          {
            question: "Is WebP compatible with all browsers?",
            answer: "WebP is supported by all modern browsers (Chrome, Firefox, Edge, Safari). Very old browsers (IE) don't support it, but fallback mechanisms can be implemented."
          },
          {
            question: "How much smaller will WebP files be?",
            answer: "WebP typically reduces file size by 25-35% compared to PNG for similar quality. For complex images, savings can be even higher while maintaining visual quality."
          },
          {
            question: "Should I convert all PNGs to WebP?",
            answer: "For web use, yes. WebP provides better performance. For print or editing, keep the original PNG. Always keep your source files for future flexibility."
          }
        ]} />
      </div>
    </div>
    </ToolLayout>
  );
};

export default PNGToWebPConverter;
