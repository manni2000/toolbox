import { useState } from "react";
import { Copy, Check, Download, Code, FileText, Zap, AlertCircle, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface TypeProperty {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

interface GeneratedInterface {
  name: string;
  properties: TypeProperty[];
  interfaceCode: string;
}

const JsonToTypeScriptTool = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [interfaceName, setInterfaceName] = useState('ApiResponse');
  const [generatedInterface, setGeneratedInterface] = useState<GeneratedInterface | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const inferType = (value: any, key: string): string => {
    if (value === null || value === undefined) return 'any';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]';
      const itemType = inferType(value[0], key);
      return `${itemType}[]`;
    }
    if (typeof value === 'object') {
      if (value instanceof Date) return 'Date';
      if (value instanceof RegExp) return 'RegExp';
      return 'object';
    }
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'any';
  };

  const generateInterface = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const properties: TypeProperty[] = [];
      
      const analyzeObject = (obj: any, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const propertyName = prefix ? `${prefix}.${key}` : key;
          const type = inferType(value, propertyName);
          const optional = value === null || value === undefined;
          
          properties.push({
            name: propertyName,
            type,
            optional,
            description: `Property ${propertyName} of type ${type}`
          });
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            analyzeObject(value, propertyName);
          }
        });
      };
      
      analyzeObject(parsed);
      
      const interfaceCode = generateTypeScriptCode(interfaceName, properties);
      
      setGeneratedInterface({
        name: interfaceName,
        properties,
        interfaceCode
      });
    } catch (error) {
      setGeneratedInterface({
        name: interfaceName,
        properties: [],
        interfaceCode: `// Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`
      });
    }
  };

  const generateTypeScriptCode = (name: string, properties: TypeProperty[]): string => {
    let code = `interface ${name} {\n`;
    
    properties.forEach(prop => {
      const optional = prop.optional ? '?' : '';
      const description = prop.description ? `  // ${prop.description}\n` : '';
      code += `${description}  ${prop.name}${optional}: ${prop.type};\n`;
    });
    
    code += '}';
    return code;
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadInterface = () => {
    if (!generatedInterface) return;
    
    const data = new Blob([generatedInterface.interfaceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedInterface.name.toLowerCase()}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    const exampleJson = {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "Software developer with 5 years of experience",
        "location": {
          "city": "San Francisco",
          "country": "USA",
          "coordinates": {
            "lat": 37.7749,
            "lng": -122.4194
          }
        }
      },
      "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
      "projects": [
        {
          "id": 1,
          "title": "E-commerce Platform",
          "description": "Full-stack e-commerce solution",
          "technologies": ["React", "Node.js", "MongoDB"],
          "completed": true
        }
      ]
    };
    
    setJsonInput(JSON.stringify(exampleJson, null, 2));
  };

  return (
    <ToolLayout
      title="JSON to TypeScript Interface Generator"
      description="Convert JSON objects to TypeScript interfaces with automatic type inference"
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
              <h3 className="text-lg font-semibold text-foreground">JSON to TypeScript Interface</h3>
              <p className="text-sm text-muted-foreground">
                Generate TypeScript interfaces from JSON with automatic type inference
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Interface Name</label>
              <input
                type="text"
                value={interfaceName}
                onChange={(e) => setInterfaceName(e.target.value)}
                placeholder="ApiResponse"
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">JSON Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON here..."
                rows={8}
                className="w-full rounded-lg bg-muted px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste valid JSON to generate TypeScript interfaces
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={generateInterface}
                disabled={!jsonInput.trim()}
                className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="inline h-4 w-4 mr-2" />
                Generate Interface
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

        {/* Generated Interface */}
        {generatedInterface && (
          <div className="space-y-6">
            {/* Interface Properties */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Interface Properties</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {generatedInterface.properties.map((prop, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{prop.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          prop.optional ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {prop.optional ? 'Optional' : 'Required'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{prop.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Code */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Generated TypeScript Code</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy("interface", generatedInterface.interfaceCode)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied === "interface" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={downloadInterface}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {generatedInterface.interfaceCode}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            TypeScript Interface Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🔍 Type Inference</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatically detects primitive types</li>
                <li>• Handles nested objects and arrays</li>
                <li>• Identifies optional properties</li>
                <li>• Recognizes common types (Date, RegExp)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">✨ Best Practices</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use descriptive property names</li>
                <li>• Mark optional properties with ?</li>
                <li>• Add JSDoc comments for documentation</li>
                <li>• Use proper TypeScript naming conventions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonToTypeScriptTool;
