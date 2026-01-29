import { useState } from "react";
import { Link2, AlertCircle, Facebook, Film, Loader2, Download, Video } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const FacebookVideoDownloader = () => {
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
          setFileName(data.filename || 'facebook_video.mp4');
          
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
        setError(data.error || 'Failed to download Facebook video');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Facebook Video Downloader"
      description="Download Facebook videos, Reels, and Watch content in high quality"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-8">
        {/* Facebook Header */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 mb-4">
            <Facebook className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Facebook Video Downloader</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Download Facebook videos, Reels, and Watch content in high quality. 
            Private and public videos supported, no login required.
          </p>
        </div>

        {/* URL Input */}
        <div className="relative rounded-2xl border bg-card p-6 shadow-sm">
          <label
            htmlFor="fb-url"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Facebook Video URL
          </label>

          <div
            className={`relative flex items-center rounded-xl border transition-all duration-200
              ${
                url
                  ? "border-blue-500/60 ring-2 ring-blue-500/20"
                  : "border-border hover:border-blue-500/40"
              }
            `}
          >
            <div className="flex h-12 w-12 items-center justify-center">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <input
              id="fb-url"
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste Facebook video link here…"
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
            Example: https://www.facebook.com/watch?v=xxxxxxxxx
          </div>
        </div>

        {/* Supported Content Types */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Supported Content</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Video, label: 'Regular Videos', desc: 'Public and private videos' },
              { icon: Film, label: 'Facebook Reels', desc: 'Short-form video content' },
              { icon: Facebook, label: 'Watch Videos', desc: 'Facebook Watch content' },
              { icon: Download, label: 'HD Quality', desc: 'High-definition downloads' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Video className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-900">All Formats</h3>
            <p className="text-sm text-blue-700 mt-1">Videos, Reels & Watch</p>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <Download className="h-8 w-8 text-indigo-600 mb-2" />
            <h3 className="font-semibold text-indigo-900">HD Quality</h3>
            <p className="text-sm text-indigo-700 mt-1">Best available quality</p>
          </div>
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <Facebook className="h-8 w-8 text-cyan-600 mb-2" />
            <h3 className="font-semibold text-cyan-900">Private Support</h3>
            <p className="text-sm text-cyan-700 mt-1">Download private videos</p>
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
                      alt="Facebook video thumbnail"
                      className="w-32 h-24 object-cover rounded-lg border border-green-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-24 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                      <Facebook className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Facebook Video Downloaded Successfully!
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {videoInfo.title || 'Facebook Video'}
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
                    {videoInfo.uploader || 'Facebook User'}
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
          className="btn-primary w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Downloading Facebook Video...
            </>
          ) : (
            <>
              <Facebook className="h-5 w-5" />
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
              title="Facebook Video Downloaded Successfully"
              description="Your Facebook video is ready for download"
              fileSize={videoInfo?.file_size ? `${(videoInfo.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default FacebookVideoDownloader;
