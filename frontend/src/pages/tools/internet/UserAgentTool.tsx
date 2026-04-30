import { useState, useEffect } from "react";
import { Monitor, Copy, Check, Smartphone, Laptop, Globe, Loader2, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "200 85% 50%";

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
  const toolSeoData = getToolSeoMetadata('user-agent-parser');
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
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.USER_AGENT}`, {
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
      // console.warn("Backend API failed, using client-side parsing:", apiError.message);
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
    <>
      {CategorySEO.Internet(
        toolSeoData?.title || "User-Agent Parser",
        toolSeoData?.description || "Parse and analyze browser user-agent strings for detailed information.",
        "user-agent-parser"
      )}
      <ToolLayout
      breadcrumbTitle="User Agent Parser"
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">

        {/* Animated Hero Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}
            >
              <Monitor className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">User-Agent Parser</h2>
              <p className="mt-2 text-sm text-muted-foreground">Parse and analyze browser user-agent strings for detailed information.</p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">user agent parser</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">browser detection</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">user agent string</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">browser information</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >

          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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

        </motion.div>

        {/* Analyze Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={parse}
          disabled={loading || !userAgent.trim()}
          style={{ background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)` }}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
        </motion.button>

        {/* Results */}
        {parsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >

            <h3 className="text-lg font-semibold">
              Analysis Results
            </h3>

            {/* Main Info */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <ResultCard
                icon={<Globe className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="Browser"
                value={parsed.browser}
                sub={parsed.version ? `v${parsed.version}` : undefined}
              />

              <ResultCard
                icon={<Monitor className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="Operating System"
                value={parsed.os}
                sub={parsed.osVersion ? `v${parsed.osVersion}` : undefined}
              />

              <ResultCard
                icon={parsed.isMobile ? <Smartphone className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} /> : <Laptop className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
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
                    icon={<Monitor className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                    title="Rendering Engine"
                    value={parsed.engine}
                  />
                )}

                {parsed.architecture && (
                  <ResultCard
                    icon={<Monitor className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                    title="Architecture"
                    value={parsed.architecture}
                  />
                )}

              </div>
            )}

          </motion.div>
        )}

        {/* Empty State */}
        {!parsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <Settings className="h-5 w-5 mx-auto mb-2" style={{ color: `hsl(${categoryColor})` }} />
            Enter a user-agent string above to analyze browser, operating system, and device information.
          </motion.div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-500" />
            What is User-Agent Parsing?
          </h3>
          <p className="text-muted-foreground mb-4">
            User-Agent parsing analyzes browser identification strings to extract information about the user's browser, operating system, device type, and other technical details. This helps understand your audience and optimize experiences.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter a user-agent string</li>
            <li>The tool parses the string components</li>
            <li>View browser, OS, and device details</li>
            <li>Get technical specifications</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Parsed Information</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Browser name and version</li>
                <li>• Operating system</li>
                <li>• Device type (mobile/desktop)</li>
                <li>• Rendering engine</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Analytics and tracking</li>
                <li>• Device-specific optimization</li>
                <li>• Compatibility testing</li>
                <li>• Feature detection</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is a user-agent string?",
            answer: "A user-agent string is text sent by browsers to servers identifying the browser, OS, and device. It helps servers deliver appropriate content and features for the accessing client."
          },
          {
            question: "Why parse user-agent strings?",
            answer: "Parsing helps understand your audience's devices, optimize experiences for specific browsers, detect mobile users for responsive design, and gather analytics for business decisions."
          },
          {
            question: "Can user-agent strings be spoofed?",
            answer: "Yes, user-agents can be easily modified or spoofed. Never rely solely on user-agent for security decisions. Use it for analytics and feature detection, not authentication."
          },
          {
            question: "What information can be extracted?",
            answer: "User-agent strings typically contain browser name/version, operating system, device type, rendering engine, and sometimes device model. However, format varies between browsers."
          },
          {
            question: "Is user-agent detection reliable?",
            answer: "User-agent detection is unreliable for precise identification due to spoofing and varying formats. For feature detection, use modern APIs like feature detection libraries instead."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
      </>
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
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-xl border border-border bg-card p-5 shadow-lg hover:shadow-xl transition-shadow duration-500"
  >
    <div className="mb-2">{icon}</div>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="font-medium">{value}</p>
    {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
  </motion.div>
);
