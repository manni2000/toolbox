import { useState } from "react";
import { FileText, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "260 70% 55%";

const TextSummarizerTool = () => {
  const toolSeoData = getToolSeoMetadata('text-summarizer');
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
      const words: string[] = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      let score = 0;
      words.forEach((word) => {
        score += wordFreq[word] || 0;
      });
      score = score / (words.length || 1);
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
    <>
      {CategorySEO.Text(
        toolSeoData?.title || "Text Summarizer",
        toolSeoData?.description || "Extract key sentences from your text using rule-based analysis",
        "text-summarizer"
      )}
      <ToolLayout
      title="Text Summarizer"
      description="Extract key sentences from your text using rule-based analysis"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="input-text" className="text-sm font-medium">Input Text</label>
            <span id="word-count" className="text-sm text-muted-foreground">{wordCount} words</span>
          </div>
          <textarea
            id="input-text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your article or long text here..."
            className="input-field h-48 w-full resize-none"
            aria-describedby="word-count"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="summary-sentence-count" className="text-sm font-medium">Key sentences:</label>
            <select
              id="summary-sentence-count"
              title="Number of key sentences to extract"
              value={sentences}
              onChange={(e) => setSentences(parseInt(e.target.value))}
              className="input-field w-20"
              aria-label="Select number of sentences for summary"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={summarize} 
            className="btn-primary"
            aria-label="Summarize the input text"
          >
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
              <button
                type="button"
                onClick={handleCopy} 
                className="btn-secondary text-sm"
                aria-label={copied ? "Text copied to clipboard" : "Copy summary to clipboard"}
              >
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            What is Text Summarization?
          </h3>
          <p className="text-muted-foreground mb-4">
            Text summarization condenses longer text into shorter, concise versions that capture the main points. This helps readers quickly understand content without reading the entire document.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste your text content</li>
            <li>Set summary length</li>
            <li>The tool extracts key points</li>
            <li>Generate condensed summary</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Summary Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Adjustable length</li>
                <li>• Key point extraction</li>
                <li>• Sentence selection</li>
                <li>• Original meaning preserved</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Article summarization</li>
                <li>• Meeting notes</li>
                <li>• Document review</li>
                <li>• Quick reference</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How long should a summary be?",
            answer: "Aim for 10-20% of the original length for short summaries, 20-30% for moderate summaries. Adjust based on your needs—shorter for quick overviews, longer for comprehensive summaries."
          },
          {
            question: "What makes a good summary?",
            answer: "A good summary captures the main ideas, key points, and conclusions. It should be accurate, objective, and stand alone without needing the original text to understand."
          },
          {
            question: "Can I summarize technical content?",
            answer: "Yes, but technical summaries require understanding the subject. This tool works best with general content. For technical content, ensure you understand the concepts first."
          },
          {
            question: "Does summarization lose important details?",
            answer: "Summarization inevitably loses some details. The goal is to preserve the most important information while condensing. Always review the full document when details matter."
          },
          {
            question: "Should I use bullet points in summaries?",
            answer: "Bullet points are great for summaries as they improve scannability. Use them to list key points, main findings, or important takeaways from the content."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default TextSummarizerTool;
