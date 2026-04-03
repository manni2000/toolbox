import { useState } from "react";
import { Camera, AlertCircle, Globe, Download, Loader2, RefreshCw, Monitor, Smartphone, Tablet } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";

const categoryColor = "210 80% 55%";

interface ScreenshotResult {
  url: string;
  width: number;
  height: number;
  format: string;
  screenshot: string;
  timestamp: string;
}

const WebsiteScreenshotTool = () => {
  const [url, setUrl] = useState("");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [format, setFormat] = useState("png");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { name: "Desktop", width: 1920, height: 1080, icon: Monitor },
    { name: "Tablet", width: 768, height: 1024, icon: Tablet },
    { name: "Mobile", width: 375, height: 812, icon: Smartphone },
  ];

  const captureScreenshot = async () => {
    if (!url.trim()) return;
    
    // Add protocol if missing
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(API_URLS.WEBSITE_SCREENSHOT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          width,
          height,
          format
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.result) {
        setResult(data.result);
      } else {
        setError(data.error || 'Failed to capture screenshot');
      }
    } catch (err) {
      console.error('Error capturing screenshot:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    // Create download link from base64
    const link = document.createElement('a');
    link.href = result.screenshot;
    link.download = `screenshot-${new Date().getTime()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  return (
    <ToolLayout
      title="Website Screenshot Tool"
      description="Capture screenshots of any website"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
        {/* URL Input */}
        <div className="rounded-xl border border-border bg-card p-6">
          <label htmlFor="website-url" className="mb-3 block text-sm font-medium">Website URL</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="website-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              title="Website URL"
              className="input-field w-full pl-12"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Device Presets</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`flex items-center justify-center gap-2 rounded-lg p-3 transition-colors ${
                  width === preset.width && height === preset.height
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <preset.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Size */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <label htmlFor="screenshot-width" className="mb-2 block text-sm font-medium">Width</label>
            <input
              id="screenshot-width"
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 1920)}
              title="Screenshot width"
              className="input-field w-full"
            />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <label htmlFor="screenshot-height" className="mb-2 block text-sm font-medium">Height</label>
            <input
              id="screenshot-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 1080)}
              title="Screenshot height"
              className="input-field w-full"
            />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <label htmlFor="screenshot-format" className="mb-2 block text-sm font-medium">Format</label>
            <select
              id="screenshot-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              title="Screenshot format"
              className="input-field w-full"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
        </div>

        {/* Capture Button */}
        <button
          onClick={captureScreenshot}
          disabled={!url.trim() || isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              Capture Screenshot
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {result.width}x{result.height} • {result.format.toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={captureScreenshot}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="p-4 bg-muted/30">
                <img
                  src={result.screenshot}
                  alt="Website Screenshot"
                  className="w-full rounded-lg border border-border"
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
            <Camera className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              Screenshot preview will appear here
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default WebsiteScreenshotTool;
