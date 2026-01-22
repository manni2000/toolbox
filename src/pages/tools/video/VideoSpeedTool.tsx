import { Gauge, Upload, Info } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const VideoSpeedTool = () => {
  return (
    <ToolLayout
      title="Video Speed Controller"
      description="Change video playback speed - speed up or slow down videos"
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
                Video speed adjustment requires server-side processing with FFmpeg. 
                This tool needs a backend API to:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Accept video file uploads</li>
                <li>Adjust video frame rate and audio tempo</li>
                <li>Support speed multipliers (0.25x to 4x)</li>
                <li>Maintain audio pitch (optional)</li>
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
          <label className="mb-2 block text-sm font-medium">Speed Multiplier</label>
          <div className="grid grid-cols-4 gap-2">
            {["0.5x", "1x", "1.5x", "2x"].map((speed) => (
              <button
                key={speed}
                disabled
                className="rounded-lg border border-border bg-card p-3 text-center opacity-50 cursor-not-allowed"
              >
                {speed}
              </button>
            ))}
          </div>
        </div>

        <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
          <Gauge className="h-5 w-5" />
          Change Speed
        </button>
      </div>
    </ToolLayout>
  );
};

export default VideoSpeedTool;
