import { Monitor, Upload, Info } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const VideoResolutionTool = () => {
  return (
    <ToolLayout
      title="Video Resolution Converter"
      description="Change video resolution - upscale or downscale video quality"
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
                Video resolution conversion requires server-side processing with FFmpeg. 
                This tool needs a backend API to:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Accept video file uploads</li>
                <li>Transcode to target resolution</li>
                <li>Support common resolutions (360p to 4K)</li>
                <li>Maintain aspect ratio</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="file-drop opacity-50 cursor-not-allowed">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Drop video file here</p>
          <p className="text-sm text-muted-foreground">Requires backend integration</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Target Resolution</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {["360p", "480p", "720p", "1080p", "1440p", "4K"].map((res) => (
              <button
                key={res}
                disabled
                className="rounded-lg border border-border bg-card p-3 text-center text-sm opacity-50 cursor-not-allowed"
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
          <Monitor className="h-5 w-5" />
          Convert Resolution
        </button>
      </div>
    </ToolLayout>
  );
};

export default VideoResolutionTool;
