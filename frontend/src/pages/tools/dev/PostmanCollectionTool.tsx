import { useState } from "react";
import { Copy, Check, Download, FileText, Plus, Trash2, AlertCircle, Code, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "210 80% 55%";

interface PostmanRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: { [key: string]: string };
  body?: {
    mode: 'raw' | 'formdata' | 'urlencoded';
    raw?: string;
    formdata?: Array<{ key: string; value: string; type: string; }>;
    urlencoded?: Array<{ key: string; value: string; }>;
  };
  description?: string;
  tests?: string;
}

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanRequest[];
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

  const updateRequest = (id: string, field: keyof PostmanRequest, value: any) => {
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
      })) as any
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
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Postman Collection Generator</h3>
              <p className="text-sm text-muted-foreground">
                Create Postman collections for API testing and documentation
              </p>
            </div>
          </div>
        </div>

        {/* Collection Info */}
        <div className="rounded-xl border border-border bg-card p-6">
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
        </div>

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
              <button
                type="button"
                onClick={addRequest}
                className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Request
              </button>
            </div>
          </div>

          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-border bg-card p-6">
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
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={generateCollection}
          className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
        >
          <Code className="inline h-4 w-4 mr-2" />
          Generate Collection
        </button>

        {/* Generated Collection */}
        {generatedCollection && (
          <div className="rounded-xl border border-border bg-card p-6">
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
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
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
        </div>
      </div>
    </ToolLayout>
  );
};

export default PostmanCollectionTool;
