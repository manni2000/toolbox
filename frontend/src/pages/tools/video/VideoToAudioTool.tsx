import { useState, useRef } from "react";
import { Music, X, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import { VideoUploadZone } from "@/components/ui/video-upload-zone";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "350 80% 55%";

const VideoToAudioTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioData, setAudioData] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [audioFormat, setAudioFormat] = useState("mp3");
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
    
    // Check file size limit (50MB)
    const fileSizeMB = f.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      toast({
        title: "File too large",
        description: `Maximum file size is 50MB. Your file is ${fileSizeMB.toFixed(2)}MB.`,
        variant: "destructive",
      });
      return;
    }
    
    setFile(f);
    setFileName(f.name);
    setAudioData(null);
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
    setAudioData(null);
    setResultFileName("");
  };

  const extractAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('format', audioFormat);

    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.VIDEO_TO_AUDIO}`, {
        method: 'POST',
        body: formData,
      });

      // Handle file size limit error specifically
      if (response.status === 413) {
        const result = await response.json();
        toast({
          title: "File too large",
          description: result.error || "Maximum file size is 50MB",
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();

      if (result.success) {
        // Handle both placeholder and actual implementation
        if (result.result && result.result.audio) {
          setAudioData(result.result.audio);
          setResultFileName(result.result.filename || `${fileName.replace(/\.[^/.]+$/, '')}.${audioFormat}`);
        } else if (result.audio) {
          setAudioData(result.audio);
          setResultFileName(`${fileName.replace(/\.[^/.]+$/, '')}.${audioFormat}`);
        } else {
          // For placeholder implementation, show a message
          toast({
            title: "Conversion Complete",
            description: "Audio extraction simulated. In production, actual audio would be generated.",
            variant: "default",
          });
          return;
        }
        
        toast({
          title: "Success!",
          description: "Video to audio conversion completed successfully",
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
        description: error instanceof Error ? error.message : "Failed to extract audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <ToolLayout
      title="Video to Audio Converter"
      description="Extract audio from video files (MP4, AVI, MOV → MP3, WAV)"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-6">
        {!file && (
          <VideoUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => {}}
            onFileSelect={handleFile}
            multiple={false}
            title="Drop video file here or click to browse"
            subtitle="Extract audio from MP4, AVI, MOV, WebM up to 50MB"
          />
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Music className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear selection">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Format Selection */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-medium">Output Format</h3>
              <div className="grid gap-2 sm:grid-cols-4">
                {['mp3', 'wav', 'aac', 'ogg'].map((format) => (
                  <button
                    key={format}
                    onClick={() => setAudioFormat(format)}
                    className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                      audioFormat === format
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Extract Button */}
            <button
              onClick={extractAudio}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Extracting Audio...
                </>
              ) : (
                <>
                  <Music className="h-5 w-5" />
                  Extract Audio
                </>
              )}
            </button>

            {/* Download Section */}
            {audioData && (
              <div ref={downloadSectionRef} className="space-y-4">
                <h3 className="text-lg font-medium text-center">Extracted Audio</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-32 h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                        <Music className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <EnhancedDownload
                      data={audioData}
                      fileName={resultFileName || fileName.replace(/\.[^/.]+$/, `.${audioFormat}`)}
                      fileType="audio"
                      title="Audio Extracted Successfully"
                      description={`Video converted to ${audioFormat.toUpperCase()} format`}
                      fileSize={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="font-medium">Supported Input</h4>
            <p className="mt-1 text-sm text-muted-foreground">MP4, AVI, MOV, MKV, WebM, FLV</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="font-medium">Output Formats</h4>
            <p className="mt-1 text-sm text-muted-foreground">MP3, WAV, AAC, OGG, FLAC</p>
          </div>
        </div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default VideoToAudioTool;
