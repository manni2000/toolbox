import { useState, useRef } from "react";
import { Upload, Download, Smartphone, X, Type, Palette, AlignLeft, AlignCenter, AlignRight, Sparkles, Image as ImageIcon } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const WhatsAppStatusTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("center");
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");
  const [fontSize, setFontSize] = useState(48);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [textShadow, setTextShadow] = useState(true);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const STATUS_WIDTH = 1080;
  const STATUS_HEIGHT = 1920;

  const presetColors = [
    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00",
    "#ff00ff", "#00ffff", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"
  ];

  const presetBackgrounds = [
    { name: "Dark", color: "#1a1a1a" },
    { name: "Gradient Blue", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "Gradient Pink", color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Gradient Green", color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { name: "Gradient Orange", color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "Pure White", color: "#ffffff" },
  ];

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

  const generate = async () => {
    setIsGenerating(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = STATUS_WIDTH;
    canvas.height = STATUS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background
    if (backgroundColor.startsWith("linear-gradient")) {
      // Handle gradient backgrounds
      const gradient = ctx.createLinearGradient(0, 0, STATUS_WIDTH, STATUS_HEIGHT);
      if (backgroundColor.includes("667eea")) {
        gradient.addColorStop(0, "#667eea");
        gradient.addColorStop(1, "#764ba2");
      } else if (backgroundColor.includes("f093fb")) {
        gradient.addColorStop(0, "#f093fb");
        gradient.addColorStop(1, "#f5576c");
      } else if (backgroundColor.includes("4facfe")) {
        gradient.addColorStop(0, "#4facfe");
        gradient.addColorStop(1, "#00f2fe");
      } else if (backgroundColor.includes("fa709a")) {
        gradient.addColorStop(0, "#fa709a");
        gradient.addColorStop(1, "#fee140");
      }
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = backgroundColor;
    }
    ctx.fillRect(0, 0, STATUS_WIDTH, STATUS_HEIGHT);

    const drawText = () => {
      if (!text) return;

      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      
      // Set text alignment
      let textX: number;
      if (textAlign === "left") {
        ctx.textAlign = "left";
        textX = 60;
      } else if (textAlign === "right") {
        ctx.textAlign = "right";
        textX = STATUS_WIDTH - 60;
      } else {
        ctx.textAlign = "center";
        textX = STATUS_WIDTH / 2;
      }

      const lines = text.split("\n");
      const lineHeight = fontSize * 1.3;
      const totalHeight = lines.length * lineHeight;

      let startY: number;
      if (textPosition === "top") startY = 150;
      else if (textPosition === "bottom") startY = STATUS_HEIGHT - totalHeight - 100;
      else startY = (STATUS_HEIGHT - totalHeight) / 2;

      // Text shadow
      if (textShadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      }

      lines.forEach((line, i) => {
        ctx.fillText(line, textX, startY + i * lineHeight);
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
        setIsGenerating(false);
      };
      img.src = image;
    } else {
      drawText();
      setResultUrl(canvas.toDataURL("image/jpeg", 0.95));
      setIsGenerating(false);
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
      description="Create perfectly sized images for WhatsApp Status with professional design tools"
      category="Social Media"
      categoryPath="/category/social"
    >
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-8">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Perfect for WhatsApp Status</h3>
              <p className="text-sm text-muted-foreground">
                Creates images in 1080×1920 pixels (9:16 aspect ratio) - the ideal size for WhatsApp Status
              </p>
            </div>
          </div>
        </div>

        {/* Background Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ImageIcon className="h-5 w-5" />
              Background Image
            </h3>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
            >
              {image ? (
                <div className="relative">
                  <img src={image} alt="Background" className="max-h-40 rounded-lg object-contain" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-3 font-medium">Drop image here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Optional - creates text-only status if no image</p>
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
          </div>

          {/* Background Color */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Palette className="h-5 w-5" />
              Background Color
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {presetBackgrounds.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setBackgroundColor(preset.color)}
                    className={`rounded-lg border-2 p-3 text-xs font-medium transition-all ${
                      backgroundColor === preset.color
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor.startsWith("linear") ? "#1a1a1a" : backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border-0"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="input-field flex-1"
                  placeholder="#1a1a1a"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <Type className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Text Overlay</h3>
          </div>

          <div className="space-y-6">
            {/* Text Input */}
            <div>
              <label className="mb-2 block text-sm font-medium">Status Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your status text... (Use Enter for multiple lines)"
                className="input-field h-24 w-full resize-none"
              />
            </div>

            {/* Text Controls */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Position */}
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

              {/* Alignment */}
              <div>
                <label className="mb-2 block text-sm font-medium">Alignment</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTextAlign("left")}
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "left"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <AlignLeft className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setTextAlign("center")}
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "center"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <AlignCenter className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setTextAlign("right")}
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "right"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <AlignRight className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Font Size */}
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

              {/* Text Shadow */}
              <div>
                <label className="mb-2 block text-sm font-medium">Text Shadow</label>
                <button
                  onClick={() => setTextShadow(!textShadow)}
                  className={`w-full rounded-lg border p-2 text-sm font-medium transition-colors ${
                    textShadow
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {textShadow ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="mb-2 block text-sm font-medium">Text Color</label>
              <div className="flex gap-2">
                <div className="flex gap-1">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`h-8 w-8 rounded-lg border-2 transition-all ${
                        textColor === color ? "border-primary" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded-lg border-0"
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

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={generate} 
            disabled={isGenerating}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            <Sparkles className={`h-5 w-5 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? "Generating..." : "Generate Status"}
          </button>
          <button onClick={reset} className="btn-secondary">
            <X className="h-5 w-5" />
            Reset
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
            <p className="mb-4 text-lg font-semibold">Preview</p>
            <div className="inline-block rounded-2xl border border-border bg-muted/30 p-4 shadow-lg">
              <img
                src={resultUrl}
                alt="WhatsApp Status"
                className="h-96 rounded-xl object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              ✅ Ready for WhatsApp Status! Image is perfectly sized at 1080×1920 pixels.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default WhatsAppStatusTool;
