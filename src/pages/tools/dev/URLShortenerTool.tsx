import { useState } from "react";
import { Link2, Copy, Check, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const generateShortCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const URLShortenerTool = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ original: string; short: string }[]>([]);

  const shorten = () => {
    if (!url.trim()) return;
    const code = generateShortCode();
    const shortened = `https://short.url/${code}`;

    setShortUrl(shortened);
    setHistory((prev) => [{ original: url, short: shortened }, ...prev.slice(0, 9)]);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="URL Shortener"
      description="Generate short URL codes locally (demo - no actual redirect)"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <strong className="text-amber-600 dark:text-amber-400">Note:</strong>
          <span className="ml-2 text-muted-foreground">
            This generates short codes locally. For actual URL redirection, backend integration is required.
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Enter Long URL</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Link2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/path"
                className="input-field w-full pl-12"
              />
            </div>
            <button onClick={shorten} className="btn-primary">
              <RefreshCw className="h-5 w-5" />
              Shorten
            </button>
          </div>
        </div>

        {shortUrl && (
          <div className="rounded-xl border border-primary bg-primary/10 p-6">
            <div className="mb-2 text-sm text-muted-foreground">Shortened URL</div>
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-lg font-medium text-primary">{shortUrl}</p>
              <button onClick={handleCopy} className="btn-secondary">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Recent URLs</h3>
            <div className="space-y-3">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-muted-foreground">{item.original}</p>
                    <p className="font-mono text-primary">{item.short}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default URLShortenerTool;
