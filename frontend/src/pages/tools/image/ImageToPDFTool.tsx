import { useState, useRef } from "react";
import { Upload, FileText, X, Plus, GripVertical, Image as ImageIcon, Download } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { PDFDocument } from "pdf-lib";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

const ImageToPDFTool = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: e.target?.result as string,
          });
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages.filter(img => img.preview)]);
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

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    setImages(newImages);
  };

  const convertToPDF = async () => {
    if (images.length === 0) return;
    setIsConverting(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        const response = await fetch(img.preview);
        const imageBytes = await response.arrayBuffer();

        let embeddedImage;
        if (img.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === "fit") {
          pageWidth = imgWidth;
          pageHeight = imgHeight;
        } else {
          // A4: 595 x 842 points, Letter: 612 x 792 points
          if (pageSize === "a4") {
            pageWidth = orientation === "portrait" ? 595 : 842;
            pageHeight = orientation === "portrait" ? 842 : 595;
          } else {
            pageWidth = orientation === "portrait" ? 612 : 792;
            pageHeight = orientation === "portrait" ? 792 : 612;
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate scaling to fit image on page with margins
        const margin = pageSize === "fit" ? 0 : 40;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const scale = Math.min(
          availableWidth / imgWidth,
          availableHeight / imgHeight,
          1
        );

        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        // Center the image
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "images-converted.pdf";
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error converting to PDF:", error);
      alert("Error converting images to PDF. Please try with JPG or PNG images.");
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    setImages([]);
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert multiple images to a single PDF document"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
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
            accept="image/jpeg,image/png,image/webp"
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
            <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as "fit" | "a4" | "letter")}
                  className="input-field w-full"
                >
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="letter">Letter (8.5 × 11 in)</option>
                  <option value="fit">Fit to Image</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")}
                  className="input-field w-full"
                  disabled={pageSize === "fit"}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={convertToPDF}
              disabled={isConverting}
              className="btn-primary w-full"
            >
              {isConverting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Converting...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageToPDFTool;
