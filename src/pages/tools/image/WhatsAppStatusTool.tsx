import { useState, useRef } from "react";
import { Upload, Download, Smartphone, X, Type } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const WhatsAppStatusTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("center");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(48);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const STATUS_WIDTH = 1080;
  const STATUS_HEIGHT = 1920;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setResultUrl(null);

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

  const generate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = STATUS_WIDTH;
    canvas.height = STATUS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, STATUS_WIDTH, STATUS_HEIGHT);

    const drawText = () => {
      if (!text) return;

      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";

      const lines = text.split("\n");
      const lineHeight = fontSize * 1.3;
      const totalHeight = lines.length * lineHeight;

      let startY: number;
      if (textPosition === "top") startY = 150;
      else if (textPosition === "bottom") startY = STATUS_HEIGHT - totalHeight - 100;
      else startY = (STATUS_HEIGHT - totalHeight) / 2;

      // Text shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, STATUS_WIDTH / 2, startY + i * lineHeight);
      });

      ctx.shadowColor = "transparent";
    };

    if (image) {
      const img = new Image();
      img.onload = () => {
        // Cover fit
        const scale = Math.max(STATUS_WIDTH / img.width, STATUS_HEIGHT / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (STATUS_WIDTH - scaledWidth) / 2;
        const y = (STATUS_HEIGHT - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        drawText();
        setResultUrl(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = image;
    } else {
      drawText();
      setResultUrl(canvas.toDataURL("image/jpeg", 0.95));
    }
  };

  const reset = () => {
    setImage(null);
    setText("");
    setResultUrl(null);
  };

  return (
    <ToolLayout
      title="WhatsApp Status Generator"
      description="Create perfectly sized images for WhatsApp Status (1080×1920)"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-6">
        {/* Image Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
        >
          {image ? (
            <div className="relative">
              <img src={image} alt="Background" className="max-h-32 rounded-lg object-contain" />
              <button
                onClick={(e) => { e.stopPropagation(); setImage(null); }}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">Add Background Image (Optional)</p>
              <p className="text-sm text-muted-foreground">Or create text-only status</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Text Input */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Type className="h-5 w-5" />
            <h3 className="font-semibold">Add Text Overlay</h3>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your status text..."
            className="input-field mb-4 h-24 w-full resize-none"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Position</label>
              <select
                value={textPosition}
                onChange={(e) => setTextPosition(e.target.value as "top" | "center" | "bottom")}
                className="input-field w-full"
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                className="input-field w-full"
                min={16}
                max={120}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          <span>Output: 1080 × 1920 pixels (9:16 aspect ratio)</span>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={generate} className="btn-primary flex-1">
            <Smartphone className="h-5 w-5" />
            Generate Status
          </button>
          {resultUrl && (
            <a
              href={resultUrl}
              download="whatsapp-status.jpg"
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download
            </a>
          )}
        </div>

        {/* Result Preview */}
        {resultUrl && (
          <div className="text-center">
            <p className="mb-3 text-sm text-muted-foreground">Preview (scaled):</p>
            <div className="inline-block rounded-xl border border-border bg-muted/30 p-2">
              <img
                src={resultUrl}
                alt="WhatsApp Status"
                className="h-80 rounded-lg object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default WhatsAppStatusTool;
