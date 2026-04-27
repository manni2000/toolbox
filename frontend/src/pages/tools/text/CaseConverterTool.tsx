import { useState } from "react";
import { Copy, Check, ArrowUpDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "260 70% 55%";

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab" | "constant" | "alternating" | "inverse";

const CaseConverterTool = () => {
  const toolSeoData = getToolSeoMetadata('case-converter');
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const conversions: { type: CaseType; label: string; convert: (text: string) => string }[] = [
    { type: "upper", label: "UPPERCASE", convert: (t) => t.toUpperCase() },
    { type: "lower", label: "lowercase", convert: (t) => t.toLowerCase() },
    { type: "title", label: "Title Case", convert: (t) => t.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) },
    { type: "sentence", label: "Sentence case", convert: (t) => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()) },
    { type: "camel", label: "camelCase", convert: (t) => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
    { type: "snake", label: "snake_case", convert: (t) => t.toLowerCase().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") },
    { type: "kebab", label: "kebab-case", convert: (t) => t.toLowerCase().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") },
    { type: "constant", label: "CONSTANT_CASE", convert: (t) => t.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "") },
    { type: "alternating", label: "aLtErNaTiNg", convert: (t) => t.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("") },
    { type: "inverse", label: "iNVERSE cASE", convert: (t) => t.split("").map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("") },
  ];

  const handleCopy = async (type: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      {CategorySEO.Text(
        toolSeoData?.title || "Case Converter",
        toolSeoData?.description || "Convert text between different cases",
        "case-converter"
      )}
      <ToolLayout
      title="Case Converter"
      description="Convert text between different cases"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        {/* Input */}
        <div>
          <label className="mb-2 block text-sm font-medium">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            className="input-tool min-h-[120px]"
          />
        </div>

        {/* Conversions */}
        {input && (
          <div className="grid gap-4 sm:grid-cols-2">
            {conversions.map(({ type, label, convert }) => (
              <div
                key={type}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {label}
                  </span>
                  <button
                    onClick={() => handleCopy(type, convert(input))}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copied === type ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="break-all font-mono text-sm">{convert(input)}</p>
              </div>
            ))}
          </div>
        )}

        {!input && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <ArrowUpDown className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Enter text above to convert
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
            <ArrowUpDown className="h-5 w-5 text-blue-500" />
            What is Case Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            Case conversion transforms text between different letter cases (uppercase, lowercase, title case, sentence case). This is useful for formatting text consistently, correcting capitalization errors, and adhering to style guidelines.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter or paste your text</li>
            <li>Select the desired case format</li>
            <li>The tool converts the text</li>
            <li>Copy the formatted result</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Case Types</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Uppercase (ALL CAPS)</li>
                <li>• Lowercase (all lower)</li>
                <li>• Title Case (Capitalize Words)</li>
                <li>• Sentence case (Sentence case)</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Title formatting</li>
                <li>• Name standardization</li>
                <li>• Code formatting</li>
                <li>• Data cleaning</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What's the difference between title case and sentence case?",
            answer: "Title case capitalizes the first letter of each word. Sentence case capitalizes only the first letter of sentences and proper nouns. Use title case for titles, sentence case for prose."
          },
          {
            question: "Should I use uppercase for emphasis?",
            answer: "Avoid using uppercase for emphasis—it's harder to read and can appear aggressive. Use bold or italics instead. Uppercase is appropriate for acronyms and headings."
          },
          {
            question: "When should I use lowercase?",
            answer: "Use lowercase for email addresses, URLs, hashtags, and casual text. It's also appropriate for code and technical identifiers that are case-sensitive."
          },
          {
            question: "How do I handle proper nouns in title case?",
            answer: "Title case should capitalize all major words including proper nouns. However, some style guides lowercase articles, conjunctions, and prepositions unless they're the first word."
          },
          {
            question: "Can case conversion affect data?",
            answer: "Yes, case conversion can affect data in systems that are case-sensitive. Be careful when converting database keys, URLs, or code identifiers that rely on specific casing."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default CaseConverterTool;
