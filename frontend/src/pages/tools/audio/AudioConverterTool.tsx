import { useState, useRef } from "react";
import { Music2, Upload, X, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { AudioUploadZone } from "@/components/ui/audio-upload-zone";

const AudioConverterTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = (f: File) => {
    if (!f.type.startsWith("audio/")) {
      toast({
        title: "Invalid file",
        description: "Please select an audio file",
        variant: "destructive",
      });
      return;
    }
    setFile(f);
    setFileName(f.name);
    setAudioData(null);
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

  const reset = () => {
    setFile(null);
    setFileName("");
    setAudioData(null);
  };

  const convertAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('format', outputFormat);

    try {
      const response = await fetch(`${API_URLS.AUDIO_CONVERTER}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAudioData(result.audio);
        toast({
          title: "Success!",
          description: `Audio converted to ${outputFormat.toUpperCase()} successfully`,
        });
        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to convert audio');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <ToolLayout
      title="Audio Format Converter"
      description="Convert audio files between MP3, WAV, AAC, OGG, and FLAC formats"
      category="Audio Tools"
      categoryPath="/category/audio"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!file && (
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
            subtitle="Supports MP3, WAV, AAC, OGG, FLAC up to 100MB"
          />
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Music2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{fileName}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} title="Remove file" className="rounded-lg p-2 hover:bg-muted self-end sm:self-auto">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Format Selection */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="output-format" className="mb-2 block text-xs sm:text-sm font-medium">Output Format</label>
                <select
                  id="output-format"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="input-tool text-sm sm:text-base"
                >
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="aac">AAC</option>
                  <option value="ogg">OGG</option>
                  <option value="flac">FLAC</option>
                </select>
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={convertAudio}
              disabled={isProcessing}
              className="btn-primary w-full text-sm sm:text-base py-3 sm:py-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Converting Audio...
                </>
              ) : (
                <>
                  <Music2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Convert Audio
                </>
              )}
            </button>

            {/* Download Section */}
            {audioData && (
              <div ref={downloadSectionRef}>
                <EnhancedDownload
                  data={audioData}
                  fileName={fileName.replace(/\.[^/.]+$/, `.${outputFormat}`)}
                  fileType="audio"
                  title={`Audio Converted to ${outputFormat.toUpperCase()}`}
                  description={`Your audio file has been successfully converted to ${outputFormat.toUpperCase()} format`}
                  fileSize={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                />
              </div>
            )}
          </div>
        )}

        {/* Format Info */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {["MP3", "WAV", "AAC", "OGG", "FLAC"].map((format) => (
            <div
              key={format}
              className={`rounded-lg border p-3 sm:p-4 text-center transition-colors ${
                outputFormat === format.toLowerCase()
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <Music2 className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              <p className="mt-1 sm:mt-2 font-medium text-xs sm:text-sm">{format}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
};

export default AudioConverterTool;
