import { useState, useRef } from "react";
import { Music2, Upload, X, Loader2, Sparkles, Settings, Info, ChevronDown, Zap, Shield, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { AudioUploadZone } from "@/components/ui/audio-upload-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const categoryColor = "290 80% 55%";

const audioFormats = {
  mp3: { name: 'MP3', description: 'Most popular, good compression', quality: 'Good', size: 'Small', icon: '🎵' },
  wav: { name: 'WAV', description: 'Uncompressed, highest quality', quality: 'Excellent', size: 'Large', icon: '🎼' },
  aac: { name: 'AAC', description: 'Apple standard, efficient', quality: 'Very Good', size: 'Small', icon: '🎧' },
  ogg: { name: 'OGG', description: 'Open source, good compression', quality: 'Good', size: 'Small', icon: '🎶' },
  flac: { name: 'FLAC', description: 'Lossless compression', quality: 'Excellent', size: 'Medium', icon: '💿' }
};

const AudioConverterTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
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
    setConversionProgress(0);
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
    setConversionProgress(0);
  };

  const convertAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    setConversionProgress(0);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('format', outputFormat);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setConversionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const response = await fetch(`${API_URLS.AUDIO_CONVERTER}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setConversionProgress(100);

      const result = await response.json();

      if (result.success) {
        setAudioData(result.audio);
        toast({
          title: "Conversion Complete!",
          description: `Audio successfully converted to ${outputFormat.toUpperCase()} format`,
        });
        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to convert audio');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setConversionProgress(0);
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to convert audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setConversionProgress(0), 1000);
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
            {/* File Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/80 p-6 shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
              
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                      <Music2 className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                      <Volume2 className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg truncate text-foreground">{fileName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {file.type.split('/')[1]?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={reset}
                    className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Format Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Output Format</h3>
                  <p className="text-sm text-muted-foreground">Choose your desired audio format</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Advanced
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {Object.entries(audioFormats).map(([key, format]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setOutputFormat(key)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      outputFormat === key
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                    }`}
                  >
                    {outputFormat === key && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <h4 className="font-semibold text-sm">{format.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {format.quality}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {format.size}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Quality</label>
                        <select className="input-tool text-sm w-full">
                          <option>High (320 kbps)</option>
                          <option>Medium (192 kbps)</option>
                          <option>Low (128 kbps)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Sample Rate</label>
                        <select className="input-tool text-sm w-full">
                          <option>48 kHz</option>
                          <option>44.1 kHz</option>
                          <option>22 kHz</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Convert Button & Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <Button
                onClick={convertAudio}
                disabled={isProcessing}
                className="btn-primary w-full text-base py-4 h-auto shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Converting to {outputFormat.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    <span>Convert to {audioFormats[outputFormat as keyof typeof audioFormats].name}</span>
                  </>
                )}
              </Button>
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Conversion Progress</span>
                    <span className="font-medium">{Math.round(conversionProgress)}%</span>
                  </div>
                  <Progress value={conversionProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Processing your audio file... This may take a few moments.
                  </p>
                </motion.div>
              )}
            </motion.div>

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

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Why Choose Our Audio Converter?</h3>
            <p className="text-muted-foreground">Professional-grade audio conversion with advanced features</p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 text-center border-border/50 bg-card/50">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Lightning Fast</h4>
              <p className="text-xs text-muted-foreground">Optimized conversion engine for quick processing</p>
            </Card>
            
            <Card className="p-4 text-center border-border/50 bg-card/50">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Secure & Private</h4>
              <p className="text-xs text-muted-foreground">Your files are processed locally and never stored</p>
            </Card>
            
            <Card className="p-4 text-center border-border/50 bg-card/50">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Music2 className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm mb-1">High Quality</h4>
              <p className="text-xs text-muted-foreground">Preserve audio quality with advanced codecs</p>
            </Card>
            
            <Card className="p-4 text-center border-border/50 bg-card/50">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Info className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Smart Info</h4>
              <p className="text-xs text-muted-foreground">Automatic metadata preservation and detection</p>
            </Card>
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default AudioConverterTool;
