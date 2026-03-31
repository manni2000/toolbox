import { useState, useRef } from "react";
import { Upload, ScanLine, Copy, Check, X, ExternalLink, QrCode } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";

const QRScannerTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setImage(dataUrl);

        // Use jsQR library for scanning
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) {
            setLoading(false);
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setLoading(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Simple pattern detection (for demo - real implementation needs jsQR)
          setError("QR scanning requires the jsQR library. Install it to enable full scanning functionality.");
          toast({
            title: "Library Required",
            description: "QR scanning functionality needs additional setup. Please install the jsQR library.",
            variant: "destructive",
          });
          setLoading(false);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError("Failed to process the image file.");
      toast({
        title: "Processing Failed",
        description: "Failed to process the selected image file.",
        variant: "destructive",
      });
      setLoading(false);
    }
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

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const isUrl = result?.startsWith("http://") || result?.startsWith("https://");

  return (
    <ToolLayout
      title="QR Code Scanner"
      description="Upload an image to scan and decode QR codes"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="space-y-6">
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
            title="Upload QR Code Image"
            subtitle="Drop an image or click to browse"
          />
        )}

        {image && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">Uploaded Image</span>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear image and reset scanner">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-4">
              <img src={image} alt="QR Code" className="max-h-64 rounded-lg object-contain" />
            </div>

            {error && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
                {error}
              </div>
            )}

            {result && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-2 text-sm font-medium text-muted-foreground">Decoded Content</div>
                <div className="flex items-start justify-between gap-4">
                  <p className="flex-1 break-all font-mono text-sm">{result}</p>
                  <div className="flex gap-2">
                    {isUrl && (
                      <a
                        href={result}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 hover:bg-muted"
                        title="Open URL in new tab"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    <button onClick={handleCopy} className="rounded-lg p-2 hover:bg-muted" title="Copy decoded QR code content to clipboard">
                      {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default QRScannerTool;
