import { useState, useRef } from "react";
import { Upload, FileText, Download, X, Presentation } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const PowerPointToPDFTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint"
  ];

  const handleFile = (f: File) => {
    if (!acceptedTypes.includes(f.type) && !f.name.match(/\.(ppt|pptx)$/i)) {
      alert("Please upload a PowerPoint file (.ppt or .pptx)");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setFile(null);
  };

  return (
    <ToolLayout
      title="PowerPoint to PDF"
      description="Convert PowerPoint presentations (.ppt, .pptx) to PDF format"
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
                PowerPoint to PDF conversion requires server-side processing.
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
            <p className="mt-4 text-lg font-medium">Drop your PowerPoint here</p>
            <p className="text-sm text-muted-foreground">Supports .ppt and .pptx files</p>
            <input
              ref={inputRef}
              type="file"
              accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Presentation className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                  Each slide becomes a PDF page
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Preserves animations as static content
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Maintains transitions and effects
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Perfect for sharing and printing
                </li>
              </ul>
            </div>

            <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
              <Download className="h-5 w-5" />
              Convert to PDF
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Enable backend integration for PowerPoint to PDF conversion
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PowerPointToPDFTool;
