import { useState, useRef } from "react";
import { ImageIcon, Upload, X, Loader2, FileImage } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";

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
  totalPages: number;
  renderedPages: number;
  format: string;
  pdfName: string;
  method: string;
}

const PDFToImageTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [resultImages, setResultImages] = useState<ImageResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [conversionStats, setConversionStats] = useState<ConversionResult | null>(null);
  const [progress, setProgress] = useState(0);
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
    setProgress(0);
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
    setProgress(0);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    const images: ImageResult[] = [];

    try {
      // Dynamically import PDF.js with worker
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker before loading document
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 2; // Higher scale for better quality
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        const imageDataUrl = canvas.toDataURL('image/png');
        const imageName = numPages === 1 
          ? `${file.name.replace('.pdf', '')}.png`
          : `${file.name.replace('.pdf', '')}-${i}.png`;

        images.push({
          page: i,
          image: imageDataUrl,
          name: imageName,
          width: viewport.width,
          height: viewport.height,
          format: 'png',
        });

        // Update progress
        setProgress(Math.round((i / numPages) * 100));
      }

      setResultImages(images);
      setConversionStats({
        success: true,
        images,
        totalPages: numPages,
        renderedPages: numPages,
        format: 'png',
        pdfName: file.name,
        method: 'client-side-pdfjs',
      });

      toast({
        title: "Success!",
        description: `Converted ${numPages} pages to PNG images`,
      });

      setTimeout(() => {
        downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('PDF to image conversion error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert PDF to images",
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
                Convert each PDF page to image files.
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
                  {progress > 0 ? `Processing... ${progress}%` : 'Processing...'}
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Convert to Images
                </>
              )}
            </button>

            {isProcessing && progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Converting pages...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {resultImages.length > 0 && conversionStats && (
              <div className="space-y-4">
                {/* Download Section */}
                <div ref={downloadSectionRef} className="flex justify-center">
                  <EnhancedDownload
                    data={resultImages[0].image}
                    fileName={resultImages[0].name}
                    fileType="image"
                    title="PDF Converted to Images"
                    description={`Successfully converted ${resultImages.length} pages to PNG images`}
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

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default PDFToImageTool;
