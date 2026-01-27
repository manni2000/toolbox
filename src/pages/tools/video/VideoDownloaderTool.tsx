import { useState } from "react";
import { Download, Link2, AlertCircle, Youtube, Instagram, Facebook, Film, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

type Platform = "youtube" | "instagram" | "facebook" | "unknown";

const VideoDownloaderTool = () => {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<any>(null);

  const detectPlatform = (inputUrl: string): Platform => {
    const lower = inputUrl.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
    if (lower.includes("instagram.com")) return "instagram";
    if (lower.includes("facebook.com") || lower.includes("fb.watch")) return "facebook";
    return "unknown";
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setPlatform(detectPlatform(value));
    setError("");
    setVideoInfo(null);
  };

  const handleDownload = async () => {
    if (!url) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/video/download/', {
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
        
        // If video data is returned, trigger download
        if (data.video) {
          const link = document.createElement('a');
          link.href = data.video;
          link.download = data.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (data.info?.download_blocked) {
          // Show message for blocked downloads
          setError(`Download blocked: ${data.info.block_reason}. ${data.message || ''}`);
        }
      } else {
        setError(data.error || 'Failed to download video');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const platformInfo = {
    youtube: {
      name: "YouTube",
      icon: Youtube,
      color: "hsl(0 70% 50%)",
      description: "Supports regular videos, Shorts, and playlists",
    },
    instagram: {
      name: "Instagram",
      icon: Instagram,
      color: "hsl(330 80% 55%)",
      description: "Supports Reels, Stories, and regular posts",
    },
    facebook: {
      name: "Facebook",
      icon: Facebook,
      color: "hsl(210 80% 50%)",
      description: "Supports videos, Reels, and Watch content",
    },
    unknown: {
      name: "Video Downloader",
      icon: Film,
      color: "hsl(var(--primary))",
      description: "Paste a video URL to get started",
    },
  };

  const currentPlatform = platformInfo[platform];
  const PlatformIcon = currentPlatform.icon;

  return (
    <ToolLayout
      title="Video Downloader"
      description="Download videos from YouTube, Instagram Reels, Facebook & more"
      category="Video Tools"
      categoryPath="/category/video"
    >
      <div className="space-y-8">
        {/* Platform Selector Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {(["youtube", "instagram", "facebook"] as Platform[]).map((p) => {
            const info = platformInfo[p];
            const Icon = info.icon;
            const isActive = platform === p;
            return (
              <div
                key={p}
                className={`relative overflow-hidden rounded-xl border p-5 transition-all ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div
                  className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${info.color}20` }}
                >
                  <Icon className="h-6 w-6" style={{ color: info.color }} />
                </div>
                <h3 className="font-semibold">{info.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{info.description}</p>
                {isActive && (
                  <div
                    className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* URL Input – Premium */}
        <div className="relative rounded-2xl border bg-card p-6 shadow-sm">
          <label
            htmlFor="video-url"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Video URL
          </label>

          <div
            className={`relative flex items-center rounded-xl border transition-all duration-200
              ${
                url
                  ? "border-primary/60 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
              }
            `}
            style={{
              boxShadow:
                platform !== "unknown"
                  ? `0 0 0 2px ${currentPlatform.color}33` 
                  : undefined,
            }}
          >
            {/* Left Icon */}
            <div className="flex h-12 w-12 items-center justify-center">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Input */}
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste YouTube / Instagram / Facebook video link…"
              className="h-12 w-full bg-transparent pr-10 text-sm outline-none placeholder:text-muted-foreground"
            />

            {/* Clear Button */}
            {url && (
              <button
                onClick={() => handleUrlChange("")}
                className="absolute right-3 rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            )}
          </div>

          {/* Helper / Detection */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Example: https://youtube.com/watch?v=xxxx
            </span>

            {platform !== "unknown" && (
              <span className="flex items-center gap-1 font-medium">
                <PlatformIcon
                  className="h-4 w-4"
                  style={{ color: currentPlatform.color }}
                />
                <span style={{ color: currentPlatform.color }}>
                  {currentPlatform.name} detected
                </span>
              </span>
            )}
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
          <div className={`rounded-xl border p-4 ${
            videoInfo.download_blocked 
              ? 'border-orange-200 bg-orange-50' 
              : 'border-green-200 bg-green-50'
          }`}>
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* Thumbnail Image */}
                {videoInfo.thumbnail && (
                  <div className="flex-shrink-0">
                    <img 
                      src={videoInfo.thumbnail} 
                      alt="Video thumbnail"
                      className="w-32 h-24 object-cover rounded-lg border border-green-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Video Info */}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    videoInfo.download_blocked 
                      ? 'text-orange-800' 
                      : 'text-green-800'
                  }`}>
                    {videoInfo.download_blocked ? 'Video Information Retrieved' : 'Video Downloaded Successfully!'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    videoInfo.download_blocked 
                      ? 'text-orange-600' 
                      : 'text-green-600'
                  }`}>
                    {videoInfo.title}
                  </p>
                  {videoInfo.download_blocked && (
                    <p className="text-xs text-orange-500 mt-1">
                      Download blocked: {videoInfo.block_reason}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={videoInfo.download_blocked ? 'text-orange-600' : 'text-green-600'}>Duration:</span>
                  <span className={`ml-2 ${videoInfo.download_blocked ? 'text-orange-800' : 'text-green-800'}`}>
                    {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <span className={videoInfo.download_blocked ? 'text-orange-600' : 'text-green-600'}>Uploader:</span>
                  <span className={`ml-2 ${videoInfo.download_blocked ? 'text-orange-800' : 'text-green-800'}`}>
                    {videoInfo.uploader}
                  </span>
                </div>
                {videoInfo.file_size && videoInfo.file_size > 0 && (
                  <div>
                    <span className={videoInfo.download_blocked ? 'text-orange-600' : 'text-green-600'}>File Size:</span>
                    <span className={`ml-2 ${videoInfo.download_blocked ? 'text-orange-800' : 'text-green-800'}`}>
                      {(videoInfo.file_size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
                {videoInfo.view_count && (
                  <div>
                    <span className={videoInfo.download_blocked ? 'text-orange-600' : 'text-green-600'}>Views:</span>
                    <span className={`ml-2 ${videoInfo.download_blocked ? 'text-orange-800' : 'text-green-800'}`}>
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
          className="btn-primary w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download Video
            </>
          )}
        </button>
      </div>
    </ToolLayout>
  );
};

export default VideoDownloaderTool;
