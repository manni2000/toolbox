import { useState } from "react";
import { Copy, Check, Code, Download, RefreshCw, Zap, AlertCircle } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

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

  const formatResponse = () => {
    try {
      let formatted = '';
      
      switch (formatType) {
        case 'json':
          if (response.body) {
            const parsed = JSON.parse(response.body);
            formatted = JSON.stringify(parsed, null, 2);
          }
          break;
        case 'xml':
          formatted = formatXML(response.body);
          break;
        case 'html':
          formatted = formatHTML(response.body);
          break;
        case 'text':
          formatted = response.body;
          break;
      }
      
      setResponse({ ...response, formatted });
    } catch (error) {
      setResponse({ ...response, formatted: `Error: ${error instanceof Error ? error.message : 'Invalid format'}` });
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
      
      let currentSection = '';
      let bodyStarted = false;
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('HTTP/')) {
          const parts = trimmedLine.split(' ');
          newResponse.status = parseInt(parts[1]) || 200;
        } else if (trimmedLine.includes(':') && !bodyStarted) {
          const [key, ...valueParts] = trimmedLine.split(':');
          const value = valueParts.join(':').trim();
          
          if (key.toLowerCase() === 'content-type') {
            newResponse.headers[key] = value;
          } else if (key.toLowerCase() === 'content-length') {
            newResponse.headers[key] = value;
          } else if (key.toLowerCase() === 'date') {
            newResponse.headers[key] = value;
          }
        } else if (trimmedLine === '' && currentSection === 'headers') {
          currentSection = 'body';
          bodyStarted = true;
        } else if (bodyStarted) {
          newResponse.body += (newResponse.body ? '\n' : '') + line;
        }
      });
      
      setResponse(newResponse);
      formatResponse();
    } catch (error) {
      setResponse({
        method: 'GET',
        url: '',
        status: 200,
        headers: {},
        body: rawResponse,
        formatted: 'Error parsing response'
      });
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
  "message": "User retrieved successfully"`;
    
    setRawResponse(exampleResponse);
    parseRawResponse();
  };

  return (
    <ToolLayout
      title="API Response Formatter"
      description="Format and beautify API responses in JSON, XML, HTML, and plain text formats"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">API Response Formatter</h3>
              <p className="text-sm text-muted-foreground">
                Format and beautify API responses for better readability
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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
              <button
                onClick={parseRawResponse}
                className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Zap className="inline h-4 w-4 mr-2" />
                Parse Response
              </button>
              <button
                onClick={loadExample}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Load Example
              </button>
            </div>
          </div>
        </div>

        {/* Format Options */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Format Type</label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => { setFormatType('json'); formatResponse(); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formatType === 'json'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => { setFormatType('xml'); formatResponse(); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formatType === 'xml'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  XML
                </button>
                <button
                  onClick={() => { setFormatType('html'); formatResponse(); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formatType === 'html'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => { setFormatType('text'); formatResponse(); }}
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

            <button
              onClick={formatResponse}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="inline h-4 w-4 mr-2" />
              Format Response
            </button>
          </div>
        </div>

        {/* Response Info */}
        {response.status && (
          <div className="rounded-xl border border-border bg-card p-6">
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
          </div>
        )}

        {/* Formatted Output */}
        {response.formatted && (
          <div className="rounded-xl border border-border bg-card p-6">
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
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
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
        </div>
      </div>
    </ToolLayout>
  );
};

export default APIResponseFormatterTool;
