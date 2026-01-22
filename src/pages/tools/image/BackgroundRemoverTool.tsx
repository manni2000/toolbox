import { useState, useRef } from "react";
import { Upload, Eraser, AlertCircle, Image as ImageIcon, X } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const BackgroundRemoverTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setImage(null);
    setFileName("");
  };

  return (
    <ToolLayout
      title="Image Background Remover"
      description="Remove backgrounds from images automatically"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
        {/* Info Notice */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                Backend Processing Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Background removal requires server-side processing using libraries like rembg. 
                This tool needs backend integration with Lovable Cloud to function. 
                The preview below shows your uploaded image.
              </p>
            </div>
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
            <Eraser className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop your image here</p>
            <p className="text-sm text-muted-foreground">PNG, JPG, WebP supported</p>
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
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Original</h3>
                <div className="flex justify-center rounded-lg bg-muted/30 p-4">
                  <img src={image} alt="Original" className="max-h-64 rounded-lg object-contain" />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Result (Preview)</h3>
                <div
                  className="flex items-center justify-center rounded-lg p-4"
                  style={{
                    backgroundImage: `linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
                      linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
                      linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                >
                  <img src={image} alt="Result" className="max-h-64 rounded-lg object-contain opacity-50" />
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Actual processing requires backend integration
                </p>
              </div>
            </div>

            {/* Disabled Action Button */}
            <button
              disabled
              className="btn-primary w-full cursor-not-allowed opacity-50"
            >
              <Eraser className="h-5 w-5" />
              Remove Background
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Enable Lovable Cloud to process images with AI-powered background removal
            </p>
          </div>
        )}

        {/* How It Works */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">How It Works</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">1. Upload:</strong> Select an image with a clear subject
            </p>
            <p>
              <strong className="text-foreground">2. Process:</strong> AI detects and separates the subject from background
            </p>
            <p>
              <strong className="text-foreground">3. Download:</strong> Get your transparent PNG with the background removed
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default BackgroundRemoverTool;
