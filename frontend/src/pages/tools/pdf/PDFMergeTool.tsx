import { useState, useRef } from "react";
import { Upload, Merge, X, FileText, GripVertical, Sparkles, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import { CategorySEO } from "@/components/ToolSEO";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "0 70% 50%";

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
      // console.error("Error merging PDFs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {CategorySEO.PDF(
        "PDF Merge",
        "Combine multiple PDF files into one document",
        "pdf-merge"
      )}
      <ToolLayout
        title="PDF Merge"
        description="Combine multiple PDF files into one document"
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
              <Layers className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Merge PDFs Seamlessly</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Combine multiple PDF files into a single document. Drag to reorder pages.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        <PDFUploadZone
          isDragging={isDragging}
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onFileSelect={(file) => {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            handleFiles(dataTransfer.files);
          }}
          multiple={true}
          title="Drop PDF files here or click to browse"
          subtitle="Select multiple PDF files to merge (up to 50MB each)"
        />

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
                        title="Move file up"
                        aria-label="Move file up"
                      >
                        ↑
                      </button>
                    )}
                    {index < files.length - 1 && (
                      <button
                        onClick={() => moveFile(index, index + 1)}
                        className="rounded p-1 hover:bg-muted"
                        title="Move file down"
                        aria-label="Move file down"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="rounded-lg p-1 text-destructive hover:bg-destructive/10"
                    title="Remove file"
                    aria-label="Remove file"
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
              fileName={files.length > 0 ? `${files[0].name.replace(/\.[^/.]+$/, "")}-merged.pdf` : "merged.pdf"}
              fileType="pdf"
              title="PDFs Merged Successfully"
              description={`${files.length} PDF files have been merged into one document`}
              fileSize={`${(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB`}
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
            What is PDF Merging?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF merging combines multiple PDF files into a single document. This is useful for organizing related documents, creating comprehensive reports, or consolidating files for easier sharing and archiving.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload multiple PDF files</li>
            <li>Arrange the order by dragging</li>
            <li>The tool merges them into one PDF</li>
            <li>Download the combined document</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Merge Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Drag to reorder pages</li>
                <li>• Multiple file support</li>
                <li>• Original quality preserved</li>
                <li>• Fast processing</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Report compilation</li>
                <li>• Document organization</li>
                <li>• Contract assembly</li>
                <li>• Archive creation</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Is there a limit to how many PDFs I can merge?",
            answer: "You can merge multiple PDFs together. The exact limit depends on file sizes and system resources. For very large merges, consider doing them in batches."
          },
          {
            question: "Will the quality of my PDFs be affected?",
            answer: "No, the merging process preserves the original quality of all PDFs. Text, images, and formatting remain unchanged in the merged document."
          },
          {
            question: "Can I change the order of pages after uploading?",
            answer: "Yes, you can drag and drop the uploaded PDFs to rearrange their order before merging. The final merged PDF will follow the order you specify."
          },
          {
            question: "What happens to bookmarks and metadata?",
            answer: "Bookmarks and metadata from individual PDFs may be preserved or combined depending on the merging method. Complex bookmarks may need manual adjustment."
          },
          {
            question: "Can I merge password-protected PDFs?",
            answer: "You'll need to unlock password-protected PDFs first before merging. Use the PDF Unlock tool to remove passwords, then merge the unlocked files."
          }
        ]} />
      </div>
    </ToolLayout>
    </>
  );
};

export default PDFMergeTool;
