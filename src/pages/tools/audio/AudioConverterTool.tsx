import { Music2, Upload, Info } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const AudioConverterTool = () => {
  return (
    <ToolLayout
      title="Audio Format Converter"
      description="Convert audio files between MP3, WAV, AAC, OGG, and FLAC formats"
      category="Audio Tools"
      categoryPath="/category/audio"
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
                Audio format conversion requires server-side processing with FFmpeg. 
                This tool needs a backend API to:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Accept audio file uploads (MP3, WAV, AAC, OGG, FLAC, M4A)</li>
                <li>Transcode between audio formats</li>
                <li>Adjust bitrate and sample rate</li>
                <li>Return converted audio file</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="file-drop opacity-50 cursor-not-allowed">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Drop audio file here</p>
          <p className="text-sm text-muted-foreground">Requires backend integration</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Output Format</label>
            <select disabled className="input-tool opacity-50">
              <option>MP3</option>
              <option>WAV</option>
              <option>AAC</option>
              <option>OGG</option>
              <option>FLAC</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Bitrate</label>
            <select disabled className="input-tool opacity-50">
              <option>128 kbps</option>
              <option>192 kbps</option>
              <option>256 kbps</option>
              <option>320 kbps</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-5">
          {["MP3", "WAV", "AAC", "OGG", "FLAC"].map((format) => (
            <div
              key={format}
              className="rounded-lg border border-border bg-card p-4 text-center"
            >
              <Music2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 font-medium">{format}</p>
            </div>
          ))}
        </div>

        <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
          <Music2 className="h-5 w-5" />
          Convert Audio
        </button>
      </div>
    </ToolLayout>
  );
};

export default AudioConverterTool;
