import { useState } from "react";
import { Trash2, Copy, Check } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const DuplicateRemoverTool = () => {
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
    <ToolLayout
      title="Duplicate Line Remover"
      description="Remove duplicate lines from your text while preserving order"
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

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default DuplicateRemoverTool;
