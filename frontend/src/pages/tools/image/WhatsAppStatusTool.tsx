import { useState, useRef } from "react";
import { Upload, Smartphone, X, Type, Palette, AlignLeft, AlignCenter, AlignRight, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const categoryColor = "173 80% 40%";

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
  const downloadSectionRef = useRef<HTMLDivElement>(null);

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
        // Scroll to download section after successful generation
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      };
      img.src = image;
    } else {
      drawText();
      setResultUrl(canvas.toDataURL("image/jpeg", 0.95));
      setIsGenerating(false);
      // Scroll to download section after successful generation
      setTimeout(() => {
        downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
              <Smartphone className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">WhatsApp Status Creator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Design professional status images with the perfect 1080×1920 resolution for WhatsApp.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Header Info */}
        <motion.div 
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}>
              <Smartphone className="h-6 w-6" style={{ color: `hsl(${categoryColor})` }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Perfect for WhatsApp Status</h3>
              <p className="text-sm text-muted-foreground">
                Creates images in 1080×1920 pixels (9:16 aspect ratio) - the ideal size for WhatsApp Status
              </p>
            </div>
          </div>
        </motion.div>

        {/* Background Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ImageIcon className="h-5 w-5" />
              Background Image
            </h3>
            <ImageUploadZone
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onFileSelect={handleFile}
              multiple={false}
              title="Drop image here or click to upload"
              subtitle="Optimized for WhatsApp Status (1080×1920) - Optional"
            />
            {image && (
              <div className="relative inline-block">
                <img src={image} alt="Background" className="max-h-40 rounded-lg object-contain" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80 transition-colors"
                  title="Remove background image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
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
                  title="Choose background color"
                  placeholder="Background color"
                  aria-label="Background color picker"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="input-field flex-1"
                  placeholder="#1a1a1a"
                  title="Background color value (hex or gradient)"
                  aria-label="Background color value"
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
                  aria-label="Text position"
                  title="Select text position on status"
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
                    type="button"
                    onClick={() => setTextAlign("left")}
                    title="Align text to the left"
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "left"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label="Align text left"
                  >
                    <AlignLeft className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign("center")}
                    title="Align text center"
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "center"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label="Align text center"
                  >
                    <AlignCenter className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign("right")}
                    title="Align text right"
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "right"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label="Align text right"
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
                  title="Set font size for status text"
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
                  title="Toggle text shadow effect"
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
                      title={`Select color ${color}`}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded-lg border-0"
                  title="Choose text color"
                  aria-label="Text color picker"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="input-field flex-1"
                  placeholder="#ffffff"
                  title="Enter hex color code for text"
                  aria-label="Text color value"
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
            title="Generate WhatsApp status"
          >
            <Sparkles className={`h-5 w-5 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? "Generating..." : "Generate Status"}
          </button>
          <button onClick={reset} className="btn-secondary" title="Reset all settings">
            <X className="h-5 w-5" />
            Reset
          </button>
        </div>

        {/* Result Preview and Download */}
        {resultUrl && (
          <div ref={downloadSectionRef} className="space-y-6">
            <div className="text-center">
              <p className="mb-4 text-lg font-semibold">Preview</p>
              <div className="inline-block rounded-2xl border border-border bg-muted/30 p-4 shadow-lg">
                <img
                  src={resultUrl}
                  alt="WhatsApp Status"
                  className="h-96 rounded-xl object-contain"
                />
              </div>
            </div>
            <EnhancedDownload
              data={resultUrl}
              fileName="whatsapp-status.jpg"
              fileType="image"
              title="WhatsApp Status Generated Successfully"
              description="Perfectly sized at 1080×1920 pixels for WhatsApp Status"
              fileSize="High Quality JPEG"
              dimensions={{ width: 1080, height: 1920 }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default WhatsAppStatusTool;
