import { useState, useRef } from "react";
import { Gauge, X, Loader2, Video, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import { VideoUploadZone } from "@/components/ui/video-upload-zone";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "350 80% 55%";

const VideoSpeedTool = () => {
  const toolSeoData = getToolSeoMetadata('video-speed-changer');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [videoData, setVideoData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [speedFactor, setSpeedFactor] = useState(1.5);
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

  const changeSpeed = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('speed_factor', speedFactor.toString());

    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/video/speed/`, {
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
    <>
      {CategorySEO.Video(
        toolSeoData?.title || "Video Speed Controller",
        toolSeoData?.description || "Change video playback speed from 0.5x to 2x",
        "video-speed"
      )}
      <ToolLayout
        title="Video Speed Controller"
        description="Change video playback speed from 0.5x to 2x"
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
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear selected video">
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
                  aria-label="Video speed multiplier"
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            What is Video Speed Adjustment?
          </h3>
          <p className="text-muted-foreground mb-4">
            Video speed adjustment changes the playback speed of videos without affecting audio pitch. This is useful for creating slow-motion effects, speeding up content, or adjusting duration requirements.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your video file</li>
            <li>Select speed multiplier</li>
            <li>The tool adjusts playback speed</li>
            <li>Download the modified video</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Speed Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Slow motion (0.5x, 0.25x)</li>
                <li>• Normal speed (1x)</li>
                <li>• Fast forward (1.5x, 2x)</li>
                <li>• Custom speed values</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Slow-motion effects</li>
                <li>• Time-lapse creation</li>
                <li>• Content condensing</li>
                <li>• Tutorial pacing</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Does changing speed affect audio?",
            answer: "This tool preserves audio pitch when changing speed. The audio plays faster or slower but maintains the same pitch, preventing the chipmunk effect."
          },
          {
            question: "What speed should I use for slow motion?",
            answer: "For slow motion, use 0.5x for mild slowdown, 0.25x for dramatic slow motion. Slower speeds may reduce smoothness depending on frame rate."
          },
          {
            question: "Can I speed up video without losing quality?",
            answer: "Speeding up doesn't inherently lose quality, but faster motion may make details harder to see. Quality depends on the original video, not speed adjustment."
          },
          {
            question: "How does speed affect file size?",
            answer: "Speed adjustment doesn't significantly change file size. The video duration changes, but the bitrate and resolution remain the same, keeping file size similar."
          },
          {
            question: "What's the difference between speed and frame rate?",
            answer: "Speed changes playback rate (how fast it plays). Frame rate changes how many frames per second are captured. Both can affect smoothness but are different concepts."
          }
        ]} />
      </div>
    </ToolLayout>
    </>
  );
};

export default VideoSpeedTool;
