import { useState, useRef } from "react";
import { FileText, Upload, X, Loader2, Sparkles, Code2, Link, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";

const categoryColor = "0 70% 50%";

const HTMLToPDFTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "url">("file");
  const [resultData, setResultData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    format: "A4",
    orientation: "portrait",
    margin: "1cm",
    scale: 1
  });
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
    setResultData(null);
  };

  const processFile = async () => {
    if (!file && !urlInput.trim()) return;

    setIsProcessing(true);

    try {
      let requestBody: Record<string, unknown>;
      
      if (inputMode === "url" && urlInput.trim()) {
        requestBody = {
          url: urlInput.trim(),
          options: pdfOptions,
        };
      } else if (file) {
        const htmlContent = await file.text();
        requestBody = {
          html: htmlContent,
          options: pdfOptions,
        };
      } else {
        throw new Error("No input provided");
      }

      const response = await fetch(`${API_URLS.HTML_TO_PDF}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        setResultData(result.file || result.pdf || result.data || JSON.stringify(result.result, null, 2));
        toast({
          title: "Success!",
          description: "HTML to PDF completed successfully with full styling",
        });
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to process');
      }
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
    <ToolLayout
      title="HTML to PDF"
      description="Convert HTML pages to PDF documents with full styling, images, and formatting"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        {/* Input Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => { setInputMode("file"); setUrlInput(""); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === "file" ? "bg-background shadow-sm" : "hover:bg-background/50"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => { setInputMode("url"); setFile(null); setFileName(""); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === "url" ? "bg-background shadow-sm" : "hover:bg-background/50"
            }`}
          >
            <Link className="h-4 w-4 inline mr-2" />
            Enter URL
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
            subtitle="Convert HTML pages to PDF with full styling preserved"
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

        {/* PDF Options */}
        {(file || urlInput.trim()) && !resultData && (
          <div className="space-y-4">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Settings2 className="h-4 w-4" />
              {showOptions ? "Hide" : "Show"} PDF Options
            </button>

            {showOptions && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-card">
                <div>
                  <label htmlFor="pdf-page-size" className="block text-xs font-medium mb-1">Page Size</label>
                  <select
                    id="pdf-page-size"
                    value={pdfOptions.format}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, format: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                    <option value="A3">A3</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="pdf-orientation" className="block text-xs font-medium mb-1">Orientation</label>
                  <select
                    id="pdf-orientation"
                    value={pdfOptions.orientation}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, orientation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="pdf-margin" className="block text-xs font-medium mb-1">Margin</label>
                  <select
                    id="pdf-margin"
                    value={pdfOptions.margin}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, margin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="0">None</option>
                    <option value="0.5cm">Small (0.5cm)</option>
                    <option value="1cm">Normal (1cm)</option>
                    <option value="2cm">Large (2cm)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="pdf-scale" className="block text-xs font-medium mb-1">Scale</label>
                  <select
                    id="pdf-scale"
                    value={pdfOptions.scale}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, scale: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="0.5">50%</option>
                    <option value="0.75">75%</option>
                    <option value="1">100%</option>
                    <option value="1.25">125%</option>
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={processFile}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Converting... (This may take a moment)
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {resultData && (
          <div ref={downloadSectionRef} className="space-y-4">
            <EnhancedDownload
              data={resultData}
              fileName={fileName ? fileName.replace(/\.[^/.]+$/, ".pdf") : "converted.pdf"}
              fileType="pdf"
              title="HTML Converted to PDF"
              description="Your HTML has been converted with full styling, images, and formatting preserved"
              fileSize={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : undefined}
            />
            <button onClick={reset} className="btn-secondary w-full">
              Convert Another
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default HTMLToPDFTool;
