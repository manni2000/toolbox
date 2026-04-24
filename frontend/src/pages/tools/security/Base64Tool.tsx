import { useState } from "react";
import { Copy, Check, Lock, Unlock, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "0 80% 55%";

const Base64Tool = () => {
  const toolSeoData = getToolSeoMetadata('base64-encoder-decoder');
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
        setError("");
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
        setError("");
      }
    } catch (e) {
      setError("Invalid input for " + (mode === "decode" ? "decoding" : "encoding"));
      setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swap = () => {
    setInput(output);
    setOutput("");
    setMode(mode === "encode" ? "decode" : "encode");
    setError("");
  };

  return (
    <>
      {CategorySEO.Security(
        toolSeoData?.title || "Base64 Encode/Decode",
        toolSeoData?.description || "Encode or decode Base64 strings",
        "base64-tool"
      )}
      <ToolLayout
      title={toolSeoData?.title || "Base64 Encode/Decode"}
      description={toolSeoData?.description || "Encode or decode Base64 strings"}
      category="Security Tools"
      categoryPath="/category/security"
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
              <Lock className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Base64 Encode/Decode</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Encode or decode Base64 strings quickly and securely
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-2"
        >
          <motion.button
            onClick={() => { setMode("encode"); setOutput(""); setError(""); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              mode === "encode"
                ? "text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={mode === "encode" ? {
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            } : undefined}
          >
            <Lock className="h-4 w-4" />
            Encode
          </motion.button>
          <motion.button
            onClick={() => { setMode("decode"); setOutput(""); setError(""); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              mode === "decode"
                ? "text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={mode === "decode" ? {
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            } : undefined}
          >
            <Unlock className="h-4 w-4" />
            Decode
          </motion.button>
        </motion.div>

        {/* Input/Output */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500">
            <label className="mb-2 block text-sm font-medium">
              {mode === "encode" ? "Plain Text" : "Base64 String"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
              className="input-tool min-h-[200px] font-mono text-sm"
            />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </label>
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
              placeholder="Output will appear here..."
              className="input-tool min-h-[200px] font-mono text-sm"
            />
          </div>
        </motion.div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4"
        >
          <motion.button 
            onClick={convert} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 text-white"
            style={{
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            }}
          >
            {mode === "encode" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {mode === "encode" ? "Encode" : "Decode"}
          </motion.button>
          <button onClick={swap} disabled={!output} className="btn-secondary">
            Swap & Convert Back
          </button>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            What is Base64 Encoding?
          </h3>
          <p className="text-muted-foreground mb-4">
            Base64 encoding converts binary data into ASCII text format for safe transmission over text-based protocols. It's commonly used for encoding data in URLs, email attachments, and storing binary data in text formats like JSON or XML.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter text or upload a file</li>
            <li>The tool encodes to Base64 format</li>
            <li>Copy the Base64 string</li>
            <li>Or decode Base64 back to original</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Encoding Uses</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Data transmission</li>
                <li>• Email attachments</li>
                <li>• URL-safe encoding</li>
                <li>• Data storage</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Security Features</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Client-side processing</li>
                <li>• No data stored</li>
                <li>• Instant results</li>
                <li>• Privacy focused</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why use Base64 encoding?",
            answer: "Base64 allows binary data to be transmitted over text-based protocols that don't support raw binary. It's essential for embedding images in HTML, sending files via email, and storing binary data in text formats."
          },
          {
            question: "Does Base64 increase file size?",
            answer: "Yes, Base64 encoding increases file size by approximately 33%. This is due to the encoding overhead. Use it when necessary for compatibility, but be aware of the size increase."
          },
          {
            question: "Is Base64 encryption?",
            answer: "No, Base64 is encoding, not encryption. It's easily reversible and provides no security. Anyone can decode Base64 data. For security, use proper encryption algorithms like AES."
          },
          {
            question: "Can I encode large files with Base64?",
            answer: "You can encode large files, but be aware of the 33% size increase. For very large files, the Base64 string may be too long for some applications. Consider chunking for large data."
          },
          {
            question: "What's URL-safe Base64?",
            answer: "URL-safe Base64 replaces characters that have special meaning in URLs (+ and /) with alternatives (- and _). This makes Base64 strings safe to use in URLs without encoding."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default Base64Tool;
