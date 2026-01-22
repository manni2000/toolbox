import { useState } from "react";
import { Map, Copy, Check, Plus, X, Download } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const SitemapGeneratorTool = () => {
  const [baseUrl, setBaseUrl] = useState("https://example.com");
  const [urls, setUrls] = useState<SitemapUrl[]>([
    { loc: "/", lastmod: new Date().toISOString().split("T")[0], changefreq: "daily", priority: "1.0" },
  ]);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const addUrl = () => {
    setUrls([
      ...urls,
      { loc: "/new-page", lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: "0.5" },
    ]);
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, field: keyof SitemapUrl, value: string) => {
    const updated = [...urls];
    updated[index][field] = value;
    setUrls(updated);
  };

  const generate = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
    setOutput(xml);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
  };

  return (
    <ToolLayout
      title="Sitemap XML Generator"
      description="Create XML sitemaps for better search engine indexing"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Base URL</label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://yoursite.com"
            className="input-field w-full"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">URLs ({urls.length})</h3>
            <button onClick={addUrl} className="btn-secondary text-sm">
              <Plus className="h-4 w-4" />
              Add URL
            </button>
          </div>

          <div className="space-y-3">
            {urls.map((url, index) => (
              <div key={index} className="grid gap-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-muted-foreground">Path</label>
                  <input
                    type="text"
                    value={url.loc}
                    onChange={(e) => updateUrl(index, "loc", e.target.value)}
                    className="input-field w-full text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Frequency</label>
                  <select
                    value={url.changefreq}
                    onChange={(e) => updateUrl(index, "changefreq", e.target.value)}
                    className="input-field w-full text-sm"
                  >
                    {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Priority</label>
                  <select
                    value={url.priority}
                    onChange={(e) => updateUrl(index, "priority", e.target.value)}
                    className="input-field w-full text-sm"
                  >
                    {["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeUrl(index)}
                    className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    disabled={urls.length === 1}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={generate} className="btn-primary w-full">
          <Map className="h-5 w-5" />
          Generate Sitemap
        </button>

        {output && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium">sitemap.xml</span>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="btn-secondary text-sm">
                  {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={handleDownload} className="btn-secondary text-sm">
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-xs">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SitemapGeneratorTool;
