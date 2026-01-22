import { useState } from "react";
import { Smile, Download, Type, Image as ImageIcon } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const MemeGeneratorTool = () => {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(48);

  const templates = [
    { name: "Drake", color: "#FFE4B5" },
    { name: "Distracted", color: "#87CEEB" },
    { name: "Change My Mind", color: "#98FB98" },
    { name: "Surprised Pikachu", color: "#FFD700" },
    { name: "Two Buttons", color: "#DDA0DD" },
    { name: "Custom Image", color: "#E0E0E0" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateMeme = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 600;

    if (image) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 600, 600);
        drawText(ctx);
        setMemeUrl(canvas.toDataURL("image/png"));
      };
      img.src = image;
    } else {
      // Default placeholder
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, 600, 600);
      ctx.fillStyle = "#666";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Upload an image to create meme", 300, 300);
      drawText(ctx);
      setMemeUrl(canvas.toDataURL("image/png"));
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = fontSize / 12;
    ctx.font = `bold ${fontSize}px Impact, Arial, sans-serif`;
    ctx.textAlign = "center";

    // Top text
    if (topText) {
      const lines = wrapText(ctx, topText.toUpperCase(), 560);
      lines.forEach((line, i) => {
        const y = 60 + i * fontSize;
        ctx.strokeText(line, 300, y);
        ctx.fillText(line, 300, y);
      });
    }

    // Bottom text
    if (bottomText) {
      const lines = wrapText(ctx, bottomText.toUpperCase(), 560);
      lines.reverse().forEach((line, i) => {
        const y = 580 - i * fontSize;
        ctx.strokeText(line, 300, y);
        ctx.fillText(line, 300, y);
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

  return (
    <ToolLayout
      title="Meme Generator"
      description="Create memes with custom top and bottom text"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Top Text</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Enter top text..."
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Bottom Text</label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Enter bottom text..."
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Font Size</label>
              <input
                type="range"
                min={24}
                max={72}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Upload Image</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {image ? "Change image" : "Click to upload"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button onClick={generateMeme} className="btn-primary w-full">
              <Smile className="h-5 w-5" />
              Generate Meme
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 flex items-center gap-2 font-medium">
              <Type className="h-5 w-5" />
              Preview
            </h3>
            {memeUrl ? (
              <div className="space-y-4">
                <img src={memeUrl} alt="Generated meme" className="w-full rounded-lg" />
                <a
                  href={memeUrl}
                  download="meme.png"
                  className="btn-secondary flex w-full items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Meme
                </a>
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-muted/50">
                <p className="text-center text-muted-foreground">
                  Add text and click generate<br />to see your meme
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default MemeGeneratorTool;
