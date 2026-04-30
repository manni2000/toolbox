import { useState } from 'react';
import { Copy, Check, Upload, Image, CheckCircle, AlertTriangle, Download, Shield, Sparkles, Settings } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "0 80% 55%";

interface ExifResult {
  success: boolean;
  had_gps_data: boolean;
  image_data: string;
  message: string;
}

export default function EXIFLocationRemoverTool() {
  const toolSeoData = getToolSeoMetadata('exif-location-remover');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExifResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setResult(null);
    
    // Create preview
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const removeExifData = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URLS.BASE_URL}/api/security/exif-location-remover/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data: ExifResult = await response.json();
        setResult(data);
      }
    } catch (error) {
      // console.error('Error removing EXIF data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `EXIF Location Removal Result\n` +
      `Success: ${result.success ? 'Yes' : 'No'}\n` +
      `Had GPS Data: ${result.had_gps_data ? 'Yes' : 'No'}\n` +
      `Message: ${result.message}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {CategorySEO.Security(
        toolSeoData?.title || "EXIF Location Remover",
        toolSeoData?.description || "Remove GPS location data from images to protect privacy",
        "exif-location-remover"
      )}
      <ToolLayout
      breadcrumbTitle="EXIF Location Remover"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="space-y-6">
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Image className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">EXIF Location Remover</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Remove GPS location data from images to protect your privacy
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">exif remover</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">gps data removal</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">image privacy</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">metadata cleaner</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="text-lg font-semibold mb-4">Image Selection</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Select Image</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : 'Click to upload image'}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFile.type}
                    </p>
                  )}
                </label>
              </div>
              {previewUrl && (
                <div className="mt-4">
                  <img src={previewUrl} alt="Preview" className="rounded-lg shadow-md max-h-60 mx-auto" />
                </div>
              )}
            </div>

            <motion.button
              onClick={removeExifData} 
              disabled={!selectedFile || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <Image className="h-4 w-4" />
              {loading ? 'Removing...' : 'Remove EXIF Data'}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Removal Summary */}
            <div className={`rounded-xl border p-6 ${result.success ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {result.success ? <CheckCircle className="h-8 w-8 text-green-600" /> : <AlertTriangle className="h-8 w-8 text-red-600" />}
                  <div>
                    <p className="text-xl font-bold">{result.success ? 'Removal Successful' : 'Removal Failed'}</p>
                    <p className="text-sm opacity-75">
                      {result.message}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Results'}
              </button>
            </div>

            {/* Image Result */}
            {result.success && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
                <h3 className="text-lg font-semibold mb-4">Processed Image</h3>
                <div className="space-y-4">
                  <img src={result.image_data} alt="Processed" className="rounded-lg shadow-md max-h-60 mx-auto" />
                  <motion.a
                    href={result.image_data}
                    download="processed-image.jpg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex items-center justify-center gap-2 text-white"
                    style={{
                      background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Image
                  </motion.a>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Information Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="text-lg font-semibold mb-4">EXIF Data Removal Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">🚨 Privacy Risks of EXIF Data</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Location Tracking:</strong> GPS data reveals location</li>
                <li>• <strong>Personal Information:</strong> Embedded user data</li>
                <li>• <strong>Device Details:</strong> Camera and device info</li>
                <li>• <strong>Time Stamps:</strong> Date and time of capture</li>
                <li>• <strong>Unauthorized Access:</strong> Data can be extracted</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ How to Protect Your Privacy</h4>
              <ul className="text-sm space-y-1">
                <li>• Remove EXIF data before sharing images</li>
                <li>• Use tools with EXIF removal features</li>
                <li>• Check privacy settings on your camera</li>
                <li>• Be cautious when sharing images online</li>
                <li>• Educate others about EXIF data risks</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Removing EXIF Data</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>1. <strong>Select Image:</strong> Choose an image file</p>
              <p>2. <strong>Remove EXIF:</strong> Click to remove GPS data</p>
              <p>3. <strong>Review:</strong> Ensure data is removed</p>
              <p>4. <strong>Download:</strong> Save the processed image</p>
              <p>5. <strong>Share Safely:</strong> Share without sensitive data</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
            <div className="text-sm">
              <strong>Important:</strong> Removing EXIF data helps protect your privacy. 
              Always verify that sensitive information is removed before sharing images.
            </div>
          </div>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            What is EXIF Location Removal?
          </h3>
          <p className="text-muted-foreground mb-4">
            EXIF location removal strips GPS coordinates and location metadata from image files. This protects your privacy when sharing photos online, preventing others from tracking where photos were taken.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your image file</li>
            <li>The tool scans for EXIF metadata</li>
            <li>Removes GPS and location data</li>
            <li>Download the cleaned image</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Metadata Removed</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• GPS coordinates</li>
                <li>• Location names</li>
                <li>• Device information</li>
                <li>• Timestamps</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Privacy Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Location privacy</li>
                <li>• Safe sharing</li>
                <li>• Identity protection</li>
                <li>• Tracking prevention</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What EXIF data is removed?",
            answer: "GPS coordinates, camera device info, location names, and timestamps are removed. The tool specifically targets location-related metadata while preserving image quality and visual content."
          },
          {
            question: "Will this affect image quality?",
            answer: "No, removing EXIF metadata doesn't affect the visual quality or resolution of the image. Only the metadata stored in the file header is modified, not the actual image data."
          },
          {
            question: "Why is EXIF removal important?",
            answer: "EXIF data can reveal your location, device type, and when a photo was taken. This information can be used to track you, profile your habits, or compromise your privacy when sharing photos online."
          },
          {
            question: "Can I remove EXIF from multiple images?",
            answer: "Yes, you can process multiple images individually or in batches. Each image will have its EXIF metadata stripped before you download the cleaned versions."
          },
          {
            question: "Is all metadata removed or just location?",
            answer: "This tool focuses on location-related metadata (GPS, location names). Some other metadata like image dimensions may remain. For complete metadata removal, use a dedicated metadata cleaner."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
}
