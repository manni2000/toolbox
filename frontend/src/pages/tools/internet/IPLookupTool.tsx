import { useState, useEffect } from "react";
import { Globe, MapPin, Server, Wifi } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const IPLookupTool = () => {
  const [ip, setIp] = useState("");
  const [myIp, setMyIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user's IP using a free service
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setMyIp(data.ip))
      .catch(() => setMyIp("Unable to detect"));
  }, []);

  return (
    <ToolLayout
      title="IP Address Lookup"
      description="Get information about any IP address"
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">
        {/* Your IP */}
        <div className="rounded-xl border border-primary bg-primary/10 p-6">
          <div className="flex items-center gap-3">
            <Wifi className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Your IP Address</p>
              <p className="font-mono text-2xl font-bold">{myIp || "Detecting..."}</p>
            </div>
          </div>
        </div>

        {/* IP Input */}
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Lookup IP Address</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                className="input-field w-full pl-12"
              />
            </div>
            <button onClick={() => setIp(myIp || "")} className="btn-secondary">
              Use My IP
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <MapPin className="mb-2 h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">Requires API</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <Server className="mb-2 h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">ISP</p>
            <p className="font-medium">Requires API</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <Globe className="mb-2 h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Country</p>
            <p className="font-medium">Requires API</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <strong className="text-amber-600 dark:text-amber-400">Note:</strong>
          <span className="ml-2 text-muted-foreground">
            Detailed IP geolocation requires an external API (e.g., ipinfo.io). 
            Enable Lovable Cloud for full lookup capabilities.
          </span>
        </div>
      </div>
    </ToolLayout>
  );
};

export default IPLookupTool;
