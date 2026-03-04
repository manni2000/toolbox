import { useState, useRef } from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

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
      const response = await fetch(`${API_URLS.PDF_TO_IMAGE}`, {
        method: 'POST',
        body: formData,
      });

      const result: ConversionResult = await response.json();

      if (result.success && result.images && result.images.length > 0) {
        setResultImages(result.images);
        setConversionStats(result);

        const methodText = result.method === 'pdftoimg-js' ? 'Fast PDF-to-Image conversion' : 'PDF conversion';
        const performanceText = result.performance?.render
          ? ` in ${result.performance.render}ms`
          : '';

        toast({
          title: "Success!",
          description: `Converted ${result.renderedPages || result.images.length} pages using ${methodText}${performanceText}`,
        });

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
        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="space-y-4">
              <div className={`mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ${
                isDragging ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <Upload className={`w-8 h-8 md:w-10 md:h-10 ${
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>

              <div>
                <p className="text-lg font-medium mb-1">
                  Drop PDF here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF files up to 50MB
                </p>
              </div>

              <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Choose File
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              title="Select a PDF file"
              aria-label="PDF file input"
            />
          </div>
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
                <button onClick={reset} className="p-1 hover:bg-destructive/20 rounded">
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
                    fileType="image"
                    title="PDF Converted to Images"
                    description={`Successfully converted ${resultImages.length} pages to ${conversionStats.format?.toUpperCase() || 'PNG'} images`}
                    fileSize={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    multipleFiles={resultImages.map(img => ({
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
