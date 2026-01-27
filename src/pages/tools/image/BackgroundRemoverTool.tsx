import { useState, useRef } from "react";
import { Upload, Eraser, Image as ImageIcon, X, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";

const BackgroundRemoverTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setFile(file);
    fileRef.current = file;
    setProcessedImage(null);

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
    setProcessedImage(null);
    setFileName("");
    fileRef.current = null;
  };

  const removeBackground = async () => {
    if (!fileRef.current) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('image', fileRef.current);

    try {
      const response = await fetch('http://localhost:8000/api/image/remove-background/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setProcessedImage(result.image);
        toast({
          title: "Success!",
          description: "Background removed successfully.",
        });
        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to remove background');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove background",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Image Background Remover"
      description="Remove backgrounds from images automatically"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
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
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Background Removed</h3>
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
                  {processedImage ? (
                    <img src={processedImage} alt="Result" className="max-h-64 rounded-lg object-contain" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>Click "Remove Background" to process</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={removeBackground}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Eraser className="h-5 w-5" />
                  Remove Background
                </>
              )}
            </button>
            
            {processedImage && (
              <div ref={downloadSectionRef} className="space-y-4">
                <h3 className="text-lg font-medium text-center">Background Removed</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-32 h-32 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
                        {processedImage && (
                          <img 
                            src={processedImage} 
                            alt="Processed image" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Background has been removed from your image</p>
                      <p className="font-medium">{fileName.replace(/\.[^/.]+$/, "_no_bg.png")}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={processedImage}
                        download={`no_bg_${fileName}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 flex-1"
                      >
                        <ImageIcon className="h-5 w-5" />
                        Download Image
                      </a>
                      <button 
                        onClick={reset} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <X className="h-5 w-5" />
                        Start Over
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
