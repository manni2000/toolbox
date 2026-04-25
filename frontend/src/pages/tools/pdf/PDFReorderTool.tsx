import { useState, useRef } from "react";
import { Upload, ArrowUpDown, X, FileText, GripVertical, Sparkles, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "0 70% 50%";

const PDFReorderTool = () => {
  const toolSeoData = getToolSeoMetadata('pdf-reorder');
  const [file, setFile] = useState<{ file: File; name: string } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [reorderedUrl, setReorderedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (newFile: File | null) => {
    if (!newFile || newFile.type !== "application/pdf") return;
    setFile({ file: newFile, name: newFile.name });
    setReorderedUrl(null);
    
    // Load PDF to get page count
    newFile.arrayBuffer().then(async (buffer) => {
      try {
        const pdf = await PDFDocument.load(buffer);
        const count = pdf.getPageCount();
        setPageCount(count);
        setPageOrder(Array.from({ length: count }, (_, i) => i));
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const movePage = (from: number, to: number) => {
    const updated = [...pageOrder];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setPageOrder(updated);
    setReorderedUrl(null);
  };

  const reorder = async () => {
    if (!file || pageOrder.length === 0) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Add pages in new order
      for (const pageIndex of pageOrder) {
        const [page] = await newPdf.copyPages(pdf, [pageIndex]);
        newPdf.addPage(page);
      }

      const reorderedBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(reorderedBytes)], { type: "application/pdf" });
      setReorderedUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error reordering PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {CategorySEO.PDF(
        toolSeoData?.title || "PDF Reorder Pages",
        toolSeoData?.description || "Reorder pages in your PDF document",
        "pdf-reorder"
      )}
      <ToolLayout
        title={toolSeoData?.title || "PDF Reorder Pages"}
        description={toolSeoData?.description || "Reorder pages in your PDF document"}
        category="PDF Tools"
        categoryPath="/category/pdf"
      >
      <div className="space-y-6">
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}
            >
              <ArrowUpDown className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Reorder PDF Pages</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Drag and drop to rearrange pages in your PDF document. Perfect for organizing reports, presentations, and more.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        {!file && (
          <PDFUploadZone
            isDragging={isDragging}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={(selectedFile) => handleFile(selectedFile)}
            multiple={false}
            title="Drop PDF file here or click to browse"
            subtitle="Select a PDF file to reorder its pages (up to 50MB)"
          />
        )}

        {/* Page Reorder Interface */}
        {file && pageCount > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Pages ({pageCount})</h3>
              <button
                onClick={() => {
                  setFile(null);
                  setPageCount(0);
                  setPageOrder([]);
                  setReorderedUrl(null);
                }}
                className="text-sm text-destructive hover:underline"
              >
                Remove File
              </button>
            </div>
            <div className="space-y-2">
              {pageOrder.map((pageIndex, position) => (
                <div
                  key={position}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <GripVertical className="h-5 w-5 cursor-move text-muted-foreground" />
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 text-sm">Page {pageIndex + 1}</span>
                  <div className="flex gap-1">
                    {position > 0 && (
                      <button
                        onClick={() => movePage(position, position - 1)}
                        className="rounded p-1 hover:bg-muted"
                        title="Move up"
                        aria-label="Move page up"
                      >
                        ↑
                      </button>
                    )}
                    {position < pageOrder.length - 1 && (
                      <button
                        onClick={() => movePage(position, position + 1)}
                        className="rounded p-1 hover:bg-muted"
                        title="Move down"
                        aria-label="Move page down"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {file && (
          <div className="flex gap-4">
            <button
              onClick={reorder}
              disabled={isProcessing}
              className="btn-primary flex-1"
            >
              <ArrowUpDown className="h-5 w-5" />
              {isProcessing ? "Reordering..." : "Reorder Pages"}
            </button>
          </div>
        )}

        {reorderedUrl && (
          <div className="flex justify-center mt-6">
            <EnhancedDownload
              data={reorderedUrl}
              fileName={file ? `${file.name.replace(/\.[^/.]+$/, "")}-reordered.pdf` : "reordered.pdf"}
              fileType="pdf"
              title="PDF Pages Reordered"
              description="Your PDF pages have been reordered successfully"
              fileSize={file ? `${(file.file.size / 1024 / 1024).toFixed(2)} MB` : "Unknown"}
            />
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
            <Layers className="h-5 w-5 text-blue-500" />
            What is PDF Page Reordering?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF page reordering allows you to change the order of pages in a PDF document. This is useful for organizing reports, fixing page sequences, or customizing document layouts.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>Use the up/down arrows to reorder pages</li>
            <li>Click "Reorder Pages" to apply changes</li>
            <li>Download the reorganized PDF</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Reorder Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Easy drag-free reordering</li>
                <li>• Visual page numbering</li>
                <li>• Original quality preserved</li>
                <li>• Fast processing</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Report organization</li>
                <li>• Presentation sequencing</li>
                <li>• Document assembly</li>
                <li>• Page correction</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        <ToolFAQ faqs={[
          {
            question: "Can I reorder pages in password-protected PDFs?",
            answer: "No, you'll need to unlock the PDF first using the PDF Unlock tool, then reorder the pages."
          },
          {
            question: "Will the quality of my PDF be affected?",
            answer: "No, the reordering process preserves the original quality of all pages. Text, images, and formatting remain unchanged."
          },
          {
            question: "Is there a limit to the number of pages I can reorder?",
            answer: "You can reorder PDFs with any number of pages. Processing time may vary based on file size and page count."
          },
          {
            question: "Can I save multiple page orders?",
            answer: "Currently, you can only work on one reordering at a time. Download your reordered PDF before starting a new reordering."
          },
          {
            question: "What happens to bookmarks and metadata?",
            answer: "Bookmarks and metadata may need to be updated after reordering, as page numbers have changed."
          }
        ]} />
      </div>
    </ToolLayout>
    </>
  );
};

export default PDFReorderTool;
