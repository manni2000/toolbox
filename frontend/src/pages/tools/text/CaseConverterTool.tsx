import { useState } from "react";
import { Copy, Check, ArrowUpDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "260 70% 55%";

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab" | "constant" | "alternating" | "inverse";

const CaseConverterTool = () => {
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

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default CaseConverterTool;
