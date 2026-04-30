import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Maximize2, Settings, Download, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "173 80% 40%";

const ImageResizeTool = () => {
  const toolSeoData = getToolSeoMetadata('image-resize');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetSize, setTargetSize] = useState("");
  const [useTargetSize, setUseTargetSize] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    setResizedUrl(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      const img = new window.Image();
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
        setLoading(false);
        toast({
          title: "Image Loaded",
          description: `Loaded ${img.width}x${img.height} image`,
        });
      };
      img.onerror = () => {
        setLoading(false);
        toast({
          title: "Load Failed",
          description: "Failed to load the image. Please try a different file.",
          variant: "destructive",
        });
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setLoading(false);
      toast({
        title: "Read Failed",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
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

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainRatio && originalSize) {
      const ratio = originalSize.height / originalSize.width;
      setHeight(Math.round(newWidth * ratio));
    }
    setResizedUrl(null);
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainRatio && originalSize) {
      const ratio = originalSize.width / originalSize.height;
      setWidth(Math.round(newHeight * ratio));
    }
    setResizedUrl(null);
  };

  const resize = () => {
    if (!preview || width <= 0 || height <= 0) return;

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);
      
      // If target size is specified, use intelligent compression
      if (useTargetSize && targetSize) {
        const targetBytes = parseTargetSize(targetSize);
        if (targetBytes > 0) {
          resizeToTargetSize(canvas, targetBytes);
          return;
        }
      }
      
      // Standard resize without target size
      const url = canvas.toDataURL("image/png", 1);
      setResizedUrl(url);
    };
    img.src = preview;
  };

  const parseTargetSize = (sizeStr: string): number => {
    const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(kb|mb|gb)?$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2] || 'kb';
    
    switch (unit) {
      case 'kb': return Math.round(value * 1024);
      case 'mb': return Math.round(value * 1024 * 1024);
      case 'gb': return Math.round(value * 1024 * 1024 * 1024);
      default: return 0;
    }
  };

  const resizeToTargetSize = (canvas: HTMLCanvasElement, targetBytes: number) => {
    let minQuality = 0.1;
    let maxQuality = 1.0;
    let bestUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    const tryQuality = (quality: number): Promise<string | null> => {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve(null);
          }
        }, 'image/jpeg', quality);
      });
    };

    const binarySearch = async () => {
      while (minQuality <= maxQuality && attempts < maxAttempts) {
        attempts++;
        const midQuality = (minQuality + maxQuality) / 2;
        const url = await tryQuality(midQuality);
        
        if (!url) {
          maxQuality = midQuality - 0.1;
          continue;
        }

        // Check size by converting back to blob
        const response = await fetch(url);
        const blob = await response.blob();
        
        if (blob.size <= targetBytes) {
          bestUrl = url;
          minQuality = midQuality + 0.05;
        } else {
          maxQuality = midQuality - 0.05;
          URL.revokeObjectURL(url);
        }
      }

      if (bestUrl) {
        setResizedUrl(bestUrl);
      } else {
        // Fallback to lowest quality we could get
        const fallbackUrl = await tryQuality(0.1);
        if (fallbackUrl) {
          setResizedUrl(fallbackUrl);
          toast({
            title: "Target Size Unreachable",
            description: "Could not reach target size. Using smallest possible.",
            variant: "destructive",
          });
        }
      }
    };

    binarySearch();
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setOriginalSize(null);
    setWidth(0);
    setHeight(0);
    setResizedUrl(null);
  };

  const presets = [
    { label: "Instagram Post", w: 1080, h: 1080 },
    { label: "Instagram Story", w: 1080, h: 1920 },
    { label: "Facebook Cover", w: 820, h: 312 },
    { label: "Twitter Header", w: 1500, h: 500 },
    { label: "YouTube Thumbnail", w: 1280, h: 720 },
    { label: "LinkedIn Banner", w: 1584, h: 396 },
  ];

  return (
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "Image Resize",
        toolSeoData?.description || "Resize images to any custom dimension or use preset sizes",
        "image-resize"
      )}
      <ToolLayout
      breadcrumbTitle="Image Resize"
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
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}
            >
              <Maximize2 className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Precise Image Resizing</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Resize images to exact dimensions with presets for social media platforms.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">image resize</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">resize image</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">image dimensions</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">image resizer online</span>
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
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            multiple={false}
            title="Drop image here or click to browse"
            subtitle="Supports JPG, PNG, WebP, GIF up to 10MB"
          />
        )}

        {/* Image Loaded */}
        {image && (
          <motion.div variants={scaleIn} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{image.name}</span>
                {originalSize && (
                  <span className="text-sm text-muted-foreground">
                    ({originalSize.width} × {originalSize.height})
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={reset}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                title="Clear image and reset resize settings"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden flex justify-center rounded-xl border border-border bg-muted/30 p-4 shadow-lg"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 max-w-full rounded-lg object-contain relative z-10"
                />
              )}
            </motion.div>

            {/* Size Controls */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h3 className="mb-4 font-semibold flex items-center gap-2">
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <Settings className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                </motion.div>
                Resize Options
              </h3>
              
              <div className="mb-4 flex items-center gap-6">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    min={1}
                    title="Enter desired image width in pixels"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    min={1}
                    title="Enter desired image height in pixels"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={maintainRatio}
                  onChange={(e) => setMaintainRatio(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  title="Maintain aspect ratio when resizing"
                />
                <span className="text-sm">Maintain aspect ratio</span>
              </label>
            </motion.div>

            {/* Presets */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg"
            >
              <h3 className="mb-4 font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                Quick Presets
              </h3>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, index) => (
                  <motion.button
                    key={preset.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setWidth(preset.w);
                      setHeight(preset.h);
                      setMaintainRatio(false);
                      setResizedUrl(null);
                    }}
                    className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                    title={`Apply ${preset.label} preset dimensions`}
                  >
                    {preset.label} ({preset.w}×{preset.h})
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex gap-4">
              <button
                onClick={resize} 
                className="btn-primary flex-1"
                style={{ background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)` }}
                title="Resize image to specified dimensions"
              >
                <Maximize2 className="h-5 w-5 mr-2" />
                Resize Image
              </button>
            </motion.div>

            {resizedUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <EnhancedDownload
                  data={resizedUrl}
                  fileName={`resized-${width}x${height}.png`}
                  fileType="image"
                  title="Image Resized Successfully"
                  description={`Original: ${originalSize?.width}×${originalSize?.height}px → Resized: ${width}×${height}px`}
                  fileSize={image ? `${(image.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                  dimensions={{ width, height }}
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
            <Maximize2 className="h-5 w-5 text-blue-500" />
            What is Image Resizing?
          </h3>
          <p className="text-muted-foreground mb-4">
            Image resizing changes the dimensions of an image to fit specific requirements. It's essential for web optimization, social media posts, print materials, and ensuring images display correctly across different devices and platforms.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your image</li>
            <li>Set the desired width and height</li>
            <li>Choose to maintain aspect ratio or not</li>
            <li>Download the resized image</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Resize Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Custom dimensions</li>
                <li>• Aspect ratio lock</li>
                <li>• Percentage scaling</li>
                <li>• Preset sizes</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Social media posts</li>
                <li>• Website optimization</li>
                <li>• Print preparation</li>
                <li>• Thumbnail creation</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Should I maintain aspect ratio when resizing?",
            answer: "Yes, maintaining aspect ratio prevents image distortion. Only disable it if you intentionally want to change the image proportions for specific requirements."
          },
          {
            question: "What are common social media image sizes?",
            answer: "Common sizes: Instagram post 1080x1080, Twitter post 1200x675, Facebook post 1200x630, LinkedIn post 1200x627. Check platform guidelines for current specs."
          },
          {
            question: "Does resizing affect image quality?",
            answer: "Resizing down typically doesn't affect quality much. Resizing up can cause pixelation. For best results, resize from original high-resolution images."
          },
          {
            question: "What is aspect ratio?",
            answer: "Aspect ratio is the proportional relationship between width and height (e.g., 16:9, 4:3, 1:1). Maintaining it ensures images don't appear stretched or squashed."
          },
          {
            question: "Can I resize multiple images at once?",
            answer: "This tool processes one image at a time. For batch processing, you'd need to repeat the process for each image or use specialized batch processing software."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default ImageResizeTool;
