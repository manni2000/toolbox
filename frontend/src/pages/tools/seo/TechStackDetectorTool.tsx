import { useState } from "react";
import { Copy, Check, Search, Download, Globe, Code, Database, Server, Palette, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";

const categoryColor = "25 90% 50%";

interface TechStack {
  url: string;
  timestamp?: string;
  frontend: string[];
  backend: string[];
  database: string[];
  server: string[];
  cms: string[];
  analytics: string[];
  frameworks: string[];
  other: string[];
  confidence?: { [key: string]: number };
  detectionMethods?: string[];
  summary?: {
    totalTechnologies: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
  };
}

const TechStackDetectorTool = () => {
  const [url, setUrl] = useState("");
  const [techStack, setTechStack] = useState<TechStack | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const { toast } = useToast();

  // Get confidence color and icon
  const getConfidenceIndicator = (tech: string) => {
    if (!techStack?.confidence) return null;
    
    const confidence = techStack.confidence[tech] || 0;
    
    if (confidence >= 85) {
      return { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: "🟢", 
        text: `${confidence}% confidence` 
      };
    } else if (confidence >= 70) {
      return { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: "🟡", 
        text: `${confidence}% confidence` 
      };
    } else {
      return { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: "🔴", 
        text: `${confidence}% confidence` 
      };
    }
  };

  const detectTechStack = async () => {
    if (!url.trim()) return;

    setIsScanning(true);

    try {
      const response = await fetch(API_URLS.TECH_STACK_DETECTOR, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        setTechStack(data.result);
        toast({
          title: "Analysis Complete",
          description: `Technology stack detected for ${data.result.url}`,
        });
      } else {
        throw new Error(data.error || "Tech stack detection failed");
      }
    } catch (error) {
      toast({
        title: "Detection Failed",
        description: error instanceof Error ? error.message : "Unable to analyze website",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadReport = () => {
    if (!techStack) return;

    const report = {
      timestamp: new Date().toISOString(),
      url: techStack.url,
      techStack: {
        frontend: techStack.frontend,
        backend: techStack.backend,
        database: techStack.database,
        server: techStack.server,
        cms: techStack.cms,
        analytics: techStack.analytics,
        frameworks: techStack.frameworks,
        other: techStack.other
      }
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tech-stack-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTechIcon = (category: string) => {
    switch (category) {
      case 'frontend': return <Palette className="h-4 w-4" />;
      case 'backend': return <Code className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'server': return <Server className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'bg-blue-100 text-blue-700';
      case 'backend': return 'bg-green-100 text-green-700';
      case 'database': return 'bg-purple-100 text-purple-700';
      case 'server': return 'bg-orange-100 text-orange-700';
      case 'cms': return 'bg-pink-100 text-pink-700';
      case 'analytics': return 'bg-red-100 text-red-700';
      case 'frameworks': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const techCategories = techStack
    ? Object.entries(techStack).filter(
        ([category, technologies]) =>
          category !== 'url' &&
          Array.isArray(technologies) &&
          technologies.length > 0
      )
    : [];

  return (
    <ToolLayout
      title="Website Tech Stack Detector"
      description="Analyze websites to detect the technology stack, frameworks, and tools being used"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Tech Stack Detector</h3>
              <p className="text-sm text-muted-foreground">
                Analyze websites to discover the technology stack and tools
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the full URL of the website you want to analyze
              </p>
            </div>

            <button
              type="button"
              onClick={detectTechStack}
              disabled={isScanning || !url.trim()}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <Search className="inline h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="inline h-4 w-4 mr-2" />
                  Detect Tech Stack
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {techStack && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Technology Stack Analysis</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy("url", techStack.url)}
                  aria-label="Copy analyzed URL"
                  title="Copy analyzed URL"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "url" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={downloadReport}
                  aria-label="Download tech stack report"
                  title="Download tech stack report"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">{techStack.url}</h4>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {techStack.frontend.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Frontend</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {techStack.backend.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Backend</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {techStack.database.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Database</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {techStack.server.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Server</div>
                </div>
              </div>

              {/* Confidence Summary */}
              {techStack.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {techStack.summary.totalTechnologies}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Detected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {techStack.summary.highConfidence}
                    </div>
                    <div className="text-xs text-muted-foreground">High Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">
                      {techStack.summary.mediumConfidence}
                    </div>
                    <div className="text-xs text-muted-foreground">Medium Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {techStack.summary.lowConfidence}
                    </div>
                    <div className="text-xs text-muted-foreground">Low Confidence</div>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Breakdown */}
            {techCategories.length > 0 ? (
              techCategories.map(([category, technologies]) => (
                <div key={category} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {getTechIcon(category)}
                    <h4 className="font-semibold capitalize">{category}</h4>
                    <span className="text-sm text-muted-foreground">
                      ({technologies.length} technologies)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {technologies.map((tech, index) => {
                      const confidence = getConfidenceIndicator(tech);
                      return (
                        <div
                          key={index}
                          className={`group relative px-3 py-2 rounded-lg text-sm font-medium border transition-all hover:scale-105 ${getCategoryColor(category)}`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{tech}</span>
                            {confidence && (
                              <span className="text-xs opacity-75" title={confidence.text}>
                                {confidence.icon}
                              </span>
                            )}
                          </div>
                          {confidence && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              {confidence.text}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                No detected technologies were returned for this website.
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Enhanced Tech Stack Analysis
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🔍 What We Detect</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Frontend frameworks & libraries (React, Vue, Angular)</li>
                <li>• Backend programming languages (Node.js, PHP, Python)</li>
                <li>• Database systems & cloud services</li>
                <li>• Server & hosting platforms (Nginx, Vercel, Netlify)</li>
                <li>• CMS & analytics tools (WordPress, GA, Shopify)</li>
                <li>• Build tools & bundlers (Webpack, Vite)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">📊 Enhanced Analysis</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Confidence scoring for each technology</li>
                <li>• Multiple detection methods (scripts, headers, patterns)</li>
                <li>• Framework inference (Next.js → React + Node.js)</li>
                <li>• Version detection where possible</li>
                <li>• API endpoint pattern recognition</li>
                <li>• Hosting provider identification</li>
              </ul>
            </div>
          </div>
          
          {techStack?.detectionMethods && techStack.detectionMethods.length > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h5 className="font-medium text-foreground mb-2 text-sm">Detection Methods Used:</h5>
              <div className="flex flex-wrap gap-2">
                {techStack.detectionMethods.map((method, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                  >
                    {method.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default TechStackDetectorTool;
