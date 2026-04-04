import { useState } from "react";
import { AlignLeft, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "260 70% 55%";

const RemoveSpacesTool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const removeSpaces = () => {
    const result = input
      .replace(/[ \t]+/g, " ") // Multiple spaces/tabs to single space
      .replace(/^ +/gm, "") // Leading spaces on each line
      .replace(/ +$/gm, "") // Trailing spaces on each line
      .replace(/\n{3,}/g, "\n\n"); // Multiple blank lines to max 2
    setOutput(result);
  };

  const removeAllSpaces = () => {
    setOutput(input.replace(/\s+/g, ""));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Remove Extra Spaces"
      description="Clean up extra whitespace, leading/trailing spaces, and blank lines"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="remove-spaces-input" className="mb-2 block text-sm font-medium">
            Input Text
          </label>
          <textarea
            id="remove-spaces-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text with extra spaces here..."
            className="input-field h-40 w-full resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={removeSpaces} className="btn-primary">
            <AlignLeft className="h-5 w-5" />
            Clean Extra Spaces
          </button>
          <button onClick={removeAllSpaces} className="btn-secondary">
            Remove All Whitespace
          </button>
        </div>

        {output && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium">Result</span>
              <button onClick={handleCopy} className="btn-secondary text-sm">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <label htmlFor="remove-spaces-output" className="sr-only">
              Result Text
            </label>
            <textarea
              id="remove-spaces-output"
              title="Result Text"
              value={output}
              readOnly
              className="input-field h-40 w-full resize-none"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default RemoveSpacesTool;
