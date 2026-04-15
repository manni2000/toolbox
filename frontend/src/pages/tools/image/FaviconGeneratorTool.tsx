import { useState, useRef } from "react";
import { Upload, Download, Image as ImageIcon, X, Package, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "173 80% 40%";

const FaviconGeneratorTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [favicons, setFavicons] = useState<{ size: number; url: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setFavicons([]);

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
    if (!image) return;
    setIsGenerating(true);

    const img = new Image();
    img.onload = () => {
      const results: { size: number; url: string }[] = [];

      sizes.forEach((size) => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, size, size);
        results.push({ size, url: canvas.toDataURL("image/png") });
      });

      setFavicons(results);
      setIsGenerating(false);
    };
    img.src = image;
  };

  const downloadAll = async () => {
    const zip = new JSZip();

    favicons.forEach((favicon) => {
      const base64Data = favicon.url.split(",")[1];
      zip.file(`favicon-${favicon.size}x${favicon.size}.png`, base64Data, { base64: true });
    });

    // Add ICO (16x16) - simplified version
    const favicon16 = favicons.find((f) => f.size === 16);
    if (favicon16) {
      const base64Data = favicon16.url.split(",")[1];
      zip.file("favicon.ico", base64Data, { base64: true });
    }

    // Add manifest.json
    const manifest = {
      icons: [
        { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    };
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // Add HTML snippet
    const htmlSnippet = `<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">
<link rel="manifest" href="/manifest.json">`;
    zip.file("README.txt", htmlSnippet);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    setZipUrl(url);
    
    // Scroll to download section after successful generation
    setTimeout(() => {
      downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const reset = () => {
    if (zipUrl) {
      URL.revokeObjectURL(zipUrl);
    }
    setImage(null);
    setFavicons([]);
    setFileName("");
    setZipUrl(null);
  };

  return (
    <ToolLayout
      title="Favicon Generator"
      description="Generate all favicon sizes from a single image"
      category="Image Tools"
      categoryPath="/category/image"
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
              <Package className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Multi-Size Favicon Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate all standard favicon sizes in one click for web, iOS, and Android.
              </p>
            </div>
          </div>
        </motion.div>

        {!image && (
          <ImageUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            multiple={false}
            title="Drop your logo or icon"
            subtitle="PNG or square image (512×512 or larger) • Generate various favicon sizes"
          />
        )}

        {image && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Reset image">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-6">
              <img src={image} alt="Original" className="max-h-40 rounded-lg object-contain" />
            </div>

            {/* Generate Button */}
            {favicons.length === 0 && (
              <button onClick={generate} disabled={isGenerating} className="btn-primary w-full" title="Generate favicon sizes from image">
                {isGenerating ? "Generating..." : "Generate Favicons"}
              </button>
            )}

            {/* Generated Favicons */}
            {favicons.length > 0 && (
              <>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 font-semibold">Generated Sizes</h3>
                  <div className="flex flex-wrap items-end gap-4">
                    {favicons.map((favicon) => (
                      <div key={favicon.size} className="text-center">
                        <div
                          className="mb-2 inline-block rounded-lg border border-border bg-muted/50 p-2"
                          style={{ width: Math.max(favicon.size + 16, 48), height: Math.max(favicon.size + 16, 48) }}
                        >
                          <img
                            src={favicon.url}
                            alt={`${favicon.size}x${favicon.size}`}
                            style={{ width: favicon.size, height: favicon.size }}
                            className="mx-auto"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{favicon.size}px</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex gap-4">
                  <button onClick={downloadAll} className="btn-primary flex-1" title="Download all favicons as ZIP">
                    <Package className="h-5 w-5" />
                    Prepare ZIP Package
                  </button>
                </div>

                {/* Enhanced Download Section */}
                {zipUrl && (
                  <div ref={downloadSectionRef}>
                    <EnhancedDownload
                      data={zipUrl}
                      fileName="favicons.zip"
                      fileType="zip"
                      title="Favicons Generated Successfully"
                      description={`Generated ${favicons.length} favicon sizes with manifest.json and HTML snippet`}
                      fileSize={`${favicons.length} files`}
                    />
                  </div>
                )}

                {/* Individual Downloads */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 font-semibold">Individual Downloads</h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {favicons.map((favicon) => (
                      <a
                        key={favicon.size}
                        href={favicon.url}
                        download={`favicon-${favicon.size}x${favicon.size}.png`}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm transition-colors hover:bg-muted"
                      >
                        <span>{favicon.size}×{favicon.size}</span>
                        <Download className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default FaviconGeneratorTool;
