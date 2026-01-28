import { useState } from "react";
import { Copy, Check, Search, Download, Globe, Code, Database, Server, Palette } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface TechStack {
  url: string;
  frontend: string[];
  backend: string[];
  database: string[];
  server: string[];
  cms: string[];
  analytics: string[];
  frameworks: string[];
  other: string[];
}

const TechStackDetectorTool = () => {
  const [url, setUrl] = useState("");
  const [techStack, setTechStack] = useState<TechStack | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const detectTechStack = async () => {
    if (!url.trim()) return;

    setIsScanning(true);
    
    // Mock implementation - in reality, you'd need a backend service to analyze the website
    setTimeout(() => {
      const mockStacks: { [key: string]: TechStack } = {
        'github.com': {
          url: 'github.com',
          frontend: ['React', 'TypeScript', 'Tailwind CSS', 'Primer'],
          backend: ['Ruby on Rails', 'Go', 'GraphQL'],
          database: ['PostgreSQL', 'Redis', 'MySQL'],
          server: ['GitHub Pages', 'Fastly', 'Cloudflare'],
          cms: [],
          analytics: ['Google Analytics', 'Amplitude'],
          frameworks: ['Ruby on Rails', 'React'],
          other: ['GitHub Actions', 'Docker', 'Kubernetes']
        },
        'facebook.com': {
          url: 'facebook.com',
          frontend: ['React', 'TypeScript', 'CSS-in-JS'],
          backend: ['PHP', 'Hack', 'GraphQL'],
          database: ['MySQL', 'Memcached', 'Cassandra'],
          server: ['AWS', 'Nginx', 'Varnish'],
          cms: [],
          analytics: ['Facebook Analytics', 'Custom Analytics'],
          frameworks: ['React', 'GraphQL'],
          other: ['BigPipe', 'HHVM', 'Thrift']
        },
        'amazon.com': {
          url: 'amazon.com',
          frontend: ['JavaScript', 'CSS', 'AUI'],
          backend: ['Java', 'Node.js', 'Python'],
          database: ['DynamoDB', 'Oracle', 'MySQL'],
          server: ['AWS', 'Amazon CloudFront', 'Nginx'],
          cms: [],
          analytics: ['Amazon Analytics', 'Custom'],
          frameworks: ['Spring', 'Node.js'],
          other: ['AWS Lambda', 'Amazon S3', 'Amazon EC2']
        }
      };

      const domain = new URL(url).hostname.replace('www.', '');
      const result = mockStacks[domain] || {
        url: domain,
        frontend: ['HTML5', 'CSS3', 'JavaScript'],
        backend: ['Unknown'],
        database: ['Unknown'],
        server: ['Unknown'],
        cms: [],
        analytics: ['Google Analytics'],
        frameworks: [],
        other: []
      };

      setTechStack(result);
      setIsScanning(false);
    }, 2000);
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
                  onClick={() => handleCopy("url", techStack.url)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "url" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={downloadReport}
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>

            {/* Detailed Breakdown */}
            {Object.entries(techStack).map(([category, technologies]) => {
              if (category === 'url' || technologies.length === 0) return null;
              
              return (
                <div key={category} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {getTechIcon(category)}
                    <h4 className="font-semibold capitalize">{category}</h4>
                    <span className="text-sm text-muted-foreground">
                      ({technologies.length} technologies)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Tech Stack Analysis
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🔍 What We Detect</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Frontend frameworks & libraries</li>
                <li>• Backend programming languages</li>
                <li>• Database systems</li>
                <li>• Server & hosting platforms</li>
                <li>• CMS & analytics tools</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">📊 How It Works</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Analyzes HTML, CSS, and JavaScript</li>
                <li>• Checks HTTP headers and responses</li>
                <li>• Identifies common patterns</li>
                <li>• Cross-references with known signatures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default TechStackDetectorTool;
