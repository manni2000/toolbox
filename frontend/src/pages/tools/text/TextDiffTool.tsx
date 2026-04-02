import { useState } from "react";
import { Diff, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "260 70% 55%";

const TextDiffTool = () => {
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
    <ToolLayout
      title="Text Diff Checker"
      description="Compare two texts and highlight differences"
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
      </div>
    </ToolLayout>
  );
};

export default TextDiffTool;
