import { useState } from "react";
import { Globe, AlertCircle, Server } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const HTTPHeaderTool = () => {
  const [url, setUrl] = useState("");

  return (
    <ToolLayout
      title="HTTP Header Checker"
      description="Check HTTP response headers from any URL"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                Backend Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                HTTP header checking requires server-side requests due to CORS restrictions. 
                Enable Lovable Cloud to unlock this feature.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Enter URL</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="input-field w-full pl-12"
            />
          </div>
        </div>

        <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
          <Server className="h-5 w-5" />
          Check Headers
        </button>

        {/* Example output */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Example Headers (Demo)</h3>
          <div className="space-y-2 font-mono text-sm">
            {[
              { key: "content-type", value: "text/html; charset=utf-8" },
              { key: "cache-control", value: "max-age=3600" },
              { key: "x-frame-options", value: "SAMEORIGIN" },
              { key: "x-content-type-options", value: "nosniff" },
              { key: "strict-transport-security", value: "max-age=31536000" },
            ].map((header) => (
              <div key={header.key} className="flex gap-2">
                <span className="text-primary">{header.key}:</span>
                <span className="text-muted-foreground">{header.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default HTTPHeaderTool;
