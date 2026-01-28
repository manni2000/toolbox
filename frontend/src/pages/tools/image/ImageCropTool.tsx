import { useState, useRef } from "react";
import { Upload, Crop, X, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const ImageCropTool = () => {
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
    <ToolLayout
      title="Image Crop Tool"
      description="Crop images with custom dimensions or preset aspect ratios"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
        {!image && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
          >
            <Crop className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop your image here</p>
            <p className="text-sm text-muted-foreground">Supports PNG, JPG, WebP</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {image && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Original: {originalSize.width} × {originalSize.height}px
              </span>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.ratio)}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setCropArea({ x: 0, y: 0, width: originalSize.width, height: originalSize.height })}
                className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            {/* Crop Controls */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">X Position</label>
                <input
                  type="number"
                  value={cropArea.x}
                  onChange={(e) => setCropArea({ ...cropArea, x: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                  min={0}
                  max={originalSize.width - cropArea.width}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Y Position</label>
                <input
                  type="number"
                  value={cropArea.y}
                  onChange={(e) => setCropArea({ ...cropArea, y: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                  min={0}
                  max={originalSize.height - cropArea.height}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Width</label>
                <input
                  type="number"
                  value={cropArea.width}
                  onChange={(e) => setCropArea({ ...cropArea, width: parseInt(e.target.value) || 100 })}
                  className="input-field w-full"
                  min={1}
                  max={originalSize.width - cropArea.x}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Height</label>
                <input
                  type="number"
                  value={cropArea.height}
                  onChange={(e) => setCropArea({ ...cropArea, height: parseInt(e.target.value) || 100 })}
                  className="input-field w-full"
                  min={1}
                  max={originalSize.height - cropArea.y}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-4">
              <img src={image} alt="Preview" className="max-h-64 rounded-lg object-contain" />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={crop} className="btn-primary flex-1">
                <Crop className="h-5 w-5" />
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
      </div>
    </ToolLayout>
  );
};

export default ImageCropTool;
