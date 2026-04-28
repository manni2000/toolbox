import { useState, useRef } from "react";
import { Upload, Scissors, FileText, X, Settings, Download, Sparkles, SplitSquareHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { useToast } from "@/hooks/use-toast";

const categoryColor = "0 70% 50%";

const PDFSplitTool = () => {
  const toolSeoData = getToolSeoMetadata('pdf-split');
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<"range" | "extract">("range");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [extractPages, setExtractPages] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (f.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File Too Large",
        description: "Please select a PDF smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(f);
    setResultUrl(null);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);
      setEndPage(count);
      setStartPage(1);

      toast({
        title: "PDF Loaded",
        description: `Loaded ${f.name} with ${count} pages`,
      });
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Failed to load the PDF file. Please try a different file.",
        variant: "destructive",
      });
    }
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

  const split = async () => {
    if (!file) {
      toast({
        title: "No PDF Selected",
        description: "Please select a PDF file first.",
        variant: "destructive",
      });
      return;
    }

    const pagesToCopy: number[] = [];

    if (splitMode === "range") {
      if (startPage < 1 || startPage > pageCount || endPage < startPage || endPage > pageCount) {
        toast({
          title: "Invalid Range",
          description: "Please enter valid page numbers within the document range.",
          variant: "destructive",
        });
        return;
      }
      for (let i = startPage - 1; i < endPage; i++) {
        pagesToCopy.push(i);
      }
    } else {
      if (!extractPages.trim()) {
        toast({
          title: "No Pages Specified",
          description: "Please enter page numbers to extract.",
          variant: "destructive",
        });
        return;
      }

      // Parse extract pages (e.g., "1,3,5-7")
      const parts = extractPages.split(",");
      parts.forEach((part) => {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map((n) => parseInt(n.trim()));
          if (start && end && start <= end) {
            for (let i = start; i <= end; i++) {
              if (i > 0 && i <= pageCount) pagesToCopy.push(i - 1);
            }
          }
        } else {
          const page = parseInt(part.trim());
          if (page > 0 && page <= pageCount) pagesToCopy.push(page - 1);
        }
      });

      if (pagesToCopy.length === 0) {
        toast({
          title: "No Valid Pages",
          description: "No valid pages found in your specification.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const pages = await newPdf.copyPages(sourcePdf, pagesToCopy);
      pages.forEach((page) => newPdf.addPage(page));

      const resultBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(resultBytes)], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));

      toast({
        title: "PDF Split Complete",
        description: `Extracted ${pagesToCopy.length} page${pagesToCopy.length > 1 ? 's' : ''} from the original PDF`,
      });
    } catch (error) {
      // console.error("Error splitting PDF:", error);
      toast({
        title: "Split Failed",
        description: "Failed to split the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setResultUrl(null);
  };

  return (
    <>
      {CategorySEO.PDF(
        toolSeoData?.title || "PDF Split",
        toolSeoData?.description || "Extract specific pages from a PDF document.",
        "pdf-split"
      )}
      <ToolLayout
      title="PDF Split"
      description="Extract specific pages from a PDF document."
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
              <Scissors className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Split PDF Pages</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Extract specific pages or page ranges from your PDF documents.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">split pdf</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">extract pdf pages</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">pdf separator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">pdf page extractor</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">pdf splitter</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">split pdf free</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">extract pdf pages</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">divide pdf</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upload Section */}
        {!file && (
          <motion.div variants={scaleIn} initial="hidden" animate="visible" className="rounded-xl border border-border bg-card p-6 shadow-lg">

            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              <h3 className="text-base font-semibold">
                Upload PDF File
              </h3>
            </div>

            <PDFUploadZone
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onFileSelect={handleFile}
              title="Drop PDF file here or click to browse"
              subtitle="Supports PDF files up to 50MB"
            />

          </motion.div>
        )}

        {/* File Info and Settings */}
        {file && (
          <div className="space-y-6">

            {/* File Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Split Options */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">
                  Split Options
                </h3>
              </div>

              <div className="space-y-4">

                {/* Split Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSplitMode("range")}
                    className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
                      splitMode === "range"
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    Page Range
                  </button>
                  <button
                    onClick={() => setSplitMode("extract")}
                    className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
                      splitMode === "extract"
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    Specific Pages
                  </button>
                </div>

                {/* Range Mode */}
                {splitMode === "range" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Start Page
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={startPage}
                        onChange={(e) => setStartPage(Math.max(1, Math.min(pageCount, parseInt(e.target.value) || 1)))}
                        placeholder="Enter start page"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        End Page
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={endPage}
                        onChange={(e) => setEndPage(Math.max(1, Math.min(pageCount, parseInt(e.target.value) || 1)))}
                        placeholder="Enter end page"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Extract Mode */}
                {splitMode === "extract" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Pages to Extract
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1,3,5-7,10"
                      value={extractPages}
                      onChange={(e) => setExtractPages(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Use commas for individual pages and dashes for ranges (e.g., 1,3,5-7)
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Action Button */}
            <button
              onClick={split}
              disabled={isProcessing}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Scissors className="h-5 w-5" />
              {isProcessing ? "Splitting PDF..." : "Split PDF"}
            </button>

          </div>
        )}

        {/* Download */}
        {resultUrl && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Split PDF Ready</h3>
            </div>
            <EnhancedDownload
              data={resultUrl}
              fileName={file ? file.name.replace(/\.[^/.]+$/, "-split.pdf") : "split_document.pdf"}
              fileType="pdf"
              title="Download Split PDF"
              description="Your split PDF document is ready for download"
              fileSize="Variable"
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
            <SplitSquareHorizontal className="h-5 w-5 text-blue-500" />
            What is PDF Splitting?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF splitting separates a single PDF document into multiple files. This allows you to extract specific pages, split by page ranges, or separate sections for easier sharing, editing, or organization of document content.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>Specify split method (range, extract, etc.)</li>
            <li>The tool separates the pages</li>
            <li>Download the split PDF files</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Split Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Extract specific pages</li>
                <li>• Split by page ranges</li>
                <li>• Separate every N pages</li>
                <li>• Remove specific pages</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Extract chapters</li>
                <li>• Separate attachments</li>
                <li>• Create smaller files</li>
                <li>• Share specific sections</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What split methods are available?",
            answer: "Common methods include extracting specific pages, splitting by page ranges (e.g., 1-5, 6-10), separating every N pages, or removing specific pages from the document."
          },
          {
            question: "Will splitting affect the quality of pages?",
            answer: "No, splitting preserves the original quality of each page. Text, images, and formatting remain unchanged in the extracted PDF files."
          },
          {
            question: "Can I split password-protected PDFs?",
            answer: "You'll need to unlock password-protected PDFs first. Use the PDF Unlock tool to remove the password, then you can split the unlocked document."
          },
          {
            question: "How do I specify page ranges?",
            answer: "Page ranges can be specified using formats like '1-5' for pages 1 through 5, '1,3,5' for specific pages, or '1-' for page 1 to the end."
          },
          {
            question: "What happens to bookmarks and links?",
            answer: "Bookmarks and internal links within split sections are preserved. However, links that reference pages outside the split section may become invalid."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default PDFSplitTool;
