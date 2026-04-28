import { useState } from "react";
import { Copy, Check, Download, Code, Plus, Trash2, AlertCircle, Settings, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

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
  const toolSeoData = getToolSeoMetadata('dockerfile-generator');
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

  const updateInstruction = (id: string, field: keyof DockerfileInstruction, value: string) => {
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
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "Dockerfile Generator",
        toolSeoData?.description || "Generate optimized Dockerfiles for different applications and frameworks",
        "dockerfile-generator"
      )}
      <ToolLayout
      title="Dockerfile Generator"
      description="Generate optimized Dockerfiles for different applications and frameworks"
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
              <Settings className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Dockerfile Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate optimized Dockerfiles for containerization with templates for popular frameworks
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">dockerfile generator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">docker file</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">containerization</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">docker templates</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Templates */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="font-semibold mb-4">Quick Templates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map(template => (
              <button
                type="button"
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
        </motion.div>

        {/* Instructions Editor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Dockerfile Instructions</h3>
            <button
              type="button"
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
                      type="button"
                      onClick={() => removeInstruction(instruction.id)}
                      className="text-red-500 hover:text-red-600"
                      aria-label="Remove instruction"
                      title="Remove instruction"
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
        </motion.div>

        {/* Generate Button */}
        <motion.button
          type="button"
          onClick={generateDockerfile}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-lg px-4 py-3 font-medium text-white transition-colors"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          <Code className="inline h-4 w-4 mr-2" />
          Generate Dockerfile
        </motion.button>

        {/* Generated Dockerfile */}
        {generatedDockerfile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated Dockerfile</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy("dockerfile", generatedDockerfile)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Copy generated Dockerfile"
                  title="Copy generated Dockerfile"
                >
                  {copied === "dockerfile" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={downloadDockerfile}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Download generated Dockerfile"
                  title="Download generated Dockerfile"
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
          </motion.div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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
            What is Dockerfile Generation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Dockerfile generation creates container configuration files that define how to build Docker images. It helps developers containerize applications by specifying the base image, dependencies, build instructions, and runtime configuration in a standardized format.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Add Dockerfile instructions (FROM, RUN, COPY, etc.)</li>
            <li>Configure values for each instruction</li>
            <li>Optionally use pre-built templates for common setups</li>
            <li>Generate and download the Dockerfile</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Dockerfile Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All standard instructions</li>
                <li>• Template presets</li>
                <li>• Instruction ordering</li>
                <li>• Comment support</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Application containerization</li>
                <li>• Microservices deployment</li>
                <li>• CI/CD pipelines</li>
                <li>• Development environments</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is a Dockerfile?",
            answer: "A Dockerfile is a text document that contains all the commands to assemble a Docker image. It's like a recipe that tells Docker how to build your container step by step."
          },
          {
            question: "What Dockerfile instructions are supported?",
            answer: "The tool supports all common instructions including FROM, RUN, COPY, ADD, WORKDIR, EXPOSE, CMD, ENTRYPOINT, ENV, ARG, VOLUME, USER, LABEL, MAINTAINER, and SHELL."
          },
          {
            question: "Can I use templates?",
            answer: "Yes, the tool provides pre-built templates for common setups like Node.js, Python, and static websites. These give you a starting point to customize."
          },
          {
            question: "What is the FROM instruction?",
            answer: "FROM specifies the base image to build from. Every Dockerfile must start with a FROM instruction, which sets the foundation for your container."
          },
          {
            question: "How do I optimize my Dockerfile?",
            answer: "Best practices include using multi-stage builds, combining RUN commands, using .dockerignore, and leveraging build cache for faster builds."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default DockerfileGeneratorTool;
