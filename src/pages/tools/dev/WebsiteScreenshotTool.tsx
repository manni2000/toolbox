import { useState } from "react";
import { Camera, AlertCircle, Globe } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const WebsiteScreenshotTool = () => {
  const [url, setUrl] = useState("");

  return (
    <ToolLayout
      title="Website Screenshot Tool"
      description="Capture screenshots of any website"
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
                Website screenshots require server-side rendering using Playwright or Puppeteer. 
                Enable Lovable Cloud to unlock this feature.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Website URL</label>
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4">
            <label className="mb-2 block text-sm font-medium">Width</label>
            <input type="number" defaultValue={1920} className="input-field w-full" disabled />
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <label className="mb-2 block text-sm font-medium">Height</label>
            <input type="number" defaultValue={1080} className="input-field w-full" disabled />
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <label className="mb-2 block text-sm font-medium">Format</label>
            <select className="input-field w-full" disabled>
              <option>PNG</option>
              <option>JPEG</option>
              <option>WebP</option>
            </select>
          </div>
        </div>

        <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
          <Camera className="h-5 w-5" />
          Capture Screenshot
        </button>

        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <Camera className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            Screenshot preview will appear here
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default WebsiteScreenshotTool;
