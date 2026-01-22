import { Image, Upload, Info } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const VideoThumbnailTool = () => {
  return (
    <ToolLayout
      title="Video Thumbnail Generator"
      description="Extract thumbnail images from video files at specific timestamps"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Backend Processing Required</h3>
              <p className="mt-2 text-muted-foreground">
                Video thumbnail extraction requires server-side processing with FFmpeg. 
                This tool needs a backend API to:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Accept video file uploads</li>
                <li>Extract frames at specified timestamps</li>
                <li>Generate multiple thumbnails at intervals</li>
                <li>Output as JPG or PNG images</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="file-drop opacity-50 cursor-not-allowed">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Drop video file here</p>
          <p className="text-sm text-muted-foreground">Requires backend integration</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Timestamp</label>
            <input
              type="text"
              placeholder="00:00:05"
              disabled
              className="input-tool opacity-50"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Output Format</label>
            <select disabled className="input-tool opacity-50">
              <option>JPG</option>
              <option>PNG</option>
            </select>
          </div>
        </div>

        <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
          <Image className="h-5 w-5" />
          Generate Thumbnail
        </button>
      </div>
    </ToolLayout>
  );
};

export default VideoThumbnailTool;
