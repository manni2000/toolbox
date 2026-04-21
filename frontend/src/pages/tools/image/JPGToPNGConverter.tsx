import { useState } from "react";
import { Image as ImageIcon, X, RefreshCw, ArrowRight, FileImage, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "173 80% 40%";

const JPGToPNGConverter = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [preserveTransparency, setPreserveTransparency] = useState(true);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
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

      // For JPG to PNG, we don't need to fill background as PNG supports transparency
      ctx.drawImage(img, 0, 0);
      
      // Convert to PNG (lossless)
      const url = canvas.toDataURL("image/png", 1);
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
    if (!image) return "converted.png";
    return image.name.replace(/\.[^/.]+$/, ".png");
  };

  return (
    <ToolLayout
      title="JPG to PNG Converter"
      description="Convert JPG images to PNG format with transparency support"
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
              <FileImage className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Quick JPG to PNG Conversion</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert JPG images to PNG format with lossless quality and full transparency support.
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
            title="Drop JPG image here or click to browse"
            subtitle="Supports JPG, JPEG, WebP, GIF, BMP and other image formats up to 10MB"
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
              <span className="rounded-lg bg-green-500/10 px-4 py-2 font-medium text-green-700 border border-green-200">
                JPG
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <span className="rounded-lg bg-blue-500/10 px-4 py-2 font-medium text-blue-700 border border-blue-200">
                PNG
              </span>
            </div>

            {/* PNG Benefits */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <div className="mb-3 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                </motion.div>
                <h3 className="font-semibold text-foreground">Why Convert to PNG?</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Lossless compression - no quality loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Supports transparency (alpha channel)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm text-muted-foreground">Better for logos, icons, and graphics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-sm text-muted-foreground">Widely supported by all browsers</span>
                </div>
              </div>
            </div>

            {isConverting && (
              <div className="flex justify-center py-8">
                <ModernLoadingSpinner 
                  size="md" 
                  text="Converting to PNG..." 
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
                  title="Convert JPG image to PNG format"
                >
                  <RefreshCw className="h-5 w-5" />
                  Convert to PNG
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
              title="JPG Converted to PNG Successfully"
              description="Your image has been converted to PNG format with lossless quality"
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
            <RefreshCw className="h-5 w-5 text-blue-500" />
            What is JPG to PNG Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            JPG to PNG conversion transforms JPEG images into PNG format. PNG supports transparency and uses lossless compression, making it ideal for graphics, logos, and images that need transparency or will be edited further.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your JPG image</li>
            <li>The tool converts it to PNG format</li>
            <li>Transparency is preserved (if applicable)</li>
            <li>Download the PNG file</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Format Differences</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• JPG: Lossy, smaller files</li>
                <li>• PNG: Lossless, supports transparency</li>
                <li>• PNG: Better for editing</li>
                <li>• JPG: Better for photos</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">When to Use PNG</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Logos and graphics</li>
                <li>• Images with transparency</li>
                <li>• Images for editing</li>
                <li>• Screenshots</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why convert JPG to PNG?",
            answer: "Convert to PNG when you need transparency, lossless quality, or plan to edit the image further. PNG is better for graphics, logos, and images requiring precise details."
          },
          {
            question: "Will PNG files be larger than JPG?",
            answer: "Yes, PNG files are typically larger than JPG because PNG uses lossless compression. For photos, JPG is more efficient. For graphics, PNG's quality is worth the size increase."
          },
          {
            question: "Does conversion affect image quality?",
            answer: "Converting JPG to PNG doesn't improve quality - it just prevents further degradation. The original JPG compression artifacts remain. Start with uncompressed sources when possible."
          },
          {
            question: "Can PNG support transparency?",
            answer: "Yes, PNG supports alpha channel transparency. This is why PNG is preferred for logos, icons, and graphics that need transparent backgrounds."
          },
          {
            question: "When should I use JPG vs PNG?",
            answer: "Use JPG for photos and images where file size matters. Use PNG for graphics, logos, images with transparency, or when you need lossless quality for editing."
          }
        ]} />
      </div>
    </div>
    </ToolLayout>
  );
};

export default JPGToPNGConverter;
