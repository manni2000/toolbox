import { useState } from "react";
import { Download, Link2, AlertCircle, Youtube, Instagram, Facebook, Film } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

type Platform = "youtube" | "instagram" | "facebook" | "unknown";

const VideoDownloaderTool = () => {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("unknown");

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

        {/* URL Input */}
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Video URL</label>
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste video URL here (e.g., https://youtube.com/watch?v=...)"
              className="input-field w-full pl-12"
            />
          </div>

          {url && platform !== "unknown" && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <PlatformIcon className="h-4 w-4" style={{ color: currentPlatform.color }} />
              <span className="text-muted-foreground">
                Detected: <span className="font-medium text-foreground">{currentPlatform.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Info Notice */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                Server Processing Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Video downloading requires server-side processing to fetch and convert videos. 
                This feature needs a backend integration to work. Enable Lovable Cloud to unlock 
                full video downloading capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Supported Platforms & Formats</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Youtube className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-medium">YouTube</p>
                <p className="text-sm text-muted-foreground">
                  Regular videos, Shorts, Music videos • MP4, WEBM • Up to 4K quality
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Instagram className="h-5 w-5 shrink-0 text-pink-500" />
              <div>
                <p className="font-medium">Instagram</p>
                <p className="text-sm text-muted-foreground">
                  Reels, Stories, IGTV, Posts • MP4 format • Original quality
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Facebook className="h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <p className="font-medium">Facebook</p>
                <p className="text-sm text-muted-foreground">
                  Videos, Reels, Watch content • MP4 format • HD quality
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button (disabled state) */}
        <button
          disabled
          className="btn-primary w-full cursor-not-allowed opacity-50"
        >
          <Download className="h-5 w-5" />
          Download Video
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Enable backend integration to start downloading videos
        </p>
      </div>
    </ToolLayout>
  );
};

export default VideoDownloaderTool;
