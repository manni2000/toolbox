import { useState } from "react";
import { ArrowUpDown, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "260 70% 55%";

const LineSorterTool = () => {
  const toolSeoData = getToolSeoMetadata('line-sorter');
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const sortAZ = () => {
    const lines = input.split("\n").filter((l) => l.trim());
    setOutput(lines.sort((a, b) => a.localeCompare(b)).join("\n"));
  };

  const sortZA = () => {
    const lines = input.split("\n").filter((l) => l.trim());
    setOutput(lines.sort((a, b) => b.localeCompare(a)).join("\n"));
  };

  const sortNumeric = () => {
    const lines = input.split("\n").filter((l) => l.trim());
    setOutput(
      lines
        .sort((a, b) => {
          const numA = parseFloat(a.match(/[\d.]+/)?.[0] || "0");
          const numB = parseFloat(b.match(/[\d.]+/)?.[0] || "0");
          return numA - numB;
        })
        .join("\n")
    );
  };

  const sortByLength = () => {
    const lines = input.split("\n").filter((l) => l.trim());
    setOutput(lines.sort((a, b) => a.length - b.length).join("\n"));
  };

  const reverse = () => {
    const lines = input.split("\n").filter((l) => l.trim());
    setOutput(lines.reverse().join("\n"));
  };

  const shuffle = () => {
    const lines = input.split("\n").filter((l) => l.trim());
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    setOutput(lines.join("\n"));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = input.split("\n").filter((l) => l.trim()).length;

  return (
    <>
      {CategorySEO.Text(
        toolSeoData?.title || "Line Sorter",
        toolSeoData?.description || "Sort lines alphabetically, numerically, by length, or shuffle them",
        "line-sorter"
      )}
      <ToolLayout
        title="Line Sorter"
        description="Sort lines alphabetically, numerically, by length, or shuffle them"
        category="Text Tools"
        categoryPath="/category/text"
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
                <ArrowUpDown className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Line Sorter Tool</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sort lines alphabetically, numerically, or reverse order.
                </p>
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">line sorter</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">sort lines</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">alphabetical sort</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">text organizer</span>
                </div>
              </div>
            </div>
          </motion.div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="line-sorter-input" className="text-sm font-medium">
                Input Lines
              </label>
            </div>
          <textarea
            id="line-sorter-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter lines to sort (one per line)..."
            className="input-field h-40 w-full resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={sortAZ} className="btn-primary">
            <ArrowUpDown className="h-4 w-4" />
            A → Z
          </button>
          <button onClick={sortZA} className="btn-secondary">
            Z → A
          </button>
          <button onClick={sortNumeric} className="btn-secondary">
            0 → 9
          </button>
          <button onClick={sortByLength} className="btn-secondary">
            By Length
          </button>
          <button onClick={reverse} className="btn-secondary">
            Reverse
          </button>
          <button onClick={shuffle} className="btn-secondary">
            Shuffle
          </button>
        </div>

        {output && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="line-sorter-output" className="font-medium">
                Sorted Result
              </label>
              <button onClick={handleCopy} className="btn-secondary text-sm">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              id="line-sorter-output"
              value={output}
              readOnly
              title="Sorted result output"
              aria-label="Sorted result output"
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
            <ArrowUpDown className="h-5 w-5 text-blue-500" />
            What is Line Sorting?
          </h3>
          <p className="text-muted-foreground mb-4">
            Line sorting arranges text lines in alphabetical order. This is useful for organizing lists, sorting names alphabetically, or ordering data in a consistent manner for easier reference.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste your text or list</li>
            <li>Select sort order (ascending/descending)</li>
            <li>The tool sorts the lines</li>
            <li>Copy the sorted result</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Sort Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ascending (A-Z)</li>
                <li>• Descending (Z-A)</li>
                <li>• Case-sensitive option</li>
                <li>• Reverse order</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Name lists</li>
                <li>• Data organization</li>
                <li>• Bibliography sorting</li>
                <li>• Inventory lists</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What's the difference between ascending and descending?",
            answer: "Ascending sorts from A to Z (a to z). Descending sorts from Z to A (z to a). Choose ascending for standard alphabetical order, descending for reverse order."
          },
          {
            question: "Should I use case-sensitive sorting?",
            answer: "Use case-sensitive when capitalization matters (e.g., code, technical data). Use case-insensitive for names or general text where 'Apple' and 'apple' should be treated the same."
          },
          {
            question: "How are numbers sorted?",
            answer: "Numbers are sorted as strings by default (1, 10, 2). For numeric sorting, ensure numbers are zero-padded or use a tool designed for numeric sorting."
          },
          {
            question: "Can I sort by multiple criteria?",
            answer: "This tool sorts lines as complete units. For multi-criteria sorting, you may need a more advanced tool or spreadsheet application that supports multi-column sorting."
          },
          {
            question: "Does sorting change original data?",
            answer: "Sorting rearranges lines but doesn't modify their content. The original data remains intact, only the order changes. Keep a backup of unsorted data if needed."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default LineSorterTool;
