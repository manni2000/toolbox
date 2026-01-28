import { useState, useRef } from "react";
import { Upload, Merge, X, FileText, GripVertical } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const PDFMergeTool = () => {
  const [files, setFiles] = useState<{ file: File; name: string }[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfFiles = Array.from(newFiles)
      .filter((f) => f.type === "application/pdf")
      .map((file) => ({ file, name: file.name }));
    setFiles((prev) => [...prev, ...pdfFiles]);
    setMergedUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedUrl(null);
  };

  const moveFile = (from: number, to: number) => {
    const updated = [...files];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setFiles(updated);
    setMergedUrl(null);
  };

  const merge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const { file } of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" });
      setMergedUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error merging PDFs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Merge"
      description="Combine multiple PDF files into one document"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
        >
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Drop PDF files here</p>
          <p className="text-sm text-muted-foreground">Or click to browse (select multiple)</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Files to Merge ({files.length})</h3>
            <div className="space-y-2">
              {files.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <GripVertical className="h-5 w-5 cursor-move text-muted-foreground" />
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 truncate text-sm">{item.name}</span>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => moveFile(index, index - 1)}
                        className="rounded p-1 hover:bg-muted"
                      >
                        ↑
                      </button>
                    )}
                    {index < files.length - 1 && (
                      <button
                        onClick={() => moveFile(index, index + 1)}
                        className="rounded p-1 hover:bg-muted"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="rounded-lg p-1 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={merge}
            disabled={files.length < 2 || isProcessing}
            className="btn-primary flex-1"
          >
            <Merge className="h-5 w-5" />
            {isProcessing ? "Merging..." : "Merge PDFs"}
          </button>
        </div>

        {files.length === 1 && (
          <p className="text-center text-sm text-muted-foreground">
            Add at least 2 PDF files to merge
          </p>
        )}

        {mergedUrl && (
          <div className="flex justify-center mt-6">
            <EnhancedDownload
              data={mergedUrl}
              fileName="merged.pdf"
              fileType="pdf"
              title="PDFs Merged Successfully"
              description={`${files.length} PDF files have been merged into one document`}
              fileSize={`${(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB`}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFMergeTool;
