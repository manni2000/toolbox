import { useState, useRef } from "react";
import { Upload, FileText, Download, X, Plus, GripVertical, FileType } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

const ImageToWordTool = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newImages: ImageFile[] = [];
    let loadedCount = 0;
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: e.target?.result as string,
          });
          loadedCount++;
          if (loadedCount === Array.from(files).filter(f => f.type.startsWith("image/")).length) {
            setImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const reset = () => {
    setImages([]);
  };

  return (
    <ToolLayout
      title="Image to Word"
      description="Convert images to editable Word documents with OCR text extraction"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
          <div className="flex gap-4">
            <FileType className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <h4 className="font-semibold text-primary">
                Backend Processing Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Image to Word conversion with OCR requires server-side processing.
                Enable Lovable Cloud for full functionality with text extraction.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
        >
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Drop images here or click to upload</p>
          <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP • Multiple files allowed</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Image List */}
        {images.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{images.length} image{images.length > 1 ? "s" : ""} selected</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add More
                </button>
                <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="cursor-move text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{img.file.name}</p>
                    <p className="text-xs text-muted-foreground">Page {index + 1}</p>
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <h3 className="mb-3 font-semibold">Conversion Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  OCR text extraction from images
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Preserves image layout and formatting
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Editable text in Word document
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Multiple language support
                </li>
              </ul>
            </div>

            {/* Convert Button */}
            <button
              disabled
              className="btn-primary w-full cursor-not-allowed opacity-50"
            >
              <Download className="h-5 w-5" />
              Convert to Word (.docx)
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Enable backend integration for Image to Word conversion with OCR
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageToWordTool;
