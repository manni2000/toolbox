import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, RefreshCw, ArrowRight, FileImage } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const PNGToJPGConverter = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState(95);
  const inputRef = useRef<HTMLInputElement>(null);

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

      // Fill white background for JPG (no transparency)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);
      
      // Convert to JPG with specified quality
      const url = canvas.toDataURL("image/jpeg", quality / 100);
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
    if (!image) return "converted";
    const nameWithoutExt = image.name.replace(/\.[^/.]+$/, "");
    return `${nameWithoutExt}-converted.jpg`;
  };

  return (
    <ToolLayout
      title="PNG to JPG Converter"
      description="Convert PNG images to JPG format with adjustable quality settings"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 mb-4">
            <FileImage className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">PNG to JPG Converter</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Convert PNG images to JPG format with customizable quality. 
            Perfect for reducing file size while maintaining good image quality.
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <ImageIcon className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-900">Quality Control</h3>
            <p className="text-sm text-blue-700 mt-1">Adjust JPG quality from 10-100%</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <RefreshCw className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-green-900">Fast Conversion</h3>
            <p className="text-sm text-green-700 mt-1">Instant PNG to JPG conversion</p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <FileImage className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-900">Size Reduction</h3>
            <p className="text-sm text-purple-700 mt-1">Significantly smaller file sizes</p>
          </div>
        </div>

        {/* Upload Area */}
        {!image && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop your PNG image here</p>
            <p className="text-sm text-muted-foreground">
              Supports PNG, WebP, GIF, BMP and other image formats
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {/* Preview and Convert */}
        {image && (
          <div className="space-y-6">
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
              <button
                onClick={reset}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-4">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-80 max-w-full rounded-lg object-contain"
                />
              )}
            </div>

            {/* Conversion Flow */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="rounded-lg bg-blue-500/10 px-4 py-2 font-medium text-blue-700 border border-blue-200">
                PNG
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <span className="rounded-lg bg-green-500/10 px-4 py-2 font-medium text-green-700 border border-green-200">
                JPG
              </span>
            </div>

            {/* Quality Slider */}
            <div className="rounded-xl border bg-card p-6">
              <label className="mb-3 block text-sm font-semibold text-foreground">
                JPG Quality: {quality}%
              </label>
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
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Low (10%)</span>
                <span>Medium (50%)</span>
                <span>High (100%)</span>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {quality <= 30 && "Low quality - Very small file size"}
                  {quality > 30 && quality <= 70 && "Medium quality - Balanced size and quality"}
                  {quality > 70 && "High quality - Best image quality"}
                </p>
              </div>
            </div>

            {/* Convert Button */}
            <button 
              onClick={convert} 
              disabled={isConverting}
              className="btn-primary w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <RefreshCw className={`h-5 w-5 ${isConverting ? "animate-spin" : ""}`} />
              {isConverting ? "Converting to JPG..." : "Convert to JPG"}
            </button>
          </div>
        )}

        {/* Download Section */}
        {convertedUrl && (
          <div id="download-section" className="flex justify-center">
            <EnhancedDownload
              data={convertedUrl}
              fileName={getFileName()}
              fileType="image"
              title="PNG Converted to JPG Successfully"
              description={`Your image has been converted to JPG format at ${quality}% quality`}
              fileSize={image ? `${(image.size / 1024).toFixed(1)} KB` : 'Unknown size'}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PNGToJPGConverter;
