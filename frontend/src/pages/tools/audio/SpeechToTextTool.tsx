import { useState, useRef } from "react";
import { Mic, Upload, Download, Languages, FileText, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const SpeechToTextTool = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const transcribe = async () => {
    if (!audioFile) return;

    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition requires a backend API. This is a demo showing the interface.",
        variant: "destructive",
      });
      
      // Demo mode - show sample transcription
      setIsProcessing(true);
      setTimeout(() => {
        setTranscription(
          "This is a demo transcription. For full speech-to-text functionality, " +
          "a backend service with speech recognition (like Google Cloud Speech-to-Text, " +
          "AWS Transcribe, or OpenAI Whisper) is required.\n\n" +
          "The uploaded audio file would be processed server-side to extract accurate text."
        );
        setIsProcessing(false);
      }, 2000);
      return;
    }

    setIsProcessing(true);
    try {
      // For browsers that support it, we can use the Web Speech API
      // However, it typically requires live microphone input
      toast({
        title: "Processing",
        description: "Transcribing audio file...",
      });
      
      // Simulated response for demo
      setTimeout(() => {
        setTranscription(
          "Speech-to-text transcription would appear here.\n\n" +
          "For production use, integrate with a backend API service."
        );
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to transcribe audio",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const exportAsTXT = () => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    a.click();
    URL.revokeObjectURL(url);
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
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.srt";
    a.click();
    URL.revokeObjectURL(url);
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
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Languages className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Select Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Upload Area */}
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
          <Mic className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">
            {audioFile ? audioFile.name : "Drop audio file here or click to upload"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports MP3, WAV, M4A, OGG, FLAC
          </p>
        </div>

        {audioFile && (
          <>
            {/* Audio Preview */}
            <Card className="p-4">
              <audio controls className="w-full">
                <source src={URL.createObjectURL(audioFile)} />
              </audio>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={transcribe}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Transcribe Audio
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
            </div>
          </>
        )}

        {/* Transcription Result */}
        {transcription && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Transcription Result</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportAsTXT}>
                  <Download className="h-4 w-4 mr-1" />
                  TXT
                </Button>
                <Button size="sm" variant="outline" onClick={exportAsSRT}>
                  <Download className="h-4 w-4 mr-1" />
                  SRT
                </Button>
              </div>
            </div>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={10}
              className="font-mono"
            />
          </div>
        )}

        {/* Info Notice */}
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Full speech-to-text transcription requires a backend service. 
            This demo shows the interface and export functionality. For production use, 
            integrate with services like Google Cloud Speech-to-Text, AWS Transcribe, or OpenAI Whisper.
          </p>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default SpeechToTextTool;
