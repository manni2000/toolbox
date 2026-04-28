import { useState } from "react";
import { AlignLeft, Copy, Check, Sparkles, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "260 70% 55%";

const RemoveSpacesTool = () => {
  const toolSeoData = getToolSeoMetadata('remove-spaces');
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
        toolSeoData?.title || "Remove Extra Spaces",
        toolSeoData?.description || "Clean up extra whitespace, leading/trailing spaces, and blank lines",
        "remove-spaces"
      )}
      <ToolLayout
        title="Remove Extra Spaces"
        description="Clean up extra whitespace, leading/trailing spaces, and blank lines"
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
                <Minimize2 className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Remove Extra Spaces</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Remove extra spaces, tabs, and line breaks from your text.
                </p>
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">space remover</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">remove spaces</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">text cleaner</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">format text</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <textarea
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
