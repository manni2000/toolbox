import { useState, useCallback } from "react";
import { Upload, Archive, X, File, Gauge, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "280 70% 55%";

const CompressionZipTool = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState("archive");
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [isCreating, setIsCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  const compressionLevels = [
    { value: 0, label: "Store (No compression)", description: "Fastest, largest file" },
    { value: 1, label: "Fastest", description: "Minimal compression" },
    { value: 3, label: "Fast", description: "Low compression" },
    { value: 6, label: "Normal", description: "Balanced speed/size" },
    { value: 9, label: "Maximum", description: "Smallest file, slowest" },
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createZip = async () => {
    if (files.length === 0) return;
    setIsCreating(true);

    try {
      const zip = new JSZip();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer, {
          compression: compressionLevel === 0 ? "STORE" : "DEFLATE",
          compressionOptions: {
            level: compressionLevel as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
          },
        });
      }

      const blob = await zip.generateAsync({ 
        type: "blob",
        compression: compressionLevel === 0 ? "STORE" : "DEFLATE",
        compressionOptions: {
          level: compressionLevel as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
        },
      });
      const url = URL.createObjectURL(blob);
      setZipUrl(url);
    } catch (error) {
      // console.error("Error creating ZIP:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <ToolLayout
      title="Compression Level ZIP"
      description="Create ZIP archives with custom compression levels"
      category="ZIP Tools"
      categoryPath="/category/zip"
    >
      <div className="space-y-6">
        {/* Hero Section */}
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
              <Gauge className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Compression Level ZIP</h2>
              <p className="mt-2 text-sm text-muted-foreground">Create ZIP archives with custom compression levels for optimal file size</p>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-border bg-card/50 p-6 shadow-lg"
          style={{ boxShadow: `0 4px 20px hsl(${categoryColor} / 0.1)` }}
        >
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`file-drop ${isDragging ? "drag-over" : ""}`}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop files here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <input
              type="file"
              multiple
              aria-label="Upload files"
              title="Upload files"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </motion.div>

        {/* Compression Level Selection */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-border bg-card/50 p-6 shadow-lg"
          style={{ boxShadow: `0 4px 20px hsl(${categoryColor} / 0.1)` }}
        >
          <label className="mb-3 block text-sm font-medium">Compression Level</label>
          <div className="grid gap-2">
            {compressionLevels.map((level) => (
              <motion.button
                type="button"
                key={level.value}
                onClick={() => setCompressionLevel(level.value)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                  compressionLevel === level.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
                style={compressionLevel === level.value ? { borderColor: `hsl(${categoryColor})`, backgroundColor: `hsl(${categoryColor} / 0.1)` } : {}}
              >
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5" style={compressionLevel === level.value ? { color: `hsl(${categoryColor})` } : { color: 'var(--muted-foreground)' }} />
                  <div>
                    <p className="font-medium">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">Level {level.value}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 shadow-lg"
            style={{ boxShadow: `0 4px 20px hsl(${categoryColor} / 0.1)` }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {files.length} file{files.length !== 1 ? "s" : ""} ({formatSize(totalSize)})
              </h3>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-48 space-y-2 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                    title={`Remove ${file.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* ZIP Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">ZIP file name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  placeholder="archive"
                  className="input-tool flex-1"
                />
                <span className="flex items-center text-muted-foreground">.zip</span>
              </div>
            </div>

            {/* Create Button */}
            <motion.button
              type="button"
              onClick={createZip}
              disabled={isCreating || files.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl py-3 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, hsl(${categoryColor}), hsl(${categoryColor} / 0.8))` }}
            >
              {isCreating ? (
                "Creating..."
              ) : (
                <>
                  <Archive className="h-5 w-5" />
                  Create ZIP (Level {compressionLevel})
                </>
              )}
            </motion.button>

            {zipUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={zipUrl}
                  fileName={`${zipName || "archive"}.zip`}
                  fileType="zip"
                  title="Compressed ZIP Created Successfully"
                  description={`${files.length} file(s) compressed with level ${compressionLevel} compression`}
                  fileSize={files.reduce((acc, file) => acc + file.size, 0) > 0 
                    ? formatSize(files.reduce((acc, file) => acc + file.size, 0))
                    : 'Unknown size'
                  }
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Tips Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-border bg-card/50 p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              Level 0 stores files without compression (fastest)
            </li>
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              Level 9 provides maximum compression (smallest files)
            </li>
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              Level 6 is recommended for balanced performance
            </li>
          </ul>
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default CompressionZipTool;
