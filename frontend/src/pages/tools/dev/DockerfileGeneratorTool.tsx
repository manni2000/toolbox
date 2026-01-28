import { useState } from "react";
import { Copy, Check, Download, Code, Plus, Trash2, AlertCircle, Settings } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface DockerfileInstruction {
  id: string;
  instruction: 'FROM' | 'RUN' | 'COPY' | 'ADD' | 'WORKDIR' | 'EXPOSE' | 'CMD' | 'ENTRYPOINT' | 'ENV' | 'ARG' | 'VOLUME' | 'USER' | 'LABEL' | 'MAINTAINER' | 'SHELL';
  value: string;
  comment?: string;
}

interface DockerfileTemplate {
  name: string;
  description: string;
  instructions: DockerfileInstruction[];
}

const DockerfileGeneratorTool = () => {
  const [baseImage, setBaseImage] = useState('node:18-alpine');
  const [instructions, setInstructions] = useState<DockerfileInstruction[]>([
    {
      id: '1',
      instruction: 'FROM',
      value: 'node:18-alpine',
      comment: 'Use Node.js 18 Alpine image'
    },
    {
      id: '2',
      instruction: 'WORKDIR',
      value: '/app',
      comment: 'Set working directory'
    },
    {
      id: '3',
      instruction: 'COPY',
      value: 'package*.json ./',
      comment: 'Copy package files'
    },
    {
      id: '4',
      instruction: 'RUN',
      value: 'npm install',
      comment: 'Install dependencies'
    },
    {
      id: '5',
      instruction: 'COPY',
      value: '. .',
      comment: 'Copy application code'
    },
    {
      id: '6',
      instruction: 'EXPOSE',
      value: '3000',
      comment: 'Expose port 3000'
    },
    {
      id: '7',
      instruction: 'CMD',
      value: '["node", "server.js"]',
      comment: 'Start the application'
    }
  ]);

  const [generatedDockerfile, setGeneratedDockerfile] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const templates: DockerfileTemplate[] = [
    {
      name: 'Node.js Web App',
      description: 'Dockerfile for Node.js web applications',
      instructions: [
        { id: '1', instruction: 'FROM', value: 'node:18-alpine', comment: 'Use Node.js 18 Alpine image' },
        { id: '2', instruction: 'WORKDIR', value: '/app', comment: 'Set working directory' },
        { id: '3', instruction: 'COPY', value: 'package*.json ./', comment: 'Copy package files' },
        { id: '4', instruction: 'RUN', value: 'npm ci --only=production', comment: 'Install production dependencies' },
        { id: '5', instruction: 'COPY', value: '. .', comment: 'Copy application code' },
        { id: '6', instruction: 'EXPOSE', value: '3000', comment: 'Expose port 3000' },
        { id: '7', instruction: 'USER', value: 'node', comment: 'Run as non-root user' },
        { id: '8', instruction: 'CMD', value: '["node", "server.js"]', comment: 'Start the application' }
      ]
    },
    {
      name: 'Python Flask App',
      description: 'Dockerfile for Python Flask applications',
      instructions: [
        { id: '1', instruction: 'FROM', value: 'python:3.9-slim', comment: 'Use Python 3.9 Slim image' },
        { id: '2', instruction: 'WORKDIR', value: '/app', comment: 'Set working directory' },
        { id: '3', instruction: 'COPY', value: 'requirements.txt .', comment: 'Copy requirements file' },
        { id: '4', instruction: 'RUN', value: 'pip install --no-cache-dir -r requirements.txt', comment: 'Install dependencies' },
        { id: '5', instruction: 'COPY', value: '. .', comment: 'Copy application code' },
        { id: '6', instruction: 'EXPOSE', value: '5000', comment: 'Expose port 5000' },
        { id: '7', instruction: 'CMD', value: '["python", "app.py"]', comment: 'Start the Flask app' }
      ]
    },
    {
      name: 'React App',
      description: 'Dockerfile for React applications with Nginx',
      instructions: [
        { id: '1', instruction: 'FROM', value: 'node:18-alpine as build', comment: 'Build stage' },
        { id: '2', instruction: 'WORKDIR', value: '/app', comment: 'Set working directory' },
        { id: '3', instruction: 'COPY', value: 'package*.json ./', comment: 'Copy package files' },
        { id: '4', instruction: 'RUN', value: 'npm ci', comment: 'Install dependencies' },
        { id: '5', instruction: 'COPY', value: '. .', comment: 'Copy application code' },
        { id: '6', instruction: 'RUN', value: 'npm run build', comment: 'Build the application' },
        { id: '7', instruction: 'FROM', value: 'nginx:alpine', comment: 'Production stage' },
        { id: '8', instruction: 'COPY', value: '--from=build /app/build /usr/share/nginx/html', comment: 'Copy built files' },
        { id: '9', instruction: 'EXPOSE', value: '80', comment: 'Expose port 80' }
      ]
    },
    {
      name: 'Java Spring Boot',
      description: 'Dockerfile for Java Spring Boot applications',
      instructions: [
        { id: '1', instruction: 'FROM', value: 'openjdk:17-jdk-slim', comment: 'Use OpenJDK 17' },
        { id: '2', instruction: 'WORKDIR', value: '/app', comment: 'Set working directory' },
        { id: '3', instruction: 'COPY', value: 'target/*.jar app.jar', comment: 'Copy JAR file' },
        { id: '4', instruction: 'EXPOSE', value: '8080', comment: 'Expose port 8080' },
        { id: '5', instruction: 'ENTRYPOINT', value: '["java", "-jar", "app.jar"]', comment: 'Start the application' }
      ]
    }
  ];

  const addInstruction = () => {
    const newInstruction: DockerfileInstruction = {
      id: Date.now().toString(),
      instruction: 'RUN',
      value: '',
      comment: ''
    };
    setInstructions([...instructions, newInstruction]);
  };

  const removeInstruction = (id: string) => {
    setInstructions(instructions.filter(i => i.id !== id));
  };

  const updateInstruction = (id: string, field: keyof DockerfileInstruction, value: any) => {
    setInstructions(instructions.map(i => 
      i.id === id ? { ...i, [field]: value } : i
    ));
  };

  const generateDockerfile = () => {
    let dockerfile = '';
    
    instructions.forEach(instruction => {
      if (instruction.comment) {
        dockerfile += `# ${instruction.comment}\n`;
      }
      
      let line = '';
      switch (instruction.instruction) {
        case 'FROM':
        case 'WORKDIR':
        case 'EXPOSE':
        case 'USER':
        case 'SHELL':
          line = `${instruction.instruction} ${instruction.value}`;
          break;
        case 'RUN':
        case 'COPY':
        case 'ADD':
        case 'CMD':
        case 'ENTRYPOINT':
          if (instruction.value.startsWith('[') && instruction.value.endsWith(']')) {
            line = `${instruction.instruction} ${instruction.value}`;
          } else {
            line = `${instruction.instruction} ${instruction.value}`;
          }
          break;
        case 'ENV':
        case 'ARG':
        case 'LABEL':
        case 'VOLUME':
        case 'MAINTAINER':
          line = `${instruction.instruction} ${instruction.value}`;
          break;
      }
      
      dockerfile += `${line}\n\n`;
    });

    setGeneratedDockerfile(dockerfile.trim());
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadDockerfile = () => {
    const data = new Blob([generatedDockerfile], { type: 'text/plain' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setInstructions(template.instructions);
    }
  };

  const getInstructionColor = (instruction: string) => {
    switch (instruction) {
      case 'FROM': return 'bg-blue-100 text-blue-700';
      case 'RUN': return 'bg-green-100 text-green-700';
      case 'COPY': return 'bg-purple-100 text-purple-700';
      case 'ADD': return 'bg-purple-100 text-purple-700';
      case 'WORKDIR': return 'bg-orange-100 text-orange-700';
      case 'EXPOSE': return 'bg-red-100 text-red-700';
      case 'CMD': return 'bg-yellow-100 text-yellow-700';
      case 'ENTRYPOINT': return 'bg-yellow-100 text-yellow-700';
      case 'ENV': return 'bg-indigo-100 text-indigo-700';
      case 'ARG': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ToolLayout
      title="Dockerfile Generator"
      description="Generate optimized Dockerfiles for different applications and frameworks"
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
              <h3 className="text-lg font-semibold text-foreground">Dockerfile Generator</h3>
              <p className="text-sm text-muted-foreground">
                Generate optimized Dockerfiles for containerization
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
                className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <div className="text-sm font-medium">{template.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.instructions.length} instructions
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions Editor */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Dockerfile Instructions</h3>
            <button
              onClick={addInstruction}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Instruction
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((instruction) => (
              <div key={instruction.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${getInstructionColor(instruction.instruction)}`}>
                    {instruction.instruction}
                  </span>
                  {instructions.length > 1 && (
                    <button
                      onClick={() => removeInstruction(instruction.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Value</label>
                    <input
                      type="text"
                      value={instruction.value}
                      onChange={(e) => updateInstruction(instruction.id, 'value', e.target.value)}
                      placeholder="Instruction value"
                      className="w-full rounded-lg bg-muted px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                    <input
                      type="text"
                      value={instruction.comment || ''}
                      onChange={(e) => updateInstruction(instruction.id, 'comment', e.target.value)}
                      placeholder="# Instruction comment"
                      className="w-full rounded-lg bg-muted px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateDockerfile}
          className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
        >
          <Code className="inline h-4 w-4 mr-2" />
          Generate Dockerfile
        </button>

        {/* Generated Dockerfile */}
        {generatedDockerfile && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated Dockerfile</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy("dockerfile", generatedDockerfile)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "dockerfile" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={downloadDockerfile}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                {generatedDockerfile}
              </pre>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Dockerfile Best Practices
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🐳 Optimization Tips</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use multi-stage builds for smaller images</li>
                <li>• Use .dockerignore to exclude files</li>
                <li>• Combine RUN commands with &&</li>
                <li>• Use specific version tags</li>
                <li>• Run as non-root user</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">📝 Common Instructions</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>FROM:</strong> Base image</li>
                <li>• <strong>WORKDIR:</strong> Working directory</li>
                <li>• <strong>COPY/ADD:</strong> Copy files</li>
                <li>• <strong>RUN:</strong> Execute commands</li>
                <li>• <strong>EXPOSE:</strong> Expose ports</li>
                <li>• <strong>CMD:</strong> Default command</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default DockerfileGeneratorTool;
