import { useState, useRef, useEffect } from "react";
import { Gauge, Upload, Play, Pause, RotateCcw, Volume2, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { AudioUploadZone } from "@/components/ui/audio-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "290 80% 55%";

const AudioSpeedTool = () => {
  const toolSeoData = getToolSeoMetadata('audio-speed');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [speed, setSpeed] = useState(1.0);
  const [preservePitch, setPreservePitch] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    setProcessedUrl(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('speed', String(speed));

      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.AUDIO_SPEED}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setProcessedUrl(result.audio);
        toast({
          title: "Success!",
          description: `Audio processed at ${speed}x speed`,
        });
      } else {
        throw new Error(result.error || 'Failed to process audio');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process audio",
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
    setSpeed(1.0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      {CategorySEO.Audio(
        toolSeoData?.title || "Audio Speed Changer",
        toolSeoData?.description || "Change audio playback speed from 0.5x to 2x while keeping pitch intact.",
        "audio-speed"
      )}
      <ToolLayout
      breadcrumbTitle="Audio Speed"
      category="Audio Tools"
      categoryPath="/category/audio"
    >
      <div className="space-y-6">
        {/* Keyword Tags Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-muted/50 via-background to-muted/30 rounded-xl border border-border p-6"
        >
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Gauge className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Audio Speed Changer Free Online</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Change audio playback speed from 0.5x to 2x while keeping pitch intact. Speed up or slow down audio.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">audio speed</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">change audio speed</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">speed up audio</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">slow down audio</span>
              </div>
            </div>
          </div>
        </motion.div>
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
            <Button
              onClick={downloadProcessed}
              variant="secondary"
              className="w-full text-sm sm:text-base py-3 sm:py-4"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gauge className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Process & Download at {speed}x</span>
                  <span className="sm:hidden">Process</span>
                </>
              )}
            </Button>

            {processedUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={processedUrl}
                  fileName={`${audioFile.name.replace(/\.[^.]+$/, "")}_${speed}x.mp3`}
                  fileType="audio"
                  title="Speed-Adjusted Audio Ready"
                  description={`Audio processed at ${speed}x speed`}
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
            <Gauge className="h-5 w-5 text-green-500" />
            What is Audio Speed Adjustment?
          </h3>
          <p className="text-muted-foreground mb-4">
            Audio speed adjustment changes the playback rate of audio files without altering the pitch. This allows you to speed up slow content or slow down fast speech for better comprehension.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload an audio file (MP3, WAV, AAC, etc.)</li>
            <li>Use the speed slider to adjust playback rate (0.5x to 2x)</li>
            <li>Preview the audio at the selected speed</li>
            <li>Process and download the speed-adjusted file</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Speed Options</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 0.5x: Half speed (slow motion)</li>
                <li>• 0.75x: 75% speed</li>
                <li>• 1x: Normal speed</li>
                <li>• 1.5x: 50% faster</li>
                <li>• 2x: Double speed</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Speed up podcasts</li>
                <li>• Slow down tutorials</li>
                <li>• Adjust music tempo</li>
                <li>• Language learning</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Does changing speed affect audio quality?",
            answer: "Our speed adjustment preserves audio quality and maintains the original pitch. The audio is resampled to maintain clarity at different speeds."
          },
          {
            question: "What speed range is supported?",
            answer: "You can adjust speed from 0.5x (half speed) to 2x (double speed). This covers most use cases from slow motion to fast playback."
          },
          {
            question: "Can I preview before downloading?",
            answer: "Yes! Use the play button to preview the audio at the selected speed before processing and downloading the final file."
          },
          {
            question: "What file formats are supported?",
            answer: "MP3, WAV, AAC, OGG, FLAC, and other common audio formats are supported. The output will be in the same format as the input."
          },
          {
            question: "Will the pitch change with speed?",
            answer: "No, our tool preserves the original pitch while changing only the playback speed. This ensures natural-sounding audio at any speed."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default AudioSpeedTool;
