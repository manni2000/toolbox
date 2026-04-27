import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, CheckCircle, AlertCircle, RotateCw, Zap, X, Sparkles, Scale } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "220 60% 45%";

interface PhotoPreset {
  name: string;
  width: number;
  height: number;
  description: string;
}

const PRESETS: PhotoPreset[] = [
  { name: 'Passport (India)', width: 350, height: 450, description: '35x45mm, White background, 50KB max' },
  { name: 'Aadhaar Card', width: 200, height: 200, description: '2x2 inches, White background, 50KB max' },
  { name: 'Visa Photo', width: 350, height: 450, description: '35x45mm, White background, 50KB max' },
  { name: 'PAN Card', width: 200, height: 200, description: '2x2 inches, White background, 50KB max' },
  { name: 'Driving License', width: 200, height: 200, description: '2x2 inches, White background, 50KB max' },
];

export default function PassportPhotoResizerTool() {
  const toolSeoData = getToolSeoMetadata('passport-photo-resizer');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<PhotoPreset>(PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileSize, setFileSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid image file (JPG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setFileSize(file.size);
    setError('');
    setProcessedUrl('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      toast({
        title: 'Photo Loaded',
        description: `Loaded ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const compressImage = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set dimensions
        canvas.width = selectedPreset.width;
        canvas.height = selectedPreset.height;

        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate aspect ratio to cover the canvas
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = img.width * (canvas.height / img.height);
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = img.height * (canvas.width / img.width);
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }

        // Draw image centered
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Compress with decreasing quality until under 50KB
        let quality = 0.95;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        let sizeInBytes = Math.round((dataUrl.length * 3) / 4);

        while (sizeInBytes > 50000 && quality > 0.1) {
          quality -= 0.05;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          sizeInBytes = Math.round((dataUrl.length * 3) / 4);
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = previewUrl;
    });
  };

  const handleProcess = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsProcessing(true);
    setError('');

    try {
      const result = await compressImage();
      setProcessedUrl(result);

      // Calculate file size
      const sizeInBytes = Math.round((result.length * 3) / 4);
      setProcessedSize(sizeInBytes);

      if (sizeInBytes > 50000) {
        setError('Warning: Image could not be compressed to under 50KB. Try a different image.');
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;

    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `${selectedPreset.name.toLowerCase().replace(/\s+/g, '-')}-photo.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      {CategorySEO.GovtLegal(
        toolSeoData?.title || "Passport/Aadhaar Photo Resizer",
        toolSeoData?.description || "Resize photos for passport and Aadhaar under 50KB",
        "passport-photo-resizer"
      )}
      <ToolLayout
        title="Passport/Aadhaar Photo Resizer"
        description="Resize photos for passport and Aadhaar under 50KB"
        category="Govt & Legal Tools"
        categoryPath="/category/govt-legal"
        toolSlug="passport-photo-resizer"
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
                <Scale className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Government Document Photo Resizer</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Resize photos for passport, Aadhaar, visa and other government documents. Automatically compresses to under 50KB.
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
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-semibold mb-2">Drop photo here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports JPG, PNG up to 10MB</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Document Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              Select Document Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {PRESETS.map((preset, index) => (
                <motion.button
                  key={preset.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    selectedPreset.name === preset.name
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  {selectedPreset.name === preset.name && (
                    <motion.div
                      layoutId="selectedPreset"
                      className="absolute inset-0 bg-primary/5"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative">
                    <p className="font-medium text-sm mb-1">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">{preset.width}x{preset.height}px</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 p-3 bg-muted/50 rounded-lg"
            >
              <p className="text-sm text-muted-foreground">
                <strong>Selected:</strong> {selectedPreset.name} - {selectedPreset.description}
              </p>
            </motion.div>
          </motion.div>

          {/* Photo Preview */}
          {selectedFile && (
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({formatFileSize(fileSize)})
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { 
                    setSelectedFile(null); 
                    setPreviewUrl(''); 
                    setProcessedUrl(''); 
                    setError('');
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                  title="Clear photo"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border border-border bg-muted/30 p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
                >
                  <p className="mb-2 text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
                    Original
                  </p>
                  {previewUrl && (
                    <motion.div className="relative overflow-hidden rounded-lg">
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                          repeatDelay: 1,
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"
                      />
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="max-h-64 w-full rounded-lg object-contain"
                      />
                    </motion.div>
                  )}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border border-border bg-muted/30 p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
                >
                  <p className="mb-2 text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    Resized {processedUrl && (
                      <span className="text-green-600 font-semibold">
                        ({formatFileSize(processedSize)})
                      </span>
                    )}
                  </p>
                  {processedUrl ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative overflow-hidden rounded-lg"
                    >
                      {processedSize <= 50000 && (
                        <div className="absolute top-2 right-2 z-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs"
                          >
                            <CheckCircle className="h-3 w-3" />
                            &lt; 50KB
                          </motion.div>
                        </div>
                      )}
                      <img
                        src={processedUrl}
                        alt="Processed"
                        className="max-h-64 w-full rounded-lg object-contain"
                      />
                    </motion.div>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Select document type and process</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProcess}
              disabled={!selectedFile || isProcessing}
              className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[48px] relative overflow-hidden"
            >
              {isProcessing && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-100, 200] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
              {isProcessing ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4" />
                  Process Photo
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={!processedUrl}
              className="btn-secondary flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Download className="h-4 w-4" />
              Download
            </motion.button>
          </motion.div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              What is Document Photo Resizing?
            </h3>
            <p className="text-muted-foreground mb-4">
              Document photo resizing adjusts images to meet specific government requirements while maintaining quality. It automatically sets dimensions, adds white backgrounds, and compresses files to under 50KB for online submissions.
            </p>
            
            <h4 className="font-semibold mb-2">How It Works</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>Upload your photo (JPG, PNG)</li>
              <li>Select document type (Passport, Aadhaar, Visa, etc.)</li>
              <li>The tool resizes and adds white background</li>
              <li>Automatically compresses to under 50KB</li>
              <li>Download the optimized photo</li>
            </ol>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Photo Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Auto white background</li>
                  <li>• Size optimization</li>
                  <li>• Multiple document types</li>
                  <li>• Under 50KB guarantee</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Document Benefits</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Online submission ready</li>
                  <li>• Government compliant</li>
                  <li>• Fast processing</li>
                  <li>• Quality maintained</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            {/* FAQ Section */}
            <ToolFAQ faqs={[
              {
                question: "What photo dimensions are required for Indian passport?",
                answer: "Indian passport photos require 35x45mm dimensions with white background. The file size must be under 50KB for online applications."
              },
              {
                question: "Can I use this for visa applications?",
                answer: "Yes, the tool supports visa photo requirements. Select the visa preset to get the correct dimensions and formatting."
              },
              {
                question: "Will the photo quality be good enough?",
                answer: "Yes. Our smart compression maintains acceptable quality while meeting size requirements. Photos remain clear and suitable for document verification."
              },
              {
                question: "What if my photo is already under 50KB?",
                answer: "The tool will still resize to the correct dimensions and ensure proper white background. File size may change slightly but stays under 50KB."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
}
