import { useState } from "react";
import { Copy, Check, RefreshCw, Key, Sparkles, Settings, Hash } from "lucide-react";
import { v4 as uuidv4, v1 as uuidv1 } from "uuid";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "0 80% 55%";

const UUIDGeneratorTool = () => {
  const toolSeoData = getToolSeoMetadata('uuid-generator');
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<"v4" | "v1">("v4");
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const generateUUIDs = () => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let uuid = version === "v4" ? uuidv4() : uuidv1();
      if (uppercase) uuid = uuid.toUpperCase();
      newUuids.push(uuid);
    }
    setUuids(newUuids);
  };

  const handleCopy = async (index: number) => {
    await navigator.clipboard.writeText(uuids[index]);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopied(-1);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      {CategorySEO.Security(
        toolSeoData?.title || "UUID Generator",
        toolSeoData?.description || "Generate unique UUIDs instantly",
        "uuid-generator"
      )}
      <ToolLayout
      title="UUID Generator"
      description="Generate unique UUIDs instantly"
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
                <h2 className="text-2xl font-bold">UUID Generator</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate unique UUIDs instantly.
                </p>
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">uuid generator</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">unique id</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">generate uuid</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">random id</span>
                </div>
              </div>
            </div>
          </motion.div>

        {/* Options */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="uuid-version" className="mb-2 block text-sm font-medium">Version</label>
            <select
              id="uuid-version"
              title="UUID version"
              aria-label="UUID version"
              value={version}
              onChange={(e) => setVersion(e.target.value as "v4" | "v1")}
              className="input-tool"
            >
              <option value="v4">UUID v4 (Random)</option>
              <option value="v1">UUID v1 (Timestamp)</option>
            </select>
          </div>
          <div>
            <label htmlFor="uuid-count" className="mb-2 block text-sm font-medium">Count</label>
            <input
              id="uuid-count"
              type="number"
              title="Number of UUIDs to generate"
              placeholder="Enter count (1-100)"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="input-tool"
            />
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary"
              />
              <span className="text-sm">Uppercase</span>
            </label>
          </div>
        </div>

        <button onClick={generateUUIDs} className="btn-primary w-full">
          <RefreshCw className="h-5 w-5" />
          Generate UUID{count > 1 ? "s" : ""}
        </button>

        {/* Results */}
        {uuids.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated UUIDs</h3>
              {uuids.length > 1 && (
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied === -1 ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      All copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy all
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <code className="font-mono text-sm">{uuid}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                  >
                    {copied === index ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uuids.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <Key className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Click generate to create UUIDs
            </p>
          </div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            What is UUID Generation?
          </h3>
          <p className="text-muted-foreground mb-4">
            UUID (Universally Unique Identifier) generation creates unique identifiers for data entities. UUIDs are 128-bit numbers represented as 36-character strings, ensuring uniqueness across systems without central coordination.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Select UUID version (v1, v4)</li>
            <li>The tool generates unique IDs</li>
 <li>Copy the UUID for use</li>
            <li>Generate multiple if needed</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">UUID Versions</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• v1: Time-based</li>
                <li>• v4: Random</li>
                <li>• v3/v5: Namespace-based</li>
                <li>• Standard format</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Database keys</li>
                <li>• Session IDs</li>
                <li>• Request tracking</li>
                <li>• Unique identifiers</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What's the difference between UUID v1 and v4?",
            answer: "v1 UUIDs are time-based and include MAC address, making them time-sortable but potentially less private. v4 UUIDs are randomly generated and don't reveal creation time or machine identity, making them more private."
          },
          {
            question: "Are UUIDs truly unique?",
            answer: "UUIDs are statistically unique across all systems. The probability of collision is infinitesimally small (1 in 2^122 for v4), making them practically unique for all real-world applications."
          },
          {
            question: "Why use UUIDs instead of auto-increment IDs?",
            answer: "UUIDs don't require central coordination, making them ideal for distributed systems. They're harder to guess than sequential IDs and work across multiple databases without ID conflicts."
          },
          {
            question: "Can UUIDs be reversed to reveal information?",
            answer: "v1 UUIDs can reveal creation time and MAC address, potentially compromising privacy. v4 UUIDs are random and don't reveal information about the generating system."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default UUIDGeneratorTool;
