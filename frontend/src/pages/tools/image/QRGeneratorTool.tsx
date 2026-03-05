import { useState, useRef, useEffect } from "react";
import { Download, Link as LinkIcon, RefreshCw, QrCode } from "lucide-react";
import QRCode from "qrcode";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";

const QRGeneratorTool = () => {
  const [text, setText] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const exampleUrls = [
    "https://google.com",
    "https://github.com",
    "https://youtube.com",
    "https://linkedin.com/in/username",
    "mailto:user@example.com",
    "tel:+1234567890"
  ];

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
      toast({
        title: "QR Code Generated",
        description: "Your QR code has been created successfully",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (text.trim()) {
      generateQRCode();
    } else {
      setQrCodeUrl("");
    }
  }, [text, size, fgColor, bgColor]);

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrCodeUrl;
    link.click();
    toast({
      title: "Download Started",
      description: "QR code downloaded successfully",
    });
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

          {/* Input Section Header */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">
                QR Code Content
              </h3>
            </div>

            <div className="space-y-4">

              {/* Text Input */}
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Focus on the next field or trigger generation
                    }
                  }}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Examples and Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">

                <span>
                  Enter any URL, text, email, or phone number to generate a QR code.
                  <br />
                  Press Enter to quickly generate.
                </span>

                <div className="flex gap-3">
                  {exampleUrls.slice(0, 4).map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setText(url)}
                      className="hover:text-primary"
                      title={`Use ${url.split('://')[1] || url}`}
                    >
                      {index === 0 ? 'Google' :
                       index === 1 ? 'GitHub' :
                       index === 2 ? 'YouTube' :
                       index === 3 ? 'LinkedIn' : 'Example'}
                    </button>
                  ))}
                </div>

              </div>

            </div>

          </div>

          {/* Customization Section */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">
                QR Code Settings
              </h3>
            </div>

            <div className="space-y-4">

              {/* Size Control */}
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
                <div className="mt-1 text-xs text-muted-foreground">
                  Recommended: 200-400px for most uses
                </div>
              </div>

              {/* Color Controls */}
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
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
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
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-8">
          <canvas ref={canvasRef} className="hidden" />
          {qrCodeUrl ? (
            <div className="space-y-4">
              <img
                src={qrCodeUrl}
                alt="Generated QR Code"
                className="rounded-lg shadow-lg"
                style={{ width: Math.min(size, 400), height: Math.min(size, 400) }}
              />
              <div className="text-center text-sm text-muted-foreground">
                {size}x{size} pixels • Ready to download
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <QrCode className="mx-auto h-16 w-16 mb-4 opacity-50" />
              <p>Enter text above to generate your QR code</p>
            </div>
          )}
        </div>

      </div>

      <div className="flex gap-4">
        <button 
          onClick={generateQRCode}
          disabled={!text.trim()}
          className="btn-secondary"
        >
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

    </ToolLayout>
  );
};

export default QRGeneratorTool;
