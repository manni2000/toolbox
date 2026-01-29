import { useState, useRef, useEffect } from "react";
import { Gauge, Upload, Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const AudioSpeedTool = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [speed, setSpeed] = useState(1.0);
  const [preservePitch, setPreservePitch] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.preservesPitch = preservePitch;
    }
  }, [speed, preservePitch]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioUrl(url);
    setSpeed(1.0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const speedPresets = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const downloadProcessed = async () => {
    if (!audioFile) return;

    toast({
      title: "Processing",
      description: `Preparing audio at ${speed}x speed...`,
    });

    // Note: Actual speed change with pitch preservation requires backend processing
    // For now, we'll create an info file with the settings
    const info = {
      originalFile: audioFile.name,
      speed: speed,
      preservePitch: preservePitch,
      estimatedDuration: duration / speed,
      note: "Full speed processing with pitch preservation requires backend processing with FFmpeg"
    };

    const blob = new Blob([JSON.stringify(info, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setProcessedUrl(url);

    toast({
      title: "Note",
      description: "Full audio processing requires backend. Preview works with browser playback.",
    });
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl("");
    setSpeed(1.0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="Audio Speed Changer"
      description="Change audio playback speed from 0.5x to 2x while keeping pitch intact."
      category="Audio Tools"
      categoryPath="/category/audio"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!audioFile && (
          <div
            className={`file-drop ${isDragging ? "border-primary bg-primary/5" : ""} p-6 sm:p-8`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
            <p className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Drop audio file here or click to upload</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Supports MP3, WAV, M4A, OGG</p>
          </div>
        )}

        {audioFile && (
          <>
            {/* File Info */}
            <Card className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 flex-shrink-0">
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{audioFile.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Duration: {formatTime(duration)} → {formatTime(duration / speed)} at {speed}x
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={reset} className="self-end sm:self-auto">
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                  <span className="sm:hidden">Rst</span>
                </Button>
              </div>
            </Card>

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Speed Control */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Gauge className="h-4 w-4 sm:h-5 sm:w-5" />
                  Playback Speed
                </h3>
                <span className="text-xl sm:text-2xl font-bold text-primary">{speed}x</span>
              </div>

              {/* Slider */}
              <Slider
                value={[speed]}
                min={0.5}
                max={2.0}
                step={0.05}
                onValueChange={([val]) => setSpeed(val)}
                className="mb-4"
              />

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {speedPresets.map((preset) => (
                  <Button
                    key={preset}
                    variant={speed === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSpeed(preset)}
                    className="text-xs sm:text-sm"
                  >
                    {preset}x
                  </Button>
                ))}
              </div>
            </Card>

            {/* Pitch Preservation Toggle */}
            <Card className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm sm:text-base">Preserve Pitch</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Keep the original pitch when changing speed
                  </p>
                </div>
                <Button
                  variant={preservePitch ? "default" : "outline"}
                  onClick={() => setPreservePitch(!preservePitch)}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {preservePitch ? "On" : "Off"}
                </Button>
              </div>
            </Card>

            {/* Progress Bar */}
            <Card className="p-4">
              <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={([val]) => seek(val)}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </Card>

            {/* Playback Controls */}
            <div className="flex gap-3">
              <Button onClick={togglePlay} className="flex-1 text-sm sm:text-base py-3 sm:py-4">
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Preview at {speed}x</span>
                    <span className="sm:hidden">Preview</span>
                  </>
                )}
              </Button>
            </div>

            {/* Download */}
            <Button onClick={downloadProcessed} variant="secondary" className="w-full text-sm sm:text-base py-3 sm:py-4">
              <Gauge className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Process Audio Speed</span>
              <span className="sm:hidden">Process</span>
            </Button>

            {processedUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={processedUrl}
                  fileName={`${audioFile.name.replace(/\.[^.]+$/, "")}_${speed}x_info.json`}
                  fileType="zip"
                  title="Audio Speed Processing Info Ready"
                  description={`Audio speed change settings for ${speed}x playback with pitch preservation: ${preservePitch ? 'enabled' : 'disabled'}`}
                  fileSize={audioFile ? `${(audioFile.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                />
              </div>
            )}

            {/* Info */}
            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Preview:</strong> Use the player above to hear how your audio sounds at different speeds. 
                The browser's built-in pitch preservation keeps the voice natural even at 2x speed.
              </p>
            </Card>
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default AudioSpeedTool;
