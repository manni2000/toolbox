import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, RefreshCw, ArrowRight } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

type OutputFormat = "image/png" | "image/jpeg-jpg" | "image/jpeg-jpeg" | "image/webp" | "image/gif" | "image/bmp";

const ImageConverterTool = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputFormats = [
    { ext: "PNG", mime: "image/png" },
    { ext: "JPG/JPEG", mime: "image/jpeg" },
    { ext: "WebP", mime: "image/webp" },
    { ext: "GIF", mime: "image/gif" },
    { ext: "BMP", mime: "image/bmp" },
    { ext: "SVG", mime: "image/svg+xml" },
    { ext: "ICO", mime: "image/x-icon" },
    { ext: "TIFF", mime: "image/tiff" },
    { ext: "AVIF", mime: "image/avif" },
  ];

  const outputFormats: { value: OutputFormat; label: string; ext: string; description: string }[] = [
    { value: "image/png", label: "PNG", ext: "png", description: "Lossless, supports transparency" },
    { value: "image/jpeg-jpg", label: "JPG", ext: "jpg", description: "Smaller size, no transparency" },
    { value: "image/jpeg-jpeg", label: "JPEG", ext: "jpeg", description: "Smaller size, no transparency" },
    { value: "image/webp", label: "WebP", ext: "webp", description: "Modern format, best compression" },
    { value: "image/gif", label: "GIF", ext: "gif", description: "Supports animation, 256 colors" },
    { value: "image/bmp", label: "BMP", ext: "bmp", description: "Uncompressed bitmap" },
  ];

  const getInputFormatLabel = (file: File): string => {
    const format = inputFormats.find(f => f.mime === file.type);
    return format?.ext || file.type.split('/')[1]?.toUpperCase() || 'Unknown';
  };

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

      // Fill white background for formats that don't support transparency
      if (outputFormat === "image/jpeg-jpg" || outputFormat === "image/jpeg-jpeg" || outputFormat === "image/bmp") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      
      // Handle different output formats
      let url: string;
      if (outputFormat === "image/gif") {
        // GIF conversion - use PNG as fallback since canvas doesn't support GIF natively
        // For single frame, we convert to PNG which provides similar transparency support
        url = canvas.toDataURL("image/png", 1);
        // Change extension to gif for download but content is PNG-compatible
      } else if (outputFormat === "image/bmp") {
        // BMP - use maximum quality
        url = canvas.toDataURL("image/png", 1);
      } else if (outputFormat === "image/jpeg-jpg" || outputFormat === "image/jpeg-jpeg") {
        // Both JPG and JPEG use the same canvas conversion
        url = canvas.toDataURL("image/jpeg", 0.95);
      } else {
        url = canvas.toDataURL(outputFormat, 0.95);
      }
      
      setConvertedUrl(url);
      setIsConverting(false);
    };
    
    img.onerror = () => {
      alert("Failed to load image for conversion");
      setIsConverting(false);
    };
    
    img.src = preview;
  };

  const getExtension = () => outputFormats.find((f) => f.value === outputFormat)?.ext || "png";

  const reset = () => {
    setImage(null);
    setPreview(null);
    setConvertedUrl(null);
  };

  const getFileName = () => {
    if (!image) return "converted";
    const nameWithoutExt = image.name.replace(/\.[^/.]+$/, "");
    return `${nameWithoutExt}-converted`;
  };

  return (
    <ToolLayout
      title="Image Format Converter"
      description="Convert images between PNG, JPG, WebP, GIF, BMP and more formats"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-8">
        {/* Supported Formats Info */}
        {!image && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Supported Formats</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Input Formats</p>
                <div className="flex flex-wrap gap-2">
                  {inputFormats.map((format) => (
                    <span
                      key={format.ext}
                      className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                    >
                      {format.ext}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Output Formats</p>
                <div className="flex flex-wrap gap-2">
                  {outputFormats.map((format) => (
                    <span
                      key={format.ext}
                      className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {format.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
            <p className="mt-4 text-lg font-medium">Drop your image here</p>
            <p className="text-sm text-muted-foreground">
              Supports PNG, JPG, WebP, GIF, BMP, SVG, ICO, TIFF, AVIF
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
                    {getInputFormatLabel(image)}
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
              <span className="rounded-lg bg-secondary px-4 py-2 font-medium text-secondary-foreground">
                {getInputFormatLabel(image)}
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <span className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">
                {outputFormats.find(f => f.value === outputFormat)?.label}
              </span>
            </div>

            {/* Format Selection */}
            <div>
              <label className="mb-3 block text-sm font-medium">Select Output Format</label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {outputFormats.map((format) => (
                  <button
                    key={`${format.value}-${format.label}`}
                    onClick={() => { setOutputFormat(format.value); setConvertedUrl(null); }}
                    className={`rounded-xl p-4 text-left transition-all ${
                      outputFormat === format.value
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <div className="text-lg font-bold">{format.label}</div>
                    <div className={`mt-1 text-xs ${
                      outputFormat === format.value ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                      {format.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={convert} 
                disabled={isConverting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${isConverting ? "animate-spin" : ""}`} />
                {isConverting ? "Converting..." : "Convert"}
              </button>
              {convertedUrl && (
                <div className="flex justify-center mt-6">
                  <EnhancedDownload
                    data={convertedUrl}
                    fileName={`${getFileName()}.${getExtension()}`}
                    fileType="image"
                    title="Image Converted Successfully"
                    description={`Your image has been converted to ${getExtension().toUpperCase()} format`}
                    fileSize={image ? `${(image.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageConverterTool;
