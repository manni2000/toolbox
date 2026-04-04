import { useState } from "react";
import { Camera, AlertCircle, Globe, Download, Loader2, RefreshCw, Monitor, Smartphone, Tablet, Settings, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
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
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Camera className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Website Screenshot Tool</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Capture screenshots of any website with customizable dimensions
              </p>
            </div>
          </div>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
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
        </motion.div>

        {/* Presets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="mb-3 block text-sm font-medium">Device Presets</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`flex items-center justify-center gap-2 rounded-lg p-3 transition-colors ${
                  width === preset.width && height === preset.height
                    ? 'text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                style={width === preset.width && height === preset.height ? {
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                } : {}}
              >
                <preset.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Custom Size */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <div className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500">
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
          <div className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500">
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
          <div className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500">
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
        </motion.div>

        {/* Capture Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={captureScreenshot}
          disabled={!url.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
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
        </motion.button>

        {/* Error */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500">
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex items-center gap-2 text-sm rounded-lg px-3 py-1.5 text-white"
                    style={{
                      background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </motion.button>
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
          </motion.div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-muted/30 p-8 text-center"
          >
            <Camera className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              Screenshot preview will appear here
            </p>
          </motion.div>
        )}

        {/* Tips Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Screenshot Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Use device presets for common viewport sizes</li>
            <li>• PNG format preserves transparency, JPEG is smaller</li>
            <li>• Full URLs with https:// are recommended</li>
          </ul>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default WebsiteScreenshotTool;
