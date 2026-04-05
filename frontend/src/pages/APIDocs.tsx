import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, Key, Code2, Zap, Shield, Clock, ChevronDown, ChevronRight, Eye, EyeOff, ExternalLink } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://toolbox-backend-jet.vercel.app");

interface ApiEndpoint {
  method: string;
  path: string;
  name: string;
  description: string;
  contentType: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: any;
    description: string;
  }>;
  example: {
    curl: string;
    response: any;
  };
}

interface ApiCategory {
  category: string;
  endpoints: ApiEndpoint[];
}

interface ApiKey {
  key: string;
  name: string;
  status: string;
  tier: string;
  dailyLimit: number;
  createdAt: string;
}

const APIDocs = () => {
  const [apiDocs, setApiDocs] = useState<{ endpoints: ApiCategory[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [keyName, setKeyName] = useState("");
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [userKeys, setUserKeys] = useState<ApiKey[]>([]);
  const [lookupEmail, setLookupEmail] = useState("");
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchApiDocs();
  }, []);

  const fetchApiDocs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/docs`);
      const data = await response.json();
      setApiDocs(data);
    } catch (error) {
      console.error("Failed to fetch API docs:", error);
      toast.error("Failed to load API documentation");
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setGeneratingKey(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/keys/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: keyName || "Default" }),
      });

      const data = await response.json();

      if (data.success) {
        setNewApiKey(data.data.apiKey);
        toast.success("API key generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate API key");
      }
    } catch (error) {
      toast.error("Failed to generate API key");
    } finally {
      setGeneratingKey(false);
    }
  };

  const lookupKeys = async () => {
    if (!lookupEmail) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/keys/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lookupEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setUserKeys(data.keys);
        if (data.keys.length === 0) {
          toast.info("No API keys found for this email");
        }
      } else {
        toast.error(data.error || "Failed to lookup keys");
      }
    } catch (error) {
      toast.error("Failed to lookup keys");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleEndpoint = (id: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEndpoints(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "POST":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PUT":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "DELETE":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
            Developer API
          </Badge>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Toolbox API for Developers
          </h1>
          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
            Integrate powerful image processing, text manipulation, and utility tools directly into your applications. Free tier with 100 requests/day.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs sm:text-base">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              <span>Fast & Reliable</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs sm:text-base">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs sm:text-base">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <span>100 req/day free</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="getstarted" className="space-y-4 sm:space-y-8">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3 bg-slate-800/50 h-auto p-1">
            <TabsTrigger value="getstarted" className="text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3">Get Started</TabsTrigger>
            <TabsTrigger value="endpoints" className="text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3">Endpoints</TabsTrigger>
            <TabsTrigger value="mykeys" className="text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3">My Keys</TabsTrigger>
          </TabsList>

          {/* Get Started Tab */}
          <TabsContent value="getstarted" className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              {/* Generate API Key */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                    <Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Generate API Key
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Get your free API key to start making requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400 text-sm h-10 sm:h-11"
                  />
                  <Input
                    placeholder="Key name (optional)"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400 text-sm h-10 sm:h-11"
                  />
                  <Button
                    onClick={generateApiKey}
                    disabled={generatingKey}
                    className="w-full h-10 sm:h-11 text-sm"
                  >
                    {generatingKey ? "Generating..." : "Generate API Key"}
                  </Button>

                  {newApiKey && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs sm:text-sm text-green-400 mb-2 font-medium">
                        🎉 Your API Key (save it securely!):
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <code className="flex-1 text-[10px] sm:text-xs bg-slate-900 p-2 rounded text-green-400 break-all leading-relaxed">
                          {showKey ? newApiKey : "•".repeat(20)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowKey(!showKey)}
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(newApiKey)}
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Start */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                    <Code2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Quick Start
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Start using the API in seconds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-1.5 sm:mb-2">Base URL:</p>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <code className="flex-1 text-xs sm:text-sm bg-slate-900 p-2 rounded text-primary break-all">
                        {API_BASE_URL}/api/v1
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${API_BASE_URL}/api/v1`)}
                        className="h-8 w-8 p-0 shrink-0"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-1.5 sm:mb-2">Authentication:</p>
                    <code className="block text-xs sm:text-sm bg-slate-900 p-2 rounded text-slate-300 break-all">
                      Header: X-API-Key: YOUR_API_KEY
                    </code>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-1.5 sm:mb-2">Example Request:</p>
                    <pre className="text-[10px] sm:text-xs bg-slate-900 p-2 sm:p-3 rounded text-slate-300 overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
{`curl -X POST "${API_BASE_URL}/api/v1/text/word-count" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello world!"}'`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rate Limits */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-base sm:text-lg">Rate Limits & Headers</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-2 text-sm sm:text-base">Free Tier</h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
                      <li>• 100 requests per day</li>
                      <li>• Resets at midnight UTC</li>
                      <li>• All endpoints available</li>
                      <li>• Up to 3 API keys per email</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2 text-sm sm:text-base">Response Headers</h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm font-mono">
                      <li className="break-all">X-RateLimit-Limit: 100</li>
                      <li className="break-all">X-RateLimit-Remaining: 95</li>
                      <li className="break-all">X-RateLimit-Reset: 1234567890</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4 sm:space-y-6">
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-slate-400 mt-3 sm:mt-4 text-sm">Loading API documentation...</p>
              </div>
            ) : (
              apiDocs?.endpoints?.map((category, catIndex) => (
                <Card key={catIndex} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-white text-base sm:text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                    {category.endpoints.map((endpoint, endIndex) => {
                      const endpointId = `${catIndex}-${endIndex}`;
                      const isExpanded = expandedEndpoints.has(endpointId);

                      return (
                        <div
                          key={endIndex}
                          className="border border-slate-700 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleEndpoint(endpointId)}
                            className="w-full flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-slate-700/50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
                              )}
                              <Badge className={`${getMethodColor(endpoint.method)} font-mono text-[10px] sm:text-xs shrink-0`}>
                                {endpoint.method}
                              </Badge>
                            </div>
                            <code className="text-xs sm:text-sm text-slate-300 break-all flex-1">{endpoint.path}</code>
                            <span className="text-xs sm:text-sm text-slate-400 hidden lg:block shrink-0">
                              {endpoint.name}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-slate-700 bg-slate-900/50">
                              {/* Mobile endpoint name */}
                              <p className="text-xs text-primary font-medium mb-2 lg:hidden">{endpoint.name}</p>
                              <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">
                                {endpoint.description}
                              </p>

                              {endpoint.parameters.length > 0 && (
                                <div className="mb-3 sm:mb-4">
                                  <h5 className="text-xs sm:text-sm font-medium text-white mb-2">
                                    Parameters
                                  </h5>
                                  {/* Mobile: Card layout */}
                                  <div className="space-y-2 sm:hidden">
                                    {endpoint.parameters.map((param, pIndex) => (
                                      <div key={pIndex} className="bg-slate-950/50 p-2.5 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                          <code className="text-xs font-mono text-primary">{param.name}</code>
                                          {param.required ? (
                                            <Badge variant="destructive" className="text-[10px] h-5">Required</Badge>
                                          ) : (
                                            <Badge variant="secondary" className="text-[10px] h-5">Optional</Badge>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 mb-1">Type: {param.type}</p>
                                        <p className="text-[11px] text-slate-400">
                                          {param.description}
                                          {param.default !== undefined && (
                                            <span className="text-slate-500"> (default: {String(param.default)})</span>
                                          )}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  {/* Desktop: Table layout */}
                                  <div className="overflow-x-auto hidden sm:block">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-left text-slate-400 text-xs">
                                          <th className="pb-2 pr-4">Name</th>
                                          <th className="pb-2 pr-4">Type</th>
                                          <th className="pb-2 pr-4">Required</th>
                                          <th className="pb-2">Description</th>
                                        </tr>
                                      </thead>
                                      <tbody className="text-slate-300">
                                        {endpoint.parameters.map((param, pIndex) => (
                                          <tr key={pIndex}>
                                            <td className="py-1 pr-4 font-mono text-primary text-xs">
                                              {param.name}
                                            </td>
                                            <td className="py-1 pr-4 text-slate-400 text-xs">
                                              {param.type}
                                            </td>
                                            <td className="py-1 pr-4">
                                              {param.required ? (
                                                <Badge variant="destructive" className="text-[10px]">Required</Badge>
                                              ) : (
                                                <Badge variant="secondary" className="text-[10px]">Optional</Badge>
                                              )}
                                            </td>
                                            <td className="py-1 text-slate-400 text-xs">
                                              {param.description}
                                              {param.default !== undefined && (
                                                <span className="text-slate-500"> (default: {String(param.default)})</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-xs sm:text-sm font-medium text-white">
                                      Example Request
                                    </h5>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        copyToClipboard(
                                          endpoint.example.curl.replace("{{baseUrl}}", API_BASE_URL)
                                        )
                                      }
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy
                                    </Button>
                                  </div>
                                  <pre className="text-[10px] sm:text-xs bg-slate-950 p-2 sm:p-3 rounded text-slate-300 overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
                                    {endpoint.example.curl.replace("{{baseUrl}}", API_BASE_URL)}
                                  </pre>
                                </div>

                                <div>
                                  <h5 className="text-xs sm:text-sm font-medium text-white mb-2">
                                    Example Response
                                  </h5>
                                  <pre className="text-[10px] sm:text-xs bg-slate-950 p-2 sm:p-3 rounded text-green-400 overflow-x-auto">
                                    {JSON.stringify(endpoint.example.response, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* My API Keys Tab */}
          <TabsContent value="mykeys" className="space-y-4 sm:space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-base sm:text-lg">Lookup Your API Keys</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enter your email to see your existing API keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400 text-sm h-10 sm:h-11"
                  />
                  <Button onClick={lookupKeys} className="h-10 sm:h-11 sm:px-6">Lookup</Button>
                </div>

                {userKeys.length > 0 && (
                  <div className="space-y-3 mt-3 sm:mt-4">
                    {userKeys.map((key, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm sm:text-base">{key.name}</p>
                          <code className="text-xs sm:text-sm text-slate-400 break-all">{key.key}</code>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                            <Badge
                              variant={key.status === "active" ? "default" : "destructive"}
                              className="text-[10px] sm:text-xs"
                            >
                              {key.status}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">{key.tier}</Badge>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{key.dailyLimit} req/day</Badge>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-400 shrink-0">
                          Created: {new Date(key.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default APIDocs;
