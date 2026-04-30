import { useState, useRef } from "react";
import { FileText, Upload, X, Loader2, Sparkles, Presentation } from "lucide-react";
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

const PDFToPowerPointTool = () => {
  const toolSeoData = getToolSeoMetadata('pdf-to-powerpoint');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [resultData, setResultData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
    formData.append('pdf', file);

    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.PDF_TO_POWERPOINT}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setResultData(result.data || result.result || result.file || result.image || result.pdf || result.video || result.pptx);
        toast({
          title: "Success!",
          description: "PDF to PowerPoint completed successfully",
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
        toolSeoData?.title || "PDF to PowerPoint",
        toolSeoData?.description || "Convert PDF to PowerPoint presentations",
        "pdf-to-powerpoint"
      )}
      <ToolLayout
      breadcrumbTitle="PDF to PowerPoint"
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
              <Presentation className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">PDF to PowerPoint Converter Free Online</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert PDF to PowerPoint presentations. Transform your PDF documents into editable slides.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">pdf to powerpoint</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">pdf to ppt</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">convert pdf to slides</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">pdf presentation maker</span>
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
            title="Drop PDF file here"
            subtitle="Convert to PowerPoint presentations"
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
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear selection">
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
                  fileName={fileName.replace(/\.[^/.]+$/, ".pptx")}
                  fileType="powerpoint"
                  title="PDF Converted to PowerPoint"
                  description="Your PDF has been successfully converted to a PowerPoint presentation"
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
            <Presentation className="h-5 w-5 text-blue-500" />
            What is PDF to PowerPoint Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF to PowerPoint conversion transforms PDF documents into editable PowerPoint presentations. This allows you to reuse PDF content in presentations, edit slides, and create presentations from existing documents.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>The tool extracts pages as slides</li>
            <li>Content is converted to PPT format</li>
            <li>Download the editable presentation</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Conversion Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Page to slide conversion</li>
                <li>• Text extraction</li>
                <li>• Images included</li>
                <li>• Basic formatting</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Presentation creation</li>
                <li>• Content reuse</li>
                <li>• Slide deck generation</li>
                <li>• Meeting materials</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How well does PDF convert to PowerPoint?",
            answer: "Conversion quality depends on PDF structure. Text-based PDFs with clear layouts convert best. Complex layouts, images, or scanned PDFs may require manual adjustment in PowerPoint."
          },
          {
            question: "Will images be preserved in the slides?",
            answer: "Yes, images from the PDF are typically extracted and placed on the corresponding slides. However, image positioning and sizing may need manual adjustment."
          },
          {
            question: "Can I convert scanned PDFs to PowerPoint?",
            answer: "Scanned PDFs require OCR to extract text. This tool works best with native PDFs. For scanned documents, use an OCR tool first, then convert to PowerPoint."
          },
          {
            question: "What about slide layouts and designs?",
            answer: "The conversion creates basic slides with extracted content. Original slide designs, animations, or transitions from the PDF won't be preserved—you'll need to apply PowerPoint themes."
          },
          {
            question: "Can I convert password-protected PDFs?",
            answer: "Password-protected PDFs must be unlocked first. Use the PDF Unlock tool to remove the password, then convert the unlocked PDF to PowerPoint."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default PDFToPowerPointTool;
