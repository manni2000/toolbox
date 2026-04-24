import { useState, useCallback, useRef } from "react";
import { Upload, Image, X, Zap, Settings, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { useToast } from "@/hooks/use-toast";
import { CategorySEO } from "@/components/ToolSEO";
import ToolFAQ from "@/components/ToolFAQ";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "173 80% 40%";

const ImageCompressorTool = () => {
  const toolSeoData = getToolSeoMetadata('image-compressor');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(95);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop a valid image file.",
        variant: "destructive",
      });
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid image file (JPG, PNG, WebP, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setImage(file);
    setOriginalSize(file.size);
    setCompressedUrl(null);
    setCompressedSize(0);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    toast({
      title: "Image Loaded",
      description: `Loaded ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const compressImage = () => {
    if (!image || !preview) return;

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize(blob.size);
            setCompressedUrl(URL.createObjectURL(blob));
          }
        },
        "image/webp",
        quality / 100
      );
    };
    img.src = preview;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const reduction = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "Image Compressor",
        toolSeoData?.description || "Compress images while maintaining quality",
        "image-compressor"
      )}
      <ToolLayout
        title={toolSeoData?.title || "Image Compressor"}
        description={toolSeoData?.description || "Compress images while maintaining quality"}
        category="Image Tools"
        categoryPath="/category/image"
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
              <Zap className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Smart Image Compression</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Reduce image file sizes by up to 90% while maintaining visual quality. Perfect for web optimization.
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
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            multiple={false}
            title="Drop image here or click to browse"
            subtitle="Supports JPG, PNG, WebP, GIF up to 10MB"
          />
        )}

        {/* Image Preview */}
        {image && (
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{image.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({formatSize(originalSize)})
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setImage(null); setPreview(null); setCompressedUrl(null); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                title="Clear image"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border bg-muted/30 p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <p className="mb-2 text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
                  Original
                </p>
                {preview && (
                  <motion.div className="relative overflow-hidden rounded-lg">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 1,
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"
                    />
                    <img
                      src={preview}
                      alt="Original"
                      className="max-h-64 w-full rounded-lg object-contain"
                    />
                  </motion.div>
                )}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-muted/30 p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <p className="mb-2 text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Compressed {compressedUrl && (
                    <span className="text-green-600 font-semibold">
                      ({formatSize(compressedSize)} - {reduction}% smaller)
                    </span>
                  )}
                </p>
                {compressedUrl ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative overflow-hidden rounded-lg"
                  >
                    <img
                      src={compressedUrl}
                      alt="Compressed"
                      className="max-h-64 w-full rounded-lg object-contain"
                    />
                  </motion.div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    Click compress to see result
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quality Slider */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                  </motion.div>
                  Quality Level
                </label>
                <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ 
                  backgroundColor: `hsl(${categoryColor} / 0.15)`,
                  color: `hsl(${categoryColor})`
                }}>
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-primary h-2 rounded-lg"
                title="Adjust image compression quality"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Maximum Compression</span>
                <span>Best Quality</span>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="flex gap-4"
            >
              <button
                onClick={compressImage} 
                className="btn-primary flex-1"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
                title="Compress image with selected quality"
              >
                <Zap className="h-5 w-5 mr-2" />
                Compress Image
              </button>
            </motion.div>

            {compressedUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <EnhancedDownload
                  data={compressedUrl}
                  fileName={image.name.replace(/\.[^/.]+$/, ".webp")}
                  fileType="image"
                  title="Image Compressed Successfully"
                  description={`Original: ${(originalSize / 1024).toFixed(1)}KB → Compressed: ${(compressedSize / 1024).toFixed(1)}KB (${Math.round((1 - compressedSize / originalSize) * 100)}% reduction)`}
                  fileSize={`${(compressedSize / 1024).toFixed(1)} KB`}
                />
              </motion.div>
            )}
          </motion.div>
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
            What is Image Compression?
          </h3>
          <p className="text-muted-foreground mb-4">
            Image compression reduces file size while maintaining acceptable visual quality. It optimizes images for web use by removing unnecessary data, improving page load times and reducing bandwidth usage without significant quality loss.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your image (JPG, PNG, WebP)</li>
            <li>Adjust the quality slider (1-100)</li>
            <li>The tool compresses the image</li>
            <li>Download the optimized image</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Compression Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Quality control slider</li>
                <li>• Size reduction preview</li>
                <li>• Multiple format support</li>
                <li>• Batch processing</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Web Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Faster page loads</li>
                <li>• Reduced bandwidth</li>
                <li>• Better SEO ranking</li>
                <li>• Improved UX</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What quality should I use for web images?",
            answer: "For web images, quality 70-85% is typically sufficient. This provides good visual quality while significantly reducing file size. Higher quality (85-95%) for important images."
          },
          {
            question: "Does compression affect image quality?",
            answer: "Compression can affect quality, especially at low settings. At quality 70%+, most images show minimal visible difference. Always preview before finalizing."
          },
          {
            question: "What's the difference between lossy and lossless compression?",
            answer: "Lossy compression (JPG) removes data permanently for smaller size. Lossless compression (PNG) preserves all data but results in larger files. Choose based on image type."
          },
          {
            question: "Can I compress PNG images?",
            answer: "Yes, PNG compression is available but less effective than JPG since PNG is lossless. For photos, convert to JPG first for better compression ratios."
          },
          {
            question: "How much can I reduce file size?",
            answer: "Typical compression reduces file size by 50-80% for JPG images at quality 80%. PNG images may see 10-30% reduction. Results vary by image content."
          }
        ]} />
      </div>
    </ToolLayout>
    </>
  );
};

export default ImageCompressorTool;
