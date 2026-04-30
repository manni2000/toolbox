import { useState, useRef } from "react";
import { Video, X, Loader2, Sparkles, Monitor, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import { VideoUploadZone } from "@/components/ui/video-upload-zone";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "350 80% 55%";

const VideoResolutionTool = () => {
  const toolSeoData = getToolSeoMetadata('video-resolution-changer');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [resultData, setResultData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [processingStage, setProcessingStage] = useState("");
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = (f: File) => {
    setFile(f);
    setFileName(f.name);
    setResultData(null);
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
    setResultData(null);
    setProcessingStage("");
    setProcessingStartTime(null);
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const cancelProcessing = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsProcessing(false);
      setProcessingStage("");
      setProcessingStartTime(null);
      toast({
        title: "Processing Cancelled",
        description: "Video processing has been cancelled",
        variant: "default",
      });
    }
  };

  const processFile = async () => {
    if (!file) return;

    const controller = new AbortController();
    setAbortController(controller);
    setIsProcessing(true);
    setProcessingStartTime(Date.now());
    setProcessingStage("Initializing video processing...");

    const formData = new FormData();
    formData.append('video', file); // Backend expects 'video' not 'file'
    formData.append('width', width.toString());
    formData.append('height', height.toString());

    // Simulate progress updates
    const progressStages = [
      { delay: 1000, message: "Loading video file..." },
      { delay: 3000, message: "Analyzing video dimensions..." },
      { delay: 5000, message: "Resizing video (this may take a while)..." },
      { delay: 10000, message: "Processing audio track..." },
      { delay: 15000, message: "Finalizing video output..." },
    ];

    const stageTimeouts: NodeJS.Timeout[] = [];
    
    progressStages.forEach((stage, index) => {
      const timeout = setTimeout(() => {
        if (!controller.signal.aborted) {
          setProcessingStage(stage.message);
        }
      }, stage.delay);
      stageTimeouts.push(timeout);
    });

    try {
      setProcessingStage("Sending request to server...");
      
      const response = await fetch(`${API_URLS.BASE_URL}/api/video/resolution/`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      // Clear all pending stage updates
      stageTimeouts.forEach(timeout => clearTimeout(timeout));
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      setProcessingStage("Processing completed successfully!");
      
      const result = await response.json();

      if (result.success) {
        setResultData(result.video); // Backend returns 'video' field
        toast({
          title: "Success!",
          description: "Video resolution conversion completed successfully",
        });
        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to process file');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled, don't show error
        return;
      }
      
      stageTimeouts.forEach(timeout => clearTimeout(timeout));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      stageTimeouts.forEach(timeout => clearTimeout(timeout));
      setIsProcessing(false);
      setProcessingStage("");
      setProcessingStartTime(null);
      setAbortController(null);
    }
  };

  return (
    <>
      {CategorySEO.Video(
        toolSeoData?.title || "Video Resolution Converter",
        toolSeoData?.description || "Change video resolution and dimensions",
        "video-resolution"
      )}
      <ToolLayout
      breadcrumbTitle="Video Resolution"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-6">
        {/* Keyword Tags Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-muted/50 via-background to-muted/30 rounded-xl border border-border p-6"
        >
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Settings className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Video Resolution Converter Free Online</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Change video resolution and dimensions. Upscale or downscale videos for different platforms and devices.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">video resolution</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">change video resolution</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">video dimensions</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">resize video</span>
              </div>
            </div>
          </div>
        </motion.div>
        {!file && (
          <>
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
              subtitle="Change resolution of MP4, AVI, MOV, WebM up to 50MB"
            />
            <label htmlFor="video-input" className="sr-only">
              Upload video file
            </label>
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
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Remove file">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Resolution Selection */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-medium">Output Resolution</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Width (pixels)</label>
                  <input
                    type="number"
                    min="160"
                    max="3840"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    placeholder="Enter width in pixels"
                    className="input-tool"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Height (pixels)</label>
                  <input
                    type="number"
                    min="90"
                    max="2160"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    placeholder="Enter height in pixels"
                    className="input-tool"
                  />
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => { setWidth(1920); setHeight(1080); }}
                  className="rounded-lg border p-2 text-sm transition-colors hover:bg-muted"
                >
                  1080p (1920×1080)
                </button>
                <button
                  type="button"
                  onClick={() => { setWidth(1280); setHeight(720); }}
                  className="rounded-lg border p-2 text-sm transition-colors hover:bg-muted"
                >
                  720p (1280×720)
                </button>
                <button
                  type="button"
                  onClick={() => { setWidth(854); setHeight(480); }}
                  className="rounded-lg border p-2 text-sm transition-colors hover:bg-muted"
                >
                  480p (854×480)
                </button>
              </div>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-blue-800">Processing Video</h3>
                    <button
                      onClick={cancelProcessing}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-700">{processingStage}</span>
                    </div>
                    
                    {processingStartTime && (
                      <div className="text-xs text-blue-600">
                        Processing time: {Math.floor((Date.now() - processingStartTime) / 1000)}s
                      </div>
                    )}
                    
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-600 bg-blue-100 rounded-lg p-3">
                    <strong>Tip:</strong> Video processing can take 30-60 seconds depending on file size and resolution. Please keep this tab open.
                  </div>
                </div>
              </div>
            )}

            {!isProcessing && (
              <button
                onClick={processFile}
                disabled={isProcessing}
                className="btn-primary w-full"
              >
                <Video className="h-5 w-5" />
                Process File
              </button>
            )}

            {resultData && (
              <div ref={downloadSectionRef} className="space-y-4">
                <h3 className="text-lg font-medium text-center">Converted Video</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-32 h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                        <Video className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <EnhancedDownload
                      data={resultData}
                      fileName={fileName.replace(/\.[^/.]+$/, "_converted.mp4")}
                      fileType="zip"
                      title="Video Resolution Changed Successfully"
                      description={`Video converted to ${width}×${height}px resolution`}
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
            <Monitor className="h-5 w-5 text-blue-500" />
            What is Video Resolution Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            Video resolution conversion changes the resolution (size) of video files to different dimensions. This is useful for optimizing videos for different devices, platforms, or storage requirements.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your video file</li>
            <li>Select target resolution</li>
            <li>The tool converts the video</li>
            <li>Download the converted video</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Resolution Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 720p (HD)</li>
                <li>• 1080p (Full HD)</li>
                <li>• 4K (Ultra HD)</li>
                <li>• Custom dimensions</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Mobile optimization</li>
                <li>• Platform compatibility</li>
                <li>• Storage optimization</li>
                <li>• Bandwidth reduction</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What video resolution should I use?",
            answer: "Use 720p for mobile and web, 1080p for most platforms, 4K for high-quality content. Consider your audience's devices and bandwidth when choosing resolution."
          },
          {
            question: "Does changing resolution reduce quality?",
            answer: "Lowering resolution can reduce quality, especially for detailed content. Raising resolution doesn't improve quality if the original is lower. Always work with the highest quality source."
          },
          {
            question: "What's the difference between 720p and 1080p?",
            answer: "720p is 1280x720 pixels (HD). 1080p is 1920x1080 pixels (Full HD). 1080p has 2.25 times more pixels than 720p, providing sharper detail."
          },
          {
            question: "Can I change aspect ratio with resolution?",
            answer: "Resolution conversion typically preserves aspect ratio. To change aspect ratio, you need cropping or scaling which may distort or cut parts of the video."
          },
          {
            question: "How does resolution affect file size?",
            answer: "Higher resolution increases file size significantly. 4K files are about 4x larger than 1080p. Lower resolution reduces file size and bandwidth requirements."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default VideoResolutionTool;
