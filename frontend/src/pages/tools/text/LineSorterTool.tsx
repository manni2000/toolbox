import { useState } from "react";
import { ArrowUpDown, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

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
      </div>
    </ToolLayout>
  );
};

export default LineSorterTool;
