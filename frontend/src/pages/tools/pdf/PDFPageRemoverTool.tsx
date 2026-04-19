import { useState, useRef } from "react";
import { Upload, Trash2, FileText, X, Sparkles, MinusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "0 70% 50%";

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
      // console.error("Error removing pages:", error);
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
                  fileName={file ? file.name.replace(/\.[^/.]+$/, "-pages-removed.pdf") : "modified.pdf"}
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MinusCircle className="h-5 w-5 text-blue-500" />
            What is PDF Page Removal?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF page removal deletes specific pages from a PDF document. This is useful for removing unwanted pages, blank pages, or sensitive content from PDFs without needing to recreate the entire document.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>Select pages to remove</li>
            <li>The tool deletes selected pages</li>
            <li>Download the cleaned PDF</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Removal Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select specific pages</li>
                <li>• Preview before removal</li>
                <li>• Quality preserved</li>
                <li>• Fast processing</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Remove blank pages</li>
                <li>• Delete sensitive content</li>
                <li>• Clean up documents</li>
                <li>• Reduce file size</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Can I undo page removal?",
            answer: "No, page removal is permanent. Always keep a backup of your original PDF before removing pages. The tool creates a new file without the deleted pages."
          },
          {
            question: "Will removing pages affect the remaining content?",
            answer: "No, removing pages only affects the specified pages. All other pages remain unchanged with their original formatting and content intact."
          },
          {
            question: "Can I remove multiple pages at once?",
            answer: "Yes, you can select multiple pages to remove simultaneously. Select all the pages you want to delete before processing the document."
          },
          {
            question: "What happens to bookmarks and links?",
            answer: "Bookmarks and links pointing to removed pages become invalid. Bookmarks and links to remaining pages are preserved in the updated document."
          },
          {
            question: "Can I remove pages from password-protected PDFs?",
            answer: "Password-protected PDFs must be unlocked first. Use the PDF Unlock tool to remove the password, then you can delete pages from the unlocked document."
          }
        ]} />
      </div>
    </ToolLayout>
  );
};

export default PDFPageRemoverTool;
