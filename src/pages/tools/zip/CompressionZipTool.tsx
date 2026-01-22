import { useState, useCallback } from "react";
import { Download, Upload, Archive, X, File, Gauge } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/layout/ToolLayout";

const CompressionZipTool = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState("archive");
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [isCreating, setIsCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
      saveAs(blob, `${zipName || "archive"}.zip`);
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
      title="Compression Level ZIP"
      description="Create ZIP archives with custom compression levels"
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
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>

        {/* Compression Level Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium">Compression Level</label>
          <div className="grid gap-2">
            {compressionLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setCompressionLevel(level.value)}
                className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                  compressionLevel === level.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">Level {level.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {files.length} file{files.length !== 1 ? "s" : ""} ({formatSize(totalSize)})
              </h3>
              <button
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
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
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
              onClick={createZip}
              disabled={isCreating || files.length === 0}
              className="btn-primary w-full"
            >
              {isCreating ? (
                "Creating..."
              ) : (
                <>
                  <Archive className="h-5 w-5" />
                  Create ZIP (Level {compressionLevel})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CompressionZipTool;
