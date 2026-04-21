import { useState, useRef } from "react";
import { Scissors, X, Loader2, Video, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { VideoUploadZone } from "@/components/ui/video-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "350 80% 55%";

const VideoTrimTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [videoData, setVideoData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
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
    <>
      {CategorySEO.Video(
        "Video Trim Tool",
        "Cut and trim video clips to specific timestamps",
        "video-trim-tool"
      )}
      <ToolLayout
      title="Video Trim Tool"
      description="Cut and trim video clips to specific timestamps"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-6">
        {/* Upload Area */}
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
            subtitle="Supports MP4, AVI, MOV, WebM up to 50MB"
          />
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-blue-500" />
            What is Video Trimming?
          </h3>
          <p className="text-muted-foreground mb-4">
            Video trimming cuts out unwanted sections from the beginning, middle, or end of videos. This is useful for removing mistakes, creating clips, or focusing on the most important content.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your video file</li>
            <li>Set start and end timestamps</li>
            <li>The tool cuts the video</li>
            <li>Download the trimmed video</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Trim Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Precise timestamp selection</li>
                <li>• Preview before trimming</li>
                <li>• Multiple trim options</li>
                <li>• Quality preservation</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Removing mistakes</li>
                <li>• Creating clips</li>
                <li>• Social media content</li>
                <li>• Highlight reels</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Does trimming reduce video quality?",
            answer: "Trimming doesn't reduce quality if done correctly. The trimmed section is cut without re-encoding, preserving original quality. Some tools may re-encode, which can affect quality."
          },
          {
            question: "How precise can I trim videos?",
            answer: "Precision depends on the video's frame rate and keyframes. You can typically trim to the nearest frame. For frame-accurate editing, use professional video editing software."
          },
          {
            question: "Can I trim multiple sections?",
            answer: "This tool trims a single continuous section. For multiple cuts, you may need to trim multiple times or use video editing software with multi-cut capabilities."
          },
          {
            question: "What's the difference between trimming and cutting?",
            answer: "Trimming removes sections from the beginning or end. Cutting can remove sections from anywhere. In practice, both terms are often used interchangeably for removing unwanted parts."
          },
          {
            question: "Does trimming affect file size?",
            answer: "Yes, trimming reduces file size proportionally to the removed duration. A 50% shorter video will be approximately 50% smaller in file size."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default VideoTrimTool;
