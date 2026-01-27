import { useState, useRef } from "react";
import { Upload, ScanLine, Copy, Check, X, ExternalLink } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const QRScannerTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);

      // Use jsQR library for scanning
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Simple pattern detection (for demo - real implementation needs jsQR)
        setError("QR scanning requires the jsQR library. Install it to enable full scanning functionality.");
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
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
          >
            <ScanLine className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Upload QR Code Image</p>
            <p className="text-sm text-muted-foreground">Drop an image or click to browse</p>
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
              <span className="font-medium">Uploaded Image</span>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
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
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    <button onClick={handleCopy} className="rounded-lg p-2 hover:bg-muted">
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
