import { useState, useRef } from "react";
import { Upload, Scissors, FileText, X } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const PDFSplitTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<"range" | "extract">("range");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [extractPages, setExtractPages] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
    setResultUrl(null);

    const arrayBuffer = await f.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const count = pdf.getPageCount();
    setPageCount(count);
    setEndPage(count);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const split = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      let pagesToCopy: number[] = [];

      if (splitMode === "range") {
        for (let i = startPage - 1; i < endPage; i++) {
          pagesToCopy.push(i);
        }
      } else {
        // Parse extract pages (e.g., "1,3,5-7")
        const parts = extractPages.split(",");
        parts.forEach((part) => {
          if (part.includes("-")) {
            const [start, end] = part.split("-").map((n) => parseInt(n.trim()));
            for (let i = start; i <= end; i++) {
              if (i > 0 && i <= pageCount) pagesToCopy.push(i - 1);
            }
          } else {
            const page = parseInt(part.trim());
            if (page > 0 && page <= pageCount) pagesToCopy.push(page - 1);
          }
        });
      }

      const pages = await newPdf.copyPages(sourcePdf, pagesToCopy);
      pages.forEach((page) => newPdf.addPage(page));

      const resultBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(resultBytes)], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error splitting PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setResultUrl(null);
  };

  return (
    <ToolLayout
      title="PDF Split"
      description="Extract specific pages from a PDF document"
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
            <p className="text-sm text-muted-foreground">Select pages to extract</p>
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
                  <p className="text-sm text-muted-foreground">{pageCount} pages</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Split Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setSplitMode("range")}
                className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
                  splitMode === "range"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                Page Range
              </button>
              <button
                onClick={() => setSplitMode("extract")}
                className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
                  splitMode === "extract"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                Extract Specific
              </button>
            </div>

            {splitMode === "range" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Start Page</label>
                  <input
                    type="number"
                    value={startPage}
                    onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={pageCount}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">End Page</label>
                  <input
                    type="number"
                    value={endPage}
                    onChange={(e) => setEndPage(Math.min(pageCount, parseInt(e.target.value) || pageCount))}
                    min={startPage}
                    max={pageCount}
                    className="input-field w-full"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium">Pages to Extract</label>
                <input
                  type="text"
                  value={extractPages}
                  onChange={(e) => setExtractPages(e.target.value)}
                  placeholder="e.g., 1,3,5-7,10"
                  className="input-field w-full"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Use commas and ranges (e.g., 1,3,5-7)
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={split}
                disabled={isProcessing}
                className="btn-primary flex-1"
              >
                <Scissors className="h-5 w-5" />
                {isProcessing ? "Processing..." : "Split PDF"}
              </button>
            </div>

            {resultUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={resultUrl}
                  fileName="split.pdf"
                  fileType="pdf"
                  title="PDF Split Successfully"
                  description={`Your PDF has been split according to your specifications`}
                  fileSize={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFSplitTool;
