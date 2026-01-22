import { useState, useRef } from "react";
import { Download, Upload, Image as ImageIcon, X, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const ImageConverterTool = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formats: { value: OutputFormat; label: string; ext: string }[] = [
    { value: "image/png", label: "PNG", ext: "png" },
    { value: "image/jpeg", label: "JPEG", ext: "jpg" },
    { value: "image/webp", label: "WebP", ext: "webp" },
  ];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
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

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill white background for JPEG (no transparency)
      if (outputFormat === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      const url = canvas.toDataURL(outputFormat, 0.95);
      setConvertedUrl(url);
    };
    img.src = preview;
  };

  const getExtension = () => formats.find((f) => f.value === outputFormat)?.ext || "png";

  const reset = () => {
    setImage(null);
    setPreview(null);
    setConvertedUrl(null);
  };

  return (
    <ToolLayout
      title="Image Format Converter"
      description="Convert between JPG, PNG, WebP formats"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-8">
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
            <p className="text-sm text-muted-foreground">Supports PNG, JPG, WebP, GIF, BMP</p>
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
                <span className="font-medium">{image.name}</span>
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

            {/* Format Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Convert to</label>
              <div className="flex flex-wrap gap-2">
                {formats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => { setOutputFormat(format.value); setConvertedUrl(null); }}
                    className={`rounded-lg px-6 py-3 font-medium transition-all ${
                      outputFormat === format.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={convert} className="btn-primary flex-1">
                <RefreshCw className="h-5 w-5" />
                Convert
              </button>
              {convertedUrl && (
                <a
                  href={convertedUrl}
                  download={`converted.${getExtension()}`}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download {getExtension().toUpperCase()}
                </a>
              )}
            </div>

            {convertedUrl && (
              <p className="text-center text-sm text-muted-foreground">
                ✓ Conversion complete! Click download to save.
              </p>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageConverterTool;
