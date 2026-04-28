import { useState } from "react";
import { Image as ImageIcon, X, RefreshCw, ArrowRight, FileImage, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "173 80% 40%";

const JPGToWebPConverter = () => {
  const toolSeoData = getToolSeoMetadata('jpg-to-webp');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState(85);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    setImage(file);
    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setConvertedUrl(null);
    setConvertedSize(0);
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
      formData.append('format', 'webp');
      formData.append('quality', quality.toString());

      const response = await fetch('/api/image/convert', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        setConvertedSize(blob.size);
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
    setConvertedSize(0);
    setOriginalSize(0);
  };

  const getFileName = () => {
    if (!image) return "converted.webp";
    return image.name.replace(/\.[^/.]+$/, ".webp");
  };

  const getSizeReduction = () => {
    if (!originalSize || !convertedSize) return 0;
    return ((originalSize - convertedSize) / originalSize * 100).toFixed(1);
  };

  return (
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "JPG to WebP Converter",
        toolSeoData?.description || "Convert JPG images to WebP format for better compression and web performance",
        "jpg-to-webp-converter"
      )}
      <ToolLayout
      title="JPG to WebP Converter"
      description="Convert JPG images to WebP format for better compression and web performance"
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
              <h2 className="text-2xl font-bold">Quick JPG to WebP Conversion</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert JPG images to modern WebP format for superior compression and faster web loading.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">jpg to webp</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">convert jpg to webp</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">jpeg to webp</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">webp converter</span>
              </div>
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
            subtitle="Supports JPG, JPEG, PNG, GIF, BMP and other image formats up to 10MB"
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

            {/* Quality Slider */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Output Quality</h3>
                <span className="rounded-lg bg-primary/10 px-3 py-1 font-medium text-primary">{quality}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Higher quality</span>
              </div>
            </div>

            {/* Conversion Flow */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="rounded-lg bg-green-500/10 px-4 py-2 font-medium text-green-700 border border-green-200">
                JPG
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <span className="rounded-lg bg-purple-500/10 px-4 py-2 font-medium text-purple-700 border border-purple-200">
                WebP
              </span>
            </div>

            {/* Size Comparison */}
            {convertedSize > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-500" />
                  Size Reduction
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Original</div>
                    <div className="text-lg font-semibold">{(originalSize / 1024).toFixed(1)} KB</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">WebP</div>
                    <div className="text-lg font-semibold">{(convertedSize / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Saved</div>
                    <div className="text-lg font-semibold text-green-600">{getSizeReduction()}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* WebP Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <div className="mb-3 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                </motion.div>
                <h3 className="font-semibold text-foreground">Why Convert to WebP?</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm text-muted-foreground">25-35% smaller than JPG at same quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Faster web page loading</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Supports transparency and animation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-sm text-muted-foreground">Supported by all modern browsers</span>
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
                  title="Convert JPG image to WebP format"
                >
                  <RefreshCw className="h-5 w-5" />
                  Convert to WebP
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
              title="JPG Converted to WebP Successfully"
              description={`Your JPG image has been converted to WebP format at ${quality}% quality`}
              fileSize={convertedSize ? `${(convertedSize / 1024).toFixed(1)} KB` : 'Unknown size'}
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
            What is JPG to WebP Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            JPG to WebP conversion transforms JPEG images into the modern WebP format. WebP provides superior compression, typically reducing file size by 25-35% while maintaining the same visual quality, resulting in faster web page loading.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your JPG image</li>
            <li>Adjust the quality slider (1-100%)</li>
            <li>The tool converts it to WebP format</li>
            <li>Download the optimized WebP file</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">WebP Advantages</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 25-35% smaller files</li>
                <li>• Faster loading</li>
                <li>• Supports transparency</li>
                <li>• Supports animation</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Best Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Web optimization</li>
                <li>• Modern websites</li>
                <li>• Faster page loads</li>
                <li>• Bandwidth savings</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why convert JPG to WebP?",
            answer: "WebP provides 25-35% better compression than JPG at the same quality level. This means faster loading websites and lower bandwidth costs without sacrificing visual quality."
          },
          {
            question: "What quality should I use?",
            answer: "For web use, 80-85% quality is recommended as it provides excellent visual quality with significant file size reduction. For print or high-quality needs, use 90-100%."
          },
          {
            question: "Is WebP supported everywhere?",
            answer: "WebP is supported by all modern browsers (Chrome, Firefox, Edge, Safari). For older browsers, you may need to provide fallback images or use picture tags with source alternatives."
          },
          {
            question: "Will I lose quality?",
            answer: "At quality settings of 80% and above, visual quality is virtually identical to JPG. The compression algorithm is more efficient, so you get smaller files with the same perceived quality."
          },
          {
            question: "Can WebP support transparency?",
            answer: "Yes, WebP supports alpha channel transparency like PNG. However, when converting from JPG (which doesn't support transparency), the result will be opaque."
          }
        ]} />
      </div>
    </div>
    </ToolLayout>
      </>
  );
};

export default JPGToWebPConverter;
