import { useState, useRef } from "react";
import { Upload, Info, Image as ImageIcon, X, Sparkles, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "173 80% 40%";

interface ImageInfo {
  name: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

const ImageDPITool = () => {
  const toolSeoData = getToolSeoMetadata('image-dpi');
  const [image, setImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        setImageInfo({
          name: file.name,
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
        });
      };
      img.src = dataUrl;
    };
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

  const reset = () => {
    setImage(null);
    setImageInfo(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
  };

  // Calculate print sizes at different DPIs
  const calculatePrintSize = (pixels: number, dpi: number) => {
    const inches = pixels / dpi;
    const cm = inches * 2.54;
    return { inches: inches.toFixed(2), cm: cm.toFixed(2) };
  };

  return (
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "Image DPI Checker",
        toolSeoData?.description || "Check image dimensions and calculate print sizes at different DPI values",
        "image-dpi"
      )}
      <ToolLayout
      breadcrumbTitle="Image DPI Checker"
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
              <Ruler className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">DPI Calculator & Analyzer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Check image dimensions and calculate optimal print sizes at various DPI values.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">dpi checker</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">image dpi</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">print size calculator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">resolution analyzer</span>
              </div>
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
            title="Drop your image here"
            subtitle="Check DPI and print size calculations"
          />
        )}

        {image && imageInfo && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{imageInfo.name}</span>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear image and reset DPI calculator">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-4">
              <img src={image} alt="Preview" className="max-h-48 rounded-lg object-contain" />
            </div>

            {/* Image Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Info className="h-5 w-5" />
                Image Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Width</p>
                  <p className="text-2xl font-bold">{imageInfo.width}px</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="text-2xl font-bold">{imageInfo.height}px</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">File Size</p>
                  <p className="text-2xl font-bold">{formatBytes(imageInfo.size)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="text-2xl font-bold">{imageInfo.type.split("/")[1].toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Print Size Calculator */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Print Size at Different DPI</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium">DPI</th>
                      <th className="px-4 py-3 text-left font-medium">Width</th>
                      <th className="px-4 py-3 text-left font-medium">Height</th>
                      <th className="px-4 py-3 text-left font-medium">Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[72, 96, 150, 300, 600].map((dpi) => {
                      const widthSize = calculatePrintSize(imageInfo.width, dpi);
                      const heightSize = calculatePrintSize(imageInfo.height, dpi);
                      const useCases: Record<number, string> = {
                        72: "Web / Screen",
                        96: "Windows Display",
                        150: "Draft Print",
                        300: "High Quality Print",
                        600: "Professional Print",
                      };
                      return (
                        <tr key={dpi} className="border-b border-border/50">
                          <td className="px-4 py-3 font-medium">{dpi} DPI</td>
                          <td className="px-4 py-3">
                            {widthSize.inches}" / {widthSize.cm} cm
                          </td>
                          <td className="px-4 py-3">
                            {heightSize.inches}" / {heightSize.cm} cm
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{useCases[dpi]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> DPI (Dots Per Inch) metadata is not
              stored in all image formats. These calculations show the print size based on pixel
              dimensions at different DPI values.
            </div>
          </div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Ruler className="h-5 w-5 text-blue-500" />
            What is DPI?
          </h3>
          <p className="text-muted-foreground mb-4">
            DPI (Dots Per Inch) measures image resolution for printing. It determines print quality and size - higher DPI produces sharper prints but larger files. Understanding DPI ensures your images print at the desired size and quality.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your image to view its dimensions</li>
            <li>Check the current DPI metadata (if available)</li>
            <li>See print size at different DPI values</li>
            <li>Understand how DPI affects print quality</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">DPI Standards</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Web: 72 DPI (standard)</li>
                <li>• Print: 300 DPI (quality)</li>
                <li>• High-end: 600 DPI (photo)</li>
                <li>• Large format: 150 DPI</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Print Considerations</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Print size calculation</li>
                <li>• Quality requirements</li>
                <li>• File size impact</li>
                <li>• Medium compatibility</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What DPI should I use for printing?",
            answer: "For most printing, 300 DPI is recommended for quality results. For high-end photo printing, use 600 DPI. For large format prints (posters), 150 DPI is often sufficient."
          },
          {
            question: "Does DPI affect web images?",
            answer: "DPI doesn't affect web display - only pixel dimensions matter. However, embedded DPI metadata can affect how images print from browsers. Set to 72 DPI for web."
          },
          {
            question: "Can I change the DPI of an image?",
            answer: "You can change DPI metadata, but this doesn't actually change resolution. To truly change DPI, you need to resample the image at the new DPI, which changes pixel dimensions."
          },
          {
            question: "Why do my prints look pixelated?",
            answer: "Pixelated prints usually mean the image has insufficient resolution for the print size. Ensure your image has enough pixels (300 DPI × print size in inches) for quality output."
          },
          {
            question: "What's the relationship between DPI and print size?",
            answer: "Print size (inches) = Pixels / DPI. For example, a 2400px image at 300 DPI = 8 inches. Higher DPI = smaller print size for same pixel count."
          }
        ]} />
      </div>
    </ToolLayout>
    </>
  );
};

export default ImageDPITool;
