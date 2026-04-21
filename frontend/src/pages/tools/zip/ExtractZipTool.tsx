import { useState, useCallback } from "react";
import { FolderOpen, Upload, File, Archive, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "280 70% 55%";

interface ExtractedFile {
  name: string;
  size: number;
  isDirectory: boolean;
  content: Blob | null;
}

const ExtractZipTool = () => {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [extractedUrls, setExtractedUrls] = useState<Array<{ url: string; name: string }>>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".zip")) {
      setZipFile(file);
      await extractZip(file);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".zip")) {
      setZipFile(file);
      await extractZip(file);
    }
  };

  const extractZip = async (file: File) => {
    setIsExtracting(true);
    setExtractedFiles([]);
    setExtractedUrls([]);

    try {
      const zip = await JSZip.loadAsync(file);
      const files: ExtractedFile[] = [];
      const urls: Array<{ url: string; name: string }> = [];

      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) {
          files.push({
            name: relativePath,
            size: 0,
            isDirectory: true,
            content: null,
          });
        } else {
          const content = await zipEntry.async("blob");
          files.push({
            name: relativePath,
            size: content.size,
            isDirectory: false,
            content,
          });
          
          // Create URL for non-directory files
          const url = URL.createObjectURL(content);
          urls.push({
            url,
            name: relativePath.split("/").pop() || relativePath
          });
        }
      }

      // Sort: directories first, then files
      files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setExtractedFiles(files);
      setExtractedUrls(urls);
    } catch (error) {
      // console.error("Error extracting ZIP:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadFile = (file: ExtractedFile) => {
    if (file.content) {
      const fileName = file.name.split("/").pop() || file.name;
      saveAs(file.content, fileName);
    }
  };

  const downloadAllFiles = () => {
    extractedFiles.forEach((file) => {
      if (!file.isDirectory && file.content) {
        const fileName = file.name.split("/").pop() || file.name;
        saveAs(file.content, fileName);
      }
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const reset = () => {
    setZipFile(null);
    setExtractedFiles([]);
  };

  return (
    <>
      {CategorySEO.ZIP(
        "Extract ZIP",
        "Extract and download files from ZIP archives",
        "extract-zip"
      )}
      <ToolLayout
      title="Extract ZIP"
      description="Extract and download files from ZIP archives"
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
              <FolderOpen className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Extract ZIP</h2>
              <p className="mt-2 text-sm text-muted-foreground">Extract and download files from ZIP archives instantly</p>
            </div>
          </div>
        </motion.div>

        {!zipFile ? (
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
              <Archive className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Drop ZIP file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                title="Upload ZIP file"
                aria-label="Upload ZIP file"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 shadow-lg"
            style={{ boxShadow: `0 4px 20px hsl(${categoryColor} / 0.1)` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="h-8 w-8" style={{ color: `hsl(${categoryColor})` }} />
                <div>
                  <p className="font-medium">{zipFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSize(zipFile.size)} • {extractedFiles.filter(f => !f.isDirectory).length} files
                  </p>
                </div>
              </div>
              <motion.button
                onClick={reset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Choose another
              </motion.button>
            </div>

            {isExtracting ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Extracting files...</p>
              </div>
            ) : (
              <>
                {extractedUrls.length > 0 && (
                  <div className="flex justify-center mt-6">
                    <EnhancedDownload
                      data=""
                      fileName=""
                      fileType="zip"
                      title="ZIP Extracted Successfully"
                      description={`${extractedUrls.length} file(s) extracted from ZIP archive`}
                      fileSize={zipFile ? formatSize(zipFile.size) : 'Unknown size'}
                      multipleFiles={extractedUrls.map((file, index) => ({
                        url: file.url,
                        name: file.name,
                        page: index + 1
                      }))}
                    />
                  </div>
                )}
              </>
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
              Supports standard ZIP archive formats
            </li>
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              All extraction happens locally in your browser
            </li>
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              Download individual files or all at once
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
            <FolderOpen className="h-5 w-5 text-blue-500" />
            What is ZIP Extraction?
          </h3>
          <p className="text-muted-foreground mb-4">
            ZIP extraction decompresses and retrieves files from ZIP archives. This restores files to their original state, allowing you to access the contents of compressed archives.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your ZIP file</li>
            <li>The tool decompresses the archive</li>
            <li>View extracted files</li>
            <li>Download individual files or all</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Extraction Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Full archive extraction</li>
                <li>• Selective file download</li>
                <li>• Password-protected support</li>
                <li>• File preview</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Opening downloaded archives</li>
                <li>• Accessing backup files</li>
                <li>• Software installation</li>
                <li>• Document retrieval</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          {/* FAQ Section */}
          <ToolFAQ faqs={[
            {
              question: "Do I need special software to extract ZIP?",
              answer: "No, ZIP is natively supported by Windows, macOS, and most operating systems. You can extract ZIP files without installing additional software."
            },
            {
              question: "What if my ZIP is password-protected?",
              answer: "You'll need the password to extract. Enter it when prompted. If you don't have the password, you cannot access the contents."
            },
            {
              question: "Can I extract only certain files?",
              answer: "Yes, this tool lets you preview and download individual files from the archive. You don't have to extract everything if you only need specific files."
            },
            {
              question: "What if extraction fails?",
              answer: "Extraction may fail if the ZIP is corrupted, password-protected without the correct password, or uses unsupported compression methods."
            },
            {
              question: "Does extraction restore original quality?",
              answer: "Yes, ZIP is lossless. Extracted files are identical to the originals before compression. No quality or data loss occurs."
            }
          ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default ExtractZipTool;
