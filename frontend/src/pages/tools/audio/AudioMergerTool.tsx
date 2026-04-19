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
import ToolFAQ from "@/components/ToolFAQ";

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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-500" />
            What is Audio Merging?
          </h3>
          <p className="text-muted-foreground mb-4">
            Audio merging combines multiple audio files into a single continuous track. This is useful for creating playlists, combining recordings, or assembling audio segments into a cohesive piece.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload multiple audio files you want to combine</li>
            <li>Drag and drop to reorder files in the desired sequence</li>
            <li>Adjust the order to match your preferred flow</li>
            <li>Click "Merge & Download" to combine all files</li>
            <li>Download the merged audio file in WAV format</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-1">Common Applications</h5>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Create continuous playlists</li>
                <li>• Combine podcast segments</li>
                <li>• Merge music tracks</li>
                <li>• Assemble audio presentations</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Key Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Drag-and-drop reordering</li>
                <li>• Preserves audio quality</li>
                <li>• No file size limits</li>
                <li>• Instant processing</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What audio formats can I merge?",
            answer: "You can merge MP3, WAV, AAC, OGG, and other common audio formats. The tool automatically handles format conversion during the merge process."
          },
          {
            question: "Is there a limit to how many files I can merge?",
            answer: "There's no strict limit on the number of files. However, very large numbers of files may take longer to process and may be limited by your browser's memory."
          },
          {
            question: "Can I adjust the order of merged tracks?",
            answer: "Yes! Simply drag and drop the audio files to reorder them before merging. The order you set will be preserved in the final merged file."
          },
          {
            question: "What format will the merged file be in?",
            answer: "The merged file is output in WAV format to ensure maximum quality and compatibility. You can then convert it to other formats if needed."
          },
          {
            question: "Will there be gaps between merged tracks?",
            answer: "The tracks are merged seamlessly without gaps. Each track starts immediately after the previous one ends, creating a continuous audio stream."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
  );
};

export default AudioMergerTool;
