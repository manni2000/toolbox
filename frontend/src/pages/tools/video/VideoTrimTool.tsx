import { useState, useRef } from "react";
import { Scissors, X, Loader2, Video } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { VideoUploadZone } from "@/components/ui/video-upload-zone";

const VideoTrimTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [videoData, setVideoData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
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
    setVideoData(null);
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
    setVideoData(null);
  };

  const trimVideo = async () => {
    if (!file) return;

    if (startTime >= endTime) {
      toast({
        title: "Invalid time range",
        description: "Start time must be less than end time",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('start_time', startTime.toString());
    formData.append('end_time', endTime.toString());

    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/video/trim/`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setVideoData(result.video); // Backend returns 'video' field
        toast({
          title: "Success!",
          description: "Video trimming completed successfully",
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
        description: error instanceof Error ? error.message : "Failed to trim video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <ToolLayout
      title="Video Trim Tool"
      description="Cut and trim video clips to specific timestamps"
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
              subtitle="Supports MP4, AVI, MOV, WebM up to 500MB"
            />
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              title="Select a video file to trim"
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
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear video">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Time Selection */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Start Time (seconds)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Start time in seconds"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="input-tool"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">End Time (seconds)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="End time in seconds"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="input-tool"
                />
              </div>
            </div>

            {/* Trim Button */}
            <button
              onClick={trimVideo}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Trimming Video...
                </>
              ) : (
                <>
                  <Scissors className="h-5 w-5" />
                  Trim Video
                </>
              )}
            </button>

            {/* Download Section */}
            {videoData && (
              <div ref={downloadSectionRef} className="space-y-4">
                <h3 className="text-lg font-medium text-center">Trimmed Video</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-32 h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                        <Video className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <EnhancedDownload
                      data={videoData}
                      fileName={fileName.replace(/\.[^/.]+$/, "_trimmed.mp4")}
                      fileType="zip"
                      title="Video Trimmed Successfully"
                      description={`Video trimmed from ${startTime}s to ${endTime}s`}
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

export default VideoTrimTool;
