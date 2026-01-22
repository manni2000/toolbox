import { Scissors, Upload, Info } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const VideoTrimTool = () => {
  return (
    <ToolLayout
      title="Video Trim Tool"
      description="Cut and trim video clips to specific timestamps"
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
                Video trimming requires server-side processing with FFmpeg. 
                This tool needs a backend API to:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Accept video file uploads</li>
                <li>Process start and end timestamps</li>
                <li>Trim video without re-encoding (fast) or with re-encoding</li>
                <li>Return trimmed video file</li>
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
            <label className="mb-2 block text-sm font-medium">Start Time</label>
            <input
              type="text"
              placeholder="00:00:00"
              disabled
              className="input-tool opacity-50"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">End Time</label>
            <input
              type="text"
              placeholder="00:00:30"
              disabled
              className="input-tool opacity-50"
            />
          </div>
        </div>

        <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
          <Scissors className="h-5 w-5" />
          Trim Video
        </button>
      </div>
    </ToolLayout>
  );
};

export default VideoTrimTool;
