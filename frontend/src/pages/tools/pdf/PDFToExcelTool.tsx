import { useState, useRef } from "react";
import { FileText, Upload, X, Loader2, Sparkles, Table } from "lucide-react";
import { motion } from "framer-motion";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "0 70% 50%";

const PDFToExcelTool = () => {
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
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.PDF_TO_EXCEL}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setResultData(result.data || result.result || result.file || result.image || result.pdf || result.video || result.xlsx);
        toast({
          title: "Success!",
          description: "PDF to Excel completed successfully",
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
        "PDF to Excel",
        "Extract tables from PDF to Excel spreadsheets",
        "pdf-to-excel"
      )}
      <ToolLayout
      title="PDF to Excel"
      description="Extract tables from PDF to Excel spreadsheets"
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
            title="Drop PDF file here"
            subtitle="Extract tables to Excel spreadsheets"
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
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear selected file">
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
                  fileName={fileName.replace(/\.[^/.]+$/, ".xlsx")}
                  fileType="excel"
                  title="PDF Converted to Excel"
                  description="Your PDF has been successfully converted to an Excel spreadsheet"
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
            <Table className="h-5 w-5 text-blue-500" />
            What is PDF to Excel Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF to Excel conversion transforms PDF tables and data into editable Excel spreadsheets. This enables you to extract tabular data from PDFs for analysis, calculations, and data manipulation in spreadsheet applications.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>The tool extracts tables and data</li>
            <li>Data is converted to Excel format</li>
            <li>Download the editable spreadsheet</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Conversion Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Table detection</li>
                <li>• Data extraction</li>
                <li>• Formatting preserved</li>
                <li>• Multiple sheets</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Financial reports</li>
                <li>• Data analysis</li>
                <li>• Invoice processing</li>
                <li>• Data migration</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How accurate is the PDF to Excel conversion?",
            answer: "Conversion accuracy depends on the PDF structure. Well-structured tables convert accurately. Complex layouts, merged cells, or scanned PDFs may require manual adjustment after conversion."
          },
          {
            question: "Will formulas be preserved?",
            answer: "No, PDFs don't contain formulas—only the calculated values. The converted Excel will contain the values as numbers or text, not the original formulas."
          },
          {
            question: "Can I convert scanned PDFs to Excel?",
            answer: "Scanned PDFs require OCR (Optical Character Recognition) to extract text. This tool works best with native PDFs containing actual text and tables, not images of text."
          },
          {
            question: "What happens to complex formatting?",
            answer: "Basic formatting like bold, italics, and cell colors may be preserved. Complex formatting, merged cells, or conditional formatting may not convert perfectly and need manual adjustment."
          },
          {
            question: "Can I convert password-protected PDFs?",
            answer: "Password-protected PDFs must be unlocked first. Use the PDF Unlock tool to remove the password, then convert the unlocked PDF to Excel format."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default PDFToExcelTool;
