import { useState, useRef } from "react";
import { Upload, FileText, Download, X, Presentation } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";

const PDFToPowerPointTool = () => {
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
      title="PDF to PowerPoint"
      description="Convert PDF documents to editable PowerPoint presentations (.pptx)"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
          <div className="flex gap-4">
            <Presentation className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <h4 className="font-semibold text-primary">
                Backend Processing Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF to PowerPoint conversion requires server-side processing.
                Enable Lovable Cloud for full functionality.
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
            <p className="text-sm text-muted-foreground">Convert to editable PowerPoint slides</p>
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
                  <p className="text-sm text-muted-foreground">{pageCount} pages → {pageCount} slides</p>
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
                  Each PDF page becomes a slide
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Preserves images and graphics
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Editable text boxes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Compatible with PowerPoint & Google Slides
                </li>
              </ul>
            </div>

            <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
              <Download className="h-5 w-5" />
              Convert to PowerPoint (.pptx)
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Enable backend integration for PDF to PowerPoint conversion
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFToPowerPointTool;
