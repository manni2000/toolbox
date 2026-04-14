import { useState, useRef } from "react";
import { ImageIcon, Upload, X, Loader2, Sparkles, FileImage } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";

const categoryColor = "0 70% 50%";

interface ImageResult {
  page: number;
  image: string;
  name: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  error?: string;
}

interface ConversionResult {
  success: boolean;
  images: ImageResult[];
  totalPages?: number;
  renderedPages?: number;
  format?: string;
  pdfName?: string;
  method?: string;
  performance?: {
    load?: number;
    parse?: number;
    render?: number;
    encode?: number;
    save?: number;
  };
  error?: string;
}

const PDFToImageTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [resultImages, setResultImages] = useState<ImageResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [conversionStats, setConversionStats] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }
    setFile(f);
    setFileName(f.name);
    setResultImages([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
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
  };

  const reset = () => {
    setFile(null);
    setFileName("");
    setResultImages([]);
    setConversionStats(null);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.PDF_TO_IMAGE}`, {
        method: 'POST',
        body: formData,
      });

      const result: ConversionResult = await response.json();

      if (result.success && result.images && result.images.length > 0) {
        // Check if we got a PDF fallback (production environment)
        const hasPdfFallback = result.images[0].format === 'pdf' || result.images[0].error;
        
        if (hasPdfFallback) {
          // Show error message for production environment
          toast({
            title: "PDF to Image Not Available",
            description: "PDF to image conversion is not available in production. You can download the original PDF file.",
            variant: "destructive",
          });
          
          // Still set the result so user can download the PDF
          setResultImages(result.images);
          setConversionStats(result);
        } else {
          // Normal image conversion result
          setResultImages(result.images);
          setConversionStats(result);

          const methodText = result.method === 'pdftoimg-js' ? 'Fast PDF-to-Image conversion' : 'PDF conversion';

          toast({
            title: "Success!",
            description: `Converted ${result.renderedPages || result.images.length} pages using ${methodText}`,
          });
        }

        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'No images were generated');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Images"
      description="Convert PDF pages to image files"
      category="PDF Tools"
      categoryPath="/category/pdf"
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
              <FileImage className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">PDF to High-Quality Images</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert each PDF page to individual image files in PNG or JPG format.
              </p>
            </div>
          </div>
        </motion.div>

        {!file && (
          <PDFUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
          />
        )}

        {file && (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button onClick={reset} className="p-1 hover:bg-destructive/20 rounded" title="Clear selection">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <button
              onClick={processFile}
              disabled={isProcessing}
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Convert to Images
                </>
              )}
            </button>

            {resultImages.length > 0 && conversionStats && (
              <div className="space-y-4">
                {/* Download Section */}
                <div ref={downloadSectionRef} className="flex justify-center">
                  <EnhancedDownload
                    data={resultImages[0].image}
                    fileName={resultImages[0].name}
                    fileType={resultImages[0].format === 'pdf' ? 'pdf' : 'image'}
                    title={resultImages[0].format === 'pdf' ? 'PDF Download' : 'PDF Converted to Images'}
                    description={resultImages[0].format === 'pdf' 
                      ? 'PDF to image conversion is not available in production. Download the original PDF file.'
                      : `Successfully converted ${resultImages.length} pages to ${conversionStats.format?.toUpperCase() || 'PNG'} images`
                    }
                    fileSize={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    multipleFiles={resultImages[0].format === 'pdf' ? undefined : resultImages.map(img => ({
                      url: img.image,
                      name: img.name,
                      page: img.page
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFToImageTool;
