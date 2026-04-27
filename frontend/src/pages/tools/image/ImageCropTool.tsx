import { useState, useRef } from "react";
import { Upload, Crop, X, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp} from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
const categoryColor = "173 80% 40%";

const ImageCropTool = () => {
  const toolSeoData = getToolSeoMetadata('image-crop');
  const [image, setImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setCroppedUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height });
        setCropArea({ x: 0, y: 0, width: img.width, height: img.height });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const crop = () => {
    if (!image) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      setCroppedUrl(canvas.toDataURL("image/png"));
    };
    img.src = image;
  };

  const reset = () => {
    setImage(null);
    setCroppedUrl(null);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  };

  const presets = [
    { label: "Square 1:1", ratio: 1 },
    { label: "Portrait 4:5", ratio: 4 / 5 },
    { label: "Landscape 16:9", ratio: 16 / 9 },
    { label: "Story 9:16", ratio: 9 / 16 },
  ];

  const applyPreset = (ratio: number) => {
    if (!originalSize.width) return;
    let newWidth = originalSize.width;
    let newHeight = Math.round(newWidth / ratio);

    if (newHeight > originalSize.height) {
      newHeight = originalSize.height;
      newWidth = Math.round(newHeight * ratio);
    }

    setCropArea({
      x: Math.round((originalSize.width - newWidth) / 2),
      y: Math.round((originalSize.height - newHeight) / 2),
      width: newWidth,
      height: newHeight,
    });
    setCroppedUrl(null);
  };

  return (
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "Image Crop Tool",
        toolSeoData?.description || "Crop images with custom dimensions or preset aspect ratios",
        "image-crop"
      )}
      <ToolLayout
      title="Image Crop Tool"
      description="Crop images with custom dimensions or preset aspect ratios"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
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
              <Crop className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Precision Image Cropping</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Crop images to exact dimensions with preset aspect ratios for social media and more.
              </p>
            </div>
          </div>
        </motion.div>

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

        {image && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="font-medium text-sm sm:text-base">
                Original: {originalSize.width} × {originalSize.height}px
              </span>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted self-start sm:self-auto" title="Reset crop area">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.ratio)}
                  className="rounded-lg bg-secondary px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium transition-colors hover:bg-secondary/80"
                  title={`Apply ${preset.label} aspect ratio preset`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setCropArea({ x: 0, y: 0, width: originalSize.width, height: originalSize.height })}
                className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium transition-colors hover:bg-secondary/80"
                title="Reset crop area to full image"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reset</span>
                <span className="sm:hidden">Rst</span>
              </button>
            </div>

              {/* Crop Controls */}
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium">X Position</label>
                  <input
                    type="number"
                    value={cropArea.x}
                    onChange={(e) => setCropArea({ ...cropArea, x: parseInt(e.target.value) || 0 })}
                    className="input-field w-full text-sm"
                    min={0}
                    max={originalSize.width - cropArea.width}
                    title="Set horizontal starting position in pixels"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium">Y Position</label>
                  <input
                    type="number"
                    value={cropArea.y}
                    onChange={(e) => setCropArea({ ...cropArea, y: parseInt(e.target.value) || 0 })}
                    className="input-field w-full text-sm"
                    min={0}
                    max={originalSize.height - cropArea.height}
                    title="Set vertical starting position in pixels"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium">Width</label>
                  <input
                    type="number"
                    value={cropArea.width}
                    onChange={(e) => setCropArea({ ...cropArea, width: parseInt(e.target.value) || 100 })}
                    className="input-field w-full text-sm"
                    min={1}
                    max={originalSize.width - cropArea.x}
                    title="Set crop width in pixels"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium">Height</label>
                  <input
                    type="number"
                    value={cropArea.height}
                    onChange={(e) => setCropArea({ ...cropArea, height: parseInt(e.target.value) || 100 })}
                    className="input-field w-full text-sm"
                    min={1}
                    max={originalSize.height - cropArea.y}
                    title="Set crop height in pixels"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-4">
                <img src={image} alt="Preview" className="max-h-64 rounded-lg object-contain" />
              </div>

              {/* Actions */}
              <div className="flex gap-3 sm:gap-4">
                <button onClick={crop} className="btn-primary flex-1 text-sm sm:text-base py-3 sm:py-4" title="Crop image with specified dimensions">
                  <Crop className="h-4 w-4 sm:h-5 sm:w-5" />
                  Crop Image
                </button>
              </div>

              {croppedUrl && (
                <div className="flex justify-center mt-6">
                  <EnhancedDownload
                    data={croppedUrl}
                    fileName={`cropped-${cropArea.width}x${cropArea.height}.png`}
                    fileType="image"
                    title="Image Cropped Successfully"
                    description={`Cropped to ${cropArea.width}×${cropArea.height}px from original ${originalSize.width}×${originalSize.height}px`}
                    fileSize="Unknown size"
                    dimensions={{ width: cropArea.width, height: cropArea.height }}
                  />
                </div>
              )}
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
              <Crop className="h-5 w-5 text-blue-500" />
              What is Image Cropping?
            </h3>
            <p className="text-muted-foreground mb-4">
              Image cropping removes unwanted outer portions of an image to focus on the main subject or improve composition. It's essential for creating profile pictures, product images, and removing distracting elements from photos.
            </p>
            
            <h4 className="font-semibold mb-2">How It Works</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>Upload your image</li>
              <li>Drag to define the crop area</li>
              <li>Adjust the selection as needed</li>
              <li>Download the cropped image</li>
            </ol>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Cropping Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Drag selection area</li>
                  <li>• Visual preview</li>
                  <li>• Aspect ratio options</li>
                  <li>• Multiple formats</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Profile pictures</li>
                  <li>• Product photos</li>
                  <li>• Social media</li>
                  <li>• Removing backgrounds</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8">
          {/* FAQ Section */}
          <ToolFAQ faqs={[
            {
              question: "How do I get a perfect square crop?",
              answer: "Most tools have aspect ratio lock options. Set it to 1:1 for square, or manually adjust until width equals height. Use grid overlays for precision."
            },
            {
              question: "Can I undo a crop?",
              answer: "Always keep your original image. If you make a mistake, reload the original and crop again. Cropping is destructive - always work from copies."
            },
            {
              question: "What's the best aspect ratio for profile pictures?",
              answer: "Most platforms prefer 1:1 (square) for profile pictures. Instagram uses 1:1, LinkedIn uses 1:1, Twitter uses 1:1 for avatars. Check specific platform guidelines."
            },
            {
              question: "Does cropping reduce image quality?",
              answer: "Cropping itself doesn't reduce quality, but if you then resize the cropped image significantly larger, it may appear pixelated. Always crop at original resolution."
            },
            {
              question: "Can I crop to specific dimensions?",
              answer: "Yes, many tools allow setting exact pixel dimensions. Enter your target width and height, and the crop tool will guide you to that exact size."
            }
          ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default ImageCropTool;
