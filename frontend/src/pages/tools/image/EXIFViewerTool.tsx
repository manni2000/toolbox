import { useState, useRef } from "react";
import { Upload, Camera, MapPin, Calendar, Settings, X } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";

interface EXIFData {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  focalLength?: string;
  dateTime?: string;
  gps?: { lat: number; lng: number } | null;
  width?: number;
  height?: number;
  orientation?: string;
  software?: string;
  colorSpace?: string;
}

const EXIFViewerTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [exifData, setExifData] = useState<EXIFData | null>(null);
  const [noExif, setNoExif] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setNoExif(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);

      // For demo, show that EXIF parsing requires a library
      // In production, use exif-js or similar
      const img = new Image();
      img.onload = () => {
        setExifData({
          width: img.width,
          height: img.height,
        });
        setNoExif(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setImage(null);
    setExifData(null);
    setNoExif(false);
    setFileName("");
  };

  const InfoCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Icon className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <ToolLayout
      title="EXIF Metadata Viewer"
      description="View camera settings, GPS data, and other metadata from photos"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
        {!image && (
          <ImageUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            multiple={false}
            title="Drop your photo here"
            subtitle="JPG photos typically contain EXIF data"
          />
        )}

        {image && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">{fileName}</span>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear image">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-4">
              <img src={image} alt="Preview" className="max-h-64 rounded-lg object-contain" />
            </div>

            {noExif && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                <strong className="text-amber-600 dark:text-amber-400">Limited EXIF Data:</strong>
                <span className="ml-2 text-muted-foreground">
                  Full EXIF parsing requires the exif-js library. Basic image dimensions are shown below.
                </span>
              </div>
            )}

            {/* EXIF Data Display */}
            {exifData && (
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard icon={Settings} title="Image Properties">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Width</span>
                      <span className="font-medium">{exifData.width}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Height</span>
                      <span className="font-medium">{exifData.height}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aspect Ratio</span>
                      <span className="font-medium">
                        {exifData.width && exifData.height
                          ? (exifData.width / exifData.height).toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Megapixels</span>
                      <span className="font-medium">
                        {exifData.width && exifData.height
                          ? ((exifData.width * exifData.height) / 1000000).toFixed(1) + " MP"
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard icon={Camera} title="Camera Settings">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Camera</span>
                      <span className="font-medium">{exifData.camera || "Not available"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aperture</span>
                      <span className="font-medium">{exifData.aperture || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shutter Speed</span>
                      <span className="font-medium">{exifData.shutter || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ISO</span>
                      <span className="font-medium">{exifData.iso || "N/A"}</span>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard icon={Calendar} title="Date & Time">
                  <p className="text-sm text-muted-foreground">
                    {exifData.dateTime || "Date information not available in this image"}
                  </p>
                </InfoCard>

                <InfoCard icon={MapPin} title="Location">
                  <p className="text-sm text-muted-foreground">
                    {exifData.gps
                      ? `${exifData.gps.lat.toFixed(6)}, ${exifData.gps.lng.toFixed(6)}`
                      : "GPS data not available in this image"}
                  </p>
                </InfoCard>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default EXIFViewerTool;
