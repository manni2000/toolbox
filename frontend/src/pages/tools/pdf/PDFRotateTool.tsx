import { useState, useRef } from "react";
import { Upload, RotateCw, FileText, X, Sparkles, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument, degrees } from "pdf-lib";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "0 70% 50%";

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
      // console.error("Error rotating pages:", error);
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
    <>
      {CategorySEO.PDF(
        "PDF Rotate Pages",
        "Rotate individual pages or entire PDF documents",
        "pdf-rotate-pages"
      )}
      <ToolLayout
      title="PDF Rotate Pages"
      description="Rotate individual pages or entire PDF documents"
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
            subtitle="Rotate pages as needed"
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
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Reset PDF">
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
                  fileName={file ? file.name.replace(/\.[^/.]+$/, "-rotated.pdf") : "rotated.pdf"}
                  fileType="pdf"
                  title="PDF Rotated Successfully"
                  description={`Your PDF has been rotated according to your specifications`}
                  fileSize={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                />
              </div>
            )}
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
            <RotateCw className="h-5 w-5 text-blue-500" />
            What is PDF Rotation?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF rotation changes the orientation of pages in a PDF document. This corrects scanned documents that were saved in the wrong orientation, fixes upside-down pages, or adjusts pages for better viewing and printing.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>Select pages to rotate</li>
            <li>Choose rotation direction (90°, 180°, 270°)</li>
            <li>Download the rotated PDF</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Rotation Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 90° clockwise</li>
                <li>• 180° flip</li>
                <li>• 270° counter-clockwise</li>
                <li>• Rotate all or specific pages</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Fix scanned documents</li>
                <li>• Correct orientation</li>
                <li>• Prepare for printing</li>
                <li>• Improve readability</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Can I rotate individual pages or all pages?",
            answer: "You can rotate individual pages, specific page ranges, or all pages at once. Choose the pages you want to rotate and apply the rotation to just those pages."
          },
          {
            question: "Will rotation affect the quality of the PDF?",
            answer: "No, rotation doesn't affect image quality or text clarity. The content is simply reoriented without any loss of quality or resolution."
          },
          {
            question: "Can I undo rotation?",
            answer: "Yes, you can rotate pages back to their original orientation. Simply rotate them in the opposite direction or by the remaining degrees (e.g., rotate 270° to undo a 90° rotation)."
          },
          {
            question: "What happens to page size when rotating?",
            answer: "Page dimensions remain the same. A portrait page rotated 90° becomes landscape, but the actual page size doesn't change—only the content orientation does."
          },
          {
            question: "Can I rotate password-protected PDFs?",
            answer: "Password-protected PDFs must be unlocked first. Use the PDF Unlock tool to remove the password, then you can rotate the pages in the unlocked document."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default PDFRotateTool;
