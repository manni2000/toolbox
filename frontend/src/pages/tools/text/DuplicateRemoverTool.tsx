import { useState } from "react";
import { Trash2, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const DuplicateRemoverTool = () => {
  const toolSeoData = getToolSeoMetadata('duplicate-remover');
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ original: number; unique: number; removed: number } | null>(null);

  const removeDuplicates = (caseSensitive: boolean) => {
    const lines = input.split("\n");
    const seen = new Set<string>();
    const unique: string[] = [];

    lines.forEach((line) => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      }
    });

    setOutput(unique.join("\n"));
    setStats({
      original: lines.length,
      unique: unique.length,
      removed: lines.length - unique.length,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {CategorySEO.Text(
        toolSeoData?.title || "Duplicate Line Remover",
        toolSeoData?.description || "Remove duplicate lines from your text while preserving order",
        "duplicate-remover"
      )}
      <ToolLayout
      title={toolSeoData?.title || "Duplicate Line Remover"}
      description={toolSeoData?.description || "Remove duplicate lines from your text while preserving order"}
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="duplicate-remover-input" className="mb-2 block text-sm font-medium">Input Text</label>
          <textarea
            id="duplicate-remover-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text with duplicate lines here..."
            className="input-field h-40 w-full resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={() => removeDuplicates(true)} className="btn-primary">
            <Trash2 className="h-5 w-5" />
            Remove Duplicates (Case Sensitive)
          </button>
          <button onClick={() => removeDuplicates(false)} className="btn-secondary">
            Ignore Case
          </button>
        </div>

        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold">{stats.original}</p>
              <p className="text-sm text-muted-foreground">Original Lines</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.unique}</p>
              <p className="text-sm text-muted-foreground">Unique Lines</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.removed}</p>
              <p className="text-sm text-muted-foreground">Removed</p>
            </div>
          </div>
        )}

        {output && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="duplicate-remover-output" className="font-medium">Result</label>
              <button onClick={handleCopy} className="btn-secondary text-sm">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              id="duplicate-remover-output"
              value={output}
              readOnly
              className="input-field h-40 w-full resize-none"
            />
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
            <Trash2 className="h-5 w-5 text-blue-500" />
            What is Duplicate Removal?
          </h3>
          <p className="text-muted-foreground mb-4">
            Duplicate removal eliminates repeated lines or items from text. This is useful for cleaning data, removing redundant entries, and ensuring unique content in lists or datasets.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste your text or list</li>
            <li>Choose case-sensitive option</li>
            <li>The tool removes duplicates</li>
            <li>Copy the cleaned result</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Removal Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Case-sensitive mode</li>
                <li>• Line-based removal</li>
                <li>• Preserve original order</li>
                <li>• Statistics display</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Email list cleaning</li>
                <li>• Data deduplication</li>
                <li>• List optimization</li>
                <li>• Content cleanup</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What does case-sensitive mean?",
            answer: "Case-sensitive mode treats 'Apple' and 'apple' as different. Case-insensitive treats them as the same. Use case-insensitive for names, case-sensitive for code or technical data."
          },
          {
            question: "Does duplicate removal preserve order?",
            answer: "Yes, duplicate removal preserves the original order of items. Only the first occurrence of each duplicate is kept, subsequent duplicates are removed."
          },
          {
            question: "Can I remove duplicates from a single paragraph?",
            answer: "This tool removes duplicate lines. For duplicates within a paragraph, use find and replace or text processing tools that handle word-level duplicates."
          },
          {
            question: "Why does duplicate data happen?",
            answer: "Duplicates occur from data merging, user error, system bugs, or copy-paste mistakes. Regular deduplication maintains data quality and efficiency."
          },
          {
            question: "Should I always remove duplicates?",
            answer: "Remove duplicates when you need unique data. However, sometimes duplicates are intentional (e.g., repeated measurements). Consider the context before removing."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default DuplicateRemoverTool;
