import { useState, useCallback } from "react";
import { Upload, Archive, X, File, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "280 70% 55%";

const CreateZipTool = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState("archive");
  const [isCreating, setIsCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

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
        zip.file(file.name, arrayBuffer);
      }

      const blob = await zip.generateAsync({ type: "blob" });
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
      title="Create ZIP"
      description="Create ZIP archives from multiple files"
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
              <Archive className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Create ZIP</h2>
              <p className="mt-2 text-sm text-muted-foreground">Create ZIP archives from multiple files quickly and easily</p>
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
              onChange={handleFileSelect}
              aria-label="Select files to include in ZIP"
              title="Select files to include in ZIP"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
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

            <div className="max-h-64 space-y-2 overflow-y-auto">
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
                  Create ZIP
                </>
              )}
            </motion.button>

            {zipUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={zipUrl}
                  fileName={`${zipName || "archive"}.zip`}
                  fileType="zip"
                  title="ZIP Archive Created Successfully"
                  description={`${files.length} file(s) compressed into ZIP archive`}
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
              Drag and drop multiple files at once
            </li>
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              All processing happens in your browser
            </li>
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              Your files never leave your device
            </li>
          </ul>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Archive className="h-5 w-5 text-blue-500" />
            What is ZIP Creation?
          </h3>
          <p className="text-muted-foreground mb-4">
            ZIP creation bundles multiple files into a single archive. This simplifies file sharing, organizes related files together, and makes it easy to transfer multiple files at once.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload or drag multiple files</li>
            <li>Arrange files if needed</li>
            <li>The tool creates ZIP archive</li>
            <li>Download the ZIP file</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">ZIP Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Multiple file support</li>
                <li>• Drag and drop</li>
                <li>• File organization</li>
                <li>• Cross-platform compatible</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• File bundling</li>
                <li>• Project archiving</li>
                <li>• Email attachments</li>
                <li>• Document sharing</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          {/* FAQ Section */}
          <ToolFAQ faqs={[
            {
              question: "How many files can I put in a ZIP?",
              answer: "ZIP files can contain thousands of files. The practical limit is file size rather than count. Most systems support ZIP files up to 4GB or larger."
            },
            {
              question: "Does ZIP preserve folder structure?",
              answer: "Yes, ZIP preserves folder structure. When you extract, files are restored to their original folder hierarchy, maintaining organization."
            },
            {
              question: "Can I add files to an existing ZIP?",
              answer: "This tool creates new ZIP files. To add files to existing ZIPs, use extraction software that supports updating archives."
            },
            {
              question: "Are ZIP files secure?",
              answer: "ZIP files can be password-protected for security. Use strong passwords when protecting sensitive archives. Standard ZIP encryption has limitations."
            },
            {
              question: "Why use ZIP instead of sending files separately?",
              answer: "ZIP simplifies sharing by bundling files, reduces total size through compression, and ensures files stay together. Much more convenient than multiple attachments."
            }
          ]} />
        </div>
      </div>
    </ToolLayout>
  );
};

export default CreateZipTool;
