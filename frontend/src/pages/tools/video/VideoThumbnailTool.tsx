import { useState, useRef } from "react";
import { Camera, X, Loader2, Video, Sparkles } from "lucide-react";
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

const VideoThumbnailTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [thumbnailData, setThumbnailData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnailTime, setThumbnailTime] = useState(1);
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
            subtitle="Generate thumbnails from MP4, AVI, MOV, WebM up to 50MB"
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-500" />
            What is Video Thumbnail Extraction?
          </h3>
          <p className="text-muted-foreground mb-4">
            Video thumbnail extraction captures still images from videos at specific timestamps. These thumbnails are used as preview images, video posters, or for sharing on social media platforms.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your video file</li>
            <li>Select timestamp for capture</li>
            <li>The tool extracts the frame</li>
            <li>Download the thumbnail image</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Thumbnail Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Frame capture at timestamp</li>
                <li>• Multiple format support</li>
                <li>• High-quality output</li>
                <li>• Custom timestamp selection</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Video posters</li>
                <li>• Social media sharing</li>
                <li>• Video previews</li>
                <li>• Content thumbnails</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What makes a good video thumbnail?",
            answer: "Good thumbnails are clear, high-contrast, and show the main subject. Use bright colors, readable text, and choose a frame that represents the video's content well."
          },
          {
            question: "What timestamp should I choose?",
            answer: "Choose a timestamp with the most action or key moment. For introductions, use 1-3 seconds. For main content, use 10-30% into the video to avoid title screens."
          },
          {
            question: "What resolution should thumbnails be?",
            answer: "Thumbnails should be at least 1280x720 (16:9 aspect ratio). YouTube recommends 1280x720. Higher resolution (1920x1080) provides better quality on large screens."
          },
          {
            question: "Can I extract multiple thumbnails?",
            answer: "This tool extracts one thumbnail at a time. For multiple thumbnails, repeat the process with different timestamps or use batch processing tools."
          },
          {
            question: "Do thumbnails affect video SEO?",
            answer: "Yes, thumbnails significantly affect click-through rates. Compelling thumbnails with clear titles improve video visibility and engagement on platforms."
          }
        ]} />
      </div>
    </ToolLayout>
  );
};

export default VideoThumbnailTool;
