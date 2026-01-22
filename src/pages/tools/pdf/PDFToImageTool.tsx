import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Download, FileText, X } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";

const PDFToImageTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
    } catch (error) {
      console.error("Error loading PDF:", error);
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
  };

  return (
    <ToolLayout
      title="PDF to Image"
      description="Convert PDF pages to images"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex gap-4">
            <ImageIcon className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                Backend Processing Recommended
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF to image conversion works best with server-side rendering. 
                Enable Lovable Cloud for high-quality conversions.
              </p>
            </div>
          </div>
        </div>

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
            <p className="text-sm text-muted-foreground">Convert pages to PNG or JPEG</p>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Output Format</label>
                <select className="input-field w-full" disabled>
                  <option>PNG</option>
                  <option>JPEG</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Quality</label>
                <select className="input-field w-full" disabled>
                  <option>High (300 DPI)</option>
                  <option>Medium (150 DPI)</option>
                  <option>Low (72 DPI)</option>
                </select>
              </div>
            </div>

            <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
              <ImageIcon className="h-5 w-5" />
              Convert to Images
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Enable backend integration for PDF to image conversion
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFToImageTool;
