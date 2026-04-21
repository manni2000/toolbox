import { useState, useRef } from "react";
import { FileText, X, Loader2, Link } from "lucide-react";
import { motion } from "framer-motion";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "0 70% 50%";

const HTMLToPDFTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "url" | "paste">("file");
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
    setUrlInput("");
    setHtmlContent("");
    setResultData(null);
  };

  const processFile = async () => {
    if (!file && !urlInput.trim() && !htmlContent.trim()) return;

    setIsProcessing(true);

    try {
      let requestBody: Record<string, unknown>;
      
      if (inputMode === "url" && urlInput.trim()) {
        // For URL mode, we need to fetch the HTML content first
        const htmlResponse = await fetch(urlInput.trim());
        if (!htmlResponse.ok) {
          throw new Error('Failed to fetch URL content');
        }
        const content = await htmlResponse.text();
        requestBody = {
          html: content,
          title: new URL(urlInput.trim()).hostname,
        };
      } else if (inputMode === "paste" && htmlContent.trim()) {
        requestBody = {
          html: htmlContent,
          title: "Pasted Content",
        };
      } else if (file) {
        const content = await file.text();
        requestBody = {
          html: content,
          title: file.name.replace(/\.[^/.]+$/, ""),
        };
      } else {
        throw new Error("No input provided");
      }

      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.HTML_TO_PDF}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to process');
      }

      // Handle binary PDF response
      const pdfBuffer = await response.arrayBuffer();
      const pdfBase64 = btoa(
        new Uint8Array(pdfBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      setResultData(`data:application/pdf;base64,${pdfBase64}`);
      
      toast({
        title: "Success!",
        description: "HTML converted to PDF successfully",
      });
      setTimeout(() => {
        downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {CategorySEO.PDF(
        "HTML to PDF",
        "Convert HTML content to PDF documents",
        "html-to-pdf"
      )}
      <ToolLayout
      title="HTML to PDF"
      description="Convert HTML content to PDF documents"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        {/* Input Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => { setInputMode("file"); setUrlInput(""); setHtmlContent(""); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === "file" ? "bg-background shadow-sm" : "hover:bg-background/50"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => { setInputMode("url"); setFile(null); setFileName(""); setHtmlContent(""); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === "url" ? "bg-background shadow-sm" : "hover:bg-background/50"
            }`}
          >
            <Link className="h-4 w-4 inline mr-2" />
            Enter URL
          </button>
          <button
            onClick={() => { setInputMode("paste"); setFile(null); setFileName(""); setUrlInput(""); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === "paste" ? "bg-background shadow-sm" : "hover:bg-background/50"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Paste HTML
          </button>
        </div>

        {/* URL Input Mode */}
        {inputMode === "url" && !resultData && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <label htmlFor="website-url" className="block text-sm font-medium mb-2">Website URL</label>
              <input
                id="website-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/page.html"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the full URL of the webpage you want to convert
              </p>
            </div>
          </div>
        )}

        {/* Paste HTML Mode */}
        {inputMode === "paste" && !resultData && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <label htmlFor="html-content" className="block text-sm font-medium mb-2">HTML Content</label>
              <textarea
                id="html-content"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<h1>Your HTML content here</h1><p>Paste or type your HTML code...</p>"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Paste your HTML content directly. The formatting will be preserved in the PDF.
              </p>
            </div>
          </div>
        )}

        {/* File Upload Mode */}
        {inputMode === "file" && !file && (
          <PDFUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            accept="text/html"
            title="Drop HTML file here"
            subtitle="Convert HTML content to PDF"
          />
        )}

        {/* File Selected */}
        {file && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear file selection">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Convert Button */}
        {(file || urlInput.trim() || htmlContent.trim()) && !resultData && (
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Convert to PDF
              </>
            )}
          </button>
        )}

        {/* Result */}
        {resultData && (
          <div ref={downloadSectionRef} className="space-y-4">
            <EnhancedDownload
              data={resultData}
              fileName={fileName ? fileName.replace(/\.[^/.]+$/, ".pdf") : "converted.pdf"}
              fileType="pdf"
              title="HTML Converted to PDF"
              description="Your HTML content has been converted to PDF"
              fileSize={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : undefined}
            />
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
            <FileText className="h-5 w-5 text-blue-500" />
            What is HTML to PDF Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            HTML to PDF conversion transforms web pages or HTML content into PDF documents. This is useful for creating printable versions of web content, archiving web pages, generating reports, or sharing formatted documents that maintain consistent appearance across devices.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your HTML file or enter HTML content</li>
            <li>The tool renders the HTML and converts to PDF</li>
            <li>Layout and styling are preserved</li>
            <li>Download the generated PDF document</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Conversion Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• CSS styling preserved</li>
                <li>• Layout maintained</li>
                <li>• Images embedded</li>
                <li>• Links clickable</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Invoice generation</li>
                <li>• Report creation</li>
                <li>• Web archiving</li>
                <li>• Document sharing</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Will CSS styling be preserved in the PDF?",
            answer: "Yes, most CSS styling including colors, fonts, and layout is preserved. However, some advanced CSS features may not render perfectly. Use standard CSS for best results."
          },
          {
            question: "Can I include images in the HTML?",
            answer: "Yes, images embedded in the HTML will be included in the PDF. Use absolute URLs or base64-encoded images for reliable inclusion."
          },
          {
            question: "What HTML features are supported?",
            answer: "Standard HTML5 elements including headings, paragraphs, lists, tables, forms, and basic CSS are supported. JavaScript execution is typically disabled for security."
          },
          {
            question: "How is page size determined?",
            answer: "PDF page size is typically A4 by default. You can control page breaks using CSS page-break properties or by setting specific dimensions in your HTML."
          },
          {
            question: "Can I convert a live website URL to PDF?",
            answer: "This tool converts HTML files or content. For live URLs, first save the page as HTML or use a specialized web-to-PDF service that can render live websites."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default HTMLToPDFTool;
