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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-500" />
            What is Hash Generation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Hash generation creates fixed-size cryptographic hashes from input data. Hashes are one-way functions that uniquely identify data without revealing the original content, essential for data integrity verification and secure password storage.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter text or upload a file</li>
            <li>Select hash algorithm (MD5, SHA-1, SHA-256, etc.)</li>
            <li>The tool generates the hash</li>
            <li>Copy the hash for verification</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Hash Algorithms</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• MD5 (fast, legacy)</li>
                <li>• SHA-1 (deprecated)</li>
                <li>• SHA-256 (recommended)</li>
                <li>• SHA-512 (high security)</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Password verification</li>
                <li>• Data integrity checks</li>
                <li>• File verification</li>
                <li>• Digital signatures</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What's the difference between MD5 and SHA-256?",
            answer: "MD5 is faster but considered cryptographically broken for security. SHA-256 is more secure and recommended for modern applications. MD5 is still used for checksums where security isn't critical."
          },
          {
            question: "Can hash be reversed to get original data?",
            answer: "No, cryptographic hash functions are one-way. You cannot reverse a hash to get the original data. This is why they're used for password storage and data integrity verification."
          },
          {
            question: "Why do hashes have fixed length?",
            answer: "Hash algorithms produce fixed-length outputs regardless of input size. This ensures consistent storage and comparison. Different algorithms produce different hash lengths (e.g., MD5 is 32 hex characters)."
          },
          {
            question: "Can two different inputs have the same hash?",
            answer: "This is called a collision. While theoretically possible, it's extremely unlikely with modern algorithms like SHA-256. MD5 and SHA-1 have known vulnerabilities making collisions more feasible."
          },
          {
            question: "Should I hash passwords before storing?",
            answer: "Yes, always hash passwords before storing them. Use strong algorithms like bcrypt, Argon2, or SHA-256 with salt. Never store passwords in plain text."
          }
        ]} />
      </div>
    </ToolLayout>
  );
};

export default HashGeneratorTool;
