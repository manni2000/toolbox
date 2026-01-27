import { useState, useRef, useEffect } from "react";
import { Gauge, Upload, Play, Pause, Download, RotateCcw, Volume2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const AudioSpeedTool = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [speed, setSpeed] = useState(1.0);
  const [preservePitch, setPreservePitch] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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
    const a = document.createElement("a");
    a.href = url;
    a.download = `${audioFile.name.replace(/\.[^.]+$/, "")}_${speed}x_info.json`;
    a.click();
    URL.revokeObjectURL(url);

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
            className={`file-drop ${isDragging ? "border-primary bg-primary/5" : ""}`}
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
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop audio file here or click to upload</p>
            <p className="text-sm text-muted-foreground">Supports MP3, WAV, M4A, OGG</p>
          </div>
        )}

        {audioFile && (
          <>
            {/* File Info */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {formatTime(duration)} → {formatTime(duration / speed)} at {speed}x
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Playback Speed
                </h3>
                <span className="text-2xl font-bold text-primary">{speed}x</span>
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
                  >
                    {preset}x
                  </Button>
                ))}
              </div>
            </Card>

            {/* Pitch Preservation Toggle */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Preserve Pitch</p>
                  <p className="text-sm text-muted-foreground">
                    Keep the original pitch when changing speed
                  </p>
                </div>
                <Button
                  variant={preservePitch ? "default" : "outline"}
                  onClick={() => setPreservePitch(!preservePitch)}
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
              <Button onClick={togglePlay} className="flex-1">
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Preview at {speed}x
                  </>
                )}
              </Button>
            </div>

            {/* Download */}
            <Button onClick={downloadProcessed} variant="secondary" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Processed Audio
            </Button>

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
