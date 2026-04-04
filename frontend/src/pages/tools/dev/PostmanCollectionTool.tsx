import { useState } from "react";
import { Copy, Check, Download, FileText, Plus, Trash2, AlertCircle, Code, Send, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "210 80% 55%";

interface PostmanRequestBody {
  mode: 'raw' | 'formdata' | 'urlencoded';
  raw?: string;
  formdata?: Array<{ key: string; value: string; type: string; }>;
  urlencoded?: Array<{ key: string; value: string; }>;
}

interface PostmanRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: { [key: string]: string };
  body?: PostmanRequestBody;
  description?: string;
  tests?: string;
}

interface PostmanCollectionItem {
  name: string;
  request: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    header: Array<{ key: string; value: string; type: string; }>;
    url: {
      raw: string;
      host: string;
      path: string[];
      protocol: string;
    };
    body?: PostmanRequestBody;
    description?: string;
  };
  response: never[];
  event?: Array<{
    listen: 'test';
    script: {
      exec: string[];
    };
  }>;
}

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanCollectionItem[];
}

const PostmanCollectionTool = () => {
  const [collectionName, setCollectionName] = useState('API Collection');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [requests, setRequests] = useState<PostmanRequest[]>([
    {
      id: '1',
      name: 'Get Users',
      method: 'GET',
      url: 'https://api.example.com/users',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{token}}'
      },
      description: 'Retrieve all users'
    }
  ]);

  const [generatedCollection, setGeneratedCollection] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const addRequest = () => {
    const newRequest: PostmanRequest = {
      id: Date.now().toString(),
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: {},
      body: {
        mode: 'raw',
        raw: ''
      }
    };
    setRequests([...requests, newRequest]);
  };

  const removeRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const updateRequest = (id: string, field: keyof PostmanRequest, value: string | PostmanRequestBody | undefined) => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const addHeader = (requestId: string) => {
    setRequests(requests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          headers: { ...r.headers, '': '' }
        };
      }
      return r;
    }));
  };

  const updateHeader = (requestId: string, oldKey: string, newKey: string, value: string) => {
    setRequests(requests.map(r => {
      if (r.id === requestId) {
        const newHeaders = { ...r.headers };
        delete newHeaders[oldKey];
        newHeaders[newKey] = value;
        return { ...r, headers: newHeaders };
      }
      return r;
    }));
  };

  const removeHeader = (requestId: string, key: string) => {
    setRequests(requests.map(r => {
      if (r.id === requestId) {
        const newHeaders = { ...r.headers };
        delete newHeaders[key];
        return { ...r, headers: newHeaders };
      }
      return r;
    }));
  };

  const generateCollection = () => {
    const collection: PostmanCollection = {
      info: {
        name: collectionName,
        description: collectionDescription,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: requests.map(request => ({
        name: request.name,
        request: {
          method: request.method,
          header: Object.entries(request.headers).map(([key, value]) => ({
            key,
            value,
            type: 'text'
          })),
          url: {
            raw: request.url,
            host: new URL(request.url).hostname,
            path: new URL(request.url).pathname.split('/').filter(p => p),
            protocol: new URL(request.url).protocol.replace(':', '')
          },
          body: request.body,
          description: request.description
        },
        response: [],
        event: request.tests ? [{
          listen: 'test',
          script: {
            exec: request.tests.split('\n')
          }
        }] : []
      }))
    };

    setGeneratedCollection(JSON.stringify(collection, null, 2));
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCollection = () => {
    const data = new Blob([generatedCollection], { type: 'application/json' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collectionName.replace(/\s+/g, '-').toLowerCase()}.postman_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    const exampleRequests: PostmanRequest[] = [
      {
        id: '1',
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{token}}'
        },
        description: 'Retrieve all users',
        tests: 'pm.test("Status code is 200", function () {\n    pm.response.to.have.status(200);\n});'
      },
      {
        id: '2',
        name: 'Create User',
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
          }, null, 2)
        },
        description: 'Create a new user',
        tests: 'pm.test("Status code is 201", function () {\n    pm.response.to.have.status(201);\n});'
      },
      {
        id: '3',
        name: 'Update User',
        method: 'PUT',
        url: 'https://api.example.com/users/{{userId}}',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{token}}'
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            name: 'Jane Doe',
            email: 'jane@example.com'
          }, null, 2)
        },
        description: 'Update user information'
      },
      {
        id: '4',
        name: 'Delete User',
        method: 'DELETE',
        url: 'https://api.example.com/users/{{userId}}',
        headers: {
          'Authorization': 'Bearer {{token}}'
        },
        description: 'Delete a user',
        tests: 'pm.test("Status code is 204", function () {\n    pm.response.to.have.status(204);\n});'
      }
    ];

    setRequests(exampleRequests);
    setCollectionName('User Management API');
    setCollectionDescription('Complete CRUD operations for user management');
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-700';
      case 'POST': return 'bg-blue-100 text-blue-700';
      case 'PUT': return 'bg-orange-100 text-orange-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'PATCH': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ToolLayout
      title="Postman Collection Generator"
      description="Generate Postman collections for API testing and documentation"
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
              <Send className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Postman Collection Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create Postman collections for API testing and documentation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Collection Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Collection Name</label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="API Collection"
                className="w-full rounded-lg bg-muted px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={collectionDescription}
                onChange={(e) => setCollectionDescription(e.target.value)}
                placeholder="Collection description..."
                rows={2}
                className="w-full rounded-lg bg-muted px-4 py-3 resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">API Requests</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadExample}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
              >
                Load Example
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={addRequest}
                className="flex items-center gap-2 rounded-lg text-white px-4 py-2 text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
              >
                <Plus className="h-4 w-4" />
                Add Request
              </motion.button>
            </div>
          </div>

          {requests.map((request, index) => (
            <motion.div 
              key={request.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${getMethodColor(request.method)}`}>
                    {request.method}
                  </span>
                  <input
                    type="text"
                    value={request.name}
                    onChange={(e) => updateRequest(request.id, 'name', e.target.value)}
                    placeholder="Request name"
                    title="Request name"
                    aria-label="Request name"
                    className="font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
                  />
                </div>
                {requests.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequest(request.id)}
                    title="Remove request"
                    aria-label="Remove request"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <input
                    type="text"
                    value={request.url}
                    onChange={(e) => updateRequest(request.id, 'url', e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className="w-full rounded-lg bg-muted px-4 py-3 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={request.description || ''}
                    onChange={(e) => updateRequest(request.id, 'description', e.target.value)}
                    placeholder="Request description..."
                    className="w-full rounded-lg bg-muted px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Headers</label>
                    <button
                      type="button"
                      onClick={() => addHeader(request.id)}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20"
                    >
                      + Add Header
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(request.headers).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            updateHeader(request.id, key, newKey, value);
                          }}
                          placeholder="Header name"
                          className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateHeader(request.id, key, key, e.target.value)}
                          placeholder="Header value"
                          className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm"
                        />
                        {key && (
                          <button
                            type="button"
                            onClick={() => removeHeader(request.id, key)}
                            title="Remove header"
                            aria-label="Remove header"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Body (JSON)</label>
                  <textarea
                    value={request.body?.raw || ''}
                    onChange={(e) => updateRequest(request.id, 'body', { 
                      ...request.body, 
                      mode: 'raw', 
                      raw: e.target.value 
                    })}
                    placeholder='{"key": "value"}'
                    rows={3}
                    className="w-full rounded-lg bg-muted px-4 py-3 font-mono text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tests (JavaScript)</label>
                  <textarea
                    value={request.tests || ''}
                    onChange={(e) => updateRequest(request.id, 'tests', e.target.value)}
                    placeholder="// Postman test scripts"
                    rows={3}
                    className="w-full rounded-lg bg-muted px-4 py-3 font-mono text-sm resize-none"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={generateCollection}
          className="w-full rounded-lg text-white px-4 py-3 font-medium transition-colors"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          <Code className="inline h-4 w-4 mr-2" />
          Generate Collection
        </motion.button>

        {/* Generated Collection */}
        {generatedCollection && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated Collection</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  title="Copy collection to clipboard"
                  onClick={() => handleCopy("collection", generatedCollection)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "collection" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  title="Download collection as JSON file"
                  onClick={downloadCollection}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                {generatedCollection}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Postman Collection Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">📝 Collection Features</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multiple HTTP methods support</li>
                <li>• Custom headers and body</li>
                <li>• Test scripts for validation</li>
                <li>• Environment variables ({'{' + '{' + 'variable' + '}' + '}'})</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🔧 Best Practices</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use descriptive request names</li>
                <li>• Add proper documentation</li>
                <li>• Include test assertions</li>
                <li>• Organize requests logically</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default PostmanCollectionTool;
