import { useState } from "react";
import { Link2, AlertCircle, Instagram, Film, Loader2, Download } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const InstagramReelsDownloader = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [downloadedUrl, setDownloadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError("");
    setVideoInfo(null);
    setDownloadedUrl(null);
    setFileName("");
  };

  const handleDownload = async () => {
    if (!url) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/video/download/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          url: url,
          quality: 'best'
        })
      });

      const data = await response.json();

      if (data.success) {
        setVideoInfo(data.info);
        
        if (data.video) {
          setDownloadedUrl(data.video);
          setFileName(data.filename || 'instagram_reel.mp4');
          
          // Auto-scroll to download section
          setTimeout(() => {
            const downloadSection = document.getElementById('download-section');
            if (downloadSection) {
              downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        } else if (data.info?.download_blocked) {
          setError(`Download blocked: ${data.info.block_reason}. ${data.message || ''}`);
        }
      } else {
        setError(data.error || 'Failed to download Instagram Reel');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Instagram Reels Downloader"
      description="Download Instagram Reels, Stories, and posts in high quality"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-8">
        {/* Instagram Header */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Instagram className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Instagram Reels Downloader</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Download Instagram Reels, Stories, IGTV, and regular posts with one click. 
            No login required, completely free and fast.
          </p>
        </div>

        {/* URL Input */}
        <div className="relative rounded-2xl border bg-card p-6 shadow-sm">
          <label
            htmlFor="reel-url"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Instagram Reel URL
          </label>

          <div
            className={`relative flex items-center rounded-xl border transition-all duration-200
              ${
                url
                  ? "border-purple-500/60 ring-2 ring-purple-500/20"
                  : "border-border hover:border-purple-500/40"
              }
            `}
          >
            <div className="flex h-12 w-12 items-center justify-center">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <input
              id="reel-url"
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste Instagram Reel link here…"
              className="h-12 w-full bg-transparent pr-10 text-sm outline-none placeholder:text-muted-foreground"
            />

            {url && (
              <button
                onClick={() => handleUrlChange("")}
                className="absolute right-3 rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            Example: https://www.instagram.com/reel/xxxxxxxxx/
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <Film className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-900">High Quality</h3>
            <p className="text-sm text-purple-700 mt-1">Download in original quality</p>
          </div>
          <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
            <Download className="h-8 w-8 text-pink-600 mb-2" />
            <h3 className="font-semibold text-pink-900">Fast Download</h3>
            <p className="text-sm text-pink-700 mt-1">Quick processing and download</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <Instagram className="h-8 w-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-orange-900">All Content</h3>
            <p className="text-sm text-orange-700 mt-1">Reels, Stories, Posts & more</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Info Display */}
        {videoInfo && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* Thumbnail Image */}
                <div className="flex-shrink-0">
                  {videoInfo.thumbnail ? (
                    <img 
                      src={
                        videoInfo.thumbnail.includes('rapidcdn.app') || 
                        videoInfo.thumbnail.includes('cdninstagram.com')
                          ? `${API_URLS.BASE_URL}/api/video/thumbnail-proxy?url=${encodeURIComponent(videoInfo.thumbnail)}`
                          : videoInfo.thumbnail
                      } 
                      alt="Instagram Reel thumbnail"
                      className="w-32 h-24 object-cover rounded-lg border border-green-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-24 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                      <Instagram className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Instagram Reel Downloaded Successfully!
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {videoInfo.title || 'Instagram Reel'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Duration:</span>
                  <span className="ml-2 text-green-800">
                    {videoInfo.duration && videoInfo.duration > 0 
                      ? `${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}`
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Uploader:</span>
                  <span className="ml-2 text-green-800">
                    {videoInfo.uploader || 'Instagram User'}
                  </span>
                </div>
                {videoInfo.file_size && videoInfo.file_size > 0 && (
                  <div>
                    <span className="text-green-600">File Size:</span>
                    <span className="ml-2 text-green-800">
                      {(videoInfo.file_size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
                {videoInfo.view_count && (
                  <div>
                    <span className="text-green-600">Views:</span>
                    <span className="ml-2 text-green-800">
                      {videoInfo.view_count.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={!url || isLoading}
          className="btn-primary w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Downloading Instagram Reel...
            </>
          ) : (
            <>
              <Instagram className="h-5 w-5" />
              Process the Reel
            </>
          )}
        </button>

        {/* Download Section */}
        {downloadedUrl && (
          <div id="download-section" className="flex justify-center">
            <EnhancedDownload
              data={downloadedUrl}
              fileName={fileName}
              fileType="video"
              title="Instagram Reel Downloaded Successfully"
              description="Your Instagram Reel is ready for download"
              fileSize={videoInfo?.file_size ? `${(videoInfo.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default InstagramReelsDownloader;
