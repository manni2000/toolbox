import { useState, useCallback } from "react";
import { FolderOpen, Upload, File, Archive } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

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
      console.error("Error extracting ZIP:", error);
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
    <ToolLayout
      title="Extract ZIP"
      description="Extract and download files from ZIP archives"
      category="ZIP Tools"
      categoryPath="/category/zip"
    >
      <div className="space-y-6">
        {!zipFile ? (
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
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{zipFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSize(zipFile.size)} • {extractedFiles.filter(f => !f.isDirectory).length} files
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Choose another
              </button>
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
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ExtractZipTool;
