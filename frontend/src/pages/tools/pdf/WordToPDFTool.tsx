import { useState, useRef } from "react";
import { FileText, Upload, X, Loader2, Sparkles, FileOutput } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "0 70% 50%";

const WordToPDFTool = () => {
  const toolSeoData = getToolSeoMetadata('word-to-pdf');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [resultData, setResultData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = (f: File) => {
    setFile(f);
    setFileName(f.name);
    setResultData(null);
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
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setFile(null);
    setFileName("");
    setResultData(null);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.WORD_TO_PDF}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setResultData(result.data || result.result || result.file || result.image || result.pdf || result.video);
        toast({
          title: "Success!",
          description: "Word to PDF completed successfully",
        });
        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to process file');
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
    <>
      {CategorySEO.PDF(
        toolSeoData?.title || "Word to PDF",
        toolSeoData?.description || "Convert Word documents to PDF",
        "word-to-pdf"
      )}
      <ToolLayout
      breadcrumbTitle="Word to PDF"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        {/* Keyword Tags Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-muted/50 via-background to-muted/30 rounded-xl border border-border p-6"
        >
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
              <FileText className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Word to PDF Converter Free Online</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert Word documents to PDF. Transform your DOCX files into universally compatible PDF format.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">word to pdf</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">docx to pdf</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">convert word document</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">pdf converter</span>
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
            accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx"
            title="Drop Word file here"
            subtitle="Convert Word documents to PDF"
          />
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" aria-label="Clear file selection">
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={processFile}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Process File
                </>
              )}
            </button>

            {resultData && (
              <div ref={downloadSectionRef} className="flex justify-center">
                <EnhancedDownload
                  data={resultData}
                  fileName={fileName.replace(/\.[^/.]+$/, ".pdf")}
                  fileType="pdf"
                  title="Word Converted to PDF"
                  description="Your Word document has been successfully converted to PDF"
                  fileSize={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
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
            <FileOutput className="h-5 w-5 text-blue-500" />
            What is Word to PDF Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            Word to PDF conversion transforms Microsoft Word documents into PDF format. This ensures documents maintain consistent formatting across all devices and platforms, making them ideal for sharing, printing, and archiving.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your Word document</li>
            <li>The tool converts to PDF format</li>
            <li>Layout and formatting are preserved</li>
            <li>Download the PDF document</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Conversion Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Formatting preserved</li>
                <li>• Fonts embedded</li>
                <li>• Images included</li>
                <li>• Tables converted</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Document sharing</li>
                <li>• Print preparation</li>
                <li>• Legal documents</li>
                <li>• Resume submission</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Will the PDF look exactly like my Word document?",
            answer: "PDF conversion preserves most formatting including fonts, colors, and layout. However, very complex layouts or advanced Word features may have slight differences in the PDF."
          },
          {
            question: "Can I convert password-protected Word documents?",
            answer: "You'll need to unlock password-protected Word files first. The resulting PDF won't have the original password unless you specifically add PDF protection."
          },
          {
            question: "What happens to track changes and comments?",
            answer: "Track changes and comments are typically not included in standard PDF conversion. The PDF shows the document as it would appear with all changes accepted and comments hidden."
          },
          {
            question: "Will the PDF be searchable?",
            answer: "Yes, text in the PDF remains searchable and selectable. The PDF preserves the text layer from the Word document, allowing you to search, copy, and extract text."
          },
          {
            question: "What's the difference between DOC and DOCX conversion?",
            answer: "Both DOC (older format) and DOCX (newer XML-based format) can be converted to PDF. DOCX is the modern standard and generally converts more reliably with better quality."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default WordToPDFTool;
