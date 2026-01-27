import { useState, useRef } from "react";
import { ImageIcon, Upload, Download, X, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";

interface ImageResult {
  page: number;
  image: string;
  filename: string;
}

const PDFToImageTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [resultImages, setResultImages] = useState<ImageResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = (f: File) => {
    setFile(f);
    setFileName(f.name);
    setResultImages([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setFile(null);
    setFileName("");
    setResultImages([]);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/pdf/to-images/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.images && result.images.length > 0) {
        setResultImages(result.images);
        toast({
          title: "Success!",
          description: `Converted ${result.images.length} pages to images`,
        });
        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'No images were generated');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Images"
      description="Convert PDF pages to image files"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop file here</p>
            <p className="text-sm text-muted-foreground">Click to browse or drag and drop</p>
            <input
              ref={inputRef}
              type="file"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={processFile}
              disabled={isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5" />
                  Process File
                </>
              )}
            </button>

            {resultImages.length > 0 && (
              <div ref={downloadSectionRef} className="space-y-4">
                <h3 className="text-lg font-medium text-center">Converted Images</h3>
                <div className={resultImages.length === 1 ? "flex justify-center" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
                  {resultImages.map((img, index) => (
                    <div key={index} className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="text-sm font-medium mb-2 text-center">Page {img.page}</h4>
                        <div className="aspect-[3/4] bg-muted/30 mb-4 rounded-md overflow-hidden flex items-center justify-center p-2 w-72 h-96 mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img 
                            src={img.image} 
                            alt={`Page ${img.page}`}
                            className="block"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', margin: 'auto' }}
                          />
                        </div>
                        <a
                          href={img.image}
                          download={img.filename}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-auto"
                        >
                          <Download className="h-4 w-4" />
                          Download Image
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFToImageTool;
