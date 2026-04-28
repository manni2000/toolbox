import { useState, useRef } from "react";
import { Upload, Crop, X, FileText, Sparkles, Scissors } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "0 70% 50%";

const CropPDFTool = () => {
  const toolSeoData = getToolSeoMetadata('crop-pdf');
  const [file, setFile] = useState<{ file: File; name: string } | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [marginTop, setMarginTop] = useState(0);
  const [marginBottom, setMarginBottom] = useState(0);
  const [marginLeft, setMarginLeft] = useState(0);
  const [marginRight, setMarginRight] = useState(0);
  const [applyToAllPages, setApplyToAllPages] = useState(true);
  const [selectedPage, setSelectedPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const handleFile = (newFile: File | null) => {
    if (!newFile || newFile.type !== "application/pdf") return;
    setFile({ file: newFile, name: newFile.name });
    setCroppedUrl(null);
    
    newFile.arrayBuffer().then(async (buffer) => {
      try {
        const pdf = await PDFDocument.load(buffer);
        setPageCount(pdf.getPageCount());
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

  const cropPDF = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();

      const pagesToCrop = applyToAllPages ? pages : [pages[selectedPage]];

      for (const page of pagesToCrop) {
        const { width, height } = page.getSize();
        
        const dpi = 96;
        const pointsPerPixel = 72 / dpi;
        
        const cropLeft = marginLeft * pointsPerPixel;
        const cropRight = marginRight * pointsPerPixel;
        const cropTop = marginTop * pointsPerPixel;
        const cropBottom = marginBottom * pointsPerPixel;

        // Set the crop box
        page.setCropBox(
          cropLeft,
          cropBottom,
          width - cropLeft - cropRight,
          height - cropTop - cropBottom
        );
      }

      const croppedBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(croppedBytes)], { type: "application/pdf" });
      setCroppedUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error cropping PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetMargins = () => {
    setMarginTop(0);
    setMarginBottom(0);
    setMarginLeft(0);
    setMarginRight(0);
  };

  return (
    <>
      {CategorySEO.PDF(
        toolSeoData?.title || "Crop PDF",
        toolSeoData?.description || "Crop margins from PDF pages",
        "crop-pdf"
      )}
      <ToolLayout
        title="Crop PDF"
        description="Crop margins from PDF pages"
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
              <h2 className="text-2xl font-bold">Crop PDF Pages</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Remove unwanted margins from PDF pages. Perfect for cleaning up documents, removing headers/footers, and standardizing page sizes.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">crop pdf</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">pdf cropper</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">trim pdf</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">margin remover</span>
              </div>
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
            subtitle="Select a PDF file to crop (up to 50MB)"
          />
        )}

        {file && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPageCount(1);
                    setSelectedPage(0);
                    setCroppedUrl(null);
                    resetMargins();
                  }}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove File
                </button>
              </div>
            </div>

            {/* Page Selection */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Apply To</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="applyToAll"
                    checked={applyToAllPages}
                    onChange={(e) => setApplyToAllPages(e.target.checked)}
                    className="rounded border-input"
                  />
                  <label htmlFor="applyToAll" className="text-sm">All Pages</label>
                </div>
              </div>
              
              {!applyToAllPages && pageCount > 1 && (
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                >
                  {Array.from({ length: pageCount }, (_, i) => (
                    <option key={i} value={i}>Page {i + 1}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Margin Settings */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Crop Margins (pixels)</label>
                <button
                  onClick={resetMargins}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Top</label>
                  <input
                    type="number"
                    value={marginTop}
                    onChange={(e) => setMarginTop(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Bottom</label>
                  <input
                    type="number"
                    value={marginBottom}
                    onChange={(e) => setMarginBottom(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Left</label>
                  <input
                    type="number"
                    value={marginLeft}
                    onChange={(e) => setMarginLeft(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Right</label>
                  <input
                    type="number"
                    value={marginRight}
                    onChange={(e) => setMarginRight(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Enter margin values in pixels to remove from each side. Use 0 to keep the edge.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={cropPDF}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              <Scissors className="h-5 w-5" />
              {isProcessing ? "Cropping..." : "Crop PDF"}
            </button>
          </div>
        )}

        {croppedUrl && (
          <div className="flex justify-center mt-6">
            <EnhancedDownload
              data={croppedUrl}
              fileName={file ? `${file.name.replace(/\.[^/.]+$/, "")}-cropped.pdf` : "cropped.pdf"}
              fileType="pdf"
              title="PDF Cropped Successfully"
              description="Your PDF margins have been cropped"
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
            <Scissors className="h-5 w-5 text-blue-500" />
            What is PDF Cropping?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF cropping allows you to remove unwanted margins from PDF pages. This is useful for eliminating headers, footers, page numbers, or excess whitespace from documents.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>Set the margin values for each side</li>
            <li>Choose to apply to all pages or specific pages</li>
            <li>Click "Crop PDF" and download</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Crop Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Precise margin control</li>
                <li>• Apply to all or specific pages</li>
                <li>• Original quality preserved</li>
                <li>• Easy reset option</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Remove headers/footers</li>
                <li>• Clean up scanned documents</li>
                <li>• Standardize page sizes</li>
                <li>• Eliminate whitespace</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        <ToolFAQ faqs={[
          {
            question: "What unit are the margins in?",
            answer: "Margins are specified in pixels. The tool automatically converts these to PDF points (72 points per inch) for accurate cropping."
          },
          {
            question: "Can I crop different margins for different pages?",
            answer: "Currently, you can crop all pages with the same margins, or crop a single page. For different margins on different pages, crop them one at a time."
          },
          {
            question: "Will cropping affect the quality of my PDF?",
            answer: "No, cropping only changes the visible area. The content quality remains unchanged. The file size may slightly decrease."
          },
          {
            question: "Can I undo the cropping?",
            answer: "Once cropped and downloaded, you cannot undo. Keep your original file safe. You can always re-upload the original to try different margins."
          },
          {
            question: "What if I set margins that are too large?",
            answer: "If margins exceed the page size, the page may become empty or partially visible. Start with small margin values and adjust as needed."
          }
        ]} />
      </div>
    </ToolLayout>
    </>
  );
};

export default CropPDFTool;
