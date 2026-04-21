import { useState } from "react";
import { AlignLeft, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

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
    <>
      {CategorySEO.Text(
        "Remove Extra Spaces",
        "Clean up extra whitespace, leading/trailing spaces, and blank lines",
        "remove-extra-spaces"
      )}
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlignLeft className="h-5 w-5 text-blue-500" />
            What is Space Removal?
          </h3>
          <p className="text-muted-foreground mb-4">
            Space removal eliminates unwanted spaces from text. This includes extra spaces between words, leading/trailing spaces, and multiple consecutive spaces that can cause formatting issues.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste your text</li>
            <li>Select space removal options</li>
            <li>The tool removes spaces</li>
            <li>Copy the cleaned text</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Removal Types</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Extra spaces</li>
                <li>• Leading/trailing spaces</li>
                <li>• Multiple consecutive spaces</li>
                <li>• Line breaks</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Data cleaning</li>
                <li>• Text normalization</li>
                <li>• Code formatting</li>
                <li>• Import/export cleanup</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why remove extra spaces?",
            answer: "Extra spaces cause formatting issues, increase file size, and can break parsers or databases. Clean text with single spaces is more reliable and professional."
          },
          {
            question: "What's the difference between spaces and tabs?",
            answer: "Spaces are single space characters. Tabs are special characters that move to the next tab stop. Consistency in using one or the other is important for code and data files."
          },
          {
            question: "Should I remove all line breaks?",
            answer: "Only if you want a single continuous line. For readability, keep line breaks between paragraphs or logical sections. Remove only unwanted extra line breaks."
          },
          {
            question: "Can space removal affect code?",
            answer: "Yes, Python and other languages use indentation. Be careful when removing spaces from code. Only remove spaces from data strings, not code indentation."
          },
          {
            question: "How do I handle non-breaking spaces?",
            answer: "Non-breaking spaces (nbsp) are special characters that prevent line breaks. They may not be removed by standard space removal tools. Use specialized tools for nbsp."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default RemoveSpacesTool;
