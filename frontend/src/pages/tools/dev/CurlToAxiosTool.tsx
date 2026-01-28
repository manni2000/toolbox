import { useState } from "react";
import { Copy, Check, Download, Code, RefreshCw, AlertCircle, Terminal } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface ConversionResult {
  axiosCode: string;
  fetchCode: string;
  javascriptCode: string;
  pythonCode: string;
}

const CurlToAxiosTool = () => {
  const [curlCommand, setCurlCommand] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'axios' | 'fetch' | 'javascript' | 'python'>('axios');
  const [copied, setCopied] = useState<string | null>(null);

  const parseCurlCommand = (curl: string): any => {
    const parsed: any = {
      method: 'GET',
      url: '',
      headers: {},
      data: null,
      params: {}
    };

    // Extract method
    const methodMatch = curl.match(/curl\s+(?:-X\s*(\w+)\s+)?/i);
    if (methodMatch && methodMatch[1]) {
      parsed.method = methodMatch[1].toUpperCase();
    }

    // Extract URL
    const urlMatch = curl.match(/(?:curl\s+(?:-X\s*\w+\s+)?)?['"]?([^'\s]+)['"]?/);
    if (urlMatch && urlMatch[1]) {
      parsed.url = urlMatch[1];
    }

    // Extract headers
    const headerMatches = curl.match(/-H\s+['"]([^'"]+)['"]?/gi);
    if (headerMatches) {
      headerMatches.forEach(match => {
        const headerMatch = match.match(/-H\s+['"]([^'"]+)['"]?/);
        if (headerMatch) {
          const [key, value] = headerMatch[1].split(':');
          if (value) {
            parsed.headers[key.trim()] = value.trim();
          } else {
            parsed.headers[key.trim()] = '';
          }
        }
      });
    }

    // Extract data
    const dataMatch = curl.match(/--data\s+['"]([^'"]+)['"]?/i);
    if (dataMatch) {
      try {
        parsed.data = JSON.parse(dataMatch[1]);
      } catch {
        parsed.data = dataMatch[1];
      }
    }

    // Extract form data
    const formMatch = curl.match(/--form\s+['"]([^'"]+)['"]?/i);
    if (formMatch) {
      const formData = new URLSearchParams();
      const formParts = formMatch[1].split('&');
      formParts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
          formData.append(key, decodeURIComponent(value));
        }
      });
      parsed.data = formData.toString();
    }

    return parsed;
  };

  const generateAxiosCode = (parsed: any): string => {
    let code = '';

    // Import statement
    code += 'import axios from "axios";\n\n';

    // Function definition
    code += 'const apiCall = async () => {\n';
    code += '  try {\n';

    // Request configuration
    const config: string[] = [];
    config.push(`    method: "${parsed.method}"`);
    config.push(`    url: "${parsed.url}"`);

    if (Object.keys(parsed.headers).length > 0) {
      const headers = Object.entries(parsed.headers)
        .map(([key, value]) => `      "${key}": "${value}"`)
        .join(',\n');
      config.push(`    headers: {\n${headers}\n    }`);
    }

    if (parsed.data) {
      if (typeof parsed.data === 'object') {
        config.push(`    data: ${JSON.stringify(parsed.data, null, 6)}`);
      } else {
        config.push(`    data: "${parsed.data}"`);
      }
    }

    code += `    const config = {\n${config.join(',\n')}\n    };\n\n`;
    code += '    const response = await axios(config);\n';
    code += '    return response.data;\n';
    code += '  } catch (error) {\n';
    code += '    console.error("Error:", error);\n';
    code += '    throw error;\n';
    code += '  }\n';
    code += '};\n\n';
    code += 'export default apiCall;';

    return code;
  };

  const generateFetchCode = (parsed: any): string => {
    let code = '';

    code += 'const apiCall = async () => {\n';
    code += '  try {\n';

    // Request configuration
    const config: string[] = [];
    config.push(`    method: "${parsed.method}"`);
    config.push(`    headers: ${JSON.stringify(parsed.headers, null, 6)}`);

    if (parsed.data) {
      if (typeof parsed.data === 'object') {
        config.push(`    body: JSON.stringify(${JSON.stringify(parsed.data, null, 6)})`);
      } else {
        config.push(`    body: "${parsed.data}"`);
      }
    }

    code += `    const config = {\n${config.join(',\n')}\n    };\n\n`;
    code += `    const response = await fetch("${parsed.url}", config);\n`;
    code += '    const data = await response.json();\n';
    code += '    return data;\n';
    code += '  } catch (error) {\n';
    code += '    console.error("Error:", error);\n';
    code += '    throw error;\n';
    code += '  }\n';
    code += '};\n\n';
    code += 'export default apiCall;';

    return code;
  };

  const generateJavaScriptCode = (parsed: any): string => {
    let code = '';

    code += 'const apiCall = async () => {\n';
    code += '  try {\n';

    // Request configuration
    const config: string[] = [];
    config.push(`    method: "${parsed.method}"`);
    config.push(`    headers: ${JSON.stringify(parsed.headers, null, 6)}`);

    if (parsed.data) {
      if (typeof parsed.data === 'object') {
        config.push(`    body: JSON.stringify(${JSON.stringify(parsed.data, null, 6)})`);
      } else {
        config.push(`    body: "${parsed.data}"`);
      }
    }

    code += `    const config = {\n${config.join(',\n')}\n    };\n\n`;
    code += `    const response = await fetch("${parsed.url}", config);\n`;
    code += '    const data = await response.json();\n';
    code += '    return data;\n';
    code += '  } catch (error) {\n';
    code += '    console.error("Error:", error);\n';
    code += '    throw error;\n';
    code += '  }\n';
    code += '};\n\n';
    code += 'export default apiCall;';

    return code;
  };

  const generatePythonCode = (parsed: any): string => {
    let code = '';

    code += 'import requests\n';
    code += 'import json\n\n';

    code += 'def api_call():\n';
    code += '    try:\n';

    // Request configuration
    code += `        url = "${parsed.url}"\n`;
    code += `        method = "${parsed.method}"\n`;

    if (Object.keys(parsed.headers).length > 0) {
      const headers = Object.entries(parsed.headers)
        .map(([key, value]) => `            "${key}": "${value}"`)
        .join(',\n');
      code += `        headers = {\n${headers}\n        }\n`;
    }

    if (parsed.data) {
      if (typeof parsed.data === 'object') {
        code += `        data = ${JSON.stringify(parsed.data, null, 8)}\n`;
      } else {
        code += `        data = "${parsed.data}"\n`;
      }
    }

    code += '\n        response = requests.request(\n';
    code += '            method=method,\n';
    code += '            url=url,\n';
    if (parsed.headers) code += '            headers=headers,\n';
    if (parsed.data) code += '            data=data,\n';
    code += '        )\n\n';
    code += '        response.raise_for_status()\n';
    code += '        return response.json()\n';
    code += '    except requests.exceptions.RequestException as e:\n';
    code += '        print(f"Error: {e}")\n';
    code += '        raise\n';

    return code;
  };

  const convertCurl = () => {
    try {
      const parsed = parseCurlCommand(curlCommand);
      
      const result: ConversionResult = {
        axiosCode: generateAxiosCode(parsed),
        fetchCode: generateFetchCode(parsed),
        javascriptCode: generateJavaScriptCode(parsed),
        pythonCode: generatePythonCode(parsed)
      };

      setConversionResult(result);
    } catch (error) {
      setConversionResult({
        axiosCode: '// Error: Invalid cURL command',
        fetchCode: '// Error: Invalid cURL command',
        javascriptCode: '// Error: Invalid cURL command',
        pythonCode: '# Error: Invalid cURL command'
      });
    }
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCode = () => {
    if (!conversionResult) return;

    const code = conversionResult[`${selectedLanguage}Code`];
    const data = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-call.${selectedLanguage === 'python' ? 'py' : 'js'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    const exampleCurl = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name": "John Doe", "email": "john@example.com"}'`;
    
    setCurlCommand(exampleCurl);
  };

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'axios': return '⚡';
      case 'fetch': return '🌐';
      case 'javascript': return '📜';
      case 'python': return '🐍';
      default: return '💻';
    }
  };

  return (
    <ToolLayout
      title="cURL to Axios Converter"
      description="Convert cURL commands to Axios, Fetch, JavaScript, and Python code"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">cURL to Code Converter</h3>
              <p className="text-sm text-muted-foreground">
                Convert cURL commands to multiple programming languages
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">cURL Command</label>
              <textarea
                value={curlCommand}
                onChange={(e) => setCurlCommand(e.target.value)}
                placeholder="Paste your cURL command here..."
                rows={6}
                className="w-full rounded-lg bg-muted px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a cURL command to convert to code
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={convertCurl}
                disabled={!curlCommand.trim()}
                className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="inline h-4 w-4 mr-2" />
                Convert
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

        {/* Language Selection */}
        {conversionResult && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Output Language</label>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedLanguage('axios')}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedLanguage === 'axios'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>⚡</span>
                    Axios
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('fetch')}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedLanguage === 'fetch'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>🌐</span>
                    Fetch
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('javascript')}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedLanguage === 'javascript'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>📜</span>
                    JavaScript
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('python')}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedLanguage === 'python'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>🐍</span>
                    Python
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Code */}
        {conversionResult && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Generated {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Code
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(selectedLanguage, conversionResult[`${selectedLanguage}Code`])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === selectedLanguage ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={downloadCode}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                {conversionResult[`${selectedLanguage}Code`]}
              </pre>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            cURL Conversion Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🔧 Supported Features</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HTTP methods (GET, POST, PUT, DELETE)</li>
                <li>• Custom headers and authentication</li>
                <li>• JSON and form data</li>
                <li>• Query parameters</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">📝 Output Formats</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Axios:</strong> Popular HTTP client library</li>
                <li>• <strong>Fetch:</strong> Native browser API</li>
                <li>• <strong>JavaScript:</strong> Vanilla JS with Fetch</li>
                <li>• <strong>Python:</strong> Requests library</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CurlToAxiosTool;
