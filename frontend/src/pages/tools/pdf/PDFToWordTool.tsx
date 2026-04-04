import { useState, useRef } from "react";
import { Upload, FileText, Download, X, FileType, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";

const categoryColor = "0 70% 50%";

interface ConversionResult {
  success: boolean;
  file?: string;
  error?: string;
  filename?: string;
}

const PDFToWordTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [docxData, setDocxData] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }
    setFile(f);
    setDocxData(null);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to load PDF file",
        variant: "destructive",
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setDocxData(null);
    setConversionResult(null);
  };

  const convertToWord = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch(`${API_URLS.PDF_TO_WORD}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setDocxData(result.file || result.docx);
        setConversionResult(result);
        toast({
          title: "Success!",
          description: "PDF converted to Word document successfully",
        });
        
        // Auto-scroll to download section after a short delay
        setTimeout(() => {
          const downloadSection = document.getElementById('download-section');
          if (downloadSection) {
            downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      } else {
        throw new Error(result.error || 'Failed to convert PDF to Word');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert PDF to Word",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Word"
      description="Convert PDF documents to editable Word files (.docx)"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        {!file && (
          <PDFUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            title="Drop your PDF here"
            subtitle="Convert to editable Word document"
          />
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{file.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted flex-shrink-0" title="Remove file">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-6">
              <h3 className="mb-3 font-semibold text-sm sm:text-base">Conversion Features</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="hidden sm:inline">Maintains original formatting and layout</span>
                  <span className="sm:hidden">Maintains formatting</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="hidden sm:inline">Preserves images, tables, and charts</span>
                  <span className="sm:hidden">Preserves images & tables</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="hidden sm:inline">Extracts text for easy editing</span>
                  <span className="sm:hidden">Extracts text for editing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="hidden sm:inline">Compatible with Microsoft Word & Google Docs</span>
                  <span className="sm:hidden">Compatible with Word & Docs</span>
                </li>
              </ul>
            </div>

            <button
              onClick={convertToWord}
              disabled={isProcessing}
              className="btn-primary w-full text-sm sm:text-base py-3 sm:py-3.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="hidden sm:inline">Converting to Word...</span>
                  <span className="sm:hidden">Converting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Convert to Word (.docx)</span>
                  <span className="sm:hidden">Convert to Word</span>
                </>
              )}
            </button>

            {docxData && (
              <div id="download-section" className="flex justify-center">
                <EnhancedDownload
                  data={docxData}
                  fileName={conversionResult?.filename || file.name.replace(/\.[^/.]+$/, ".docx")}
                  fileType="word"
                  title="PDF Converted to Word"
                  description="Your PDF has been successfully converted to an editable Word document"
                  fileSize={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  pageCount={pageCount}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFToWordTool;
