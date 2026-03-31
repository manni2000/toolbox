import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, RefreshCw, ArrowRight, FileImage, Sparkles } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const JPGToPNGConverter = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [preserveTransparency, setPreserveTransparency] = useState(true);
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
    if (!image) return "converted";
    const nameWithoutExt = image.name.replace(/\.[^/.]+$/, "");
    return `${nameWithoutExt}-converted.png`;
  };

  return (
    <ToolLayout
      title="JPG to PNG Converter"
      description="Convert JPG images to PNG format with transparency support"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 mb-4">
            <FileImage className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">JPG to PNG Converter</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Convert JPG images to PNG format with full transparency support. 
            Perfect for web graphics and images that need transparent backgrounds.
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <Sparkles className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-green-900">Lossless Quality</h3>
            <p className="text-sm text-green-700 mt-1">Perfect image quality preservation</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <FileImage className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-900">Transparency Support</h3>
            <p className="text-sm text-blue-700 mt-1">Supports transparent backgrounds</p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <RefreshCw className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-900">Web Optimized</h3>
            <p className="text-sm text-purple-700 mt-1">Perfect for web and graphics</p>
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
            <p className="mt-4 text-lg font-medium">Drop your JPG image here</p>
            <p className="text-sm text-muted-foreground">
              Supports JPG, JPEG, WebP, GIF, BMP and other image formats
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              title="Select JPG image file to convert"
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
                title="Clear image and reset converter"
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
              <span className="rounded-lg bg-green-500/10 px-4 py-2 font-medium text-green-700 border border-green-200">
                JPG
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <span className="rounded-lg bg-blue-500/10 px-4 py-2 font-medium text-blue-700 border border-blue-200">
                PNG
              </span>
            </div>

            {/* PNG Benefits */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-3 font-semibold text-foreground">Why Convert to PNG?</h3>
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

            {/* Convert Button */}
            <button 
              onClick={convert} 
              disabled={isConverting}
              className="btn-primary w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              title="Convert JPG image to PNG format"
            >
              <RefreshCw className={`h-5 w-5 ${isConverting ? "animate-spin" : ""}`} />
              {isConverting ? "Converting to PNG..." : "Convert to PNG"}
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
              title="JPG Converted to PNG Successfully"
              description="Your image has been converted to PNG format with lossless quality"
              fileSize={image ? `${(image.size / 1024).toFixed(1)} KB` : 'Unknown size'}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default JPGToPNGConverter;
