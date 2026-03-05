import { useState, useCallback } from "react";
import { Upload, Image, X, Zap, Settings, Download } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { useToast } from "@/hooks/use-toast";

const ImageCompressorTool = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop a valid image file.",
        variant: "destructive",
      });
    }
  }, []);

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
    setOriginalSize(file.size);
    setCompressedUrl(null);
    setCompressedSize(0);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    toast({
      title: "Image Loaded",
      description: `Loaded ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const compressImage = () => {
    if (!image || !preview) return;

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize(blob.size);
            setCompressedUrl(URL.createObjectURL(blob));
          }
        },
        "image/webp",
        quality / 100
      );
    };
    img.src = preview;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const reduction = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <ToolLayout
      title="Image Compressor"
      description="Compress images while maintaining quality"
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
            className={`file-drop ${isDragging ? "drag-over" : ""}`}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop your image here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        )}

        {/* Image Preview */}
        {image && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{image.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({formatSize(originalSize)})
                </span>
              </div>
              <button
                onClick={() => { setImage(null); setPreview(null); setCompressedUrl(null); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2 text-sm font-medium">Original</p>
                {preview && (
                  <img
                    src={preview}
                    alt="Original"
                    className="max-h-64 w-full rounded-lg object-contain"
                  />
                )}
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2 text-sm font-medium">
                  Compressed {compressedUrl && `(${formatSize(compressedSize)} - ${reduction}% smaller)`}
                </p>
                {compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed"
                    className="max-h-64 w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    Click compress to see result
                  </div>
                )}
              </div>
            </div>

            {/* Quality Slider */}
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-medium">Quality</label>
                <span className="text-sm text-muted-foreground">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={compressImage} className="btn-primary flex-1">
                Compress Image
              </button>
            </div>

            {compressedUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={compressedUrl}
                  fileName={`compressed-${image.name.split('.')[0]}.webp`}
                  fileType="image"
                  title="Image Compressed Successfully"
                  description={`Original: ${(originalSize / 1024).toFixed(1)}KB → Compressed: ${(compressedSize / 1024).toFixed(1)}KB (${Math.round((1 - compressedSize / originalSize) * 100)}% reduction)`}
                  fileSize={`${(compressedSize / 1024).toFixed(1)} KB`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageCompressorTool;
