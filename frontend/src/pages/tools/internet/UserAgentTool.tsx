import { useState, useEffect } from "react";
import { Monitor, Copy, Check, Smartphone, Laptop, Globe, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";

interface ParsedUA {
  browser: string;
  version: string;
  os: string;
  osVersion: string;
  device: string;
  isMobile: boolean;
  engine?: string;
  platform?: string;
  architecture?: string;
}

const UserAgentTool = () => {
  const [userAgent, setUserAgent] = useState("");
  const [parsed, setParsed] = useState<ParsedUA | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exampleUserAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  ];

  useEffect(() => {
    setUserAgent(navigator.userAgent);
  }, []);

  const parse = async () => {
    if (!userAgent.trim()) {
      toast({
        title: "User Agent Required",
        description: "Please enter a user-agent string to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Try backend API first for more accurate parsing
      const response = await fetch(API_URLS.USER_AGENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAgent }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result && data.result.parsed) {
          const backendParsed = data.result.parsed;
          const result: ParsedUA = {
            browser: backendParsed.browser || "Unknown",
            version: backendParsed.version || "",
            os: backendParsed.os || "Unknown",
            osVersion: backendParsed.osVersion || "",
            device: backendParsed.device || "Desktop",
            isMobile: backendParsed.device === "Mobile" || backendParsed.device === "Tablet",
            engine: backendParsed.engine,
            platform: backendParsed.platform,
            architecture: backendParsed.architecture,
          };
          setParsed(result);
          toast({
            title: "Analysis Complete",
            description: "User-agent parsed successfully",
          });
          setLoading(false);
          return;
        }
      }
    } catch (apiError) {
      console.warn("Backend API failed, using client-side parsing:", apiError.message);
    }

    // Fallback to enhanced client-side parsing
    const ua = userAgent.toLowerCase();
    const result: ParsedUA = {
      browser: "Unknown",
      version: "",
      os: "Unknown",
      osVersion: "",
      device: "Desktop",
      isMobile: false,
    };

    // Enhanced browser detection
    const browserRegex = [
      { name: "Opera", regex: /opera\/([\d.]+)/ },
      { name: "Opera", regex: /opr\/([\d.]+)/ },
      { name: "Edge", regex: /edg\/([\d.]+)/ },
      { name: "Chrome", regex: /chrome\/([\d.]+)/ },
      { name: "Firefox", regex: /firefox\/([\d.]+)/ },
      { name: "Safari", regex: /safari\/([\d.]+)/ },
      { name: "Internet Explorer", regex: /msie ([\d.]+)/ },
      { name: "Internet Explorer", regex: /trident.*rv:([\d.]+)/ },
    ];

    for (const { name, regex } of browserRegex) {
      const match = ua.match(regex);
      if (match) {
        result.browser = name;
        result.version = match[1] || "";
        break;
      }
    }

    // Special Safari detection (must come after Chrome)
    if (ua.includes("safari/") && !ua.includes("chrome") && result.browser === "Unknown") {
      result.browser = "Safari";
      const versionMatch = ua.match(/version\/([\d.]+)/);
      result.version = versionMatch ? versionMatch[1] : "";
    }

    // Enhanced OS detection
    const osRegex = [
      { name: "Windows", regex: /windows nt ([\d.]+)/ },
      { name: "Windows", regex: /windows ([\d.]+)/ },
      { name: "macOS", regex: /mac os x ([\d_]+)/ },
      { name: "macOS", regex: /macos ([\d.]+)/ },
      { name: "iOS", regex: /os ([\d_]+)/ },
      { name: "Android", regex: /android ([\d.]+)/ },
      { name: "Linux", regex: /linux/ },
      { name: "Ubuntu", regex: /ubuntu/ },
      { name: "Chrome OS", regex: /cros/ },
    ];

    for (const { name, regex } of osRegex) {
      const match = ua.match(regex);
      if (match) {
        result.os = name;
        result.osVersion = match[1] ? match[1].replace(/_/g, ".") : "";
        break;
      }
    }

    // Special Windows version detection
    if (result.os === "Windows") {
      if (ua.includes("windows nt 10")) result.osVersion = "10/11";
      else if (ua.includes("windows nt 6.3")) result.osVersion = "8.1";
      else if (ua.includes("windows nt 6.2")) result.osVersion = "8";
      else if (ua.includes("windows nt 6.1")) result.osVersion = "7";
    }

    // Enhanced device detection
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      result.device = "Mobile";
      result.isMobile = true;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      result.device = "Tablet";
      result.isMobile = true;
    } else if (ua.includes("smarttv") || ua.includes("tv")) {
      result.device = "Smart TV";
      result.isMobile = false;
    } else if (ua.includes("wearable") || ua.includes("watch")) {
      result.device = "Wearable";
      result.isMobile = true;
    }

    // Detect rendering engine
    if (ua.includes("webkit")) result.engine = "WebKit";
    else if (ua.includes("gecko")) result.engine = "Gecko";
    else if (ua.includes("trident")) result.engine = "Trident";
    else if (ua.includes("blink")) result.engine = "Blink";

    // Detect platform/architecture
    if (ua.includes("win64") || ua.includes("wow64") || ua.includes("x64")) result.architecture = "x64";
    else if (ua.includes("win32") || ua.includes("i386") || ua.includes("x86")) result.architecture = "x86";
    else if (ua.includes("arm")) result.architecture = "ARM";
    else if (ua.includes("x86_64")) result.architecture = "x64";

    setParsed(result);
    toast({
      title: "Analysis Complete",
      description: "User-agent parsed using client-side analysis",
    });
    setLoading(false);
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
      description="Parse and analyze browser user-agent strings for detailed information."
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">
              User-Agent Analysis
            </h3>
          </div>

          <div className="space-y-4">

            {/* User Agent Textarea */}
            <div className="relative">
              <textarea
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    parse();
                  }
                }}
                placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
                className="w-full rounded-lg border border-border bg-background py-3 px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary resize-none h-24"
              />
            </div>

            {/* Examples and Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">

              <span>
                Analyze user-agent strings to identify browser, OS, device, and more.
                <br />
                Press Ctrl+Enter to analyze quickly.
              </span>

              <div className="flex gap-3">
                <button
                  onClick={() => setUserAgent(exampleUserAgents[0])}
                  className="hover:text-primary"
                  title="Chrome on Windows"
                >
                  Chrome
                </button>
                <button
                  onClick={() => setUserAgent(exampleUserAgents[1])}
                  className="hover:text-primary"
                  title="Safari on iPhone"
                >
                  Safari
                </button>
                <button
                  onClick={() => setUserAgent(exampleUserAgents[2])}
                  className="hover:text-primary"
                  title="Chrome on macOS"
                >
                  macOS
                </button>
                <button
                  onClick={() => setUserAgent(exampleUserAgents[3])}
                  className="hover:text-primary"
                  title="Chrome on Linux"
                >
                  Linux
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Analyze Button */}
        <button
          onClick={parse}
          disabled={loading || !userAgent.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing User-Agent...
            </>
          ) : (
            <>
              <Monitor className="h-5 w-5" />
              Analyze User-Agent
            </>
          )}
        </button>

        {/* Results */}
        {parsed && (
          <div className="space-y-4">

            <h3 className="text-lg font-semibold">
              Analysis Results
            </h3>

            {/* Main Info */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <ResultCard
                icon={<Globe className="h-5 w-5 text-primary" />}
                title="Browser"
                value={parsed.browser}
                sub={parsed.version ? `v${parsed.version}` : undefined}
              />

              <ResultCard
                icon={<Monitor className="h-5 w-5 text-primary" />}
                title="Operating System"
                value={parsed.os}
                sub={parsed.osVersion ? `v${parsed.osVersion}` : undefined}
              />

              <ResultCard
                icon={parsed.isMobile ? <Smartphone className="h-5 w-5 text-primary" /> : <Laptop className="h-5 w-5 text-primary" />}
                title="Device Type"
                value={parsed.device}
                sub={parsed.isMobile ? "Mobile Device" : "Desktop"}
              />

            </div>

            {/* Additional Info */}
            {(parsed.engine || parsed.architecture) && (
              <div className="grid gap-4 sm:grid-cols-2">

                {parsed.engine && (
                  <ResultCard
                    icon={<Monitor className="h-5 w-5 text-primary" />}
                    title="Rendering Engine"
                    value={parsed.engine}
                  />
                )}

                {parsed.architecture && (
                  <ResultCard
                    icon={<Monitor className="h-5 w-5 text-primary" />}
                    title="Architecture"
                    value={parsed.architecture}
                  />
                )}

              </div>
            )}

          </div>
        )}

        {/* Empty State */}
        {!parsed && (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Enter a user-agent string above to analyze browser, operating system, and device information.
          </div>
        )}

      </div>
    </ToolLayout>
  );
};

export default UserAgentTool;

const ResultCard = ({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="mb-2">{icon}</div>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="font-medium">{value}</p>
    {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
  </div>
);
