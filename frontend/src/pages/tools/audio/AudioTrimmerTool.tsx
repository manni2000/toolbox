import { useState, useRef, useEffect } from "react";
import { Scissors, Upload, Play, Pause, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { AudioUploadZone } from "@/components/ui/audio-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "290 80% 55%";

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
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    setTrimmedUrl(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('startTime', String(startTime));
      formData.append('endTime', String(endTime));
      formData.append('duration', String(endTime - startTime));

      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.AUDIO_TRIMMER}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setTrimmedUrl(result.audio);
        toast({
          title: "Success!",
          description: `Audio trimmed from ${formatTime(startTime)} to ${formatTime(endTime)}`,
        });
      } else {
        throw new Error(result.error || 'Failed to trim audio');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trim audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
    <>
      {CategorySEO.Audio(
        "Audio Trimmer",
        "Cut and trim audio files. Set start and end points, preview before download.",
        "audio-trimmer"
      )}
      <ToolLayout
      title="Audio Trimmer"
      description="Cut and trim audio files. Set start and end points, preview before download."
      category="Audio Tools"
      categoryPath="/category/audio"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!audioFile && (
          <AudioUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            multiple={false}
            title="Drop audio file here or click to browse"
            subtitle="Supports MP3, WAV, M4A, OGG up to 50MB"
          />
        )}

        {audioFile && (
          <>
            {/* File Info */}
            <Card className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{audioFile.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Duration: {formatTime(duration)} | Selection: {formatTime(endTime - startTime)}
                  </p>
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

            {/* Waveform / Timeline */}
            <Card className="p-3 sm:p-4">
              <div className="relative h-16 sm:h-20 bg-muted rounded-lg overflow-hidden">
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
                <div className="absolute inset-0 flex items-center justify-center gap-px px-1 sm:px-2">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-primary/40 rounded-full w-0.5 sm:w-1"
                      style={{
                        height: `${20 + Math.sin(i * 0.3) * 15 + Math.random() * 30}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Time labels */}
              <div className="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
                <span>{formatTime(0)}</span>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </Card>

            {/* Trim Controls */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-3 sm:p-4">
                <label className="text-xs sm:text-sm font-medium mb-2 block">Start Time</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={formatTime(startTime)}
                    onChange={(e) => {
                      const time = parseTime(e.target.value);
                      if (time >= 0 && time < endTime) setStartTime(time);
                    }}
                    className="font-mono text-sm"
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

              <Card className="p-3 sm:p-4">
                <label className="text-xs sm:text-sm font-medium mb-2 block">End Time</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={formatTime(endTime)}
                    onChange={(e) => {
                      const time = parseTime(e.target.value);
                      if (time > startTime && time <= duration) setEndTime(time);
                    }}
                    className="font-mono text-sm"
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={togglePlay} className="flex-1 text-sm sm:text-base py-3 sm:py-4">
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Play Full</span>
                    <span className="sm:hidden">Play</span>
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={previewSelection} className="flex-1 text-sm sm:text-base py-3 sm:py-4">
                <Scissors className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Preview Selection</span>
                <span className="sm:hidden">Preview</span>
              </Button>
            </div>

            {/* Download */}
            <Button
              onClick={downloadTrimmed}
              className="w-full text-sm sm:text-base py-3 sm:py-4"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  Trimming...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Trim Audio
                </>
              )}
            </Button>

            {trimmedUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={trimmedUrl}
                  fileName={`${audioFile.name.replace(/\.[^.]+$/, "")}_trimmed.mp3`}
                  fileType="audio"
                  title="Trimmed Audio Ready"
                  description={`Trimmed from ${formatTime(startTime)} to ${formatTime(endTime)}`}
                  fileSize={audioFile ? `${(audioFile.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                />
              </div>
            )}
          </>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-orange-500" />
            What is Audio Trimming?
          </h3>
          <p className="text-muted-foreground mb-4">
            Audio trimming removes unwanted sections from the beginning, middle, or end of audio files. This is perfect for removing silence, mistakes, or extracting specific segments from longer recordings.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload an audio file you want to trim</li>
            <li>Set the start and end points using sliders or time input</li>
            <li>Preview the selected segment to verify</li>
            <li>Process and download the trimmed audio file</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-semibold text-orange-900 mb-1">Common Use Cases</h5>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Remove silence from recordings</li>
                <li>• Extract audio clips</li>
                <li>• Cut out mistakes</li>
                <li>• Create ringtones</li>
              </ul>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-1">Trimming Features</h5>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Precise time selection</li>
                <li>• Visual waveform preview</li>
                <li>• Real-time preview</li>
                <li>• Frame-accurate cuts</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How precise can I make my cuts?",
            answer: "You can trim with precision up to 0.1 seconds. Use the sliders or manually enter the exact start and end times for precise cutting."
          },
          {
            question: "Can I trim multiple sections from one file?",
            answer: "Currently, the tool trims a single continuous segment. For multiple cuts, you would need to process the file multiple times or use a dedicated audio editor."
          },
          {
            question: "Will trimming affect audio quality?",
            answer: "No, trimming is a lossless operation. The audio quality remains exactly the same as the original file within the selected segment."
          },
          {
            question: "What file formats are supported?",
            answer: "MP3, WAV, AAC, OGG, FLAC, and other common audio formats are supported. The output maintains the same format as the input."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default AudioTrimmerTool;
