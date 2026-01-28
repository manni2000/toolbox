import { useState, useRef, useEffect } from "react";
import { Scissors, Upload, Play, Pause, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const AudioTrimmerTool = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

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
    setStartTime(0);
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
      const dur = audioRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      // Stop at end time during preview
      if (time >= endTime) {
        audioRef.current.pause();
        audioRef.current.currentTime = startTime;
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const previewSelection = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startTime;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      const [m, s] = parts;
      return parseInt(m) * 60 + parseFloat(s);
    }
    return parseFloat(timeStr) || 0;
  };

  const downloadTrimmed = async () => {
    if (!audioFile) return;

    toast({
      title: "Trimming Audio",
      description: `Trimming from ${formatTime(startTime)} to ${formatTime(endTime)}`,
    });

    // Note: Full audio trimming requires Web Audio API or backend
    // This is a simplified demo that downloads the original
    toast({
      title: "Note",
      description: "Full audio trimming requires backend processing. Download includes trim markers.",
    });

    // Create a metadata file with trim info
    const trimInfo = {
      originalFile: audioFile.name,
      startTime: startTime,
      endTime: endTime,
      duration: endTime - startTime,
      trimMarkers: `${formatTime(startTime)} - ${formatTime(endTime)}`
    };

    const blob = new Blob([JSON.stringify(trimInfo, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setTrimmedUrl(url);
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl("");
    setDuration(0);
    setCurrentTime(0);
    setStartTime(0);
    setEndTime(0);
    setIsPlaying(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const selectionWidth = duration > 0 ? ((endTime - startTime) / duration) * 100 : 0;
  const selectionLeft = duration > 0 ? (startTime / duration) * 100 : 0;
  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <ToolLayout
      title="Audio Trimmer"
      description="Cut and trim audio files. Set start and end points, preview before download."
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
                <div>
                  <p className="font-medium">{audioFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {formatTime(duration)} | Selection: {formatTime(endTime - startTime)}
                  </p>
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

            {/* Waveform / Timeline */}
            <Card className="p-4">
              <div className="relative h-20 bg-muted rounded-lg overflow-hidden">
                {/* Selection highlight */}
                <div
                  className="absolute top-0 bottom-0 bg-primary/20 border-x-2 border-primary"
                  style={{
                    left: `${selectionLeft}%`,
                    width: `${selectionWidth}%`,
                  }}
                />
                
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                  style={{ left: `${playheadPosition}%` }}
                />

                {/* Fake waveform visualization */}
                <div className="absolute inset-0 flex items-center justify-center gap-px px-2">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-primary/40 rounded-full w-1"
                      style={{
                        height: `${20 + Math.sin(i * 0.3) * 15 + Math.random() * 30}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Time labels */}
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{formatTime(0)}</span>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </Card>

            {/* Trim Controls */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <label className="text-sm font-medium mb-2 block">Start Time</label>
                <div className="flex gap-2">
                  <Input
                    value={formatTime(startTime)}
                    onChange={(e) => {
                      const time = parseTime(e.target.value);
                      if (time >= 0 && time < endTime) setStartTime(time);
                    }}
                    className="font-mono"
                  />
                  <Slider
                    value={[startTime]}
                    min={0}
                    max={duration}
                    step={0.1}
                    onValueChange={([val]) => {
                      if (val < endTime) setStartTime(val);
                    }}
                    className="flex-1"
                  />
                </div>
              </Card>

              <Card className="p-4">
                <label className="text-sm font-medium mb-2 block">End Time</label>
                <div className="flex gap-2">
                  <Input
                    value={formatTime(endTime)}
                    onChange={(e) => {
                      const time = parseTime(e.target.value);
                      if (time > startTime && time <= duration) setEndTime(time);
                    }}
                    className="font-mono"
                  />
                  <Slider
                    value={[endTime]}
                    min={0}
                    max={duration}
                    step={0.1}
                    onValueChange={([val]) => {
                      if (val > startTime) setEndTime(val);
                    }}
                    className="flex-1"
                  />
                </div>
              </Card>
            </div>

            {/* Playback Controls */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={togglePlay} className="flex-1">
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play Full
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={previewSelection} className="flex-1">
                <Scissors className="h-4 w-4 mr-2" />
                Preview Selection
              </Button>
            </div>

            {/* Download */}
            <Button onClick={downloadTrimmed} className="w-full">
              <Scissors className="h-4 w-4 mr-2" />
              Trim Audio
            </Button>

            {trimmedUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={trimmedUrl}
                  fileName={`${audioFile.name.replace(/\.[^.]+$/, "")}_trim_info.json`}
                  fileType="zip"
                  title="Audio Trim Info Ready"
                  description={`Trim markers for ${formatTime(startTime)} to ${formatTime(endTime)}`}
                  fileSize={audioFile ? `${(audioFile.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                />
              </div>
            )}

            {/* Info */}
            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Full audio trimming with actual file cutting requires 
                backend processing with FFmpeg. This demo provides the UI and preview functionality.
              </p>
            </Card>
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default AudioTrimmerTool;
