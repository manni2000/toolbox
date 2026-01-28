import { useState, useRef } from "react";
import { Music, Upload, X, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const VideoToAudioTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [audioFormat, setAudioFormat] = useState("mp3");
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
    setAudioData(null);
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
  };

  const extractAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('format', audioFormat);

    try {
      const response = await fetch('/api/video/to-audio/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAudioData(result.audio); // Backend returns 'audio' field
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
                <Music className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
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
                    {/* Audio Preview Player */}
                    <div className="mb-6">
                      <div className="bg-muted/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Music className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">Audio Preview</span>
                        </div>
                        <audio 
                          controls 
                          className="w-full h-10 rounded"
                          src={audioData}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                    
                    <EnhancedDownload
                      data={audioData}
                      fileName={fileName.replace(/\.[^/.]+$/, `.${audioFormat}`)}
                      fileType="audio"
                      title="Audio Extracted Successfully"
                      description={`Video converted to ${audioFormat.toUpperCase()} format with audio preview`}
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
      </div>
    </ToolLayout>
  );
};

export default VideoToAudioTool;
