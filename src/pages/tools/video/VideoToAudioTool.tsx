import { Music, Upload, Info } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const VideoToAudioTool = () => {
  return (
    <ToolLayout
      title="Video to Audio Converter"
      description="Extract audio from video files (MP4, AVI, MOV → MP3, WAV)"
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
                Video to audio conversion requires server-side processing with FFmpeg or MoviePy. 
                This tool needs a backend API to:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Accept video file uploads (MP4, AVI, MOV, MKV, WebM)</li>
                <li>Extract audio tracks using FFmpeg</li>
                <li>Convert to desired format (MP3, WAV, AAC, OGG)</li>
                <li>Return downloadable audio file</li>
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
