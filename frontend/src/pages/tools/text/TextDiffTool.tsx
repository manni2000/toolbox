import { useState } from "react";
import { Diff, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "260 70% 55%";

const TextDiffTool = () => {
  const toolSeoData = getToolSeoMetadata('text-diff');
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diff, setDiff] = useState<{ type: "same" | "added" | "removed"; text: string }[]>([]);
  const [compared, setCompared] = useState(false);

  const compare = () => {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const result: { type: "same" | "added" | "removed"; text: string }[] = [];

    // Simple line-by-line diff
    const maxLen = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === line2) {
        if (line1 !== undefined) {
          result.push({ type: "same", text: line1 });
        }
      } else {
        if (line1 !== undefined && !lines2.includes(line1)) {
          result.push({ type: "removed", text: line1 });
        }
        if (line2 !== undefined && !lines1.includes(line2)) {
          result.push({ type: "added", text: line2 });
        }
        if (line1 !== undefined && lines2.includes(line1)) {
          result.push({ type: "same", text: line1 });
        }
        if (line2 !== undefined && lines1.includes(line2)) {
          // Already handled
        }
      }
    }

    setDiff(result);
    setCompared(true);
  };

  const stats = {
    added: diff.filter((d) => d.type === "added").length,
    removed: diff.filter((d) => d.type === "removed").length,
    same: diff.filter((d) => d.type === "same").length,
  };

  return (
    <>
      {CategorySEO.Text(
        toolSeoData?.title || "Text Diff Checker",
        toolSeoData?.description || "Compare two texts and highlight differences",
        "text-diff"
      )}
      <ToolLayout
      title={toolSeoData?.title || "Text Diff Checker"}
      description={toolSeoData?.description || "Compare two texts and highlight differences"}
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Original Text</label>
            <textarea
              value={text1}
              onChange={(e) => { setText1(e.target.value); setCompared(false); }}
              placeholder="Paste original text here..."
              className="input-field h-48 w-full resize-none font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Modified Text</label>
            <textarea
              value={text2}
              onChange={(e) => { setText2(e.target.value); setCompared(false); }}
              placeholder="Paste modified text here..."
              className="input-field h-48 w-full resize-none font-mono text-sm"
            />
          </div>
        </div>

        <button onClick={compare} className="btn-primary w-full">
          <Diff className="h-5 w-5" />
          Compare Texts
        </button>

        {compared && (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <p className="text-2xl font-bold text-green-500">+{stats.added}</p>
                <p className="text-sm text-muted-foreground">Added</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-4 text-center">
                <p className="text-2xl font-bold text-red-500">-{stats.removed}</p>
                <p className="text-sm text-muted-foreground">Removed</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold">{stats.same}</p>
                <p className="text-sm text-muted-foreground">Unchanged</p>
              </div>
            </div>

            {/* Diff Display */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-4 font-medium">Differences</h3>
              <div className="max-h-96 overflow-auto rounded-lg bg-muted/30 p-4 font-mono text-sm">
                {diff.length === 0 ? (
                  <p className="text-muted-foreground">No differences found - texts are identical!</p>
                ) : (
                  diff.map((line, i) => (
                    <div
                      key={i}
                      className={`px-2 py-1 ${
                        line.type === "added"
                          ? "bg-green-500/20 text-green-700 dark:text-green-400"
                          : line.type === "removed"
                          ? "bg-red-500/20 text-red-700 dark:text-red-400"
                          : ""
                      }`}
                    >
                      <span className="mr-2 inline-block w-4 text-muted-foreground">
                        {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                      </span>
                      {line.text || " "}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Diff className="h-5 w-5 text-blue-500" />
            What is Text Diffing?
          </h3>
          <p className="text-muted-foreground mb-4">
            Text diffing compares two versions of text to identify changes. It highlights additions, deletions, and modifications, making it easy to review document changes, track revisions, and understand what changed between versions.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste original and new text versions</li>
            <li>The tool compares the texts line by line</li>
            <li>Highlights differences visually</li>
            <li>View change summary</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Diff Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Side-by-side comparison</li>
                <li>• Color-coded changes</li>
                <li>• Line-by-line diff</li>
                <li>• Change statistics</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Code review</li>
                <li>• Document comparison</li>
                <li>• Version control</li>
                <li>• Change tracking</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What do the colors mean in diff?",
            answer: "Red typically indicates deletions (removed text). Green or blue indicates additions (new text). Different tools may use different color schemes."
          },
          {
            question: "Can diff handle large files?",
            answer: "Diff can handle large files but may be slower. For very large files, consider using command-line diff tools designed for performance with large datasets."
          },
          {
            question: "What's the difference between unified and context diff?",
            answer: "Unified diff shows changes in a single view with context. Context diff shows changes with surrounding lines. Unified is more compact, context provides more surrounding information."
          },
          {
            question: "How do I ignore whitespace changes?",
            answer: "Most diff tools have an option to ignore whitespace changes. This is useful when only formatting changed, not actual content. Enable this to focus on substantive changes."
          },
          {
            question: "Can I compare binary files with diff?",
            answer: "Standard text diff tools only work with text files. For binary files, use specialized binary diff tools that can handle binary data comparison."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default TextDiffTool;
