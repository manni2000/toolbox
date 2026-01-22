import { useState, useRef } from "react";
import { Download, Upload, Image as ImageIcon, X, Maximize2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const ImageResizeTool = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImage(file);
    setResizedUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      const img = new window.Image();
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
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
      title="Image Resize Tool"
      description="Resize images to any custom dimension or use preset sizes"
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
            <p className="text-sm text-muted-foreground">Supports PNG, JPG, WebP, GIF</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {/* Image Loaded */}
        {image && (
          <div className="space-y-6">
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
                  className="max-h-64 max-w-full rounded-lg object-contain"
                />
              )}
            </div>

            {/* Size Controls */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Resize Options</h3>
              
              <div className="mb-4 flex items-center gap-6">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    min={1}
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
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={maintainRatio}
                  onChange={(e) => setMaintainRatio(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Maintain aspect ratio</span>
              </label>
            </div>

            {/* Presets */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Quick Presets</h3>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setWidth(preset.w);
                      setHeight(preset.h);
                      setMaintainRatio(false);
                      setResizedUrl(null);
                    }}
                    className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    {preset.label} ({preset.w}×{preset.h})
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={resize} className="btn-primary flex-1">
                <Maximize2 className="h-5 w-5" />
                Resize Image
              </button>
              {resizedUrl && (
                <a
                  href={resizedUrl}
                  download={`resized-${width}x${height}.png`}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download
                </a>
              )}
            </div>

            {resizedUrl && (
              <p className="text-center text-sm text-muted-foreground">
                ✓ Resized to {width} × {height}px. Click download to save.
              </p>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageResizeTool;
