import { useState } from "react";
import { Copy, Check, Link, Unlink, Sparkles, Settings, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

const URLEncoderTool = () => {
  const toolSeoData = getToolSeoMetadata('url-encoder-decoder');
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
        setOutput(encodeURIComponent(input));
        setError("");
      } else {
        setOutput(decodeURIComponent(input));
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

  return (
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "URL Encoder/Decoder",
        toolSeoData?.description || "Encode or decode URLs and query parameters",
        "url-encoder-decoder"
      )}
      <ToolLayout
      title={toolSeoData?.title || "URL Encoder/Decoder"}
      description={toolSeoData?.description || "Encode or decode URLs and query parameters"}
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-2xl space-y-6">
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
              <Link className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">URL Encoder/Decoder</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Encode or decode URLs and query parameters for web development
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
          <button
            onClick={() => { setMode("encode"); setOutput(""); setError(""); }}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              mode === "encode"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Link className="h-4 w-4" />
            Encode
          </button>
          <button
            onClick={() => { setMode("decode"); setOutput(""); setError(""); }}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              mode === "decode"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Unlink className="h-4 w-4" />
            Decode
          </button>
        </motion.div>

        {/* Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="mb-2 block text-sm font-medium">
            {mode === "encode" ? "Text to Encode" : "URL to Decode"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Hello World! Special chars: #&=" : "Hello%20World%21"}
            className="input-tool min-h-[120px] font-mono text-sm"
          />
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={convert} 
          className="w-full rounded-lg py-3 font-medium text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          {mode === "encode" ? "Encode URL" : "Decode URL"}
        </motion.button>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}

        {/* Output */}
        {output && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Result</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
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
            <div className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm break-all">
              {output}
            </div>
          </motion.div>
        )}

        {/* Tips Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            URL Encoding Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Special characters like spaces become %20</li>
            <li>• Use encoding for query parameters with special characters</li>
            <li>• Decoding converts %XX sequences back to characters</li>
          </ul>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-8">
        <ToolFAQ faqs={[
          {
            question: "Why do I need URL encoding?",
            answer: "URL encoding ensures that special characters (like spaces, symbols, and non-ASCII characters) are safely transmitted in URLs without breaking the link or causing errors."
          },
          {
            question: "What characters get encoded?",
            answer: "Characters that are not allowed in URLs, such as spaces, quotes, angle brackets, and non-ASCII characters, are encoded. Letters, numbers, and some symbols like hyphen and underscore don't need encoding."
          },
          {
            question: "Can I decode encoded URLs?",
            answer: "Yes, switch to decode mode to convert encoded URLs back to their original, readable format. This is useful for debugging or reading encoded parameters."
          },
          {
            question: "What is the encoding format?",
            answer: "URL encoding uses percent-encoding, where each special character is replaced by a % sign followed by two hexadecimal digits representing the character's ASCII value."
          },
          {
            question: "Is my data stored or sent to servers?",
            answer: "No, all encoding and decoding happens locally in your browser. Your data is never sent to any server, ensuring complete privacy."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default URLEncoderTool;
