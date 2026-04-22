import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, X, Sparkles, Maximize2, Trash2, Download as DownloadIcon } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "142 76% 36%";

interface ImageFile {
  file: File;
  preview: string;
  processed: string | null;
  originalSize: number;
  processedSize: number;
}

const BulkImageResizerTool = () => {
  const toolSeoData = getToolSeoMetadata('bulk-image-resizer');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      toast({
        title: 'Some Files Skipped',
        description: 'Only image files are supported',
        variant: 'destructive',
      });
    }

    const processedImages = validFiles.map(file => {
      const reader = new FileReader();
      return new Promise<ImageFile>((resolve) => {
        reader.onload = (e) => {
          resolve({
            file,
            preview: e.target?.result as string,
            processed: null,
            originalSize: file.size,
            processedSize: 0,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(processedImages).then(results => {
      setImages(prev => [...prev, ...results]);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (images.length === 0) {
      toast({
        title: 'No Images',
        description: 'Please upload at least one image',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    const processed: ImageFile[] = await Promise.all(images.map((img, index) => {
      return new Promise<ImageFile>((resolve) => {
        const canvas = document.createElement('canvas');
        const imgElement = new Image();
        
        imgElement.onload = () => {
          let newWidth = width;
          let newHeight = height;

          if (maintainAspect) {
            const aspectRatio = imgElement.width / imgElement.height;
            newHeight = Math.round(width / aspectRatio);
          }

          canvas.width = newWidth;
          canvas.height = newHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(imgElement, 0, 0, newWidth, newHeight);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  file: img.file,
                  preview: img.preview,
                  processed: e.target?.result as string,
                  originalSize: img.originalSize,
                  processedSize: blob.size,
                });
              };
              reader.readAsDataURL(blob);
            }
          }, 'image/jpeg', 0.9);
        };
        
        imgElement.src = img.preview;
      });
    }));

    setImages(processed);
    setIsProcessing(false);

    toast({
      title: 'Processing Complete',
      description: `${processed.length} images have been resized`,
    });
  };

  const downloadImage = (index: number) => {
    const image = images[index];
    if (!image.processed) return;

    const link = document.createElement('a');
    link.href = image.processed;
    link.download = `resized-${image.file.name.replace(/\.[^/.]+$/, '')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    images.forEach((_, index) => downloadImage(index));
    toast({
      title: 'Download Started',
      description: 'All images are being downloaded',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      {CategorySEO.Ecommerce(
        toolSeoData?.title || "Bulk Image Resizer",
        toolSeoData?.description || "Resize multiple images at once for e-commerce",
        "bulk-image-resizer"
      )}
      <ToolLayout
        title={toolSeoData?.title || "Bulk Image Resizer"}
        description={toolSeoData?.description || "Resize multiple images at once for e-commerce"}
        category="E-commerce Tools"
        categoryPath="/category/ecommerce"
      >
        <div className="space-y-8">
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
                <Maximize2 className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Bulk Image Resizer</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Resize multiple product images at once. Perfect for batch processing e-commerce catalogs and image galleries.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              Upload Images
            </h3>
            <div
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop multiple images</p>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP up to 10MB each</p>
            </div>
          </motion.div>

          {/* Settings */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4">Resize Settings</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Width: {width}px</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min="100"
                    max="4000"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Height: {height}px</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min="100"
                    max="4000"
                    disabled={maintainAspect}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="aspect"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="aspect" className="cursor-pointer text-sm">Maintain aspect ratio</label>
              </div>
              <button
                onClick={processImages}
                disabled={isProcessing}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Upload className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Resize All Images
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Image List */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                  Images ({images.length})
                </h3>
                {images.some(img => img.processed) && (
                  <button
                    onClick={downloadAll}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-2"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Download All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="border border-border rounded-lg p-3 relative group">
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <img src={img.processed || img.preview} alt={`Image ${index + 1}`} className="w-full h-32 object-contain bg-muted/20 rounded mb-2" />
                    <p className="text-xs text-muted-foreground truncate">{img.file.name}</p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Original: {formatFileSize(img.originalSize)}</span>
                      {img.processed && <span>New: {formatFileSize(img.processedSize)}</span>}
                    </div>
                    {img.processed && (
                      <button
                        onClick={() => downloadImage(index)}
                        className="mt-2 w-full bg-primary text-primary-foreground py-1.5 rounded text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                      >
                        <DownloadIcon className="h-3 w-3" />
                        Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tool Definition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Maximize2 className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              What is Bulk Image Resizing?
            </h3>
            <p className="text-muted-foreground mb-4">
              Bulk image resizing allows you to resize multiple images to the same dimensions simultaneously. This is essential for e-commerce catalogs where consistent product image sizes are required.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Resize Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Batch processing</li>
                  <li>• Aspect ratio lock</li>
                  <li>• Custom dimensions</li>
                  <li>• Quality preservation</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• E-commerce catalogs</li>
                  <li>• Image galleries</li>
                  <li>• Social media posts</li>
                  <li>• Product listings</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <ToolFAQ faqs={[
              {
                question: "How many images can I resize at once?",
                answer: "You can upload and resize multiple images simultaneously. There's no strict limit, but performance may vary with very large batches."
              },
              {
                question: "Will the quality be affected?",
                answer: "We use high-quality JPEG compression (90%) to maintain image quality while reducing file size. The images remain crisp and clear."
              },
              {
                question: "What happens if I don't maintain aspect ratio?",
                answer: "Without aspect ratio lock, images will be stretched to fit the exact dimensions. This may cause distortion. We recommend keeping aspect ratio enabled."
              },
              {
                question: "What output format is used?",
                answer: "All resized images are output as JPEG format with 90% quality for optimal balance between file size and quality."
              },
              {
                question: "Can I download images individually?",
                answer: "Yes, you can download each image individually using the download button, or use 'Download All' to get all resized images at once."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default BulkImageResizerTool;
