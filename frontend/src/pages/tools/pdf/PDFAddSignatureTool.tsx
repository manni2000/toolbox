import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Image as ImageIcon, ChevronLeft, ChevronRight, Download, Trash2, Move } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import ToolFAQ from "@/components/ToolFAQ";
import { useToast } from "@/hooks/use-toast";

// pdf-lib for writing, pdfjs-dist for rendering preview
import { PDFDocument } from "pdf-lib";

const categoryColor = "0 70% 50%";

interface SignaturePlacement {
  id: string;
  dataUrl: string;
  x: number; // percent of canvas width
  y: number; // percent of canvas height
  w: number; // percent of canvas width
  h: number; // percent of canvas height
  page: number; // 1-based
}

const PDFAddSignatureTool = () => {
  const toolSeoData = getToolSeoMetadata("pdf-add-signature");
  const { toast } = useToast();

  // File state
  const [file, setFile] = useState<{ file: File; name: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // PDF render state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Signature state
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Placements
  const [placements, setPlacements] = useState<SignaturePlacement[]>([]);

  // Drag/resize interaction
  const interactRef = useRef<{
    type: "drag" | "resize";
    id: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    overlayW: number;
    overlayH: number;
  } | null>(null);

  // Download state
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // ─── Load PDF ───────────────────────────────────────────────────────────────

  const handleFile = useCallback(async (newFile: File | null) => {
    if (!newFile || newFile.type !== "application/pdf") return;
    setFile({ file: newFile, name: newFile.name });
    setSignedUrl(null);
    setPlacements([]);
    setCurrentPage(1);

    try {
      const ab = await newFile.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker before loading document
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs';
      
      const doc = await pdfjsLib.getDocument({ data: ab }).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
    } catch (e) {
      setTimeout(() => {
        toast({ title: "Error loading PDF", description: "Could not parse this PDF file.", variant: "destructive" });
      }, 0);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  }, [handleFile]);

  // ─── Render PDF page ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;
    setIsRendering(true);

    (async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = canvasRef.current!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error("[PDFAddSignature] render error:", err);
      }
      if (!cancelled) setIsRendering(false);
    })();

    return () => { cancelled = true; };
  }, [pdfDoc, currentPage]);

  // ─── Load Signature ──────────────────────────────────────────────────────────

  const handleSignatureUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload a PNG or JPG image.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSignatureDataUrl(ev.target?.result as string);
      toast({ title: "Signature loaded", description: "Click 'Place Signature' to add it to the PDF." });
    };
    reader.readAsDataURL(f);
  }, [toast]);

  // ─── Place signature centered on current page ────────────────────────────────

  const placeSignature = useCallback(() => {
    if (!signatureDataUrl) return;
    const newPlacement: SignaturePlacement = {
      id: Math.random().toString(36).slice(2),
      dataUrl: signatureDataUrl,
      x: 30, // % from left
      y: 40, // % from top
      w: 28, // % width
      h: 10, // % height
      page: currentPage,
    };
    setPlacements((prev) => [...prev, newPlacement]);
    setSignedUrl(null);
  }, [signatureDataUrl, currentPage]);

  const removePlacement = useCallback((id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    setSignedUrl(null);
  }, []);

  const clearPagePlacements = useCallback(() => {
    setPlacements((prev) => prev.filter((p) => p.page !== currentPage));
    setSignedUrl(null);
  }, [currentPage]);

  // ─── Mouse drag / resize ─────────────────────────────────────────────────────

  const onMouseDownDrag = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const overlay = overlayRef.current;
    if (!overlay) return;
    const placement = placements.find((p) => p.id === id)!;
    const rect = overlay.getBoundingClientRect();
    interactRef.current = {
      type: "drag", id,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startX: placement.x, startY: placement.y,
      startW: placement.w, startH: placement.h,
      overlayW: rect.width, overlayH: rect.height,
    };
  }, [placements, overlayRef]);

  const onMouseDownResize = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const overlay = overlayRef.current;
    if (!overlay) return;
    const placement = placements.find((p) => p.id === id)!;
    const rect = overlay.getBoundingClientRect();
    interactRef.current = {
      type: "resize", id,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startX: placement.x, startY: placement.y,
      startW: placement.w, startH: placement.h,
      overlayW: rect.width, overlayH: rect.height,
    };
  }, [placements, overlayRef]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const ref = interactRef.current;
      if (!ref) return;
      const dx = ((e.clientX - ref.startMouseX) / ref.overlayW) * 100;
      const dy = ((e.clientY - ref.startMouseY) / ref.overlayH) * 100;

      setPlacements((prev) =>
        prev.map((p) => {
          if (p.id !== ref.id) return p;
          if (ref.type === "drag") {
            return {
              ...p,
              x: Math.max(0, Math.min(100 - p.w, ref.startX + dx)),
              y: Math.max(0, Math.min(100 - p.h, ref.startY + dy)),
            };
          } else {
            return {
              ...p,
              w: Math.max(5, Math.min(100 - p.x, ref.startW + dx)),
              h: Math.max(3, Math.min(100 - p.y, ref.startH + dy)),
            };
          }
        })
      );
    };
    const onUp = () => { interactRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  // ─── Download ────────────────────────────────────────────────────────────────

  const doDownload = useCallback(async () => {
    if (!file || placements.length === 0) return;
    setIsProcessing(true);
    try {
      const ab = await file.file.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(ab);
      const pages = pdfLibDoc.getPages();
      const canvas = canvasRef.current!;

      // Get actual PDF page dimensions for coordinate mapping
      for (const sig of placements) {
        const pdfPage = pages[sig.page - 1];
        if (!pdfPage) continue;
        const { width: pw, height: ph } = pdfPage.getSize();

        // Convert % positions to PDF coordinates (PDF origin is bottom-left)
        const pdfX = (sig.x / 100) * pw;
        const pdfY = ph - ((sig.y + sig.h) / 100) * ph;
        const pdfW = (sig.w / 100) * pw;
        const pdfH = (sig.h / 100) * ph;

        const imgBytes = await fetch(sig.dataUrl).then((r) => r.arrayBuffer());
        let embedded;
        try { embedded = await pdfLibDoc.embedPng(imgBytes); }
        catch { embedded = await pdfLibDoc.embedJpg(imgBytes); }

        pdfPage.drawImage(embedded, { x: pdfX, y: pdfY, width: pdfW, height: pdfH });
      }

      const bytes = await pdfLibDoc.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setSignedUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "-signed.pdf";
      a.click();

      toast({ title: "Download started", description: "Your signed PDF is ready." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to process PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [file, placements]);

  const reset = useCallback(() => {
    setFile(null);
    setPdfDoc(null);
    setPlacements([]);
    setSignedUrl(null);
    setCurrentPage(1);
    setTotalPages(1);
    setSignatureDataUrl(null);
  }, []);

  // Memoized handlers for inline functions
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handlePDFUploadClick = useCallback(() => {
    // PDFUploadZone handles its own click internally
  }, []);

  const handleSignatureInputClick = useCallback(() => {
    signatureInputRef.current?.click();
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const handleRemovePlacementWithStop = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removePlacement(id);
  }, [removePlacement]);

  const handleRemovePlacement = useCallback((id: string) => {
    removePlacement(id);
  }, [removePlacement]);

  const pagePlacements = placements.filter((p) => p.page === currentPage);

  return (
    <>
      {CategorySEO.PDF(
        toolSeoData?.title || "PDF Add Signature",
        toolSeoData?.description || "Add your signature to PDF documents",
        "pdf-add-signature"
      )}
      <ToolLayout
        title="PDF Add Signature"
        description="Add your signature to PDF documents"
        category="PDF Tools"
        categoryPath="/category/pdf"
      >
        <div className="space-y-6">
          {/* Hero */}
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
                style={{
                  backgroundColor: `hsl(${categoryColor} / 0.15)`,
                  boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
                }}
              >
                <ImageIcon className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Add Signature to PDF</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload your PDF, load a signature image, then drag and resize it exactly where you need it.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upload */}
          {!file && (
            <PDFUploadZone
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handlePDFUploadClick}
              onFileSelect={handleFile}
              multiple={false}
              title="Drop PDF file here or click to browse"
              subtitle="Select a PDF to add your signature (up to 50MB)"
            />
          )}

          
          {/* Editor */}
          {file && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
              {/* Left — PDF Preview */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* File bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                  <button onClick={reset} className="text-xs text-destructive hover:underline flex-shrink-0">Remove</button>
                </div>

                {/* Canvas + overlay */}
                <div className="relative bg-[#525659] select-none" style={{ touchAction: "none" }}>
                  {isRendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#525659] z-10">
                      <div className="h-7 w-7 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    </div>
                  )}
                  <canvas ref={canvasRef} className="w-full h-auto block" />

                  {/* Signature overlay */}
                  <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
                    {pagePlacements.map((sig) => (
                      <div
                        key={sig.id}
                        className="absolute pointer-events-auto"
                        style={{
                          left: `${sig.x}%`,
                          top: `${sig.y}%`,
                          width: `${sig.w}%`,
                          height: `${sig.h}%`,
                          border: "2px solid #1a73e8",
                          borderRadius: 3,
                          cursor: "move",
                          background: "rgba(255,255,255,0.04)",
                        }}
                        onMouseDown={(e) => onMouseDownDrag(e, sig.id)}
                      >
                        {/* Signature image */}
                        <img
                          src={sig.dataUrl}
                          alt="signature"
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                        {/* Delete */}
                        <button
                          className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 z-10"
                          onClick={(e) => handleRemovePlacementWithStop(e, sig.id)}
                        >
                          ×
                        </button>
                        {/* Resize handle */}
                        <div
                          className="absolute bottom-[-4px] right-[-4px] w-3 h-3 bg-blue-600 rounded-sm cursor-nwse-resize z-10"
                          onMouseDown={(e) => onMouseDownResize(e, sig.id)}
                        />
                        {/* Move icon */}
                        <div className="absolute top-1 left-1 opacity-50">
                          <Move className="w-3 h-3 text-blue-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page navigation */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right — Controls */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                {/* Signature upload */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Signature</p>
                  <div
                    onClick={handleSignatureInputClick}
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {signatureDataUrl ? "Click to change signature" : "Upload PNG / JPG signature"}
                    </p>
                  </div>
                  <input ref={signatureInputRef} type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />

                  {signatureDataUrl && (
                    <div className="mt-2 bg-white border border-border rounded-lg p-2 flex items-center justify-center" style={{ minHeight: 60 }}>
                      <img src={signatureDataUrl} alt="Your signature" className="max-h-14 max-w-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Place button */}
                <button
                  onClick={placeSignature}
                  disabled={!signatureDataUrl}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  style={{ backgroundColor: `hsl(${categoryColor})` }}
                >
                  <ImageIcon className="h-4 w-4" />
                  Place Signature on Page {currentPage}
                </button>

                {pagePlacements.length > 0 && (
                  <button
                    onClick={clearPagePlacements}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm border border-border bg-background hover:bg-muted transition"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Clear page {currentPage} signatures
                  </button>
                )}

                {/* Tip */}
                {pagePlacements.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Drag to reposition · Pull corner handle to resize · × to delete
                  </p>
                )}

                {/* Signature summary */}
                {placements.length > 0 && (
                  <div className="rounded-lg bg-muted/30 border border-border p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Placed</p>
                    {placements.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-muted-foreground">Signature on page {p.page}</span>
                        <button onClick={() => handleRemovePlacement(p.id)} className="text-destructive hover:underline">remove</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Download */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Download</p>
                  <button
                    onClick={doDownload}
                    disabled={placements.length === 0 || isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <Download className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Download Signed PDF"}
                  </button>
                  {placements.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">Place at least one signature to download.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              What is PDF Signature?
            </h3>
            <p className="text-muted-foreground mb-4">
              Add your handwritten signature to PDF documents digitally. Perfect for contracts, agreements, and official documents without printing.
            </p>
            <h4 className="font-semibold mb-2">How It Works</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>Upload your PDF document — it renders as a live preview</li>
              <li>Upload your signature image (PNG or JPG)</li>
              <li>Click "Place Signature" — then drag it anywhere on the page</li>
              <li>Resize using the corner handle, delete with the × button</li>
              <li>Click "Download Signed PDF" to save</li>
            </ol>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Signature Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Drag & drop positioning</li>
                  <li>• Resizable signature box</li>
                  <li>• Multi-page support</li>
                  <li>• Multiple signatures per PDF</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Contract signing</li>
                  <li>• Agreement authorization</li>
                  <li>• Form completion</li>
                  <li>• Document approval</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8">
          <ToolFAQ
            faqs={[
              {
                question: "Is the signature legally binding?",
                answer:
                  "Digital signatures can be legally binding in many jurisdictions, but requirements vary. For important legal documents, consult with a legal professional about signature requirements in your jurisdiction.",
              },
              {
                question: "Can I add multiple signatures?",
                answer:
                  "Yes! Place as many signatures as you need across any pages. Each one can be dragged and resized independently. All are embedded when you download.",
              },
              {
                question: "Can I reposition after placing?",
                answer:
                  "Absolutely. After placing a signature, drag it anywhere on the page. Use the blue corner handle to resize, and the × button to delete it.",
              },
              {
                question: "What file formats are supported?",
                answer: "PDF files for the document, and PNG or JPG images for the signature.",
              },
              {
                question: "Is my signature stored anywhere?",
                answer:
                  "No. All processing happens entirely in your browser. Your signature and documents are never uploaded to any server.",
              },
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default PDFAddSignatureTool;