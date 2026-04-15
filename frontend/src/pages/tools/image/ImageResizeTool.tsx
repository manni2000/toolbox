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

const categoryColor = "173 80% 40%";

const ImageResizeTool = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const url = canvas.toDataURL("image/png", 1);
      setResizedUrl(url);
    };
    img.src = preview;
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
    <ToolLayout
      title="Image Resize"
      description="Resize images to any custom dimension or use preset sizes"
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

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default ImageResizeTool;
