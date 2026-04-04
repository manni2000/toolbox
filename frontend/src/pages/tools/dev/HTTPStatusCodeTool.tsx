import { useState } from "react";
import { Copy, Check, Search, Download, AlertCircle, Globe, Info, CheckCircle, XCircle, AlertTriangle, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "210 80% 55%";

interface StatusCodeInfo {
  code: number;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  name: string;
  description: string;
  meaning: string;
  commonCauses: string[];
  solutions: string[];
  examples: string[];
}

const HTTPStatusCodeTool = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const statusCodes: StatusCodeInfo[] = [
    // 1xx Informational
    {
      code: 100,
      category: '1xx',
      name: 'Continue',
      description: 'The server has received the request headers and the client should proceed to send the request body.',
      meaning: 'Interim response indicating that the initial part of the request has been received.',
      commonCauses: ['Large uploads', 'Expect header usage', 'WebSocket upgrades'],
      solutions: ['Continue sending the request body', 'Check Expect header', 'Verify WebSocket handshake'],
      examples: ['POST with Expect: 100-continue', 'WebSocket upgrade request']
    },
    {
      code: 101,
      category: '1xx',
      name: 'Switching Protocols',
      description: 'The server is switching protocols according to Upgrade header.',
      meaning: 'Protocol switch is accepted and the server will use the new protocol.',
      commonCauses: ['WebSocket connections', 'HTTP/2 upgrades', 'Protocol changes'],
      solutions: ['Use the new protocol for communication', 'Verify protocol compatibility', 'Check Upgrade header'],
      examples: ['WebSocket handshake', 'HTTP to HTTPS upgrade']
    },

    // 2xx Success
    {
      code: 200,
      category: '2xx',
      name: 'OK',
      description: 'The request succeeded.',
      meaning: 'Standard response for successful HTTP requests.',
      commonCauses: ['Successful GET requests', 'Successful POST requests', 'Successful PUT/DELETE'],
      solutions: ['Process the response data', 'Update UI accordingly', 'Log successful operations'],
      examples: ['GET /api/users', 'POST /api/users', 'PUT /api/users/1']
    },
    {
      code: 201,
      category: '2xx',
      name: 'Created',
      description: 'The request succeeded and a new resource was created.',
      meaning: 'Resource successfully created as a result of the request.',
      commonCauses: ['POST requests creating resources', 'Database insertions', 'File uploads'],
      solutions: ['Extract Location header for new resource URL', 'Update UI with new resource', 'Cache the new resource'],
      examples: ['POST /api/users', 'POST /api/posts', 'POST /api/files']
    },
    {
      code: 204,
      category: '2xx',
      name: 'No Content',
      description: 'The request succeeded but there is no content to return.',
      meaning: 'Request was successful but no response body is needed.',
      commonCauses: ['DELETE requests', 'PUT requests with no response', 'Successful operations with no data'],
      solutions: ['Consider returning 200 with empty body', 'Update UI to reflect deletion', 'Handle empty responses'],
      examples: ['DELETE /api/users/1', 'PUT /api/users/1/status']
    },

    // 3xx Redirection
    {
      code: 301,
      category: '3xx',
      name: 'Moved Permanently',
      description: 'The requested resource has been permanently moved to a new URL.',
      meaning: 'Resource has been permanently relocated to a different URL.',
      commonCauses: ['Website restructuring', 'URL changes', 'Domain migrations'],
      solutions: ['Update bookmarks', 'Update links', 'Use new URL permanently'],
      examples: ['Old domain to new domain', 'URL structure changes']
    },
    {
      code: 302,
      category: '3xx',
      name: 'Found',
      description: 'The requested resource has been temporarily moved to a different URL.',
      meaning: 'Resource is temporarily available at a different URL.',
      commonCauses: ['Temporary redirects', 'A/B testing', 'Maintenance pages'],
      solutions: ['Follow the redirect', 'Update temporary links', 'Check redirect loops'],
      examples: ['Temporary URL changes', 'Maintenance redirects']
    },
    {
      code: 304,
      category: '3xx',
      name: 'Not Modified',
      description: 'The resource has not been modified since the last request.',
      meaning: 'Cached version is still valid, no need to transfer data again.',
      commonCauses: ['Conditional requests', 'Cache validation', 'ETag/If-Modified-Since headers'],
      solutions: ['Use cached version', 'No action needed', 'Update cache if needed'],
      examples: ['Cached resource requests', 'API responses with caching']
    },

    // 4xx Client Errors
    {
      code: 400,
      category: '4xx',
      name: 'Bad Request',
      description: 'The server cannot process the request due to a client error.',
      meaning: 'Request is malformed or contains invalid data.',
      commonCauses: ['Invalid JSON', 'Missing required fields', 'Malformed URL', 'Invalid parameters'],
      solutions: ['Validate request data', 'Check API documentation', 'Fix malformed JSON', 'Add required fields'],
      examples: ['Invalid JSON payload', 'Missing required parameters']
    },
    {
      code: 401,
      category: '4xx',
      name: 'Unauthorized',
      description: 'The client is not authenticated to access the requested resource.',
      meaning: 'Authentication is required but has failed or not been provided.',
      commonCauses: ['Missing authentication', 'Invalid credentials', 'Expired tokens'],
      solutions: ['Provide valid credentials', 'Refresh authentication token', 'Check API key'],
      examples: ['Missing Authorization header', 'Invalid API key']
    },
    {
      code: 403,
      category: '4xx',
      name: 'Forbidden',
      description: 'The client does not have permission to access the requested resource.',
      meaning: 'Authentication succeeded but client lacks permission for the resource.',
      commonCauses: ['Insufficient permissions', 'User role restrictions', 'Resource access limits'],
      solutions: ['Check user permissions', 'Request proper access rights', 'Contact administrator'],
      examples: ['User trying to access admin resources', 'API rate limits exceeded']
    },
    {
      code: 404,
      category: '4xx',
      name: 'Not Found',
      description: 'The requested resource could not be found.',
      meaning: 'Resource does not exist or is not available.',
      commonCauses: ['Wrong URL', 'Resource deleted', 'Typo in endpoint', 'Missing resource'],
      solutions: ['Check URL spelling', 'Verify resource exists', 'Check API documentation'],
      examples: ['Invalid endpoint', 'Deleted resource', 'Wrong ID']
    },
    {
      code: 429,
      category: '4xx',
      name: 'Too Many Requests',
      description: 'The client has sent too many requests in a given amount of time.',
      meaning: 'Rate limit has been exceeded, client should slow down requests.',
      commonCauses: ['API rate limiting', 'Excessive requests', 'Bot activity'],
      solutions: ['Implement rate limiting', 'Use exponential backoff', 'Add delays between requests'],
      examples: ['API rate limits exceeded', 'Too many requests per minute']
    },

    // 5xx Server Errors
    {
      code: 500,
      category: '5xx',
      name: 'Internal Server Error',
      description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
      meaning: 'Generic server error, something went wrong on the server.',
      commonCauses: ['Database errors', 'Application bugs', 'Server configuration issues'],
      solutions: ['Check server logs', 'Debug application code', 'Contact server administrator'],
      examples: ['Database connection failed', 'Application crashed', 'Server misconfiguration']
    },
    {
      code: 502,
      category: '5xx',
      name: 'Bad Gateway',
      description: 'The server was acting as a gateway or proxy and received an invalid response.',
      meaning: 'Server received invalid response from upstream server.',
      commonCauses: ['Upstream server down', 'Network issues', 'Configuration problems'],
      solutions: ['Check upstream server status', 'Verify network connectivity', 'Check proxy configuration'],
      examples: ['Upstream server unavailable', 'Network timeout']
    },
    {
      code: 503,
      category: '5xx',
      name: 'Service Unavailable',
      description: 'The server is currently unable to handle the request due to maintenance or overload.',
      meaning: 'Server is temporarily unavailable or overloaded.',
      commonCauses: ['Server maintenance', 'High traffic', 'Service downtime'],
      solutions: ['Try again later', 'Check server status', 'Implement retry logic'],
      examples: ['Scheduled maintenance', 'Server overload']
    }
  ];

  const filteredStatusCodes = statusCodes.filter(code => {
    const matchesSearch = searchTerm === '' || 
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.toString().includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'all' || code.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadReference = () => {
    const data = statusCodes.map(code => ({
      code: code.code,
      category: code.category,
      name: code.name,
      description: code.description,
      meaning: code.meaning,
      commonCauses: code.commonCauses,
      solutions: code.solutions,
      examples: code.examples
    }));
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'http-status-codes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (category: string) => {
    switch (category) {
      case '1xx': return <Info className="h-5 w-5 text-blue-500" />;
      case '2xx': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case '3xx': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case '4xx': return <XCircle className="h-5 w-5 text-red-500" />;
      case '5xx': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '1xx': return 'bg-blue-100 text-blue-700';
      case '2xx': return 'bg-green-100 text-green-700';
      case '3xx': return 'bg-orange-100 text-orange-700';
      case '4xx': return 'bg-red-100 text-red-700';
      case '5xx': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const categories = [
    { value: 'all', label: 'All Codes' },
    { value: '1xx', label: '1xx - Informational' },
    { value: '2xx', label: '2xx - Success' },
    { value: '3xx', label: '3xx - Redirection' },
    { value: '4xx', label: '4xx - Client Error' },
    { value: '5xx', label: '5xx - Server Error' }
  ];

  return (
    <ToolLayout
      title="HTTP Status Code Explainer"
      description="Comprehensive guide to HTTP status codes with meanings, causes, and solutions"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Globe className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">HTTP Status Code Explainer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Understand HTTP status codes, their meanings, causes, and how to handle them
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Status Codes</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by code, name, or description..."
                  className="w-full rounded-lg bg-muted pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filter by Category</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Codes List */}
        <div className="space-y-4">
          {filteredStatusCodes.map((statusCode, index) => (
            <motion.div 
              key={statusCode.code} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(statusCode.category)}
                  <div>
                    <h3 className="text-lg font-semibold">{statusCode.code} - {statusCode.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(statusCode.category)}`}>
                      {statusCode.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{statusCode.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Meaning</h4>
                  <p className="text-sm text-muted-foreground">{statusCode.meaning}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Common Causes</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {statusCode.commonCauses.map((cause, index) => (
                        <li key={index}>• {cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Solutions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {statusCode.solutions.map((solution, index) => (
                        <li key={index}>• {solution}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {statusCode.examples.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Examples</h4>
                    <div className="flex flex-wrap gap-2">
                      {statusCode.examples.map((example, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(`code-${statusCode.code}`, `${statusCode.code} - ${statusCode.name}: ${statusCode.description}`)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied === `code-${statusCode.code}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Download Reference */}
        <div className="flex justify-center">
          <motion.button
            onClick={downloadReference}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg px-6 py-3 font-medium text-white transition-colors"
            style={{
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            }}
          >
            <Download className="inline h-4 w-4 mr-2" />
            Download Reference
          </motion.button>
        </div>

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            HTTP Status Code Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">📊 Status Code Categories</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>1xx:</strong> Informational responses</li>
                <li>• <strong>2xx:</strong> Successful responses</li>
                <li>• <strong>3xx:</strong> Redirection messages</li>
                <li>• <strong>4xx:</strong> Client error responses</li>
                <li>• <strong>5xx:</strong> Server error responses</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🔧 Best Practices</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Always handle 4xx and 5xx errors gracefully</li>
                <li>• Use appropriate status codes for different scenarios</li>
                <li>• Include helpful error messages</li>
                <li>• Log errors for debugging purposes</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default HTTPStatusCodeTool;
