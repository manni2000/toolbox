import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Play, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw, 
  Code2, 
  Terminal, 
  FileJson, 
  History,
  Save,
  Trash2,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Key,
  Rocket,
  Sparkles,
  ArrowRight,
  Settings,
  Send,
  Globe,
  Shield,
  Activity
} from "lucide-react";

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

interface PlaygroundRequest {
  id: string;
  endpoint: ApiEndpoint;
  parameters: Record<string, any>;
  response: any;
  status: number;
  duration: number;
  timestamp: Date;
  apiKey: string;
}

interface SavedExample {
  id: string;
  name: string;
  endpoint: ApiEndpoint;
  parameters: Record<string, any>;
  createdAt: Date;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://toolbox-backend-jet.vercel.app");

const APIPlayground = ({ 
  apiDocs, 
  onApiKeyChange 
}: { 
  apiDocs: { endpoints: ApiCategory[] } | null;
  onApiKeyChange: (key: string) => void;
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [requestHistory, setRequestHistory] = useState<PlaygroundRequest[]>([]);
  const [savedExamples, setSavedExamples] = useState<SavedExample[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("curl");
  const [responseFormat, setResponseFormat] = useState("pretty");
  const [requestTemplate, setRequestTemplate] = useState("custom");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("api-playground-history");
    if (saved) {
      setRequestHistory(JSON.parse(saved, (key, value) => {
        if (key === "timestamp") return new Date(value);
        return value;
      }));
    }

    const examples = localStorage.getItem("api-playground-examples");
    if (examples) {
      setSavedExamples(JSON.parse(examples, (key, value) => {
        if (key === "createdAt") return new Date(value);
        return value;
      }));
    }
  }, []);

  useEffect(() => {
    if (requestHistory.length > 0) {
      localStorage.setItem("api-playground-history", JSON.stringify(requestHistory));
    }
  }, [requestHistory]);

  useEffect(() => {
    if (savedExamples.length > 0) {
      localStorage.setItem("api-playground-examples", JSON.stringify(savedExamples));
    }
  }, [savedExamples]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono font-semibold";
      case "POST":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono font-semibold";
      case "PUT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono font-semibold";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20 font-mono font-semibold";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20 font-mono font-semibold";
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (status >= 300 && status < 400) return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    if (status >= 400 && status < 500) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    if (status >= 500) return "text-rose-400 bg-rose-400/10 border-rose-400/20";
    return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  };

  const handleEndpointSelect = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setParameters({});
    setResponse(null);
    setResponseStatus(null);
    setResponseDuration(null);
    
    // Set default values
    const defaultParams: Record<string, any> = {};
    endpoint.parameters.forEach(param => {
      if (param.default !== undefined) {
        defaultParams[param.name] = param.default;
      }
    });
    setParameters(defaultParams);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const executeRequest = async () => {
    if (!selectedEndpoint || !apiKey) {
      toast.error("Please select an endpoint and provide an API key", {
        description: "Both endpoint selection and API key are required to make requests.",
        action: {
          label: "Dismiss",
          onClick: () => {}
        }
      });
      return;
    }

    // Validate required parameters
    const missingParams = selectedEndpoint.parameters
      .filter(param => param.required && !parameters[param.name])
      .map(param => param.name);

    if (missingParams.length > 0) {
      toast.error(`Missing required parameters: ${missingParams.join(", ")}`, {
        description: "Please fill in all required parameters before sending the request.",
        action: {
          label: "View Parameters",
          onClick: () => document.getElementById('parameters-section')?.scrollIntoView({ behavior: 'smooth' })
        }
      });
      return;
    }

    setLoading(true);
    setResponse(null);
    setResponseStatus(null);
    setResponseDuration(null);
    
    const startTime = Date.now();

    try {
      const url = new URL(`${API_BASE_URL}${selectedEndpoint.path}`);
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": selectedEndpoint.contentType || "application/json",
        },
      };

      // Add request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      options.signal = controller.signal;

      if (selectedEndpoint.method !== "GET" && Object.keys(parameters).length > 0) {
        options.body = JSON.stringify(parameters);
      } else if (selectedEndpoint.method === "GET" && Object.keys(parameters).length > 0) {
        Object.entries(parameters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), options);
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      setResponseDuration(responseTime);
      setResponseStatus(response.status);

      let responseData;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      setResponse(responseData);

      if (response.ok) {
        toast.success("Request completed successfully!", {
          description: `Status: ${response.status} | Time: ${responseTime}ms`,
          icon: <CheckCircle className="h-4 w-4 text-green-400" />
        });
      } else {
        toast.error(`Request failed with status ${response.status}`, {
          description: responseData?.error || responseData?.message || "An error occurred while processing your request.",
          icon: <AlertCircle className="h-4 w-4 text-red-400" />
        });
      }

      // Add to history
      const historyItem: PlaygroundRequest = {
        id: Date.now().toString(),
        endpoint: selectedEndpoint,
        parameters: { ...parameters },
        response: responseData,
        status: response.status,
        duration: responseTime,
        timestamp: new Date(),
        apiKey: apiKey
      };
      setRequestHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50 requests

    } catch (error) {
      console.error("Request failed:", error);
      
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timed out after 30 seconds";
        } else if (error.message.includes('fetch')) {
          errorMessage = "Network error - please check your connection";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error("Request failed", {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4 text-red-400" />,
        action: {
          label: "Retry",
          onClick: () => executeRequest()
        }
      });

      setResponse({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = (language: string) => {
    if (!selectedEndpoint) return "";

    const baseUrl = API_BASE_URL;
    const endpoint = selectedEndpoint;

    switch (language) {
      case "curl":
        let curlCommand = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}"`;
        curlCommand += `\n  -H "X-API-Key: ${apiKey}"`;
        curlCommand += `\n  -H "Content-Type: ${endpoint.contentType || "application/json"}"`;
        
        if (endpoint.method !== "GET" && Object.keys(parameters).length > 0) {
          curlCommand += `\n  -d '${JSON.stringify(parameters, null, 2)}'`;
        } else if (endpoint.method === "GET" && Object.keys(parameters).length > 0) {
          const queryParams = new URLSearchParams();
          Object.entries(parameters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, String(value));
            }
          });
          const queryString = queryParams.toString();
          if (queryString) {
            curlCommand = curlCommand.replace(endpoint.path, `${endpoint.path}?${queryString}`);
          }
        }
        return curlCommand;

      case "javascript":
        const jsCode = `const response = await fetch('${baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': '${endpoint.contentType || "application/json"}',
  }${
  endpoint.method !== "GET" && Object.keys(parameters).length > 0
    ? `,
  body: JSON.stringify(${JSON.stringify(parameters, null, 2)})`
    : ""
},
});

const data = await response.json();
console.log(data);`;
        return jsCode;

      case "python":
        const pythonCode = `import requests
import json

url = '${baseUrl}${endpoint.path}'
headers = {
    'X-API-Key': '${apiKey}',
    'Content-Type': '${endpoint.contentType || "application/json"}',
}${
  endpoint.method !== "GET" && Object.keys(parameters).length > 0
    ? `
data = ${JSON.stringify(parameters, null, 2)}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=data)`
    : `
response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)`
}

result = response.json()
print(result)`;
        return pythonCode;

      case "node":
        const nodeCode = `const https = require('https');

const data = ${endpoint.method !== "GET" && Object.keys(parameters).length > 0 
  ? JSON.stringify(parameters, null, 2) 
  : 'null'};

const options = {
  hostname: '${baseUrl.replace('https://', '').replace('http://', '')}',
  port: 443,
  path: '${endpoint.path}',
  method: '${endpoint.method}',
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': '${endpoint.contentType || "application/json"}',
  },
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log(responseData);
  });
});

if (data) {
  req.write(JSON.stringify(data));
}
req.end();`;
        return nodeCode;

      case "php":
        const phpCode = `<?php
$curl = curl_init();

$url = '${baseUrl}${endpoint.path}';
$headers = [
    'X-API-Key: ${apiKey}',
    'Content-Type: ${endpoint.contentType || "application/json"}',
];

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => '${endpoint.method}',
    CURLOPT_POSTFIELDS => ${endpoint.method !== "GET" && Object.keys(parameters).length > 0 
      ? 'json_encode(' + JSON.stringify(parameters, null, 2) + ')' 
      : 'null'},
    CURLOPT_HTTPHEADER => $headers,
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo 'cURL Error #:' . $err;
} else {
    echo $response;
}
?>`;
        return phpCode;

      default:
        return "";
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const saveExample = () => {
    if (!selectedEndpoint) return;

    const name = prompt("Enter a name for this example:");
    if (!name) return;

    const example: SavedExample = {
      id: Date.now().toString(),
      name,
      endpoint: selectedEndpoint,
      parameters: { ...parameters },
      createdAt: new Date()
    };

    setSavedExamples(prev => [...prev, example]);
    toast.success("Example saved successfully!");
  };

  const loadExample = (example: SavedExample) => {
    setSelectedEndpoint(example.endpoint);
    setParameters(example.parameters);
    setShowSaved(false);
    toast.success("Example loaded!");
  };

  const deleteExample = (id: string) => {
    setSavedExamples(prev => prev.filter(ex => ex.id !== id));
    toast.success("Example deleted!");
  };

  const clearHistory = () => {
    setRequestHistory([]);
    localStorage.removeItem("api-playground-history");
    toast.success("History cleared!");
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <Terminal className="h-6 w-6 text-primary" />
              </div>
              API Playground
            </h2>
            <p className="text-slate-400 text-lg">Test API endpoints in real-time with our interactive playground</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Testing
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Zap className="h-4 w-4 text-yellow-400" />
                Instant Response
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield className="h-4 w-4 text-green-400" />
                Secure
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm text-white"
            >
              <History className="h-4 w-4 mr-2" />
              History ({requestHistory.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaved(!showSaved)}
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Saved ({savedExamples.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced API Key Input */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">API Authentication</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your API key to start testing endpoints
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 relative z-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  onApiKeyChange(e.target.value);
                }}
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400 pr-10 focus:border-primary/50 transition-colors"
              />
              {apiKey && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyCode(apiKey)}
              className="border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 px-4 text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {!apiKey && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 p-2 rounded-lg border border-slate-700">
              <AlertCircle className="h-3 w-3 text-yellow-400" />
              <span>API key is required to make requests. Get one from the Get Started tab.</span>
            </div>
          )}
          {apiKey && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
              <CheckCircle className="h-3 w-3" />
              <span>API key authenticated and ready to use</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Endpoint Selection */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 h-fit overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <Terminal className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">Select Endpoint</CardTitle>
                  <CardDescription className="text-slate-400">
                    Choose an endpoint to test
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto relative z-10">
              {apiDocs?.endpoints?.map((category, catIndex) => (
                <div key={catIndex}>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    {category.category}
                  </h4>
                  {category.endpoints.map((endpoint, endIndex) => (
                    <button
                      key={endIndex}
                      onClick={() => handleEndpointSelect(endpoint)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 mb-2 ${
                        selectedEndpoint === endpoint
                          ? "bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/30 shadow-lg shadow-primary/10"
                          : "bg-slate-900/30 border-slate-700 hover:bg-slate-900/50 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getMethodColor(endpoint.method)} text-xs font-medium`}>
                          {endpoint.method}
                        </Badge>
                        {selectedEndpoint === endpoint && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <code className="text-xs text-slate-300 block mb-1 group-hover:text-primary transition-colors">
                        {endpoint.path}
                      </code>
                      <p className="text-xs text-slate-400 line-clamp-2">{endpoint.name}</p>
                    </button>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Request Builder */}
        <div className="lg:col-span-2 space-y-4">
          {selectedEndpoint ? (
            <>
              {/* Enhanced Endpoint Info */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                        <Send className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <Badge className={`${getMethodColor(selectedEndpoint.method)} text-sm font-medium`}>
                            {selectedEndpoint.method}
                          </Badge>
                          {selectedEndpoint.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                          {selectedEndpoint.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      onClick={executeRequest}
                      disabled={loading || !apiKey}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Send Request
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced
                    </Button>
                  </div>
                  
                  {/* Advanced Options */}
                  {showAdvanced && (
                    <div className="mt-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 mb-1 block">Request Template</label>
                          <Select value={requestTemplate} onValueChange={setRequestTemplate}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">Custom</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                              <SelectItem value="production">Production</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 mb-1 block">Timeout (ms)</label>
                          <Input
                            type="number"
                            placeholder="30000"
                            defaultValue="30000"
                            className="bg-slate-800/50 border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <AlertCircle className="h-3 w-3 text-blue-400" />
                        <span>Advanced options modify request headers and behavior</span>
                      </div>
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Enhanced Parameters */}
              {selectedEndpoint.parameters.length > 0 && (
                <Card id="parameters-section" className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                        <Settings className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">Parameters</CardTitle>
                        <CardDescription className="text-slate-400">
                          Configure request parameters
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 relative z-10">
                    {selectedEndpoint.parameters.map((param) => (
                      <div key={param.name} className="space-y-2 p-3 bg-slate-900/30 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                              {param.name}
                              {param.required && (
                                <Badge variant="destructive" className="text-xs bg-red-500/20 border-red-500/30 text-white">
                                  Required
                                </Badge>
                              )}
                            </label>
                          </div>
                          <Badge variant="outline" className="text-xs border-slate-600 !text-white bg-slate-800/50">
                            {param.type}
                          </Badge>
                        </div>
                        {param.type === "boolean" ? (
                          <Select
                            value={parameters[param.name]?.toString() || "false"}
                            onValueChange={(value) => handleParameterChange(param.name, value === "true")}
                          >
                            <SelectTrigger className="bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">true</SelectItem>
                              <SelectItem value="false">false</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : param.type === "text" || param.type === "string" ? (
                          <Textarea
                            placeholder={param.description}
                            value={parameters[param.name] || ""}
                            onChange={(e) => handleParameterChange(param.name, e.target.value)}
                            className="bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 resize-none text-white"
                            rows={3}
                          />
                        ) : (
                          <Input
                            type={param.type === "number" ? "number" : "text"}
                            placeholder={param.description}
                            value={parameters[param.name] || ""}
                            onChange={(e) => handleParameterChange(param.name, e.target.value)}
                            className="bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 text-white"
                          />
                        )}
                        {param.default !== undefined && (
                          <p className="text-xs text-slate-300 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            Default: {String(param.default)}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Code Generation */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                        <Code2 className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          Code Generation
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Export request in multiple programming languages
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-28 bg-slate-900/50 border-slate-700 focus:border-purple-500/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="curl">cURL</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="node">Node.js</SelectItem>
                          <SelectItem value="php">PHP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCode(generateCode(selectedLanguage))}
                        className="border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-white"
                      >
                        {copiedCode === generateCode(selectedLanguage) ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveExample}
                        className="border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-white"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <pre className="text-xs bg-slate-950/50 p-4 rounded-lg text-slate-300 overflow-x-auto whitespace-pre-wrap border border-slate-700 font-mono leading-relaxed">
                    {generateCode(selectedLanguage)}
                  </pre>
                </CardContent>
              </Card>

              {/* Enhanced Response */}
              {response && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                          <FileJson className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg flex items-center gap-2">
                            Response
                            {responseStatus && (
                              <Badge 
                                className={`text-xs font-mono font-semibold ${getStatusColor(responseStatus)}`}
                              >
                                {responseStatus}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-slate-400 flex items-center gap-2">
                            API response data and metadata
                            {responseStatus && (
                              <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 border border-slate-600">
                                {responseStatus >= 200 && responseStatus < 300 ? 'Success' : 
                                 responseStatus >= 400 && responseStatus < 500 ? 'Client Error' :
                                 responseStatus >= 500 ? 'Server Error' : 'Redirect'}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {responseDuration && (
                          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/30 px-3 py-1 rounded-full border border-slate-700">
                            <Zap className="h-3 w-3 text-green-400" />
                            {responseDuration}ms
                          </div>
                        )}
                        <Select value={responseFormat} onValueChange={setResponseFormat}>
                          <SelectTrigger className="w-24 bg-slate-900/50 border-slate-700 focus:border-green-500/50 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pretty">Pretty</SelectItem>
                            <SelectItem value="raw">Raw</SelectItem>
                            <SelectItem value="compact">Compact</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="relative">
                      <pre className={`text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap border font-mono leading-relaxed ${
                        responseFormat === 'pretty' 
                          ? 'bg-slate-950/50 text-green-400 border-green-500/20' 
                          : responseFormat === 'raw'
                          ? 'bg-slate-900/50 text-slate-300 border-slate-600/20'
                          : 'bg-slate-950/50 text-blue-400 border-blue-500/20'
                      }`}>
                        {responseFormat === 'pretty' 
                          ? JSON.stringify(response, null, 2)
                          : responseFormat === 'raw'
                          ? JSON.stringify(response)
                          : JSON.stringify(response).replace(/\s+/g, ' ')
                        }
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(JSON.stringify(response, null, 2))}
                        className="absolute top-2 right-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-600"
                      >
                        {copiedCode === JSON.stringify(response, null, 2) ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-slate-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="flex flex-col items-center justify-center py-16 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-2xl flex items-center justify-center mb-6">
                  <Terminal className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Select an Endpoint</h3>
                <p className="text-slate-400 text-center max-w-md">
                  Choose an endpoint from the sidebar to start testing the API with our interactive playground.
                </p>
                <div className="flex items-center gap-4 mt-6 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Real-time Testing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Instant Response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Code Export</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800/95 backdrop-blur-sm border-slate-700 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                    <History className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Request History</CardTitle>
                    <CardDescription className="text-slate-400">
                      Your recent API requests and responses
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="border-red-700 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(false)}
                    className="border-slate-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[60vh]">
              {requestHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400">No request history yet</p>
                  <p className="text-slate-500 text-sm mt-2">Start making API requests to see your history here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {requestHistory.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getMethodColor(item.endpoint.method)} text-xs`}>
                            {item.endpoint.method}
                          </Badge>
                          <code className="text-xs text-slate-300">{item.endpoint.path}</code>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {item.timestamp.toLocaleTimeString()}
                          <Badge 
                            variant={item.status >= 200 && item.status < 300 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                          <span className="bg-slate-900/50 px-2 py-1 rounded">{item.duration}ms</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {Object.entries(item.parameters).map(([key, value]) => (
                          <span key={key} className="mr-2 bg-slate-900/30 px-2 py-1 rounded">
                            {key}: {JSON.stringify(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Saved Examples Modal */}
      {showSaved && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800/95 backdrop-blur-sm border-slate-700 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Save className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Saved Examples</CardTitle>
                    <CardDescription className="text-slate-400">
                      Your frequently used API request configurations
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaved(false)}
                  className="border-slate-700"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[60vh]">
              {savedExamples.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Save className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400">No saved examples yet</p>
                  <p className="text-slate-500 text-sm mt-2">Save your frequently used API requests for quick access</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {savedExamples.map((example) => (
                    <div key={example.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                            {example.name}
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getMethodColor(example.endpoint.method)} text-xs`}>
                              {example.endpoint.method}
                            </Badge>
                            <code className="text-xs text-slate-300">{example.endpoint.path}</code>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadExample(example)}
                            className="border-green-700 text-green-400 hover:bg-green-900/20"
                          >
                            <Rocket className="h-3 w-3 mr-1" />
                            Load
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteExample(example.id)}
                            className="border-red-700 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {example.createdAt.toLocaleDateString()} at {example.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default APIPlayground;
