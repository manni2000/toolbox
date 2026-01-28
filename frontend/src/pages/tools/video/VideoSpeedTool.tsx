import { useState, useRef } from "react";
import { Gauge, Upload, X, Loader2, Video } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const VideoSpeedTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [videoData, setVideoData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [speedFactor, setSpeedFactor] = useState(1.5);
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

  const changeSpeed = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('speed_factor', speedFactor.toString());

    try {
      const response = await fetch('/api/video/speed/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setVideoData(result.video); // Backend returns 'video' field
        toast({
          title: "Success!",
          description: "Video speed change completed successfully",
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
        description: error instanceof Error ? error.message : "Failed to change video speed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <ToolLayout
      title="Video Speed Controller"
      description="Change video playback speed - speed up or slow down videos"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop video file here</p>
            <p className="text-sm text-muted-foreground">MP4, AVI, MOV, MKV, WebM supported</p>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
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
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Speed Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Speed Multiplier</label>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSpeedFactor(speed)}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      speedFactor === speed
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="range"
                  min="0.1"
                  max="4"
                  step="0.1"
                  value={speedFactor}
                  onChange={(e) => setSpeedFactor(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="mt-1 text-center text-sm text-muted-foreground">
                  Custom: {speedFactor}x
                </p>
              </div>
            </div>

            {/* Change Speed Button */}
            <button
              onClick={changeSpeed}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Changing Speed...
                </>
              ) : (
                <>
                  <Gauge className="h-5 w-5" />
                  Change Speed
                </>
              )}
            </button>

            {/* Download Section */}
            {videoData && (
              <div ref={downloadSectionRef} className="space-y-4">
                <h3 className="text-lg font-medium text-center">Speed-Changed Video</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-32 h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                        <Video className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <EnhancedDownload
                      data={videoData}
                      fileName={fileName.replace(/\.[^/.]+$/, `_speed_${speedFactor}x.mp4`)}
                      fileType="zip"
                      title="Video Speed Changed Successfully"
                      description={`Video speed adjusted to ${speedFactor}x original speed`}
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

export default VideoSpeedTool;
