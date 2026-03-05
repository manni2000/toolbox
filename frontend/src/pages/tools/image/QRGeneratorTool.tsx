import { useState, useRef, useEffect } from "react";
import { Download, Link as LinkIcon, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import ToolLayout from "@/components/layout/ToolLayout";

const QRGeneratorTool = () => {
  const [text, setText] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    if (!text.trim()) return;
    
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [text, size, fgColor, bgColor]);

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes from any URL or text instantly"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              URL or Text
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or text..."
                className="input-tool pl-12"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Size: {size}px
            </label>
            <input
              type="range"
              min="100"
              max="500"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                QR Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-border"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="input-tool flex-1"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-border"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="input-tool flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={generateQRCode} className="btn-secondary">
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
            <button
              onClick={downloadQRCode}
              disabled={!qrCodeUrl}
              className="btn-primary flex-1"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-8">
          <canvas ref={canvasRef} className="hidden" />
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Generated QR Code"
              className="max-w-full rounded-lg"
              style={{ maxHeight: size }}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Enter text or URL to generate QR code</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default QRGeneratorTool;
