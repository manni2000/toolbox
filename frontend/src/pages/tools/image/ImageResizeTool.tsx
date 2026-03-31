import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Maximize2, Settings, Download } from "lucide-react";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { useToast } from "@/hooks/use-toast";

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
                title="Clear image and reset resize settings"
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
                    title={`Apply ${preset.label} preset dimensions`}
                  >
                    {preset.label} ({preset.w}×{preset.h})
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={resize} className="btn-primary flex-1" title="Resize image to specified dimensions">
                <Maximize2 className="h-5 w-5" />
                Resize Image
              </button>
            </div>

            {resizedUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={resizedUrl}
                  fileName={`resized-${width}x${height}.png`}
                  fileType="image"
                  title="Image Resized Successfully"
                  description={`Original: ${originalSize?.width}×${originalSize?.height}px → Resized: ${width}×${height}px`}
                  fileSize={image ? `${(image.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                  dimensions={{ width, height }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageResizeTool;
