import { useState } from "react";
import { ArrowUpDown, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "260 70% 55%";

const LineSorterTool = () => {
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
        "Line Sorter",
        "Sort lines alphabetically, numerically, by length, or shuffle them",
        "line-sorter"
      )}
      <ToolLayout
      title="Line Sorter"
      description="Sort lines alphabetically, numerically, by length, or shuffle them"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="line-sorter-input" className="text-sm font-medium">
              Input Lines
            </label>
            <span className="text-sm text-muted-foreground">{lineCount} lines</span>
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
