import { useState, useEffect } from "react";
import { Monitor, Copy, Check, Smartphone, Laptop, Globe } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface ParsedUA {
  browser: string;
  version: string;
  os: string;
  osVersion: string;
  device: string;
  isMobile: boolean;
}

const UserAgentTool = () => {
  const [userAgent, setUserAgent] = useState("");
  const [parsed, setParsed] = useState<ParsedUA | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUserAgent(navigator.userAgent);
  }, []);

  const parse = () => {
    const ua = userAgent.toLowerCase();
    const result: ParsedUA = {
      browser: "Unknown",
      version: "",
      os: "Unknown",
      osVersion: "",
      device: "Desktop",
      isMobile: false,
    };

    // Detect browser
    if (ua.includes("edg/")) {
      result.browser = "Microsoft Edge";
      result.version = ua.match(/edg\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("chrome/")) {
      result.browser = "Google Chrome";
      result.version = ua.match(/chrome\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("firefox/")) {
      result.browser = "Mozilla Firefox";
      result.version = ua.match(/firefox\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("safari/") && !ua.includes("chrome")) {
      result.browser = "Safari";
      result.version = ua.match(/version\/([\d.]+)/)?.[1] || "";
    }

    // Detect OS
    if (ua.includes("windows nt 10")) {
      result.os = "Windows";
      result.osVersion = "10/11";
    } else if (ua.includes("windows nt")) {
      result.os = "Windows";
      result.osVersion = ua.match(/windows nt ([\d.]+)/)?.[1] || "";
    } else if (ua.includes("mac os x")) {
      result.os = "macOS";
      result.osVersion = ua.match(/mac os x ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
    } else if (ua.includes("linux")) {
      result.os = "Linux";
    } else if (ua.includes("android")) {
      result.os = "Android";
      result.osVersion = ua.match(/android ([\d.]+)/)?.[1] || "";
    } else if (ua.includes("iphone") || ua.includes("ipad")) {
      result.os = "iOS";
      result.osVersion = ua.match(/os ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
    }

    // Detect device
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      result.device = "Mobile";
      result.isMobile = true;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      result.device = "Tablet";
      result.isMobile = true;
    }

    setParsed(result);
  };

  useEffect(() => {
    if (userAgent) parse();
  }, [userAgent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(userAgent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const DeviceIcon = parsed?.isMobile ? Smartphone : Laptop;

  return (
    <ToolLayout
      title="User-Agent Parser"
      description="Parse and analyze browser user-agent strings"
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">
        {/* Current UA */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium">User-Agent String</label>
            <button onClick={handleCopy} className="btn-secondary text-sm">
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            className="input-field h-24 w-full resize-none font-mono text-sm"
            placeholder="Paste a user-agent string to analyze..."
          />
        </div>

        <button onClick={parse} className="btn-primary w-full">
          <Monitor className="h-5 w-5" />
          Parse User-Agent
        </button>

        {parsed && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <Globe className="mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Browser</p>
              <p className="text-lg font-semibold">{parsed.browser}</p>
              {parsed.version && (
                <p className="text-sm text-muted-foreground">v{parsed.version}</p>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <Monitor className="mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Operating System</p>
              <p className="text-lg font-semibold">{parsed.os}</p>
              {parsed.osVersion && (
                <p className="text-sm text-muted-foreground">v{parsed.osVersion}</p>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <DeviceIcon className="mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Device Type</p>
              <p className="text-lg font-semibold">{parsed.device}</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default UserAgentTool;
