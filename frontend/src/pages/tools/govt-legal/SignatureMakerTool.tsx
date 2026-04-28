import { useState, useRef, useEffect, useCallback } from 'react';
import { Pen, Download, Trash2, CheckCircle, Palette, Sliders, Zap, X, Sparkles, PenTool, Image as ImageIcon } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "220 60% 45%";

export default function SignatureMakerTool() {
  const toolSeoData = getToolSeoMetadata('signature-maker');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(3);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    // Set initial styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const handleResize = () => {
      if (!canvas) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = 400;
      ctx.putImageData(imageData, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
  }, [penColor, penSize]);

  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
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

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio to fit image in canvas
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        setHasSignature(true);
        
        toast({
          title: 'Signature Uploaded',
          description: 'Your signature image has been loaded successfully',
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (format: 'png' | 'jpg' | 'svg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'svg') {
      // Convert canvas to SVG
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              <canvas width="${canvas.width}" height="${canvas.height}" style="background-color: ${backgroundColor}">
                ${canvas.toDataURL()}
              </canvas>
            </div>
          </foreignObject>
        </svg>
      `;

      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'signature.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const link = document.createElement('a');
      link.href = canvas.toDataURL(mimeType, 0.95);
      link.download = `signature.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: 'Signature Downloaded',
      description: `Downloaded as ${format.toUpperCase()} format`,
    });
  };

  const COLORS = [
    '#000000',
    '#1a1a1a',
    '#333333',
    '#0000ff',
    '#000080',
    '#800080',
    '#008000',
    '#800000',
  ];

  const SIZES = [1, 2, 3, 4, 5, 6, 8, 10];

  return (
    <>
      {CategorySEO.GovtLegal(
        toolSeoData?.title || "Signature Maker",
        toolSeoData?.description || "Draw and create digital signatures",
        "signature-maker"
      )}
      <ToolLayout
        title="Signature Maker"
        description="Draw and create digital signatures"
        category="Govt & Legal Tools"
        categoryPath="/category/govt-legal"
        toolSlug="signature-maker"
      >
        <div className="space-y-8">
          {/* Enhanced Hero Section */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
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
                <PenTool className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Digital Signature Creator</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Draw professional digital signatures online. Download in multiple formats for documents and contracts.
                </p>
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">signature maker</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">digital signature</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">online signature</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">signature creator</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Canvas Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PenTool className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              Create Your Signature
            </h3>

            {/* Mode Switcher */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSignatureMode('draw')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  signatureMode === 'draw' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <PenTool className="h-4 w-4 mx-auto mb-1" style={{ color: signatureMode === 'draw' ? `hsl(${categoryColor})` : '' }} />
                <span className="text-xs">Draw</span>
              </button>
              <button
                onClick={() => setSignatureMode('upload')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  signatureMode === 'upload' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <ImageIcon className="h-4 w-4 mx-auto mb-1" style={{ color: signatureMode === 'upload' ? `hsl(${categoryColor})` : '' }} />
                <span className="text-xs">Upload</span>
              </button>
            </div>

            <div className="relative">
              {signatureMode === 'draw' ? (
                <div className="border-2 border-dashed border-border rounded-2xl overflow-hidden bg-background hover:border-primary/50 transition-colors">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                  />
                </div>
              ) : (
                <div
                  onClick={() => signatureInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl overflow-hidden bg-background hover:border-primary/50 transition-colors h-[400px] flex flex-col items-center justify-center cursor-pointer"
                >
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Click to upload signature image</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG supported</p>
                </div>
              )}
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="hidden"
              />
              {hasSignature && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-2 right-2"
                >
                  <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                    <CheckCircle className="h-3 w-3" />
                    Signature Ready
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
            >
              {hasSignature ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Signature captured successfully</span>
                </>
              ) : (
                <span>{signatureMode === 'draw' ? 'Use your mouse or touch to draw your signature above' : 'Upload your signature image above'}</span>
              )}
            </motion.div>
          </motion.div>

          {/* Controls Section */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">Customize Signature</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pen Color */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4" />
                  Pen Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        penColor === color ? 'border-primary scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="w-full h-10 rounded border border-border cursor-pointer"
                />
              </div>

              {/* Pen Size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Sliders className="h-4 w-4" />
                  Pen Size: {penSize}px
                </label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setPenSize(size)}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        penSize === size ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div
                        className="rounded-full bg-foreground"
                        style={{ width: Math.min(size, 6), height: Math.min(size, 6) }}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={penSize}
                  onChange={(e) => setPenSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Background</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBackgroundColor('#ffffff')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      backgroundColor === '#ffffff' ? 'border-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    White
                  </button>
                  <button
                    onClick={() => setBackgroundColor('#f0f0f0')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      backgroundColor === '#f0f0f0' ? 'border-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: '#f0f0f0' }}
                  >
                    Gray
                  </button>
                  <button
                    onClick={() => setBackgroundColor('transparent')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      backgroundColor === 'transparent' ? 'border-primary' : 'border-border'
                    }`}
                  >
                    Transparent
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={clearCanvas}
              disabled={!hasSignature}
              className="btn-secondary flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Trash2 className="h-4 w-4" />
              Clear Signature
            </button>

            <div className="flex flex-1 flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleDownload('png')}
                disabled={!hasSignature}
                className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
              <button
                onClick={() => handleDownload('jpg')}
                disabled={!hasSignature}
                className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Download className="h-4 w-4" />
                Download JPG
              </button>
              <button
                onClick={() => handleDownload('svg')}
                disabled={!hasSignature}
                className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Download className="h-4 w-4" />
                Download SVG
              </button>
            </div>
          </div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <PenTool className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              What is a Digital Signature?
            </h3>
            <p className="text-muted-foreground mb-4">
              A digital signature is an electronic representation of your handwritten signature. It can be drawn, stored, and used on digital documents for authentication and agreement purposes.
            </p>
            
            <h4 className="font-semibold mb-2">How It Works</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>Choose pen color and size</li>
              <li>Draw your signature using mouse or touch</li>
              <li>Review and adjust if needed</li>
              <li>Download in your preferred format</li>
            </ol>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Signature Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Custom pen styles</li>
                  <li>• Multiple formats</li>
                  <li>• Touch support</li>
                  <li>• Instant download</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Digital documents</li>
                  <li>• Email signatures</li>
                  <li>• Contract signing</li>
                  <li>• Form completion</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            {/* FAQ Section */}
            <ToolFAQ faqs={[
              {
                question: "What signature formats can I download?",
                answer: "You can download signatures as PNG (transparent background), JPG (white background), or SVG (vector format) for maximum flexibility."
              },
              {
                question: "Are these signatures legally binding?",
                answer: "For general documents, yes. For legally binding contracts, use dedicated e-signature services that comply with ESIGN Act and eIDAS regulations."
              },
              {
                question: "Can I use this on mobile devices?",
                answer: "Yes! Full touch support for drawing signatures on phones, tablets, and desktop computers with any browser."
              },
              {
                question: "Is my signature data private?",
                answer: "Absolutely. All drawing happens locally in your browser. Your signature is never stored or transmitted to any server."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
}
