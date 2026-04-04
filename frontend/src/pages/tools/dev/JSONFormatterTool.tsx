import { useState } from "react";
import { Copy, Check, FileJson, AlertCircle, CheckCircle, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "210 80% 55%";

const JSONFormatterTool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  const formatJSON = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, validate, and beautify JSON data"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
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
              <FileJson className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">JSON Formatter</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Format, validate, and beautify JSON data with customizable indentation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <label htmlFor="indent-size" className="text-sm font-medium">Indent:</label>
            <select
              id="indent-size"
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="input-tool w-20 py-2"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>
          <motion.button 
            onClick={formatJSON} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 text-white"
            style={{
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            }}
          >
            <FileJson className="h-4 w-4" />
            Format
          </motion.button>
          <button onClick={minifyJSON} className="btn-secondary">
            Minify
          </button>
          <button onClick={handlePaste} className="btn-secondary">
            Paste from Clipboard
          </button>
        </motion.div>

        {/* Status */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-5 w-5" />
            <span>Invalid JSON: {error}</span>
          </motion.div>
        )}
        {output && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Valid JSON</span>
          </motion.div>
        )}

        {/* Input/Output */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500">
            <label className="mb-2 block text-sm font-medium">Input JSON</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="input-tool min-h-[400px] font-mono text-sm"
            />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Formatted Output</label>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
              className="input-tool min-h-[400px] font-mono text-sm"
            />
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default JSONFormatterTool;
