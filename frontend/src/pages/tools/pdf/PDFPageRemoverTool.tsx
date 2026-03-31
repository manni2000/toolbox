import { useState, useRef } from "react";
import { Upload, Trash2, FileText, X } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";

const PDFPageRemoverTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagesToRemove, setPagesToRemove] = useState<number[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
    setResultUrl(null);
    setPagesToRemove([]);

    const arrayBuffer = await f.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    setPageCount(pdf.getPageCount());
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

  const togglePage = (page: number) => {
    setPagesToRemove((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
    setResultUrl(null);
  };

  const removePages = async () => {
    if (!file || pagesToRemove.length === 0) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const pagesToKeep = Array.from({ length: pageCount }, (_, i) => i)
        .filter((i) => !pagesToRemove.includes(i + 1));

      const pages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      pages.forEach((page) => newPdf.addPage(page));

      const resultBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(resultBytes)], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error removing pages:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setPagesToRemove([]);
    setResultUrl(null);
  };

  return (
    <ToolLayout
      title="PDF Page Remover"
      description="Remove specific pages from your PDF document"
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
            subtitle="Select pages to remove"
          />
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
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear PDF">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Select Pages to Remove</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => togglePage(page)}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg font-medium transition-all ${
                      pagesToRemove.includes(page)
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              {pagesToRemove.length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {pagesToRemove.length} page(s) selected for removal: {pagesToRemove.sort((a, b) => a - b).join(", ")}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={removePages}
                disabled={isProcessing || pagesToRemove.length === 0 || pagesToRemove.length === pageCount}
                className="btn-primary flex-1"
              >
                <Trash2 className="h-5 w-5" />
                {isProcessing ? "Processing..." : "Remove Pages"}
              </button>
            </div>

            {resultUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={resultUrl}
                  fileName="modified.pdf"
                  fileType="pdf"
                  title="Pages Removed Successfully"
                  description={`${pagesToRemove.length} page(s) have been removed from your PDF`}
                  fileSize={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                />
              </div>
            )}

            {pagesToRemove.length === pageCount && (
              <p className="text-center text-sm text-destructive">
                Cannot remove all pages from PDF
              </p>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFPageRemoverTool;
