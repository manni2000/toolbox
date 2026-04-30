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
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";

const categoryColor = "0 70% 50%";

interface ConversionResult {
  success: boolean;
  file?: string;
  error?: string;
  filename?: string;
}

const PDFToWordTool = () => {
  const toolSeoData = getToolSeoMetadata('pdf-to-word');
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
      // console.error("Error loading PDF:", error);
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
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.PDF_TO_WORD}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Convert base64 to a blob URL for downloading
        const base64 = result.file || result.docx;
        const byteChars = atob(base64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i);
        }
        const blob = new Blob([new Uint8Array(byteNums)], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const blobUrl = URL.createObjectURL(blob);

        setDocxData(blobUrl);
        setConversionResult({ ...result, filename: result.filename });
        toast({
          title: "Success!",
          description: "PDF converted to Word document successfully",
        });

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
    <>
      {CategorySEO.PDF(
        toolSeoData?.title || "PDF to Word",
        toolSeoData?.description || "Convert PDF documents to editable Word files (.docx)",
        "pdf-to-word"
      )}
      <ToolLayout
      breadcrumbTitle="PDF to Word"
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
              <Sparkles className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">PDF to Word Converter Free Online</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert PDF documents to editable Word files while maintaining formatting. Perfect for editing contracts, reports, and documents.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  pdf to word converter
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  convert pdf to word free
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  pdf to docx
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  edit pdf in word
                </span>
              </div>
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileType className="h-5 w-5 text-blue-500" />
            What is PDF to Word Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF to Word conversion transforms PDF documents into editable Microsoft Word (.docx) files. This enables you to extract, edit, and reuse content from PDFs in Word processors, making documents easier to modify and update.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>The tool extracts text and formatting</li>
            <li>Layout is converted to Word format</li>
            <li>Download the editable Word document</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Conversion Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Text extraction</li>
                <li>• Formatting preserved</li>
                <li>• Tables converted</li>
                <li>• Images included</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Document editing</li>
                <li>• Content reuse</li>
                <li>• Format conversion</li>
                <li>• Text extraction</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-8">
          <ToolFAQ faqs={[
          {
            question: "How accurate is the PDF to Word conversion?",
            answer: "Conversion accuracy depends on the PDF structure. Text-based PDFs convert well with good formatting. Scanned PDFs need OCR for text extraction. Complex layouts may require manual adjustment."
          },
          {
            question: "Will images be preserved in the Word document?",
            answer: "Yes, images embedded in the PDF are typically extracted and included in the Word document. However, image positioning may need manual adjustment for complex layouts."
          },
          {
            question: "Can I convert scanned PDFs to Word?",
            answer: "Scanned PDFs require OCR (Optical Character Recognition) to extract text. This tool works best with text-based PDFs. For scanned documents, use an OCR tool first."
          },
          {
            question: "What happens to tables in the PDF?",
            answer: "Tables are converted to Word tables when possible. Complex or nested tables may convert to text or require manual reformatting in Word."
          },
          {
            question: "Can I convert password-protected PDFs?",
            answer: "Password-protected PDFs must be unlocked first. Use the PDF Unlock tool to remove the password, then convert the unlocked PDF to Word format."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default PDFToWordTool;
