import { useState, useRef } from "react";
import { Upload, RotateCw, FileText, X } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument, degrees } from "pdf-lib";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const PDFRotateTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
    setResultUrl(null);
    setRotations({});

    const arrayBuffer = await f.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    setPageCount(pdf.getPageCount());
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const rotatePage = (page: number) => {
    setRotations((prev) => ({
      ...prev,
      [page]: ((prev[page] || 0) + 90) % 360,
    }));
    setResultUrl(null);
  };

  const rotateAll = (angle: number) => {
    const newRotations: Record<number, number> = {};
    for (let i = 1; i <= pageCount; i++) {
      newRotations[i] = angle;
    }
    setRotations(newRotations);
    setResultUrl(null);
  };

  const applyRotations = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      pdf.getPages().forEach((page, index) => {
        const rotation = rotations[index + 1] || 0;
        if (rotation) {
          page.setRotation(degrees(page.getRotation().angle + rotation));
        }
      });

      const resultBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(resultBytes)], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error rotating pages:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setRotations({});
    setResultUrl(null);
  };

  const hasRotations = Object.values(rotations).some((r) => r !== 0);

  return (
    <ToolLayout
      title="PDF Rotate Pages"
      description="Rotate individual pages or entire PDF documents"
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
            <p className="text-sm text-muted-foreground">Rotate pages as needed</p>
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

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => rotateAll(90)} className="btn-secondary text-sm">
                Rotate All 90°
              </button>
              <button onClick={() => rotateAll(180)} className="btn-secondary text-sm">
                Rotate All 180°
              </button>
              <button onClick={() => rotateAll(270)} className="btn-secondary text-sm">
                Rotate All 270°
              </button>
              <button onClick={() => setRotations({})} className="btn-secondary text-sm">
                Reset All
              </button>
            </div>

            {/* Page Grid */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Click pages to rotate 90°</h3>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => rotatePage(page)}
                    className="relative flex aspect-[3/4] flex-col items-center justify-center rounded-lg border border-border bg-muted transition-all hover:border-primary"
                  >
                    <RotateCw
                      className="h-5 w-5 text-primary transition-transform"
                      style={{ transform: `rotate(${rotations[page] || 0}deg)` }}
                    />
                    <span className="mt-1 text-xs">{page}</span>
                    {rotations[page] ? (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {rotations[page]}°
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={applyRotations}
                disabled={isProcessing || Object.keys(rotations).length === 0}
                className="btn-primary flex-1"
              >
                <RotateCw className="h-5 w-5" />
                {isProcessing ? "Processing..." : "Apply Rotations"}
              </button>
            </div>

            {resultUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={resultUrl}
                  fileName="rotated.pdf"
                  fileType="pdf"
                  title="PDF Rotated Successfully"
                  description={`Your PDF has been rotated according to your specifications`}
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

export default PDFRotateTool;
