import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, PenTool, X, FileText, Sparkles, Download, RotateCcw, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument, rgb } from "pdf-lib";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import ToolFAQ from "@/components/ToolFAQ";
import { useToast } from "@/hooks/use-toast";

const categoryColor = "0 70% 50%";

const PDFAddSignatureTool = () => {
  const toolSeoData = getToolSeoMetadata('pdf-add-signature');
  const { toast } = useToast();
  const [file, setFile] = useState<{ file: File; name: string } | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  // Signature canvas state
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');

  const getCoordinates = useCallback((event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, [getCoordinates]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [isDrawing, getCoordinates]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureData(null);
      }
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio to fit image in canvas
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        setSignatureData(canvas.toDataURL('image/png'));
        
        toast({
          title: 'Signature Uploaded',
          description: 'Your signature image has been loaded successfully',
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (newFile: File | null) => {
    if (!newFile || newFile.type !== "application/pdf") return;
    setFile({ file: newFile, name: newFile.name });
    setSignedUrl(null);
    
    // Load PDF to get page count
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

  const addSignature = async () => {
    if (!file || !signatureData) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Convert signature data to image
      const signatureImageBytes = await fetch(signatureData).then(res => res.arrayBuffer());
      const signatureImage = await pdf.embedPng(signatureImageBytes);
      
      // Get the selected page
      const pages = pdf.getPages();
      const page = pages[selectedPage];
      
      // Calculate position (bottom right corner)
      const { width, height } = page.getSize();
      const sigWidth = 200;
      const sigHeight = (signatureImage.height / signatureImage.width) * sigWidth;
      
      // Add signature to page
      page.drawImage(signatureImage, {
        x: width - sigWidth - 20,
        y: 20,
        width: sigWidth,
        height: sigHeight,
      });

      const signedBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(signedBytes)], { type: "application/pdf" });
      setSignedUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error adding signature:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {CategorySEO.PDF(
        toolSeoData?.title || "PDF Add Signature",
        toolSeoData?.description || "Add your signature to PDF documents",
        "pdf-add-signature"
      )}
      <ToolLayout
        title={toolSeoData?.title || "PDF Add Signature"}
        description={toolSeoData?.description || "Add your signature to PDF documents"}
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
              <PenTool className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Add Signature to PDF</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Draw your signature and add it to any PDF document. Perfect for contracts, agreements, and official documents.
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
            subtitle="Select a PDF file to add your signature (up to 50MB)"
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
                    setSignedUrl(null);
                  }}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove File
                </button>
              </div>
            </div>

            {/* Page Selection */}
            {pageCount > 1 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <label className="block text-sm font-medium mb-3">Select Page to Add Signature</label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                >
                  {Array.from({ length: pageCount }, (_, i) => (
                    <option key={i} value={i}>Page {i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Signature Canvas */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Add Your Signature</label>
                <button
                  onClick={clearSignature}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSignatureMode('draw')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    signatureMode === 'draw' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <PenTool className="h-4 w-4 mx-auto mb-1" />
                  <span className="text-xs">Draw</span>
                </button>
                <button
                  onClick={() => setSignatureMode('upload')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    signatureMode === 'upload' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <ImageIcon className="h-4 w-4 mx-auto mb-1" />
                  <span className="text-xs">Upload</span>
                </button>
              </div>

              {signatureMode === 'draw' ? (
                <>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    className="w-full h-[150px] border-2 border-dashed border-border rounded-lg bg-white cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Draw your signature above using your mouse or touchscreen
                  </p>
                </>
              ) : (
                <>
                  <div
                    onClick={() => signatureInputRef.current?.click()}
                    className="w-full h-[150px] border-2 border-dashed border-border rounded-lg bg-white flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload signature image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG supported</p>
                  </div>
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={addSignature}
              disabled={!signatureData || isProcessing}
              className="btn-primary w-full"
            >
              <PenTool className="h-5 w-5" />
              {isProcessing ? "Adding Signature..." : "Add Signature to PDF"}
            </button>
          </div>
        )}

        {signedUrl && (
          <div className="flex justify-center mt-6">
            <EnhancedDownload
              data={signedUrl}
              fileName={file ? `${file.name.replace(/\.[^/.]+$/, "")}-signed.pdf` : "signed.pdf"}
              fileType="pdf"
              title="Signature Added Successfully"
              description="Your signature has been added to the PDF"
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
            <PenTool className="h-5 w-5 text-blue-500" />
            What is PDF Signature?
          </h3>
          <p className="text-muted-foreground mb-4">
            Add your handwritten signature to PDF documents digitally. This is perfect for signing contracts, agreements, forms, and any official documents without printing.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF document</li>
            <li>Draw your signature on the canvas</li>
            <li>Select which page to add the signature to</li>
            <li>Click "Add Signature" and download</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Signature Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Draw with mouse or touch</li>
                <li>• Clear and redraw anytime</li>
                <li>• Place on any page</li>
                <li>• Professional appearance</li>
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
        <ToolFAQ faqs={[
          {
            question: "Is the signature legally binding?",
            answer: "Digital signatures can be legally binding in many jurisdictions, but requirements vary. For important legal documents, consult with a legal professional about signature requirements in your jurisdiction."
          },
          {
            question: "Can I add multiple signatures?",
            answer: "Currently, you can add one signature at a time. Download the signed PDF, then upload it again to add more signatures if needed."
          },
          {
            question: "Can I change the signature size?",
            answer: "The signature is automatically sized to fit the document. You can draw a larger or smaller signature on the canvas to control the final size."
          },
          {
            question: "What file formats are supported?",
            answer: "We support PDF files for signing. The signature is drawn as a PNG image embedded in the PDF."
          },
          {
            question: "Is my signature stored anywhere?",
            answer: "No, all processing happens in your browser. Your signature and documents are never stored on any server."
          }
        ]} />
      </div>
    </ToolLayout>
    </>
  );
};

export default PDFAddSignatureTool;
