import { useState } from "react";
import { Link2, AlertCircle, Youtube, Film, Loader2, Download, Play } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const YouTubeVideoDownloader = () => {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("best");
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
          quality: quality
        })
      });

      const data = await response.json();

      if (data.success) {
        setVideoInfo(data.info);
        
        if (data.video) {
          setDownloadedUrl(data.video);
          setFileName(data.filename || 'youtube_video.mp4');
          
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
        setError(data.error || 'Failed to download YouTube video');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout
      title="YouTube Video Downloader"
      description="Download YouTube videos, Shorts, and playlists in high quality"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-8">
        {/* YouTube Header */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 mb-4">
            <Youtube className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">YouTube Video Downloader</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Download YouTube videos, Shorts, and playlists in your preferred quality. 
            Fast, secure, and completely free.
          </p>
        </div>

        {/* URL Input */}
        <div className="relative rounded-2xl border bg-card p-6 shadow-sm">
          <label
            htmlFor="video-url"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            YouTube Video URL
          </label>

          <div
            className={`relative flex items-center rounded-xl border transition-all duration-200
              ${
                url
                  ? "border-red-500/60 ring-2 ring-red-500/20"
                  : "border-border hover:border-red-500/40"
              }
            `}
          >
            <div className="flex h-12 w-12 items-center justify-center">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <input
              id="video-url"
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste YouTube video link here…"
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
            Example: https://www.youtube.com/watch?v=xxxxxxxxx
          </div>
        </div>

        {/* Quality Selector */}
        <div className="rounded-xl border bg-card p-6">
          <label className="mb-3 block text-sm font-semibold text-foreground">
            Video Quality
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: 'highest', label: 'Highest (1080p+)', desc: 'Best available quality' },
              { value: 'best', label: 'Best (720p)', desc: 'Balanced quality & size' },
              { value: 'lowest', label: 'Lowest (360p)', desc: 'Smallest file size' }
            ].map((option) => (
              <label
                key={option.value}
                className={`relative flex cursor-pointer rounded-lg border p-3 transition-all ${
                  quality === option.value
                    ? "border-red-500 bg-red-50"
                    : "border-border hover:border-red-500/30"
                }`}
              >
                <input
                  type="radio"
                  name="quality"
                  value={option.value}
                  checked={quality === option.value}
                  onChange={(e) => setQuality(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    quality === option.value ? "text-red-900" : "text-foreground"
                  }`}>
                    {option.label}
                  </p>
                  <p className={`text-xs mt-1 ${
                    quality === option.value ? "text-red-700" : "text-muted-foreground"
                  }`}>
                    {option.desc}
                  </p>
                </div>
                {quality === option.value && (
                  <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <Play className="h-8 w-8 text-red-600 mb-2" />
            <h3 className="font-semibold text-red-900">Multiple Formats</h3>
            <p className="text-sm text-red-700 mt-1">Videos, Shorts & Playlists</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <Download className="h-8 w-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-orange-900">Quality Options</h3>
            <p className="text-sm text-orange-700 mt-1">Choose your preferred quality</p>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <Film className="h-8 w-8 text-yellow-600 mb-2" />
            <h3 className="font-semibold text-yellow-900">Fast Processing</h3>
            <p className="text-sm text-yellow-700 mt-1">Quick download speeds</p>
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
                      src={videoInfo.thumbnail}
                      alt="YouTube video thumbnail"
                      className="w-32 h-24 object-cover rounded-lg border border-green-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-24 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                      <Youtube className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    YouTube Video Downloaded Successfully!
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {videoInfo.title || 'YouTube Video'}
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
                  <span className="text-green-600">Channel:</span>
                  <span className="ml-2 text-green-800">
                    {videoInfo.uploader || 'Unknown Channel'}
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
          className="btn-primary w-full bg-red-600 hover:bg-red-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Downloading YouTube Video...
            </>
          ) : (
            <>
              <Youtube className="h-5 w-5" />
              Process the Video
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
              title="YouTube Video Downloaded Successfully"
              description="Your YouTube video is ready for download"
              fileSize={videoInfo?.file_size ? `${(videoInfo.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default YouTubeVideoDownloader;
