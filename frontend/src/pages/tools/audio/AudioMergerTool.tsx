import { useState, useRef } from "react";
import { Music, Upload, Trash2, ArrowUp, ArrowDown, Plus, Loader2, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { AudioUploadZone } from "@/components/ui/audio-upload-zone";

const categoryColor = "290 80% 55%";

interface AudioItem {
  id: string;
  file: File;
  name: string;
  duration: number;
}

const AudioMergerTool = () => {
  const [audioFiles, setAudioFiles] = useState<AudioItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const newItems: AudioItem[] = [];
    
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("audio/")) continue;
      
      // Get duration using Audio element
      const duration = await getAudioDuration(file);
      
      newItems.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        duration,
      });
    }

    if (newItems.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload audio files only",
        variant: "destructive",
      });
      return;
    }

    setAudioFiles((prev) => [...prev, ...newItems]);
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = (file: File) => {
    // Convert single file to FileList-like object for handleFiles
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    handleFiles(dataTransfer.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
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

  const removeFile = (id: string) => {
    setAudioFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= audioFiles.length) return;

    const newFiles = [...audioFiles];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setAudioFiles(newFiles);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const totalDuration = audioFiles.reduce((sum, item) => sum + item.duration, 0);

  const mergeAudio = async () => {
    if (audioFiles.length < 2) {
      toast({
        title: "Not enough files",
        description: "Add at least 2 audio files to merge",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Using Web Audio API for basic merging
      const audioContext = new AudioContext();
      const buffers: AudioBuffer[] = [];

      // Load all audio files
      for (const item of audioFiles) {
        const arrayBuffer = await item.file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        buffers.push(audioBuffer);
      }

      // Calculate total length
      const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
      const sampleRate = buffers[0].sampleRate;
      const numberOfChannels = Math.max(...buffers.map((b) => b.numberOfChannels));

      // Create merged buffer
      const mergedBuffer = audioContext.createBuffer(
        numberOfChannels,
        totalLength,
        sampleRate
      );

      // Copy audio data
      let offset = 0;
      for (const buffer of buffers) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sourceData = buffer.numberOfChannels > channel
            ? buffer.getChannelData(channel)
            : buffer.getChannelData(0);
          mergedBuffer.getChannelData(channel).set(sourceData, offset);
        }
        offset += buffer.length;
      }

      // Convert to WAV
      const wav = audioBufferToWav(mergedBuffer);
      const blob = new Blob([wav], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      // Store the merged URL for download
      setMergedUrl(url);

      toast({
        title: "Success!",
        description: "Audio files merged successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to merge audio files. Try different formats.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, bufferLength - 8, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, "data");
    view.setUint32(40, dataLength, true);

    // Interleave channels
    const offset = 44;
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let pos = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset + pos, intSample, true);
        pos += 2;
      }
    }

    return arrayBuffer;
  };

  const reset = () => {
    setAudioFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="Audio Merger"
      description="Merge multiple audio files into one. Perfect for podcasts, songs, and audio compilations."
      category="Audio Tools"
      categoryPath="/category/audio"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <AudioUploadZone
          isDragging={isDragging}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onFileSelect={handleFileSelect}
          multiple={true}
          title="Drop audio files here or click to browse"
          subtitle="Supports MP3, WAV, M4A, OGG • Select multiple files"
        />

        {/* File List */}
        {audioFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-semibold text-sm sm:text-base">
                Audio Files ({audioFiles.length}) • Total: {formatDuration(totalDuration)}
              </h3>
              <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Add More</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {audioFiles.map((item, index) => (
              <Card key={item.id} className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 sm:h-8 sm:w-8"
                      onClick={() => moveFile(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 sm:h-8 sm:w-8"
                      onClick={() => moveFile(index, "down")}
                      disabled={index === audioFiles.length - 1}
                    >
                      <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 flex-shrink-0">
                    <Music className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Duration: {formatDuration(item.duration)}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                    #{index + 1}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                    onClick={() => removeFile(item.id)}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        {audioFiles.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={mergeAudio}
                disabled={isProcessing || audioFiles.length < 2}
                className="flex-1 text-sm sm:text-base py-3 sm:py-4"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Merge & Download</span>
                    <span className="sm:hidden">Merge</span>
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={reset} className="text-sm sm:text-base py-3 sm:py-4">
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>

            {mergedUrl && (
              <div className="flex justify-center mt-6">
                <EnhancedDownload
                  data={mergedUrl}
                  fileName="merged_audio.wav"
                  fileType="audio"
                  title="Audio Files Merged Successfully"
                  description={`${audioFiles.length} audio files have been merged into one track`}
                  fileSize={`${(
                    audioFiles.reduce((acc, item) => acc + item.file.size, 0) /
                    1024 /
                    1024
                  ).toFixed(2)} MB`}
                />
              </div>
            )}
          </>
        )}

        {/* Info */}
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-2">How it works</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Upload multiple audio files</li>
            <li>• Drag to reorder the sequence</li>
            <li>• Click "Merge & Download" to combine them</li>
            <li>• Output is in WAV format for best compatibility</li>
          </ul>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default AudioMergerTool;
