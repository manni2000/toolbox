import { useState } from "react";
import { Copy, Check, Code, AlertCircle, CheckCircle, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

const RegexTesterTool = () => {
  const toolSeoData = getToolSeoMetadata('regex-tester');
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
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "Regex Tester",
        toolSeoData?.description || "Test regular expressions with live matching",
        "regex-tester"
      )}
      <ToolLayout
      breadcrumbTitle="Regex Tester"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
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
              <Code className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Regex Tester</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Test regular expressions with live matching and highlight results
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">regex tester</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">regular expression</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">regex pattern</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">regex validation</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pattern Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="regex-pattern" className="text-sm font-medium">Regular Expression</label>
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
              id="regex-pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              title="Regular expression pattern"
              aria-label="Regular expression pattern"
              className="input-tool flex-1 font-mono"
            />
            <span className="text-lg text-muted-foreground">/</span>
            <input
              id="regex-flags"
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gim"
              title="Regular expression flags"
              aria-label="Regular expression flags"
              className="input-tool w-16 font-mono text-center"
            />
          </div>
        </motion.div>

        {/* Flags */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2"
        >
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
        </motion.div>

        {/* Status */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </motion.div>
        )}
        {pattern && !error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground"
          >
            <CheckCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            <span>{matches.length} match{matches.length !== 1 ? "es" : ""} found</span>
          </motion.div>
        )}

        {/* Test String */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="mb-2 block text-sm font-medium">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="input-tool min-h-[150px] font-mono text-sm"
          />
        </motion.div>

        {/* Highlighted Result */}
        {testString && pattern && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <label className="mb-2 block text-sm font-medium">Highlighted Matches</label>
            <div
              className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
            />
          </motion.div>
        )}

        {/* Match Details */}
        {matches.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <label className="mb-2 block text-sm font-medium">Match Details</label>
            <div className="space-y-2">
              {matches.map((m, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm">
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
          </motion.div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            What is Regex Testing?
          </h3>
          <p className="text-muted-foreground mb-4">
            Regular expressions (regex) are patterns used to match character combinations in strings. Regex testing allows you to validate patterns against test text, find matches, and debug complex regex expressions for data validation and extraction.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your regex pattern in the pattern field</li>
            <li>Set flags (g for global, i for case-insensitive, m for multiline)</li>
            <li>Enter test text to match against the pattern</li>
            <li>View all matches, groups, and capture results</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Regex Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pattern matching</li>
                <li>• Capture groups</li>
                <li>• Flag support (g, i, m)</li>
                <li>• Real-time testing</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Email validation</li>
                <li>• Data extraction</li>
                <li>• String replacement</li>
                <li>• Input validation</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What are regex flags?",
            answer: "Flags modify how regex patterns match. Common flags: g (global - find all matches), i (case-insensitive), m (multiline - match across line breaks)."
          },
          {
            question: "How do capture groups work?",
            answer: "Capture groups are parts of the pattern enclosed in parentheses (). They allow you to extract specific portions of matches for further processing."
          },
          {
            question: "What does the 'g' flag do?",
            answer: "The 'g' (global) flag finds all matches in the string, not just the first one. Without it, regex stops after the first match."
          },
          {
            question: "Can I test complex regex patterns?",
            answer: "Yes, the tool supports complex patterns including lookaheads, lookbehinds, character classes, quantifiers, and all standard regex features."
          },
          {
            question: "Does this support JavaScript regex syntax?",
            answer: "Yes, this tool uses JavaScript's RegExp engine, supporting all JavaScript regex syntax and features."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default RegexTesterTool;
