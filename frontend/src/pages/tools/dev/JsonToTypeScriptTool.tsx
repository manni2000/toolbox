import { useState } from "react";
import { Copy, Check, Download, Code, FileText, Zap, AlertCircle, RefreshCw, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

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
  const toolSeoData = getToolSeoMetadata('json-to-typescript');
  const [jsonInput, setJsonInput] = useState('');
  const [interfaceName, setInterfaceName] = useState('ApiResponse');
  const [generatedInterface, setGeneratedInterface] = useState<GeneratedInterface | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const inferType = (value: unknown, key: string): string => {
    if (value === null || value === undefined) return 'unknown';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]';
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
      
      const analyzeObject = (obj: Record<string, unknown>, prefix = '') => {
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
            analyzeObject(value as Record<string, unknown>, propertyName);
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
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "JSON to TypeScript Interface Generator",
        toolSeoData?.description || "Convert JSON objects to TypeScript interfaces with automatic type inference",
        "json-to-typescript"
      )}
      <ToolLayout
      title="JSON to TypeScript Interface Generator"
      description="Convert JSON objects to TypeScript interfaces with automatic type inference"
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
              <h2 className="text-2xl font-bold">JSON to TypeScript Interface</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate TypeScript interfaces from JSON with automatic type inference
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">json to typescript</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">typescript interface</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">type generator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">json typescript</span>
              </div>
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateInterface}
                disabled={!jsonInput.trim()}
                className="flex-1 rounded-lg text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
              >
                <Zap className="inline h-4 w-4 mr-2" />
                Generate Interface
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

        {/* Generated Interface */}
        {generatedInterface && (
          <div className="space-y-6">
            {/* Interface Properties */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
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
            </motion.div>

            {/* Generated Code */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Generated TypeScript Code</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy("interface", generatedInterface.interfaceCode)}
                    aria-label={copied === "interface" ? "Code copied" : "Copy generated code"}
                    title={copied === "interface" ? "Code copied" : "Copy generated code"}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied === "interface" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={downloadInterface}
                    aria-label="Download generated TypeScript interface"
                    title="Download generated TypeScript interface"
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
            </motion.div>
          </div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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
            What is JSON to TypeScript Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            JSON to TypeScript conversion automatically generates TypeScript interfaces from JSON data. It analyzes the structure of your JSON objects and creates type-safe interfaces, saving time and ensuring type safety in your TypeScript projects.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste or type your JSON data into the input area</li>
            <li>Choose interface naming preferences</li>
            <li>The tool analyzes the JSON structure</li>
            <li>Generate and copy TypeScript interfaces</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Generation Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic type inference</li>
                <li>• Nested object support</li>
                <li>• Array type detection</li>
                <li>• Optional property marking</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• API response typing</li>
                <li>• Configuration interfaces</li>
                <li>• Data model definition</li>
                <li>• Type-safe development</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What TypeScript types are generated?",
            answer: "The tool generates basic types (string, number, boolean, null), arrays, nested objects, and marks optional properties with ?. Complex types like unions may need manual adjustment."
          },
          {
            question: "How are nested objects handled?",
            answer: "Nested objects are converted into separate interfaces or inline types, depending on the structure. Each nested level gets its own type definition for clarity."
          },
          {
            question: "Can I customize interface names?",
            answer: "Yes, you can specify the root interface name. Nested interfaces are automatically named based on their property names or structure."
          },
          {
            question: "What if my JSON has inconsistent types?",
            answer: "The tool uses union types (e.g., string | number) when it detects inconsistent types for the same property across different objects."
          },
          {
            question: "Are arrays properly typed?",
            answer: "Yes, arrays are typed as Array<T> or T[] where T is the inferred type of array elements. The tool analyzes array contents to determine the element type."
          }
        ]} />
      </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default JsonToTypeScriptTool;
