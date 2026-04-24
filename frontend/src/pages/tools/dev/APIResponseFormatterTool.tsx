import { useState } from "react";
import { Copy, Check, Code, Download, RefreshCw, Zap, AlertCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

interface APIResponse {
  method: string;
  url: string;
  status: number;
  headers: { [key: string]: string };
  body: string;
  formatted: string;
}

const APIResponseFormatterTool = () => {
  const toolSeoData = getToolSeoMetadata('api-response-formatter');
  const [response, setResponse] = useState<APIResponse>({
    method: 'GET',
    url: '',
    status: 200,
    headers: {},
    body: '',
    formatted: ''
  });
  const [rawResponse, setRawResponse] = useState('');
  const [formatType, setFormatType] = useState<'json' | 'xml' | 'html' | 'text'>('json');
  const [copied, setCopied] = useState<string | null>(null);

  const formatResponse = (bodyToFormat?: string, typeToFormat?: 'json' | 'xml' | 'html' | 'text') => {
    const bodyContent = bodyToFormat !== undefined ? bodyToFormat : response.body;
    const formatTypeToUse = typeToFormat || formatType;
    
    if (!bodyContent) {
      setResponse(prev => ({ ...prev, formatted: '' }));
      return;
    }
    
    try {
      let formatted = '';
      
      switch (formatTypeToUse) {
        case 'json': {
          const parsed = JSON.parse(bodyContent);
          formatted = JSON.stringify(parsed, null, 2);
          break;
        }
        case 'xml': {
          formatted = formatXML(bodyContent);
          break;
        }
        case 'html': {
          formatted = formatHTML(bodyContent);
          break;
        }
        case 'text':
          formatted = bodyContent;
          break;
      }
      
      setResponse(prev => ({ ...prev, formatted }));
    } catch (error) {
      setResponse(prev => ({ 
        ...prev, 
        formatted: `Error: ${error instanceof Error ? error.message : 'Invalid format'}` 
      }));
    }
  };

  const formatXML = (xml: string): string => {
    const PADDING = '  ';
    let formatted = '';
    let indent = 0;
    
    xml.split(/>\s*</).forEach((node) => {
      if (node.startsWith('</')) {
        indent--;
        formatted += PADDING.repeat(indent) + node + '>\n';
      } else if (node.startsWith('<?')) {
        formatted += node + '>\n';
      } else if (node.startsWith('<') && !node.startsWith('</') && !node.endsWith('/>')) {
        formatted += PADDING.repeat(indent) + node + '>\n';
        indent++;
      } else {
        formatted += PADDING.repeat(indent) + node + '>\n';
      }
    });
    
    return formatted.trim();
  };

  const formatHTML = (html: string): string => {
    const PADDING = '  ';
    let formatted = '';
    let indent = 0;
    
    const tags = html.match(/<[^>]*>/g) || [];
    const text = html.split(/<[^>]*>/);
    
    let tagIndex = 0;
    text.forEach((textPart, index) => {
      if (textPart) {
        formatted += PADDING.repeat(indent) + textPart.trim() + '\n';
      }
      if (tagIndex < tags.length) {
        const tag = tags[tagIndex];
        if (tag.startsWith('</')) {
          indent--;
          formatted += PADDING.repeat(indent) + tag + '\n';
        } else if (tag.startsWith('<') && !tag.startsWith('</') && !tag.endsWith('/>')) {
          formatted += PADDING.repeat(indent) + tag + '\n';
          indent++;
        } else {
          formatted += PADDING.repeat(indent) + tag + '\n';
        }
        tagIndex++;
      }
    });
    
    return formatted.trim();
  };

  const parseRawResponse = () => {
    if (!rawResponse.trim()) {
      return;
    }
    
    try {
      const lines = rawResponse.split('\n');
      const newResponse: APIResponse = {
        method: 'GET',
        url: '',
        status: 200,
        headers: {},
        body: '',
        formatted: ''
      };
      
      let inHeaders = true;
      const bodyLines: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Parse status line
        if (i === 0 && trimmedLine.startsWith('HTTP/')) {
          const parts = trimmedLine.split(' ');
          newResponse.status = parseInt(parts[1]) || 200;
          continue;
        }
        
        // Empty line marks end of headers
        if (trimmedLine === '' && inHeaders) {
          inHeaders = false;
          continue;
        }
        
        // Parse headers
        if (inHeaders && trimmedLine.includes(':')) {
          const colonIndex = trimmedLine.indexOf(':');
          const key = trimmedLine.substring(0, colonIndex).trim();
          const value = trimmedLine.substring(colonIndex + 1).trim();
          newResponse.headers[key.toLowerCase()] = value;
        }
        
        // Collect body lines
        if (!inHeaders) {
          bodyLines.push(line);
        }
      }
      
      newResponse.body = bodyLines.join('\n').trim();
      
      setResponse(newResponse);
      
      // Format the body after parsing
      if (newResponse.body) {
        formatResponse(newResponse.body, formatType);
      }
    } catch (error) {
      // If parsing fails, treat the entire input as the body
      const newResponse: APIResponse = {
        method: 'GET',
        url: '',
        status: 200,
        headers: {},
        body: rawResponse,
        formatted: ''
      };
      setResponse(newResponse);
      formatResponse(rawResponse, formatType);
    }
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFormatted = () => {
    const data = new Blob([response.formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-response.${formatType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    const exampleResponse = `HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 156
Date: ${new Date().toUTCString()}

{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "User retrieved successfully"
}`;
    
    setRawResponse(exampleResponse);
    
    // Parse the example response directly
    const newResponse: APIResponse = {
      method: 'GET',
      url: '',
      status: 200,
      headers: {
        'content-type': 'application/json',
        'content-length': '156',
        'date': new Date().toUTCString()
      },
      body: `{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "User retrieved successfully"
}`,
      formatted: ''
    };
    
    setResponse(newResponse);
    formatResponse(newResponse.body, 'json');
  };

  return (
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "API Response Formatter",
        toolSeoData?.description || "Format and beautify API responses in JSON, XML, HTML, and plain text formats",
        "api-response-formatter"
      )}
      <ToolLayout
      title={toolSeoData?.title || "API Response Formatter"}
      description={toolSeoData?.description || "Format and beautify API responses in JSON, XML, HTML, and plain text formats"}
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
              <Code className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">API Response Formatter</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Format and beautify API responses in JSON, XML, HTML, and plain text for better readability
              </p>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Raw API Response</label>
              <textarea
                value={rawResponse}
                onChange={(e) => setRawResponse(e.target.value)}
                placeholder="Paste raw API response here..."
                rows={8}
                className="w-full rounded-lg bg-muted px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste the complete HTTP response including headers and body
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={parseRawResponse}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors text-white"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
              >
                <Zap className="inline h-4 w-4 mr-2" />
                Parse Response
              </motion.button>
              <button
                onClick={loadExample}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Load Example
              </button>
            </div>
          </div>
        </motion.div>

        {/* Format Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Format Type</label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => { setFormatType('json'); formatResponse(response.body, 'json'); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formatType === 'json'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => { setFormatType('xml'); formatResponse(response.body, 'xml'); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formatType === 'xml'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  XML
                </button>
                <button
                  onClick={() => { setFormatType('html'); formatResponse(response.body, 'html'); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formatType === 'html'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => { setFormatType('text'); formatResponse(response.body, 'text'); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formatType === 'text'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Text
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => formatResponse()}
              className="w-full rounded-lg px-4 py-3 font-medium transition-colors text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <RefreshCw className="inline h-4 w-4 mr-2" />
              Format Response
            </motion.button>
          </div>
        </motion.div>

        {/* Response Info */}
        {response.status && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <h3 className="font-semibold mb-4">Response Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {response.status}
                </div>
                <div className="text-sm text-muted-foreground">Status Code</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-bold text-primary truncate">
                  {response.headers['content-type'] || 'Unknown'}
                </div>
                <div className="text-sm text-muted-foreground">Content Type</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {response.headers['content-length'] || 'Unknown'}
                </div>
                <div className="text-sm text-muted-foreground">Content Length</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-bold text-primary capitalize">
                  {formatType.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">Format Type</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Formatted Output */}
        {response.formatted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Formatted Response</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={copied === "formatted" ? "Copied formatted response" : "Copy formatted response"}
                  title={copied === "formatted" ? "Copied formatted response" : "Copy formatted response"}
                  onClick={() => handleCopy("formatted", response.formatted)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "formatted" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  aria-label="Download formatted response"
                  title="Download formatted response"
                  onClick={downloadFormatted}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                {response.formatted}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            API Response Formatting Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">📝 Supported Formats</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>JSON:</strong> Pretty-printed with proper indentation</li>
                <li>• <strong>XML:</strong> Hierarchical formatting</li>
                <li>• <strong>HTML:</strong> Tag-based formatting</li>
                <li>• <strong>Text:</strong> Preserved as-is</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🔧 Features</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Auto-detect response format</li>
                <li>• Syntax validation</li>
                <li>• Error highlighting</li>
                <li>• Copy & download options</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            What is API Response Formatting?
          </h3>
          <p className="text-muted-foreground mb-4">
            API response formatting beautifies and structures HTTP API responses for better readability. It handles JSON, XML, and other formats, adding proper indentation, syntax highlighting, and structure to make debugging and documentation easier.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your API response or paste a URL</li>
            <li>The tool auto-detects the response format</li>
            <li>It formats the response with proper structure</li>
            <li>View headers, status, and formatted body</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Formatting Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Auto format detection</li>
                <li>• Syntax highlighting</li>
                <li>• Header inspection</li>
                <li>• Error highlighting</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• API debugging</li>
                <li>• Response analysis</li>
                <li>• Documentation</li>
                <li>• Integration testing</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What response formats are supported?",
            answer: "The tool supports JSON, XML, HTML, plain text, and other common API response formats. It auto-detects the format and applies appropriate formatting."
          },
          {
            question: "Can I format responses from live APIs?",
            answer: "Yes, you can enter a URL and the tool will fetch the response, then format it. This is useful for debugging live endpoints."
          },
          {
            question: "What information is displayed?",
            answer: "The tool shows the HTTP status code, response headers, and the formatted response body. This provides a complete view of the API response."
          },
          {
            question: "Does it handle nested JSON?",
            answer: "Yes, nested JSON objects and arrays are properly formatted with indentation to show the hierarchical structure clearly."
          },
          {
            question: "Can I copy the formatted response?",
            answer: "Yes, you can copy the formatted response to clipboard or download it as a file for documentation or sharing with your team."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default APIResponseFormatterTool;
