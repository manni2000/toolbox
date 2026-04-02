import { useState, useRef } from "react";
import { Smile, Download, Type, Image as ImageIcon, Upload, X, Palette, AlignLeft, AlignCenter, AlignRight, Sparkles, RotateCw, RefreshCw, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "330 80% 55%";

const MemeGeneratorTool = () => {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const memeTemplates = [
    {
      id: "distracted-boyfriend",
      name: "Distracted Boyfriend",
      url: "https://i.imgflip.com/1ur9b0.jpg",
      topText: "Me",
      bottomText: "My current project",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "drake-hotline-bling",
      name: "Drake Hotline Bling",
      url: "https://i.imgflip.com/30b1gx.jpg",
      topText: "Not finishing projects",
      bottomText: "Finishing projects",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "success-kid",
      name: "Success Kid",
      url: "https://i.imgflip.com/1bgw.jpg",
      topText: "",
      bottomText: "WHEN YOU FINISH A PROJECT",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "this-is-fine",
      name: "This is Fine",
      url: "https://i.imgflip.com/2/9h.jpg",
      topText: "",
      bottomText: "WHEN DEADLINES APPROACH",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "expanding-brain",
      name: "Expanding Brain",
      url: "https://i.imgflip.com/1jwhww.jpg",
      topText: "Using basic tools",
      bottomText: "Using advanced tools",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "one-does-not-simply",
      name: "One Does Not Simply",
      url: "https://i.imgflip.com/1bij.jpg",
      topText: "ONE DOES NOT SIMPLY",
      bottomText: "FINISH A PROJECT ON TIME",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "futurama-fry",
      name: "Futurama Fry",
      url: "https://i.imgflip.com/1bhw.jpg",
      topText: "NOT SURE IF PROJECT",
      bottomText: "WILL BE SUCCESSFUL OR NOT",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "hide-the-pain-harold",
      name: "Hide the Pain Harold",
      url: "https://i.imgflip.com/1ihzfe.jpg",
      topText: "",
      bottomText: "WHEN THE CODE WORKS",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "sponge-bob-rainbow",
      name: "SpongeBob Rainbow",
      url: "https://i.imgflip.com/2/2zmog8.jpg",
      topText: "CODING WITHOUT BUGS",
      bottomText: "CODING WITH BUGS",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "first-world-problems",
      name: "First World Problems",
      url: "https://i.imgflip.com/2/1bh8.jpg",
      topText: "",
      bottomText: "HAVING TO DEBUG CODE",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "ancient-aliens",
      name: "Ancient Aliens",
      url: "https://i.imgflip.com/2/26am.jpg",
      topText: "ALIENS",
      bottomText: "CREATED JAVASCRIPT",
      topPos: 10,
      bottomPos: 10
    },
    {
      id: "bad-luck-brian",
      name: "Bad Luck Brian",
      url: "https://i.imgflip.com/1bip.jpg",
      topText: "CHOOSING THE WRONG FRAMEWORK",
      bottomText: "",
      topPos: 10,
      bottomPos: 10
    }
  ];

  const fontOptions = [
    { name: "Impact", value: "Impact, Arial Black, sans-serif" },
    { name: "Arial Black", value: "Arial Black, sans-serif" },
    { name: "Comic Sans", value: "Comic Sans MS, cursive" },
    { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  ];

  const presetColors = [
    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00",
    "#ff00ff", "#00ffff", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"
  ];

  const presetColorClassMap: Record<string, string> = {
    "#ffffff": "bg-white",
    "#000000": "bg-black",
    "#ff0000": "bg-red-500",
    "#00ff00": "bg-green-500",
    "#0000ff": "bg-blue-500",
    "#ffff00": "bg-yellow-400",
    "#ff00ff": "bg-fuchsia-500",
    "#00ffff": "bg-cyan-400",
    "#ff6b6b": "bg-[#ff6b6b]",
    "#4ecdc4": "bg-[#4ecdc4]",
    "#45b7d1": "bg-[#45b7d1]",
    "#96ceb4": "bg-[#96ceb4]"
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectTemplate = (template: typeof memeTemplates[0]) => {
    setImage(template.url);
    setTopText(template.topText);
    setBottomText(template.bottomText);
    setShowTemplates(false);
  };

  const generateMeme = async () => {
    setIsGenerating(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 600, 600);
        drawText(ctx);
        setMemeUrl(canvas.toDataURL("image/png", 0.95));
        setIsGenerating(false);
      };
      img.onerror = () => {
        // Fallback if image fails to load
        createPlaceholder(ctx);
        drawText(ctx);
        setMemeUrl(canvas.toDataURL("image/png", 0.95));
        setIsGenerating(false);
      };
      img.src = image;
    } else {
      createPlaceholder(ctx);
      drawText(ctx);
      setMemeUrl(canvas.toDataURL("image/png", 0.95));
      setIsGenerating(false);
    }
  };

  const createPlaceholder = (ctx: CanvasRenderingContext2D) => {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 600, 600);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 600);

    // Add placeholder text
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Upload an image or select a template", 300, 280);
    ctx.fillText("to create your meme", 300, 320);
  };

  const drawText = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;

    // Set text alignment
    let textX: number;
    if (textAlign === "left") {
      ctx.textAlign = "left";
      textX = 30;
    } else if (textAlign === "right") {
      ctx.textAlign = "right";
      textX = 570;
    } else {
      ctx.textAlign = "center";
      textX = 300;
    }

    // Top text
    if (topText) {
      const lines = wrapText(ctx, topText.toUpperCase(), textAlign === "center" ? 560 : 540);
      lines.forEach((line, i) => {
        const y = 60 + i * fontSize;
        ctx.strokeText(line, textX, y);
        ctx.fillText(line, textX, y);
      });
    }

    // Bottom text
    if (bottomText) {
      const lines = wrapText(ctx, bottomText.toUpperCase(), textAlign === "center" ? 560 : 540);
      lines.reverse().forEach((line, i) => {
        const y = 580 - i * fontSize;
        ctx.strokeText(line, textX, y);
        ctx.fillText(line, textX, y);
      });
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const reset = () => {
    setTopText("");
    setBottomText("");
    setImage(null);
    setMemeUrl(null);
  };

  return (
    <ToolLayout
      title="Meme Generator"
      description="Create professional memes with templates, custom text, and advanced styling options"
      category="Social Media"
      categoryPath="/category/social"
    >
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-8">
        {/* Meme Templates */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Grid3X3 className="h-5 w-5" />
              Meme Templates
            </h3>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="btn-secondary text-sm"
            >
              {showTemplates ? 'Hide Templates' : 'Browse Templates'}
            </button>
          </div>

          {showTemplates && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {memeTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className="group cursor-pointer rounded-lg border border-border overflow-hidden hover:border-primary transition-colors"
                >
                  <div className="aspect-square relative">
                    <img
                      src={template.url}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center px-2">
                        <div className="text-sm font-medium">{template.name}</div>
                        <div className="text-xs">Click to use</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-muted">
                    <p className="text-xs font-medium truncate">{template.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Editor */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          {/* Controls Panel */}
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            {/* Text Inputs */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Type className="h-5 w-5" />
                Text Content
              </h3>
              
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Top Text</label>
                  <textarea
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder="Enter top text..."
                    className="input-field h-14 md:h-16 w-full resize-none text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Bottom Text</label>
                  <textarea
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="Enter bottom text..."
                    className="input-field h-14 md:h-16 w-full resize-none text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Styling Options */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Palette className="h-5 w-5" />
                Styling Options
              </h3>
              
              <div className="space-y-4">
                {/* Text Alignment */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Text Alignment</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setTextAlign("left")}
                      aria-label="Align text left"
                      title="Align text left"
                      className={`flex-1 rounded-lg border p-2 md:p-3 transition-colors ${
                        textAlign === "left"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <AlignLeft className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextAlign("center")}
                      aria-label="Align text center"
                      title="Align text center"
                      className={`flex-1 rounded-lg border p-2 md:p-3 transition-colors ${
                        textAlign === "center"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <AlignCenter className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextAlign("right")}
                      aria-label="Align text right"
                      title="Align text right"
                      className={`flex-1 rounded-lg border p-2 md:p-3 transition-colors ${
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
                  <label htmlFor="font-size-range" className="mb-2 block text-sm font-medium">Font Size: {fontSize}px</label>
                  <input
                    id="font-size-range"
                    type="range"
                    min={24}
                    max={72}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    aria-label="Font size"
                    title="Font size"
                    className="w-full h-2"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Text Color</label>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setTextColor(color)}
                          aria-label={`Select text color ${color}`}
                          title={`Select text color ${color}`}
                          className={`h-8 w-8 md:h-10 md:w-10 rounded-lg border-2 transition-all ${presetColorClassMap[color]} ${
                            textColor === color ? "border-primary" : "border-border"
                          }`}
                        >
                          <span className="sr-only">Select text color {color}</span>
                        </button>
                      ))}
                    </div>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      aria-label="Choose text color"
                      title="Choose text color"
                      className="h-8 w-12 md:h-10 md:w-14 cursor-pointer rounded-lg border-0"
                    />
                  </div>
                </div>

                {/* Stroke Color */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Stroke Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      aria-label="Choose stroke color"
                      title="Choose stroke color"
                      className="h-8 w-12 md:h-10 md:w-14 cursor-pointer rounded-lg border-0"
                    />
                    <input
                      type="text"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="input-field flex-1 text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Stroke Width */}
                <div>
                  <label htmlFor="stroke-width-range" className="mb-2 block text-sm font-medium">Stroke Width: {strokeWidth}px</label>
                  <input
                    id="stroke-width-range"
                    type="range"
                    min={0}
                    max={10}
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    aria-label="Stroke width"
                    title="Stroke width"
                    className="w-full h-2"
                  />
                </div>
              </div>
            </div>

            {/* Custom Image Upload */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Upload className="h-5 w-5" />
                Custom Image
              </h3>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 md:p-6 transition-colors hover:border-primary/50">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-muted-foreground text-sm md:text-base text-center">
                  {image ? "Change image" : "Click to upload custom image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  aria-label="Upload custom image"
                  title="Upload custom image"
                  className="hidden"
                />
              </label>
              {image && (
                <div className="mt-4">
                  <img src={image} alt="Custom" className="h-16 w-16 md:h-20 md:w-20 rounded-lg object-cover mx-auto" />
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Custom image loaded
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4 order-1 lg:order-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Type className="h-5 w-5" />
              Preview
            </h3>
            
            <div className="rounded-xl border border-border bg-card p-4">
              {memeUrl ? (
                <div className="space-y-4">
                  <img src={memeUrl} alt="Generated meme" className="w-full rounded-lg shadow-lg" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={generateMeme}
                      disabled={isGenerating}
                      className="btn-primary flex-1 disabled:opacity-50 py-2 md:py-3"
                    >
                      <RefreshCw className={`h-4 w-4 md:h-5 md:w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                      {isGenerating ? "Regenerating..." : "Regenerate"}
                    </button>
                    <a
                      href={memeUrl}
                      download="meme.png"
                      className="btn-secondary flex items-center justify-center gap-2 py-2 md:py-3 text-sm md:text-base"
                    >
                      <Download className="h-4 w-4 md:h-5 md:w-5" />
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg bg-muted/50">
                  <div className="text-center">
                    <Smile className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-sm md:text-base px-2">
                      Add text and upload your own image<br className="hidden sm:block" />to create your meme
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={generateMeme}
                disabled={isGenerating}
                className="btn-primary flex-1 disabled:opacity-50 py-2 md:py-3"
              >
                <Sparkles className={`h-4 w-4 md:h-5 md:w-5 ${isGenerating ? 'animate-pulse' : ''}`} />
                {isGenerating ? "Generating..." : "Generate Meme"}
              </button>
              <button onClick={reset} className="btn-secondary py-2 md:py-3">
                <RotateCw className="h-4 w-4 md:h-5 md:w-5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <h4 className="font-semibold mb-2">💡 Pro Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use popular templates for instant recognition</li>
            <li>• Keep text short and impactful for best results</li>
            <li>• Adjust stroke width for better readability</li>
            <li>• Try different text alignments for creative layouts</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
};

export default MemeGeneratorTool;
