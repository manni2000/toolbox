import { useState, useRef } from "react";
import { Eraser, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";

const categoryColor = "173 80% 40%";

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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
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
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.BACKGROUND_REMOVER}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Background removal result:', result);

      if (result.success && result.result?.image) {
        const imageDataUrl = `data:image/png;base64,${result.result.image}`;
        console.log('Image data URL length:', imageDataUrl.length);
        setProcessedImage(imageDataUrl);
        toast({
          title: "Success!",
          description: "Background removed successfully.",
        });
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        console.error('Background removal failed:', result);
        throw new Error(result.error || result.message || 'Failed to remove background');
      }
    } catch (error) {
      console.error('Background removal error:', error);
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
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}
            >
              <Eraser className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">AI Background Removal</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Remove backgrounds from images instantly with AI-powered precision.
              </p>
            </div>
          </div>
        </motion.div>

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
            title="Drop your image here"
            subtitle="PNG, JPG, WebP supported"
          />
        )}

        {image && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Reset image">
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
              title="Remove background from image using AI"
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
              <div ref={downloadSectionRef}>
                <EnhancedDownload
                  data={processedImage}
                  fileName={fileName.replace(/\.[^/.]+$/, "_no_bg.png")}
                  fileType="image"
                  title="Background Removed Successfully"
                  description="The background has been automatically removed from your image"
                  fileSize={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                />
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
