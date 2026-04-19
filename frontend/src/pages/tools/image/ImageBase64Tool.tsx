import { useState, useRef } from "react";
import { Upload, Copy, Check, Image as ImageIcon, FileCode, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "173 80% 40%";

const ImageBase64Tool = () => {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState("");
  const [decodedImage, setDecodedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setBase64(dataUrl);
    };
    reader.readAsDataURL(file);
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

  const decodeBase64 = () => {
    setError(null);
    try {
      let base64String = base64.trim();
      
      // Add data URL prefix if not present
      if (!base64String.startsWith("data:")) {
        base64String = `data:image/png;base64,${base64String}`;
      }

      // Validate by creating an image
      const img = new Image();
      img.onerror = () => setError("Invalid Base64 image data");
      img.onload = () => {
        setDecodedImage(base64String);
        // Scroll to download section after successful decoding
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      };
      img.src = base64String;
    } catch {
      setError("Failed to decode Base64 string");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(base64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setImage(null);
    setBase64("");
    setDecodedImage(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Image ↔ Base64 Converter"
      description="Convert images to Base64 strings and vice versa"
      category="Image Tools"
      categoryPath="/category/image"
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
              <FileCode className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Base64 Encoder/Decoder</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert images to Base64 strings for embedding in code or data URIs.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div 
          variants={scaleIn} 
          initial="hidden" 
          animate="visible"
          className="flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode("encode"); reset(); }}
            className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
              mode === "encode"
                ? "text-white shadow-lg"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={mode === "encode" ? { backgroundColor: `hsl(${categoryColor})` } : {}}
            title="Switch to image to Base64 encoding mode"
          >
            <ImageIcon className="mr-2 inline h-4 w-4" />
            Image → Base64
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode("decode"); reset(); }}
            className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
              mode === "decode"
                ? "text-white shadow-lg"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={mode === "decode" ? { backgroundColor: `hsl(${categoryColor})` } : {}}
            title="Switch to Base64 to image decoding mode"
          >
            <FileCode className="mr-2 inline h-4 w-4" />
            Base64 → Image
          </motion.button>
        </motion.div>

        {mode === "encode" ? (
          <>
            {/* Upload Area */}
            <ImageUploadZone
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onFileSelect={handleFile}
              multiple={false}
              title="Drop your image here"
              subtitle="Supports PNG, JPG, WebP, GIF up to 10MB"
            />
            {image && (
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <img src={image} alt="Uploaded" className="mx-auto max-h-40 rounded-lg object-contain" />
              </div>
            )}

            {/* Base64 Output */}
            {base64 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium">Base64 String</span>
                  <button onClick={handleCopy} className="btn-secondary" title="Copy Base64 string to clipboard">
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <textarea
                  value={base64}
                  readOnly
                  title="Base64 encoded image string"
                  className="input-field h-40 w-full resize-none font-mono text-xs"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Length: {base64.length.toLocaleString()} characters
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Base64 Input */}
            <div className="rounded-xl border border-border bg-card p-6">
              <label className="mb-3 block font-medium">Paste Base64 String</label>
              <textarea
                value={base64}
                onChange={(e) => setBase64(e.target.value)}
                placeholder="Paste your Base64 encoded image string here..."
                title="Paste your Base64 encoded image string here"
                className="input-field h-40 w-full resize-none font-mono text-xs"
              />
            </div>

            <button onClick={decodeBase64} className="btn-primary w-full" title="Decode Base64 string to image">
              <ImageIcon className="h-5 w-5" />
              Decode to Image
            </button>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Decoded Image */}
            {decodedImage && (
              <div ref={downloadSectionRef} className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">Decoded Image:</p>
                  <img
                    src={decodedImage}
                    alt="Decoded"
                    className="mx-auto max-h-64 rounded-lg object-contain"
                  />
                </div>
                <EnhancedDownload
                  data={decodedImage}
                  fileName="decoded-image.png"
                  fileType="image"
                  title="Base64 Decoded Successfully"
                  description="Your Base64 string has been decoded to an image"
                  fileSize={`${(base64.length / 1024).toFixed(1)} KB (encoded)`}
                />
              </div>
            )}
          </>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-500" />
            What is Base64 Encoding?
          </h3>
          <p className="text-muted-foreground mb-4">
            Base64 encoding converts binary data (like images) into ASCII text format. This allows images to be embedded directly in HTML, CSS, or JSON without needing separate files. It's commonly used for data URIs and API responses.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your image for encoding</li>
            <li>The tool converts it to Base64 string</li>
            <li>Copy the Base64 string for use</li>
            <li>Or paste Base64 to decode back to image</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Base64 Uses</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Inline images in HTML</li>
                <li>• CSS background images</li>
                <li>• JSON API responses</li>
                <li>• Email attachments</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Encoding Features</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Image to Base64</li>
                <li>• Base64 to Image</li>
                <li>• Copy to clipboard</li>
                <li>• Download as file</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
          <ToolFAQ faqs={[
            {
              question: "Why use Base64 for images?",
              answer: "Base64 allows embedding images directly in code, reducing HTTP requests. Useful for small icons, logos, or when you can't use external files. However, it increases file size by ~33%."
            },
            {
              question: "Does Base64 encoding increase file size?",
              answer: "Yes, Base64 encoding increases file size by approximately 33%. Use it sparingly for small images. For large images, external files are more efficient."
            },
            {
              question: "Can I use Base64 images in CSS?",
              answer: "Yes, you can use Base64 in CSS with background-image: url('data:image/png;base64,...'). This is common for small icons and sprites."
            },
          ]} />
      </div>
    </ToolLayout>
  );
};

export default ImageBase64Tool;
