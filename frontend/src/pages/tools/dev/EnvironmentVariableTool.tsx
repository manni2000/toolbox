import { useState } from "react";
import { Copy, Check, Download, FileText, Settings, Plus, Trash2, AlertCircle, Code } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface EnvVariable {
  id: string;
  name: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'url' | 'email';
  required: boolean;
}

interface EnvTemplate {
  name: string;
  description: string;
  variables: EnvVariable[];
}

const EnvironmentVariableTool = () => {
  const [variables, setVariables] = useState<EnvVariable[]>([
    {
      id: '1',
      name: 'API_KEY',
      value: '',
      description: 'API key for external service',
      type: 'string',
      required: true
    },
    {
      id: '2',
      name: 'DATABASE_URL',
      value: '',
      description: 'Database connection string',
      type: 'url',
      required: true
    },
    {
      id: '3',
      name: 'PORT',
      value: '3000',
      description: 'Server port number',
      type: 'number',
      required: false
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'env' | 'json' | 'yaml' | 'docker'>('env');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const templates: EnvTemplate[] = [
    {
      name: 'Node.js Web App',
      description: 'Common environment variables for Node.js applications',
      variables: [
        { id: 'node1', name: 'NODE_ENV', value: 'development', description: 'Application environment', type: 'string', required: true },
        { id: 'node2', name: 'PORT', value: '3000', description: 'Server port', type: 'number', required: false },
        { id: 'node3', name: 'DATABASE_URL', value: '', description: 'Database connection string', type: 'url', required: true },
        { id: 'node4', name: 'JWT_SECRET', value: '', description: 'JWT signing secret', type: 'string', required: true },
        { id: 'node5', name: 'CORS_ORIGIN', value: '*', description: 'CORS allowed origins', type: 'string', required: false }
      ]
    },
    {
      name: 'React App',
      description: 'Environment variables for React applications',
      variables: [
        { id: 'react1', name: 'REACT_APP_API_URL', value: 'http://localhost:3001', description: 'API base URL', type: 'url', required: true },
        { id: 'react2', name: 'REACT_APP_ENVIRONMENT', value: 'development', description: 'Build environment', type: 'string', required: false },
        { id: 'react3', name: 'REACT_APP_VERSION', value: '1.0.0', description: 'Application version', type: 'string', required: false }
      ]
    },
    {
      name: 'Python Django',
      description: 'Environment variables for Django applications',
      variables: [
        { id: 'django1', name: 'DJANGO_SETTINGS_MODULE', value: 'myproject.settings', description: 'Settings module', type: 'string', required: true },
        { id: 'django2', name: 'SECRET_KEY', value: '', description: 'Django secret key', type: 'string', required: true },
        { id: 'django3', name: 'DEBUG', value: 'True', description: 'Debug mode', type: 'boolean', required: false },
        { id: 'django4', name: 'DATABASE_URL', value: '', description: 'Database connection', type: 'url', required: true }
      ]
    },
    {
      name: 'Docker Compose',
      description: 'Environment variables for Docker services',
      variables: [
        { id: 'docker1', name: 'COMPOSE_PROJECT_NAME', value: 'myapp', description: 'Project name', type: 'string', required: false },
        { id: 'docker2', name: 'MYSQL_ROOT_PASSWORD', value: '', description: 'MySQL root password', type: 'string', required: true },
        { id: 'docker3', name: 'REDIS_PASSWORD', value: '', description: 'Redis password', type: 'string', required: false }
      ]
    }
  ];

  const addVariable = () => {
    const newVariable: EnvVariable = {
      id: Date.now().toString(),
      name: '',
      value: '',
      description: '',
      type: 'string',
      required: false
    };
    setVariables([...variables, newVariable]);
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
  };

  const updateVariable = (id: string, field: keyof EnvVariable, value: any) => {
    setVariables(variables.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const loadTemplate = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setVariables(template.variables);
      setSelectedTemplate(templateName);
    }
  };

  const generateOutput = () => {
    let output = '';

    switch (outputFormat) {
      case 'env':
        output = generateEnvFormat();
        break;
      case 'json':
        output = generateJSONFormat();
        break;
      case 'yaml':
        output = generateYAMLFormat();
        break;
      case 'docker':
        output = generateDockerFormat();
        break;
    }

    setGeneratedOutput(output);
  };

  const generateEnvFormat = (): string => {
    return variables
      .filter(v => v.name && v.value)
      .map(v => {
        const comment = v.description ? `# ${v.description}\n` : '';
        const required = v.required ? '# REQUIRED\n' : '';
        return `${comment}${required}${v.name}=${v.value}`;
      })
      .join('\n\n');
  };

  const generateJSONFormat = (): string => {
    const env: { [key: string]: string } = {};
    variables
      .filter(v => v.name && v.value)
      .forEach(v => {
        env[v.name] = v.value;
      });
    return JSON.stringify(env, null, 2);
  };

  const generateYAMLFormat = (): string => {
    const lines = ['environment:'];
    variables
      .filter(v => v.name && v.value)
      .forEach(v => {
        lines.push(`  ${v.name}: "${v.value}"`);
        if (v.description) {
          lines.push(`  # ${v.description}`);
        }
      });
    return lines.join('\n');
  };

  const generateDockerFormat = (): string => {
    const lines = ['version: "3.8"', 'services:'];
    lines.push('  app:');
    lines.push('    build: .');
    lines.push('    environment:');
    variables
      .filter(v => v.name && v.value)
      .forEach(v => {
        lines.push(`      - ${v.name}=${v.value}`);
      });
    return lines.join('\n');
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadOutput = () => {
    const extensions = {
      env: '.env',
      json: '.json',
      yaml: '.yml',
      docker: '.yml'
    };

    const data = new Blob([generatedOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environment${extensions[outputFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'string': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '☑️';
      case 'json': return '📋';
      case 'url': return '🔗';
      case 'email': return '📧';
      default: return '📄';
    }
  };

  return (
    <ToolLayout
      title="Environment Variable Generator"
      description="Generate and manage environment variables for different platforms and frameworks"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Environment Variable Generator</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage environment variables for your applications
              </p>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Quick Templates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map(template => (
              <button
                key={template.name}
                onClick={() => loadTemplate(template.name)}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedTemplate === template.name
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="text-sm font-medium">{template.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.variables.length} variables
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Variables Editor */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Environment Variables</h3>
            <button
              onClick={addVariable}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Variable
            </button>
          </div>

          <div className="space-y-4">
            {variables.map(variable => (
              <div key={variable.id} className="border border-border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => updateVariable(variable.id, 'name', e.target.value)}
                      placeholder="VARIABLE_NAME"
                      className="w-full rounded-lg bg-muted px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Value</label>
                    <input
                      type="text"
                      value={variable.value}
                      onChange={(e) => updateVariable(variable.id, 'value', e.target.value)}
                      placeholder="value"
                      className="w-full rounded-lg bg-muted px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={variable.type}
                      onChange={(e) => updateVariable(variable.id, 'type', e.target.value)}
                      className="w-full rounded-lg bg-muted px-3 py-2 text-sm"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON</option>
                      <option value="url">URL</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={variable.required}
                        onChange={(e) => updateVariable(variable.id, 'required', e.target.checked)}
                        className="rounded"
                      />
                      Required
                    </label>
                    {variables.length > 1 && (
                      <button
                        onClick={() => removeVariable(variable.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {variable.description && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={variable.description}
                      onChange={(e) => updateVariable(variable.id, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full rounded-lg bg-muted px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Output Format */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Output Format</label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setOutputFormat('env')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    outputFormat === 'env'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  .env
                </button>
                <button
                  onClick={() => setOutputFormat('json')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    outputFormat === 'json'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setOutputFormat('yaml')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    outputFormat === 'yaml'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  YAML
                </button>
                <button
                  onClick={() => setOutputFormat('docker')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    outputFormat === 'docker'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Docker
                </button>
              </div>
            </div>

            <button
              onClick={generateOutput}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              <Code className="inline h-4 w-4 mr-2" />
              Generate Output
            </button>
          </div>
        </div>

        {/* Generated Output */}
        {generatedOutput && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated Output</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy("output", generatedOutput)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "output" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={downloadOutput}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                {generatedOutput}
              </pre>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Environment Variables Best Practices
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🔒 Security</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Never commit secrets to version control</li>
                <li>• Use .env files for local development</li>
                <li>• Store secrets in environment variables</li>
                <li>• Use different configs for each environment</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">📝 Naming</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use UPPER_CASE with underscores</li>
                <li>• Be descriptive and consistent</li>
                <li>• Group related variables</li>
                <li>• Document complex configurations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default EnvironmentVariableTool;
