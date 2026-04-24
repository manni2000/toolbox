import { useState, useRef } from "react";
import { Upload, ScanLine, Copy, Check, X, ExternalLink, QrCode, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "173 80% 40%";

const QRScannerTool = () => {
  const toolSeoData = getToolSeoMetadata('qr-code-scanner');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      setImage(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/image/qr-scanner', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result.text);
        toast({
          title: "QR Code Scanned",
          description: "QR code has been successfully decoded.",
        });
      } else {
        setError(data.error || 'Failed to scan QR code');
        toast({
          title: "Scan Failed",
          description: data.error || "Could not find a QR code in the image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = "Failed to scan QR code. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const isUrl = result?.startsWith("http://") || result?.startsWith("https://");

  return (
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "QR Code Scanner",
        toolSeoData?.description || "Upload an image to scan and decode QR codes",
        "qr-code-scanner"
      )}
      <ToolLayout
      title={toolSeoData?.title || "QR Code Scanner"}
      description={toolSeoData?.description || "Upload an image to scan and decode QR codes"}
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
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
              <QrCode className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Quick QR Code Scanning</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Instantly decode QR codes from any image. Fast, secure, and works entirely in your browser.
              </p>
            </div>
          </div>
        </motion.div>

        {!image && (
          <ImageUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            multiple={false}
            title="Upload QR Code Image"
            subtitle="Drop an image or click to browse"
          />
        )}

        {image && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Uploaded Image</span>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear image and reset scanner">
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            </div>

            <motion.div 
              className="relative overflow-hidden flex justify-center rounded-xl border border-border bg-muted/30 p-4"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
              <img src={image} alt="QR Code" className="max-h-64 rounded-lg object-contain relative z-10" />
            </motion.div>

            {loading && (
              <div className="flex justify-center py-12">
                <ModernLoadingSpinner 
                  size="md" 
                  text="Scanning QR Code..." 
                  color={`hsl(${categoryColor})`}
                />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400"
              >
                {error}
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-6"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
                <div className="relative z-10">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
                    </motion.div>
                    Decoded Content
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <p className="flex-1 break-all font-mono text-sm">{result}</p>
                    <div className="flex gap-2">
                      {isUrl && (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <a
                            href={result}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 hover:bg-muted"
                            title="Open URL in new tab"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <button onClick={handleCopy} className="rounded-lg p-2 hover:bg-muted" title="Copy decoded QR code content to clipboard">
                          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-blue-500" />
            What is QR Code Scanning?
          </h3>
          <p className="text-muted-foreground mb-4">
            QR code scanning decodes the information stored in QR code images. It extracts URLs, text, contact information, and other data encoded in the QR code, allowing you to access the content without using a mobile device.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload or drag a QR code image</li>
            <li>The tool analyzes and decodes the QR code</li>
            <li>View the extracted content</li>
            <li>Copy the result or visit the URL</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Scanning Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Image upload support</li>
                <li>• Multiple QR code types</li>
                <li>• Instant decoding</li>
                <li>• Copy to clipboard</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• URL extraction</li>
                <li>• Contact info retrieval</li>
                <li>• WiFi password access</li>
                <li>• Text decoding</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What types of QR codes can be scanned?",
            answer: "This tool can scan standard QR codes containing URLs, text, contact information (vCards), WiFi credentials, and other common QR code data types."
          },
          {
            question: "Why scan QR codes from images?",
            answer: "Scanning from images is useful when you can't scan with your phone, need to extract data from screenshots, or want to analyze QR codes from printed materials digitally."
          },
          {
            question: "Can I scan damaged or blurry QR codes?",
            answer: "The scanner can handle moderately damaged or blurry QR codes due to built-in error correction. However, severely damaged codes may not be readable."
          },
          {
            question: "Is it safe to scan QR codes?",
            answer: "Be cautious with unknown QR codes as they could link to phishing sites. Always verify the URL before visiting, especially for codes from untrusted sources."
          },
          {
            question: "What if the QR code isn't recognized?",
            answer: "Ensure the QR code is clear, well-lit, and not distorted. Try cropping the image to focus only on the QR code, or improve the image quality if possible."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default QRScannerTool;
