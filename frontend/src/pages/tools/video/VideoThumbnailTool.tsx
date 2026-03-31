import { useState, useRef } from "react";
import { Camera, X, Loader2, Video } from "lucide-react";
import { VideoUploadZone } from "@/components/ui/video-upload-zone";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const VideoThumbnailTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [thumbnailData, setThumbnailData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnailTime, setThumbnailTime] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }
    setFile(f);
    setFileName(f.name);
    setThumbnailData(null);
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

  const reset = () => {
    setFile(null);
    setFileName("");
    setThumbnailData(null);
  };

  const extractThumbnail = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('timestamp', thumbnailTime.toString());

    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/video/thumbnail/`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setThumbnailData(result.thumbnail); // Backend returns 'thumbnail' field
        toast({
          title: "Success!",
          description: "Thumbnail extraction completed successfully",
        });
        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to process file');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extract thumbnail",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Video Thumbnail Generator"
      description="Extract thumbnail images from video files at specific timestamps"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!file && (
          <>
            <VideoUploadZone
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onFileSelect={handleFile}
              multiple={false}
              title="Drop video file here or click to browse"
              subtitle="Generate thumbnails from MP4, AVI, MOV, WebM up to 500MB"
            />
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              title="Select a video file"
            />
          </>
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Video className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear video selection">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Timestamp Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Timestamp (seconds)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={thumbnailTime}
                onChange={(e) => setThumbnailTime(Number(e.target.value))}
                className="input-tool"
                placeholder="Enter timestamp in seconds"
                title="Enter the timestamp in seconds to extract thumbnail"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Extract thumbnail at {thumbnailTime} seconds
              </p>
            </div>

            {/* Extract Button */}
            <button
              onClick={extractThumbnail}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Extracting Thumbnail...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  Generate Thumbnail
                </>
              )}
            </button>

            {/* Download Section */}
            {thumbnailData && (
              <div ref={downloadSectionRef} className="space-y-4">
                <h3 className="text-lg font-medium text-center">Video Thumbnail</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-64 h-64 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
                        {thumbnailData && (
                          <img 
                            src={thumbnailData} 
                            alt="Thumbnail preview" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    
                    <EnhancedDownload
                      data={thumbnailData}
                      fileName={fileName.replace(/\.[^/.]+$/, "_thumbnail.png")}
                      fileType="image"
                      title="Thumbnail Generated Successfully"
                      description={`Video thumbnail captured at ${thumbnailTime}s from ${fileName}`}
                      fileSize={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoThumbnailTool;
