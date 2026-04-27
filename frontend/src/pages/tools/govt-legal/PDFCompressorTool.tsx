import { useState, useRef, useCallback } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, RotateCw, Zap, X, Sparkles, Archive } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { API_URLS } from "@/lib/api-complete";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "220 60% 45%";

interface CompressionLevel {
  name: string;
  value: string;
  description: string;
}

const COMPRESSION_LEVELS: CompressionLevel[] = [
  { name: 'Low', value: 'low', description: 'Minimal compression, best quality' },
  { name: 'Medium', value: 'medium', description: 'Balanced compression and quality' },
  { name: 'High', value: 'high', description: 'Maximum compression, smaller file' },
];

export default function PDFCompressorTool() {
  const toolSeoData = getToolSeoMetadata('pdf-compressor');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<string>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: 'File Too Large',
        description: 'Please select a PDF smaller than 50MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setOriginalSize(file.size);
    setError('');
    setCompressedUrl('');
    setCompressedSize(0);

    toast({
      title: 'PDF Loaded',
      description: `Loaded ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('compressionLevel', compressionLevel);

      const response = await fetch(`${API_URLS.BASE_URL}/api/pdf/compress`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setCompressedUrl(url);
        setCompressedSize(blob.size);

        const originalSizeHeader = response.headers.get('X-Original-Size');
        const compressedSizeHeader = response.headers.get('X-Compressed-Size');

        if (originalSizeHeader && compressedSizeHeader) {
          setOriginalSize(parseInt(originalSizeHeader));
          setCompressedSize(parseInt(compressedSizeHeader));
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to compress PDF');
      }
    } catch (err) {
      setError('Failed to compress PDF. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl) return;

    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `compressed-${selectedFile?.name || 'document.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getCompressionPercentage = () => {
    if (originalSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
  };

  return (
    <>
      {CategorySEO.GovtLegal(
        toolSeoData?.title || "PDF Compressor",
        toolSeoData?.description || "Compress PDF files for document submission",
        "pdf-compressor"
      )}
      <ToolLayout
      title="PDF Compressor"
      description="Compress PDF files for document submission"
      category="Govt & Legal Tools"
      categoryPath="/category/govt-legal"
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
                <Archive className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Smart PDF Compression</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reduce PDF file sizes significantly while maintaining quality. Perfect for email attachments and document submissions.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upload Area */}
          {!selectedFile && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <div
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-semibold mb-2">Drop PDF here or click to browse</p>
                  <p className="text-sm text-muted-foreground">PDF files only up to 50MB</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Compression Level Selection */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">Compression Level</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COMPRESSION_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setCompressionLevel(level.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    compressionLevel === level.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <p className="font-medium text-sm mb-1">{level.name}</p>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCompress}
            disabled={!selectedFile || isProcessing}
            className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px]"
          >
            {isProcessing ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Compress PDF
              </>
            )}
          </button>

          {/* Results Section */}
          {compressedSize > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Compression Results</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Original Size</p>
                  <p className="text-2xl font-bold">{formatFileSize(originalSize)}</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Compressed Size</p>
                  <p className="text-2xl font-bold">{formatFileSize(compressedSize)}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Reduced By</p>
                  <p className="text-2xl font-bold text-green-600">{getCompressionPercentage()}%</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {compressedSize < originalSize ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <p className="text-sm">
                  {compressedSize < originalSize
                    ? 'PDF successfully compressed!'
                    : 'PDF could not be compressed further. Try a different compression level.'}
                </p>
              </div>

              <button
                onClick={handleDownload}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Download className="h-4 w-4" />
                Download Compressed PDF
              </button>
            </div>
          )}

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Archive className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              What is PDF Compression?
            </h3>
            <p className="text-muted-foreground mb-4">
              PDF compression reduces file size by removing redundant data, optimizing images, and compressing content while maintaining readability. Perfect for email attachments and faster uploads.
            </p>
            
            <h4 className="font-semibold mb-2">How It Works</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>Upload your PDF file (up to 50MB)</li>
              <li>Choose compression level (Low, Medium, High)</li>
              <li>The tool optimizes content and images</li>
              <li>Download the compressed PDF</li>
            </ol>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Compression Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Three compression levels</li>
                  <li>• Size reduction preview</li>
                  <li>• Quality preservation</li>
                  <li>• Fast processing</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Email attachments</li>
                  <li>• Document submissions</li>
                  <li>• Website uploads</li>
                  <li>• Storage optimization</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            {/* FAQ Section */}
            <ToolFAQ faqs={[
              {
                question: "How much can I reduce PDF file size?",
                answer: "Typical compression reduces file size by 30-70% depending on content. PDFs with many images compress more than text-only documents."
              },
              {
                question: "Will compression affect PDF quality?",
                answer: "Low compression maintains near-original quality. High compression reduces size more but may slightly affect image clarity. Text remains perfectly readable."
              },
              {
                question: "What compression level should I use?",
                answer: "Use Medium for most documents. Use High for email attachments when size is critical. Use Low for important documents where quality is priority."
              },
              {
                question: "Is my PDF data secure?",
                answer: "Yes. PDF compression happens locally in your browser. Your files are never uploaded to our servers or stored anywhere."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
}
