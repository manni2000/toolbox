import { useState } from "react";
import { FileText, Copy, Check } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const TextSummarizerTool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [sentences, setSentences] = useState(3);

  const summarize = () => {
    // Rule-based summarization (non-AI)
    // 1. Split into sentences
    const sentenceList = input
      .replace(/([.!?])\s+/g, "$1|")
      .split("|")
      .filter((s) => s.trim().length > 20);

    if (sentenceList.length === 0) {
      setOutput("Not enough content to summarize. Please provide more text.");
      return;
    }

    // 2. Score sentences by word frequency
    const allWords = input.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const wordFreq: Record<string, number> = {};
    allWords.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // 3. Score each sentence
    const scored = sentenceList.map((sentence, index) => {
      const words = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      const score = words.reduce((sum: number, word: string) => sum + (wordFreq[word] || 0), 0) / (words.length || 1);
      // Boost first sentence
      const positionBonus = index === 0 ? 2 : 0;
      return { sentence: sentence.trim(), score: score + positionBonus };
    });

    // 4. Sort by score and take top sentences
    const topSentences = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, sentences)
      .sort((a, b) => sentenceList.indexOf(a.sentence) - sentenceList.indexOf(b.sentence));

    setOutput(topSentences.map((s) => s.sentence).join(" "));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout
      title="Text Summarizer"
      description="Extract key sentences from your text using rule-based analysis"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Input Text</label>
            <span className="text-sm text-muted-foreground">{wordCount} words</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your article or long text here..."
            className="input-field h-48 w-full resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Key sentences:</label>
            <select
              value={sentences}
              onChange={(e) => setSentences(parseInt(e.target.value))}
              className="input-field w-20"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button onClick={summarize} className="btn-primary">
            <FileText className="h-5 w-5" />
            Summarize
          </button>
        </div>

        {output && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="font-medium">Summary</span>
                <span className="ml-3 text-sm text-muted-foreground">
                  {outputWordCount} words ({Math.round((outputWordCount / wordCount) * 100) || 0}% of original)
                </span>
              </div>
              <button onClick={handleCopy} className="btn-secondary text-sm">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-foreground leading-relaxed">{output}</p>
          </div>
        )}

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> This tool uses word frequency analysis 
          to identify and extract the most important sentences. It's a deterministic, rule-based approach 
          (not AI-powered) that works best with news articles and factual content.
        </div>
      </div>
    </ToolLayout>
  );
};

export default TextSummarizerTool;
