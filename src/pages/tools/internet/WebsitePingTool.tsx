import { useState } from "react";
import { Wifi, AlertCircle, Activity } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const WebsitePingTool = () => {
  const [url, setUrl] = useState("");

  return (
    <ToolLayout
      title="Website Ping Test"
      description="Test website availability and response time"
      category="Internet Tools"
      categoryPath="/category/internet"
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
                Website ping requires server-side requests. Enable Lovable Cloud to unlock.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Website URL</label>
          <div className="relative">
            <Wifi className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
          <Activity className="h-5 w-5" />
          Ping Website
        </button>

        {/* Example output */}
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-pulse rounded-full bg-green-500" />
              <span className="font-semibold text-green-600 dark:text-green-400">Online</span>
            </div>
            <span className="font-mono text-2xl font-bold">124ms</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {["Ping 1", "Ping 2", "Ping 3", "Ping 4"].map((ping, i) => (
            <div key={ping} className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">{ping}</p>
              <p className="font-mono text-lg font-bold">{120 + i * 5}ms</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-2xl font-bold text-primary">127ms</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">Min</p>
            <p className="text-2xl font-bold">120ms</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">Max</p>
            <p className="text-2xl font-bold">135ms</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default WebsitePingTool;
