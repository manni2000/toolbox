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

const WebPToPNGConverter = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

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

  const convert = async () => {
    if (!image) return;
    setIsConverting(true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('format', 'png');

      const response = await fetch('/api/image/convert', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
      } else {
        alert('Failed to convert image');
      }
    } catch (error) {
      alert('Failed to convert image');
    } finally {
      setIsConverting(false);
    }
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
      title="WebP to PNG Converter"
      description="Convert WebP images to PNG format with full quality preservation"
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
              <h2 className="text-2xl font-bold">Quick WebP to PNG Conversion</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert modern WebP images to universal PNG format for maximum compatibility.
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
            title="Drop WebP image here or click to browse"
            subtitle="Supports WebP, JPG, PNG, GIF, BMP and other image formats up to 10MB"
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
              <span className="rounded-lg bg-purple-500/10 px-4 py-2 font-medium text-purple-700 border border-purple-200">
                WebP
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <span className="rounded-lg bg-blue-500/10 px-4 py-2 font-medium text-blue-700 border border-blue-200">
                PNG
              </span>
            </div>

            {/* WebP Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <div className="mb-3 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                </motion.div>
                <h3 className="font-semibold text-foreground">Why Convert WebP to PNG?</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm text-muted-foreground">Better compatibility with older browsers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Works with all image editing software</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Lossless quality preservation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-sm text-muted-foreground">Supports transparency perfectly</span>
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
                  title="Convert WebP image to PNG format"
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
              title="WebP Converted to PNG Successfully"
              description="Your WebP image has been converted to PNG format with lossless quality"
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
            What is WebP to PNG Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            WebP to PNG conversion transforms WebP images into PNG format. This is useful when you need compatibility with older systems or applications that don't support WebP, while maintaining lossless quality.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your WebP image</li>
            <li>The tool converts it to PNG format</li>
            <li>Transparency is preserved</li>
            <li>Download the PNG file</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Conversion Reasons</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Legacy compatibility</li>
                <li>• Editing software support</li>
                <li>• Print requirements</li>
                <li>• Universal format</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">PNG Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Universal support</li>
                <li>• Lossless quality</li>
                <li>• Transparency support</li>
                <li>• Editing-friendly</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why convert WebP to PNG?",
            answer: "Convert to PNG for compatibility with older systems, editing software, or applications that don't support WebP. PNG has universal support and is required in many workflows."
          },
          {
            question: "Will file size increase?",
            answer: "Yes, PNG files are typically larger than WebP because WebP uses more efficient compression. The trade-off is universal compatibility at the cost of file size."
          },
          {
            question: "Is transparency preserved?",
            answer: "Yes, PNG supports transparency just like WebP. The conversion preserves alpha channel data, so transparent areas remain transparent."
          },
          {
            question: "When should I use PNG over WebP?",
            answer: "Use PNG when you need compatibility with older systems, for print work, or when using software that doesn't support WebP. Use WebP for web optimization."
          },
          {
            question: "Can I convert back to WebP?",
            answer: "Yes, you can convert PNG back to WebP. However, the WebP file will be larger than the original since you're converting from PNG's lossless format to WebP's compressed format."
          }
        ]} />
      </div>
    </div>
    </ToolLayout>
  );
};

export default WebPToPNGConverter;
