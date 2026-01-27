import { useState, useRef } from "react";
import { Upload, FileText, Download, X, FileType, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

const PDFToWordTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [docxData, setDocxData] = useState<string | null>(null);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setDocxData(null);
  };

  const convertToWord = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:8000/api/pdf/to-word/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setDocxData(result.docx);
        toast({
          title: "Success!",
          description: "PDF converted to Word document successfully",
        });
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
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop your PDF here</p>
            <p className="text-sm text-muted-foreground">Convert to editable Word document</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <h3 className="mb-3 font-semibold">Conversion Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Maintains original formatting and layout
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Preserves images, tables, and charts
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Extracts text for easy editing
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Compatible with Microsoft Word & Google Docs
                </li>
              </ul>
            </div>

            <button
              onClick={convertToWord}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Converting to Word...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Convert to Word (.docx)
                </>
              )}
            </button>

            {docxData && (
              <div className="flex gap-4">
                <a
                  href={docxData}
                  download="converted.docx"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Word Document
                </a>
                <button onClick={reset} className="btn-secondary flex items-center gap-2">
                  <X className="h-5 w-5" />
                  Convert Another
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFToWordTool;
