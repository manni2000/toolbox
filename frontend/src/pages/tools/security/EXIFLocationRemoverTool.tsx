import { useState } from 'react';
import { Copy, Check, Upload, Image, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";

interface ExifResult {
  success: boolean;
  had_gps_data: boolean;
  image_data: string;
  message: string;
}

export default function EXIFLocationRemoverTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExifResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    
    // Create preview
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
      console.error('Error removing EXIF data:', error);
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
    <ToolLayout
      title="EXIF Location Remover"
      description="Remove GPS location data from images to protect privacy"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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

            <button 
              onClick={removeExifData} 
              disabled={!selectedFile || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Image className="h-4 w-4" />
              {loading ? 'Removing...' : 'Remove EXIF Data'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
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
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Processed Image</h3>
                <div className="space-y-4">
                  <img src={result.image_data} alt="Processed" className="rounded-lg shadow-md max-h-60 mx-auto" />
                  <a
                    href={result.image_data}
                    download="processed-image.jpg"
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Image
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Important:</strong> Removing EXIF data helps protect your privacy. 
              Always verify that sensitive information is removed before sharing images.
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
