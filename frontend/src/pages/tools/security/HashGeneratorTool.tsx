import { useState } from "react";
import { Copy, Check, Hash, Sparkles } from "lucide-react";
import CryptoJS from "crypto-js";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

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
        {/* Input */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Text to Hash
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to generate hashes..."
            className="input-tool min-h-[120px]"
          />
        </div>

        {/* Results */}
        {hashes && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Hashes</h3>
            {Object.entries(hashes).map(([algorithm, hash]) => (
              <div
                key={algorithm}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
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
          </div>
        )}

        {!input && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <Hash className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Enter text above to generate hashes
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default HashGeneratorTool;
