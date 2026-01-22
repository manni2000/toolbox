import { useState } from "react";
import { Copy, Check, Code, AlertCircle, CheckCircle } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const RegexTesterTool = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const getMatches = () => {
    if (!pattern || !testString) return [];
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { match: string; index: number; groups: string[] }[] = [];
      let match;
      
      if (flags.includes("g")) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (!match[0]) break; // Prevent infinite loop
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }
      
      setError("");
      return matches;
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  };

  const matches = getMatches();

  const getHighlightedText = () => {
    if (!pattern || !testString || error) return testString;
    try {
      const regex = new RegExp(pattern, flags);
      return testString.replace(regex, '<mark class="bg-primary/30 text-foreground rounded px-0.5">$&</mark>');
    } catch {
      return testString;
    }
  };

  const handleCopy = async () => {
    if (!pattern) return;
    const regexString = `/${pattern}/${flags}`;
    await navigator.clipboard.writeText(regexString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const flagOptions = [
    { value: "g", label: "Global (g)" },
    { value: "i", label: "Case insensitive (i)" },
    { value: "m", label: "Multiline (m)" },
    { value: "s", label: "Dotall (s)" },
  ];

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ""));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions with live matching"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
        {/* Pattern Input */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Regular Expression</label>
            <button
              onClick={handleCopy}
              disabled={!pattern}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg text-muted-foreground">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="input-tool flex-1 font-mono"
            />
            <span className="text-lg text-muted-foreground">/</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="input-tool w-16 font-mono text-center"
            />
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-2">
          {flagOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleFlag(opt.value)}
              className={`rounded-lg px-3 py-2 text-sm transition-all ${
                flags.includes(opt.value)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        {pattern && !error && (
          <div className="flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
            <CheckCircle className="h-5 w-5" />
            <span>{matches.length} match{matches.length !== 1 ? "es" : ""} found</span>
          </div>
        )}

        {/* Test String */}
        <div>
          <label className="mb-2 block text-sm font-medium">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="input-tool min-h-[150px] font-mono text-sm"
          />
        </div>

        {/* Highlighted Result */}
        {testString && pattern && !error && (
          <div>
            <label className="mb-2 block text-sm font-medium">Highlighted Matches</label>
            <div
              className="rounded-lg border border-border bg-card p-4 font-mono text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
            />
          </div>
        )}

        {/* Match Details */}
        {matches.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium">Match Details</label>
            <div className="space-y-2">
              {matches.map((m, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Match {i + 1}:</span>
                    <span className="text-xs text-muted-foreground">Index: {m.index}</span>
                  </div>
                  <p className="mt-1 font-semibold">{m.match}</p>
                  {m.groups.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Groups: {m.groups.map((g, j) => <code key={j} className="mx-1 rounded bg-muted px-1">{g || "(empty)"}</code>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default RegexTesterTool;
