import { useState } from "react";
import { Camera, AlertCircle, Globe, Download, Loader2, RefreshCw, Monitor, Smartphone, Tablet, Sparkles, Lightbulb, ScanSearch, X, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "200 85% 50%";

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
  const [width, setWidth] = useState(1440);
  const [height, setHeight] = useState(900);
  const [format, setFormat] = useState("png");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { name: "Desktop", width: 1440, height: 900, icon: Monitor },
    { name: "Tablet", width: 768, height: 1024, icon: Tablet },
    { name: "Mobile", width: 390, height: 844, icon: Smartphone },
  ];

  const captureScreenshot = async () => {
    if (!url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.WEBSITE_SCREENSHOT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: targetUrl,
          width,
          height,
          format,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.result) {
        setResult(data.result);
      } else {
        setError(data.error || "Failed to capture screenshot");
      }
    } catch (err) {
      console.error("Error capturing screenshot:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement("a");
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
      description="Capture full-page screenshots of any website from top to footer."
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-4 sm:p-6 lg:p-8 shadow-xl"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.55, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `hsl(${categoryColor} / 0.15)`,
                  boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
                }}
              >
                <Camera className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <ScanSearch className="h-3.5 w-3.5" />
                  Full-page capture
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">Website Screenshot Tool</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Capture a full-page render from the first pixel to the footer, with device presets and downloadable output.
                </p>
              </div>
            </div>

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-lg transition-shadow duration-500 hover:shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <label htmlFor="website-url" className="block text-sm font-medium">
                Website URL
              </label>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Link2 className="h-3.5 w-3.5" />
              Smart URL
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-3 shadow-sm transition-all duration-300 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
            <div className="flex items-center gap-2">
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">https://</span>
              </div>
              <input
                id="website-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com or https://example.com"
                title="Website URL"
                className="input-field h-11 flex-1 border-0 bg-transparent px-0 shadow-none focus:ring-0"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Clear website URL"
                  title="Clear URL"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-lg transition-shadow duration-500 hover:shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium">Device Presets</label>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Recommended
            </span>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {presets.map((preset) => {
              const isSelected = width === preset.width && height === preset.height;
              const Icon = preset.icon;

              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "border-sky-500/50 bg-sky-500 text-white shadow-lg"
                      : "border-border bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 grid-cols-1 sm:grid-cols-3"
        >
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4 shadow-lg transition-shadow duration-500 hover:shadow-xl">
            <label htmlFor="screenshot-width" className="mb-2 block text-sm font-medium">
              Viewport Width
            </label>
            <input
              id="screenshot-width"
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 1440)}
              title="Screenshot width"
              className="input-field w-full"
            />
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4 shadow-lg transition-shadow duration-500 hover:shadow-xl">
            <label htmlFor="screenshot-height" className="mb-2 block text-sm font-medium">
              Viewport Height
            </label>
            <input
              id="screenshot-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 900)}
              title="Screenshot height"
              className="input-field w-full"
            />
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4 shadow-lg transition-shadow duration-500 hover:shadow-xl">
            <label htmlFor="screenshot-format" className="mb-2 block text-sm font-medium">
              Format
            </label>
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

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={captureScreenshot}
          disabled={!url.trim() || isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Capturing full page...
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              Capture Screenshot
            </>
          )}
        </motion.button>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 sm:p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card shadow-lg transition-shadow duration-500 hover:shadow-xl overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {result.width}x{result.height} viewport • {result.format.toUpperCase()} • full page
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={captureScreenshot}
                    className="btn-secondary flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-white"
                    style={{
                      background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </motion.button>
                </div>
              </div>
              <div className="bg-muted/30 p-3 sm:p-4 overflow-x-auto">
                <img
                  src={result.screenshot}
                  alt="Website Screenshot"
                  className="mx-auto max-w-full h-auto rounded-lg border border-border"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {!result && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-muted/30 p-6 sm:p-8 text-center"
          >
            <Camera className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Screenshot preview will appear here
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border bg-muted/30 p-4 sm:p-6 shadow-lg transition-shadow duration-500 hover:shadow-xl"
        >
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <Lightbulb className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Screenshot Tips
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Full-page mode captures the entire page down to the footer.</li>
            <li>• Use width presets for desktop, tablet, or mobile rendering.</li>
            <li>• PNG preserves quality, while JPEG is smaller for sharing.</li>
          </ul>
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default WebsiteScreenshotTool;
