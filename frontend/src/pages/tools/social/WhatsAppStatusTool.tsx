import { useState, useRef } from "react";
import { Upload, Smartphone, X, Type, Palette, AlignLeft, AlignCenter, AlignRight, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "173 80% 40%";

const WhatsAppStatusTool = () => {
  const toolSeoData = getToolSeoMetadata('whatsapp-status-generator');
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
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "WhatsApp Status Generator",
        toolSeoData?.description || "Create perfectly sized images for WhatsApp Status with professional design tools",
        "whatsapp-status-generator"
      )}
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
          className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-4 sm:p-6 lg:p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-10 -top-10 sm:-right-20 sm:-top-20 h-40 w-40 sm:h-60 sm:w-60 rounded-full blur-2xl sm:blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-3 sm:gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}
            >
              <Smartphone className="h-5 w-5 sm:h-7 sm:w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">WhatsApp Status Creator</h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
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
          className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-4 sm:p-6 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl" style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}>
              <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: `hsl(${categoryColor})` }} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Perfect for WhatsApp Status</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Creates images in 1080×1920 pixels (9:16 aspect ratio) - the ideal size for WhatsApp Status
              </p>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Background Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:gap-6 lg:grid-cols-2"
        >
          {/* Image Upload */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="space-y-3 sm:space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-100 flex items-center justify-center"
              >
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold">Background Image</h3>
            </div>
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
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative inline-block"
              >
                <img src={image} alt="Background" className="max-h-32 sm:max-h-40 rounded-lg object-contain shadow-md" />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove background image"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Background Color */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="space-y-3 sm:space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-100 flex items-center justify-center"
              >
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold">Background Color</h3>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presetBackgrounds.map((preset, index) => (
                  <motion.button
                    key={preset.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => setBackgroundColor(preset.color)}
                    className={`rounded-lg border-2 p-3 text-xs font-medium transition-all ${
                      backgroundColor === preset.color
                        ? "border-primary bg-primary/10 text-primary shadow-lg"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    {preset.name}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <input
                    type="color"
                    value={backgroundColor.startsWith("linear") ? "#1a1a1a" : backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border-0 shadow-md"
                    title="Choose background color"
                    placeholder="Background color"
                    aria-label="Background color picker"
                  />
                </motion.div>
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-medium"
                  placeholder="#1a1a1a"
                  title="Background color value (hex or gradient)"
                  aria-label="Background color value"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Text Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-100 flex items-center justify-center"
            >
              <Type className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </motion.div>
            <h3 className="text-base sm:text-lg font-semibold">Text Overlay</h3>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Text Input */}
            <div>
              <label className="mb-2 block text-sm font-medium">Status Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your status text... (Use Enter for multiple lines)"
                className="w-full rounded-lg bg-muted px-4 py-3 h-24 resize-none text-sm font-medium"
              />
            </div>

            {/* Enhanced Text Controls */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Position */}
              <div>
                <label className="mb-2 block text-sm font-medium">Position</label>
                <div className="relative">
                  <select
                    value={textPosition}
                    onChange={(e) => setTextPosition(e.target.value as "top" | "center" | "bottom")}
                    className="w-full rounded-lg bg-muted px-3 py-2 appearance-none text-sm font-medium"
                    aria-label="Text position"
                    title="Select text position on status"
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="mb-2 block text-sm font-medium">Alignment</label>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTextAlign("left")}
                    title="Align text to the left"
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "left"
                        ? "border-primary bg-primary/10 text-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label="Align text left"
                  >
                    <AlignLeft className="h-4 w-4 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTextAlign("center")}
                    title="Align text center"
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "center"
                        ? "border-primary bg-primary/10 text-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label="Align text center"
                  >
                    <AlignCenter className="h-4 w-4 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTextAlign("right")}
                    title="Align text right"
                    className={`flex-1 rounded-lg border p-2 transition-colors ${
                      textAlign === "right"
                        ? "border-primary bg-primary/10 text-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label="Align text right"
                  >
                    <AlignRight className="h-4 w-4 mx-auto" />
                  </motion.button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="mb-2 block text-sm font-medium">Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                  className="w-full rounded-lg bg-muted px-3 py-2 text-sm font-medium"
                  min={16}
                  max={120}
                  title="Set font size for status text"
                />
              </div>

              {/* Text Shadow */}
              <div>
                <label className="mb-2 block text-sm font-medium">Text Shadow</label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTextShadow(!textShadow)}
                  className={`w-full rounded-lg border p-2 text-sm font-medium transition-colors ${
                    textShadow
                      ? "border-primary bg-primary/10 text-primary shadow-md"
                      : "border-border hover:border-primary/50"
                  }`}
                  title="Toggle text shadow effect"
                >
                  {textShadow ? "Enabled" : "Disabled"}
                </motion.button>
              </div>
            </div>

            {/* Enhanced Text Color */}
            <div>
              <label className="mb-2 block text-sm font-medium">Text Color</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-wrap gap-1">
                  {presetColors.slice(0, 8).map((color, index) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                      onClick={() => setTextColor(color)}
                      className={`h-6 w-6 sm:h-8 sm:w-8 rounded-lg border-2 transition-all shadow-sm hover:shadow-md ${
                        textColor === color ? "border-primary ring-2 ring-primary/30" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Select color ${color}`}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-6 w-8 sm:h-8 sm:w-12 cursor-pointer rounded-lg border-0 shadow-md"
                      title="Choose text color"
                      aria-label="Text color picker"
                    />
                  </motion.div>
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 rounded-lg bg-muted px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium"
                    placeholder="#ffffff"
                    title="Enter hex color code for text"
                    aria-label="Text color value"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generate} 
            disabled={isGenerating}
            className="w-full sm:flex-1 rounded-lg text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:font-medium transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            }}
            title="Generate WhatsApp status"
          >
            <Sparkles className={`inline h-4 w-4 sm:h-5 sm:w-5 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? "Generating..." : "Generate Status"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset} 
            className="w-full sm:w-auto rounded-lg bg-muted px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:font-medium transition-colors hover:bg-muted/80 shadow-md hover:shadow-lg"
            title="Reset all settings"
          >
            <X className="inline h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Reset
          </motion.button>
        </motion.div>

        {/* Result Preview and Download */}
        {resultUrl && (
          <div ref={downloadSectionRef} className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <p className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Preview</p>
              <div className="inline-block rounded-2xl border border-border bg-muted/30 p-3 sm:p-4 shadow-lg">
                <img
                  src={resultUrl}
                  alt="WhatsApp Status"
                  className="h-64 sm:h-80 lg:h-96 max-w-full rounded-xl object-contain"
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
            <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            What is WhatsApp Status Creation?
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            WhatsApp Status creator generates custom status images for WhatsApp stories. You can add text, choose colors, and customize the design to create engaging status updates that appear as full-screen stories in WhatsApp.
          </p>
          
          <h4 className="font-semibold mb-2 text-sm">How It Works</h4>
          <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground mb-4">
            <li>Upload your background image or use solid color</li>
            <li>Add your text and customize styling</li>
            <li>Adjust text position, color, and size</li>
            <li>Download the 1080x1920 status image</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1 text-sm">Customization Options</h5>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• Text overlay with styling</li>
                <li>• Position and alignment</li>
                <li>• Color customization</li>
                <li>• Font size control</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1 text-sm">Status Features</h5>
              <ul className="text-xs sm:text-sm text-green-800 space-y-1">
                <li>• 1080x1920 resolution</li>
                <li>• Full-screen display</li>
                <li>• Auto-optimized for WhatsApp</li>
                <li>• Easy sharing</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What resolution should WhatsApp status images be?",
            answer: "WhatsApp status images should be 1080x1920 pixels (9:16 aspect ratio) for full-screen display. This ensures your status appears correctly on all devices without cropping."
          },
          {
            question: "Can I use any image as a background?",
            answer: "Yes, you can upload any image as a background. For best results, use high-quality images with good lighting. The tool will resize to fit the status dimensions."
          },
          {
            question: "How long do WhatsApp statuses last?",
            answer: "WhatsApp statuses last 24 hours before disappearing. They can be viewed multiple times during this period by your contacts."
          },
          {
            question: "Can I add multiple text elements?",
            answer: "This tool supports a single text element for simplicity. For complex designs with multiple text layers, use graphic design software and upload as an image."
          },
          {
            question: "What's the difference between status and profile photo?",
            answer: "Status appears as full-screen stories visible for 24 hours. Profile photos are permanent and appear in chat windows. Status is for temporary updates and sharing moments."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default WhatsAppStatusTool;
