import { useState, useCallback } from "react";
import { Upload, Archive, X, File, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const categoryColor = "45 80% 50%";

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
      console.error("Error creating ZIP:", error);
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
        {/* Upload Area */}
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

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
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
                    <File className="h-5 w-5 text-muted-foreground" />
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
            <button
              type="button"
              onClick={createZip}
              disabled={isCreating || files.length === 0}
              className="btn-primary w-full"
            >
              {isCreating ? (
                "Creating..."
              ) : (
                <>
                  <Archive className="h-5 w-5" />
                  Create ZIP
                </>
              )}
            </button>

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
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CreateZipTool;
