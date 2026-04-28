import { useState } from "react";
import { Upload, Camera, MapPin, Calendar, Settings, X, Sparkles, Info } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { API_URLS } from "@/lib/api-complete";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "173 80% 40%";

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
  const toolSeoData = getToolSeoMetadata('exif-viewer');
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [exifData, setExifData] = useState<EXIFData | null>(null);
  const [noExif, setNoExif] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setNoExif(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);

      try {
        const formData = new FormData();
        formData.append('image', file);
                
        const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.EXIF_VIEWER}`, {
          method: 'POST',
          body: formData,
        });

        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          const exifResult = result.result;
          
          setExifData({
            width: exifResult.width,
            height: exifResult.height,
            orientation: exifResult.orientation ? String(exifResult.orientation) : undefined,
            software: exifResult.software,
            colorSpace: exifResult.space,
            camera: exifResult.make && exifResult.model ? `${exifResult.make} ${exifResult.model}` : exifResult.model || exifResult.make,
            lens: exifResult.lensModel,
            aperture: exifResult.aperture,
            shutter: exifResult.shutterSpeed,
            iso: exifResult.iso ? `ISO ${exifResult.iso}` : undefined,
            focalLength: exifResult.focalLength,
            dateTime: exifResult.dateTime,
            gps: exifResult.gps,
          });
          
          const hasDetailedExif = exifResult.make || exifResult.model || exifResult.software || 
                                exifResult.dateTime || exifResult.lensModel || exifResult.aperture ||
                                exifResult.shutterSpeed || exifResult.iso || exifResult.focalLength || exifResult.gps;
          
          if (!hasDetailedExif) {
            setNoExif(true);
          }
        } else {
          throw new Error(result.error || 'Failed to extract EXIF data');
        }
      } catch (error) {
        const img = new Image();
        img.onload = () => {
          setExifData({
            width: img.width,
            height: img.height,
          });
          setNoExif(true);
        };
        img.src = dataUrl;
      }
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

  const InfoCard = ({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Icon className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "EXIF Metadata Viewer",
        toolSeoData?.description || "View camera settings, GPS data, and other metadata from photos",
        "exif-viewer"
      )}
      <ToolLayout
        title="EXIF Metadata Viewer"
        description="View camera settings, GPS data, and other metadata from photos"
        category="Image Tools"
        categoryPath="/category/image"
      >
      <div className="space-y-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}
            >
              <Camera className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">EXIF Data Explorer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                View camera settings, GPS coordinates, and detailed metadata from your photos.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">exif viewer</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">metadata viewer</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">photo info</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">camera data</span>
              </div>
            </div>
          </div>
        </motion.div>

        {!image && (
          <ImageUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => {}}
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
                  {fileName.toLowerCase().endsWith('.png') 
                    ? "PNG files typically don't contain EXIF metadata. Try uploading a JPEG photo from a camera or smartphone to see detailed EXIF information."
                    : "This image doesn't contain detailed EXIF metadata. Basic image properties are shown below."
                  }
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
                      <span className="text-muted-foreground">Lens</span>
                      <span className="font-medium">{exifData.lens || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Focal Length</span>
                      <span className="font-medium">{exifData.focalLength || "N/A"}</span>
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            What is EXIF Data?
          </h3>
          <p className="text-muted-foreground mb-4">
            EXIF (Exchangeable Image File Format) metadata contains information about how a photo was taken: camera settings, GPS location, date/time, and more. It's embedded in image files and helps photographers understand and improve their photography.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your image to extract EXIF data</li>
            <li>View camera settings (aperture, shutter, ISO)</li>
            <li>Check GPS location and timestamp</li>
            <li>Download or copy the metadata</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">EXIF Data Types</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Camera make/model</li>
                <li>• Exposure settings</li>
                <li>• GPS coordinates</li>
                <li>• Date/time stamp</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Photography Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Learning from photos</li>
                <li>• Technical analysis</li>
                <li>• Location tracking</li>
                <li>• Workflow optimization</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What EXIF data is stored in images?",
            answer: "EXIF stores camera settings (aperture, shutter speed, ISO), camera model, date/time, GPS location, orientation, and other technical details about how the photo was taken."
          },
          {
            question: "Does EXIF data affect image quality?",
            answer: "No, EXIF metadata doesn't affect image quality. It's separate from the actual image data. You can remove it to reduce file size without changing the image."
          },
          {
            question: "Can I edit or remove EXIF data?",
            answer: "Yes, you can edit or remove EXIF data using various tools. This is useful for privacy (removing GPS) or reducing file size before sharing images online."
          },
          {
            question: "Do all images have EXIF data?",
            answer: "No, only images from cameras (phones, DSLRs, etc.) typically have EXIF. Screenshots, edited images, or downloaded images often have no or incomplete EXIF data."
          },
          {
            question: "Why is EXIF important for photographers?",
            answer: "EXIF helps photographers analyze their techniques, learn from successful shots, understand why images worked (or didn't), and improve their photography skills over time."
          }
        ]} />
      </div>
    </ToolLayout>
    </>
  );
};

export default EXIFViewerTool;
