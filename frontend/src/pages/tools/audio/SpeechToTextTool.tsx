import { useState, useRef, useEffect } from "react";
import { Mic, Upload, Languages, FileText, Loader2, Sparkles, MicOff, Play, StopCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { AudioUploadZone } from "@/components/ui/audio-upload-zone";

const categoryColor = "290 80% 55%";

const SpeechToTextTool = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [isDragging, setIsDragging] = useState(false);
  const [txtUrl, setTxtUrl] = useState<string | null>(null);
  const [srtUrl, setSrtUrl] = useState<string | null>(null);
  const [supportsRecording, setSupportsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-BR", name: "Portuguese (Brazil)" },
    { code: "hi-IN", name: "Hindi" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "ar-SA", name: "Arabic" },
    { code: "ru-RU", name: "Russian" },
  ];

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupportsRecording(!!SpeechRecognition);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }
    setAudioFile(file);
    setTranscription("");
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

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak into your microphone...",
      });
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscription(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast({
        title: "Error",
        description: `Recognition error: ${event.error}`,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Transcription complete",
      });
    }
  };

  const transcribe = async () => {
    if (!audioFile) return;

    toast({
      title: "File Upload Not Supported",
      description: "For audio file transcription, use the microphone recording feature or integrate with a cloud service like Google Cloud Speech-to-Text.",
      variant: "destructive",
    });
  };

  const exportAsTXT = () => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    setTxtUrl(url);
    
    // Auto download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    a.click();
  };

  const exportAsSRT = () => {
    if (!transcription) return;
    // Create a simple SRT format
    const lines = transcription.split("\n").filter(line => line.trim());
    let srtContent = "";
    lines.forEach((line, index) => {
      const startTime = index * 5;
      const endTime = (index + 1) * 5;
      srtContent += `${index + 1}\n`;
      srtContent += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
      srtContent += `${line}\n\n`;
    });
    
    const blob = new Blob([srtContent], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    setSrtUrl(url);
    
    // Auto download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.srt';
    a.click();
  };

  const formatSRTTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},000`;
  };

  const reset = () => {
    setAudioFile(null);
    setTranscription("");
    setTxtUrl(null);
    setSrtUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="Speech to Text"
      description="Convert audio files to text with language support. Export as TXT or SRT subtitles."
      category="Audio Tools"
      categoryPath="/category/audio"
    >
      <div className="space-y-6">
        {/* Language Selection */}
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-xs sm:text-sm font-medium mb-1 block">Select Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-sm">
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Recording Button */}
        {supportsRecording && (
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex flex-col items-center gap-4">
              <h3 className="font-semibold text-lg">Live Speech Recognition</h3>
              <p className="text-sm text-muted-foreground text-center">
                Record your speech directly using your microphone
              </p>
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Recording...</span>
                  </div>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <StopCircle className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {!supportsRecording && (
          <Card className="p-4 bg-amber-500/10 border-amber-500/30">
            <div className="flex items-start gap-3">
              <MicOff className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                  Speech Recognition Not Supported
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your browser doesn't support live speech recognition. Please use Chrome, Edge, or Safari for this feature.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Upload Area */}
        <AudioUploadZone
          isDragging={isDragging}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onFileSelect={handleFile}
          multiple={false}
          title={audioFile ? audioFile.name : "Drop audio file here or click to browse"}
          subtitle="Supports MP3, WAV, M4A, OGG, FLAC for accurate speech recognition"
        />

        {audioFile && (
          <>
            {/* Audio Preview */}
            <Card className="p-3 sm:p-4">
              <audio controls className="w-full h-8 sm:h-10">
                <source src={URL.createObjectURL(audioFile)} />
              </audio>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={transcribe}
                disabled={isProcessing}
                className="flex-1 text-sm sm:text-base py-3 sm:py-4"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Transcribe Audio</span>
                    <span className="sm:hidden">Transcribe</span>
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset} className="text-sm sm:text-base py-3 sm:py-4">
                <span className="hidden sm:inline">Reset</span>
                <span className="sm:hidden">Rst</span>
              </Button>
            </div>
          </>
        )}

        {/* Transcription Result */}
        {transcription && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold">Transcription Result</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportAsTXT} className="text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Export TXT</span>
                  <span className="sm:hidden">TXT</span>
                </Button>
                <Button size="sm" variant="outline" onClick={exportAsSRT} className="text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Export SRT</span>
                  <span className="sm:hidden">SRT</span>
                </Button>
              </div>
            </div>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />

            {/* Download Sections */}
            {txtUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={txtUrl}
                  fileName="transcription.txt"
                  fileType="word"
                  title="Transcription Exported as TXT"
                  description={`Plain text transcription in ${language} language`}
                  fileSize={`${transcription.length} characters`}
                />
              </div>
            )}

            {srtUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={srtUrl}
                  fileName="transcription.srt"
                  fileType="word"
                  title="Transcription Exported as SRT"
                  description={`Subtitle file with timestamps for video editing`}
                  fileSize={`${transcription.length} characters`}
                />
              </div>
            )}
          </div>
        )}

        {/* Info Notice */}
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>How it works:</strong> This tool uses the Web Speech API for live microphone recording 
            (supported in Chrome, Edge, and Safari). For audio file transcription, a backend service 
            like Google Cloud Speech-to-Text, AWS Transcribe, or OpenAI Whisper would be required.
          </p>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default SpeechToTextTool;
