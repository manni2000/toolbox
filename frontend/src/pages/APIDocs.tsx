import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { Copy, Key, Code2, Zap, Shield, Clock, ChevronDown, ChevronRight, Eye, EyeOff, ExternalLink, Terminal, Rocket, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import APIPlayground from "../components/APIPlayground";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10
    }
  }
};

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
  usage?: number;
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
  const [playgroundApiKey, setPlaygroundApiKey] = useState<string>("");

  useEffect(() => {
    fetchApiDocs();
  }, []);

  const fetchApiDocs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/docs`);
      const data = await response.json();
      setApiDocs(data);
    } catch (error) {
      // console.error("Failed to fetch API docs:", error);
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
        <div className="text-center mb-8 sm:mb-12 px-2 relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
            <motion.div
            variants={itemVariants}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary-foreground backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
             Developer API
            </motion.span>
          </motion.div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
              Toolbox API for Developers
            </h1>
            <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-2 leading-relaxed">
              Integrate powerful image processing, text manipulation, and utility tools directly into your applications. 
              <span className="text-primary font-medium"> Free tier with 100 requests/day.</span>
            </p>
            
            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Lightning Fast</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Optimized endpoints with sub-second response times</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Enterprise Security</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Bank-level encryption and secure API key management</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <Rocket className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Easy Integration</h3>
                <p className="text-slate-400 text-xs sm:text-sm">RESTful API with comprehensive documentation</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs sm:text-sm">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">15+</div>
                <div className="text-slate-400">API Endpoints</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">99.9%</div>
                <div className="text-slate-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">&lt;100ms</div>
                <div className="text-slate-400">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">100</div>
                <div className="text-slate-400">Free Requests/Day</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="getstarted" className="space-y-4 sm:space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-slate-800/50 h-auto p-1">
            <TabsTrigger value="getstarted" className="text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3 text-white data-[state=active]:text-black">Get Started</TabsTrigger>
            <TabsTrigger value="endpoints" className="text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3 text-white data-[state=active]:text-black">Endpoints</TabsTrigger>
            <TabsTrigger value="playground" className="text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3 flex items-center gap-1 text-white data-[state=active]:text-black hover:text-white/90 data-[state=active]:hover:text-black/90">
              <Terminal className="h-3 w-3 text-current" />
              Playground
            </TabsTrigger>
            <TabsTrigger value="mykeys" className="text-xs sm:text-sm py-2 sm:py-2.5 px-1 sm:px-3 text-white data-[state=active]:text-black">My Keys</TabsTrigger>
          </TabsList>

          {/* Get Started Tab */}
          <TabsContent value="getstarted" className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              {/* Generate API Key */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="p-4 sm:p-6 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Key className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                    Generate API Key
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-400">
                    Get your free API key to start making requests instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0 relative z-10">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400 text-sm h-10 sm:h-11 focus:border-primary/50 transition-colors"
                  />
                  <Input
                    placeholder="Key name (optional)"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400 text-sm h-10 sm:h-11 focus:border-primary/50 transition-colors"
                  />
                  <Button
                    onClick={generateApiKey}
                    disabled={generatingKey}
                    className="w-full h-10 sm:h-11 text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300"
                  >
                    {generatingKey ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate API Key
                      </>
                    )}
                  </Button>

                  {newApiKey && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 animate-pulse"></div>
                      <div className="relative z-10">
                        <p className="text-xs sm:text-sm text-green-400 mb-2 font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          Your API Key (save it securely!)
                        </p>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <code className="flex-1 text-[10px] sm:text-xs bg-slate-900/50 p-2 rounded text-green-400 break-all leading-relaxed border border-green-500/20">
                            {showKey ? newApiKey : "•".repeat(20)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowKey(!showKey)}
                            className="h-8 w-8 p-0 shrink-0 hover:bg-green-500/10 text-green-400"
                          >
                            {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(newApiKey)}
                            className="h-8 w-8 p-0 shrink-0 hover:bg-green-500/10 text-green-400"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Start */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="p-4 sm:p-6 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Code2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                    Quick Start
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-400">
                    Start using the API in seconds with our simple integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0 relative z-10">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-1.5 sm:mb-2 flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      Base URL
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <code className="flex-1 text-xs sm:text-sm bg-slate-900/50 p-2 rounded text-primary break-all border border-primary/20">
                        {API_BASE_URL}/api/v1
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${API_BASE_URL}/api/v1`)}
                        className="h-8 w-8 p-0 shrink-0 hover:bg-primary/10 text-primary"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-1.5 sm:mb-2 flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      Authentication
                    </p>
                    <code className="block text-xs sm:text-sm bg-slate-900/50 p-2 rounded text-slate-300 break-all border border-slate-700">
                      Header: X-API-Key: YOUR_API_KEY
                    </code>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-1.5 sm:mb-2 flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      Example Request
                    </p>
                    <pre className="text-[10px] sm:text-xs bg-slate-950/50 p-2 sm:p-3 rounded text-slate-300 overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal border border-slate-700">
{`curl -X POST "${API_BASE_URL}/api/v1/text/word-count" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello world!"}'`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Rate Limits */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base sm:text-lg">Rate Limits & Features</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-400">
                      Understand your usage limits and API capabilities
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-medium text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Free Tier
                    </h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        100 requests per day
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        Resets at midnight UTC
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        All endpoints available
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        Up to 3 API keys per email
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-medium text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Response Headers
                    </h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm font-mono">
                      <li className="break-all bg-slate-950/50 p-2 rounded border border-slate-800">
                        X-RateLimit-Limit: 100
                      </li>
                      <li className="break-all bg-slate-950/50 p-2 rounded border border-slate-800">
                        X-RateLimit-Remaining: 95
                      </li>
                      <li className="break-all bg-slate-950/50 p-2 rounded border border-slate-800">
                        X-RateLimit-Reset: 1234567890
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-medium text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Supported Formats
                    </h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        JSON requests/responses
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        Form data uploads
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        Base64 encoding
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        CORS enabled
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-medium text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Error Handling
                    </h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        Detailed error messages
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        Standard HTTP codes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        Rate limit warnings
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        Validation feedback
                      </li>
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
                <Card key={catIndex} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="p-4 sm:p-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                        <Terminal className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-base sm:text-lg">{category.category}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-slate-400">
                          {category.endpoints.length} endpoint{category.endpoints.length !== 1 ? 's' : ''} available
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0 relative z-10">
                    {category.endpoints.map((endpoint, endIndex) => {
                      const endpointId = `${catIndex}-${endIndex}`;
                      const isExpanded = expandedEndpoints.has(endpointId);

                      return (
                        <div
                          key={endIndex}
                          className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/30 hover:bg-slate-900/50 transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleEndpoint(endpointId)}
                            className="w-full flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-slate-700/30 transition-colors text-left group"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0 transition-transform duration-200" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0 transition-transform duration-200" />
                              )}
                              <Badge className={`${getMethodColor(endpoint.method)} font-mono text-[10px] sm:text-xs shrink-0`}>
                                {endpoint.method}
                              </Badge>
                            </div>
                            <code className="text-xs sm:text-sm text-slate-300 break-all flex-1 group-hover:text-primary transition-colors duration-200">{endpoint.path}</code>
                            <span className="text-xs sm:text-sm text-slate-400 hidden lg:block shrink-0 group-hover:text-white transition-colors duration-200">
                              {endpoint.name}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-slate-700 bg-slate-900/50">
                              {/* Mobile endpoint name */}
                              <p className="text-xs text-primary font-medium mb-2 lg:hidden">{endpoint.name}</p>
                              <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                {endpoint.description}
                              </p>

                              {endpoint.parameters.length > 0 && (
                                <div className="mb-3 sm:mb-4">
                                  <h5 className="text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    Parameters
                                  </h5>
                                  {/* Mobile: Card layout */}
                                  <div className="space-y-2 sm:hidden">
                                    {endpoint.parameters.map((param, pIndex) => (
                                      <div key={pIndex} className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
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
                                        <tr className="text-left text-xs border-b border-slate-800">
                                          <th className="pb-2 pr-4 text-white">Name</th>
                                          <th className="pb-2 pr-4 text-white">Type</th>
                                          <th className="pb-2 pr-4 text-white">Required</th>
                                          <th className="pb-2 text-white">Description</th>
                                        </tr>
                                      </thead>
                                      <tbody className="text-slate-300">
                                        {endpoint.parameters.map((param, pIndex) => (
                                          <tr key={pIndex} className="border-b border-slate-800/50">
                                            <td className="py-2 pr-4 font-mono text-primary text-xs">
                                              {param.name}
                                            </td>
                                            <td className="py-2 pr-4 text-slate-400 text-xs">
                                              <Badge variant="outline" className="text-[10px] border-slate-600">
                                                {param.type}
                                              </Badge>
                                            </td>
                                            <td className="py-2 pr-4">
                                              {param.required ? (
                                                <Badge variant="destructive" className="text-[10px]">Required</Badge>
                                              ) : (
                                                <Badge variant="secondary" className="text-[10px]">Optional</Badge>
                                              )}
                                            </td>
                                            <td className="py-2 text-slate-400 text-xs">
                                              {param.description}
                                              {param.default !== undefined && (
                                                <span className="text-slate-500 ml-1">(default: {String(param.default)})</span>
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
                                    <h5 className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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
                                      className="h-7 px-2 text-xs hover:bg-green-500/10 text-green-400"
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy
                                    </Button>
                                  </div>
                                  <pre className="text-[10px] sm:text-xs bg-slate-950/50 p-2 sm:p-3 rounded text-slate-300 overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal border border-slate-700">
                                    {endpoint.example.curl.replace("{{baseUrl}}", API_BASE_URL)}
                                  </pre>
                                </div>

                                <div>
                                  <h5 className="text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    Example Response
                                  </h5>
                                  <pre className="text-[10px] sm:text-xs bg-slate-950/50 p-2 sm:p-3 rounded text-green-400 overflow-x-auto border border-slate-700">
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

          {/* API Playground Tab */}
          <TabsContent value="playground" className="space-y-4 sm:space-y-6">
            <APIPlayground 
              apiDocs={apiDocs} 
              onApiKeyChange={setPlaygroundApiKey}
            />
          </TabsContent>

          {/* My API Keys Tab */}
          <TabsContent value="mykeys" className="space-y-4 sm:space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <Key className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base sm:text-lg">Manage Your API Keys</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-400">
                      Enter your email to view and manage your existing API keys
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0 relative z-10">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400 text-sm h-10 sm:h-11 focus:border-purple-500/50 transition-colors"
                  />
                  <Button 
                    onClick={lookupKeys} 
                    className="h-10 sm:h-11 sm:px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Lookup Keys
                  </Button>
                </div>

                {userKeys.length > 0 && (
                  <div className="space-y-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Found {userKeys.length} API key{userKeys.length !== 1 ? 's' : ''}
                    </div>
                    {userKeys.map((key, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:bg-slate-900/70 transition-all duration-300 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white font-medium text-sm sm:text-base">{key.name}</p>
                            <div className="flex gap-1">
                              {key.status === "active" && (
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-xs sm:text-sm text-slate-400 break-all bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
                              {key.key.slice(0, 8)}••••••••••••{key.key.slice(-4)}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(key.key)}
                              className="h-6 w-6 p-0 hover:bg-slate-700 text-slate-400 hover:text-white"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {/* API key usage info */}
                          {typeof key.usage === "number" && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="text-[11px] sm:text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-900 border border-blue-300">
                                Used: {key.usage}
                              </span>
                              <span className="text-[11px] sm:text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-900 border border-green-300">
                                Remaining: {Math.max(0, (key.dailyLimit || 0) - key.usage)}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {/* Status badge: active (black text, white bg), others (default/destructive) */}
                            <span
                              className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded border ${
                                key.status === "active"
                                  ? "bg-white text-black border-slate-300"
                                  : "bg-red-500/10 text-red-500 border-red-500/20"
                              } flex items-center gap-1`}
                            >
                              {key.status === "active" && (
                                <div className="w-1.5 h-1.5 bg-black rounded-full mr-1"></div>
                              )}
                              {key.status}
                            </span>
                            {/* Tier badge: free (white text, green bg), others (default) */}
                            <span
                              className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded border ${
                                key.tier === "free"
                                  ? "bg-green-500 text-white border-green-500"
                                  : "bg-slate-700/50 text-slate-200 border-slate-600"
                              }`}
                            >
                              {key.tier}
                            </span>
                            {/* Daily limit badge: black text, white bg */}
                            <span
                              className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded border bg-white text-black border-slate-300"
                            >
                              {key.dailyLimit} req/day
                            </span>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(key.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {userKeys.length === 0 && lookupEmail && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key className="h-8 w-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-sm">No API keys found for this email</p>
                    <p className="text-slate-500 text-xs mt-2">Generate a new API key from the Get Started tab</p>
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
