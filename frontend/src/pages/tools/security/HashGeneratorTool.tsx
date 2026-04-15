import { useState } from "react";
import { Copy, Check, Hash, Sparkles, Settings } from "lucide-react";
import CryptoJS from "crypto-js";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "0 80% 55%";

const HashGeneratorTool = () => {
  const [input, setInput] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const hashes = input
    ? {
        MD5: CryptoJS.MD5(input).toString(),
        "SHA-1": CryptoJS.SHA1(input).toString(),
        "SHA-256": CryptoJS.SHA256(input).toString(),
        "SHA-384": CryptoJS.SHA384(input).toString(),
        "SHA-512": CryptoJS.SHA512(input).toString(),
      }
    : null;

  const handleCopy = async (algorithm: string, hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(algorithm);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate MD5, SHA-1, SHA-256, and more hashes"
      category="Security Tools"
      categoryPath="/category/security"
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
              <Hash className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Hash Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate MD5, SHA-1, SHA-256, and more hashes instantly
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="mb-2 block text-sm font-medium">
            Text to Hash
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to generate hashes..."
            className="input-tool min-h-[120px]"
          />
        </motion.div>

        {/* Results */}
        {hashes && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Generated Hashes</h3>
            {Object.entries(hashes).map(([algorithm, hash]) => (
              <div
                key={algorithm}
                className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
                    <span className="text-sm font-medium">{algorithm}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(algorithm, hash)}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copiedHash === algorithm ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <code className="block break-all rounded bg-muted p-3 font-mono text-sm">
                  {hash}
                </code>
              </div>
            ))}
          </motion.div>
        )}

        {!input && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center"
          >
            <Hash className="mx-auto h-12 w-12" style={{ color: `hsl(${categoryColor} / 0.5)` }} />
            <p className="mt-4 text-muted-foreground">
              Enter text above to generate hashes
            </p>
          </motion.div>
        )}

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default HashGeneratorTool;
