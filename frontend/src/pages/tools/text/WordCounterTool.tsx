import { useState } from "react";
import { Copy, Check, Type, AlignLeft, Hash, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "260 70% 55%";

const WordCounterTool = () => {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0,
    paragraphs: text.trim() ? text.split(/\n\n+/).filter(p => p.trim()).length : 0,
    lines: text.trim() ? text.split(/\n/).length : 0,
    readingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200),
    speakingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 150),
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {CategorySEO.Text(
        "Word & Character Counter",
        "Count words, characters, sentences, and more",
        "word--character-counter"
      )}
      <ToolLayout
      title="Word & Character Counter"
      description="Count words, characters, sentences, and more"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Text Input */}
        <div className="lg:col-span-2">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="input-tool min-h-[400px] resize-y font-mono text-sm"
            />
            <button
              onClick={handleCopy}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Statistics</h3>
          <div className="space-y-3">
            <StatCard
              icon={Type}
              label="Characters"
              value={stats.characters.toLocaleString()}
              subValue={`${stats.charactersNoSpaces.toLocaleString()} without spaces`}
            />
            <StatCard
              icon={AlignLeft}
              label="Words"
              value={stats.words.toLocaleString()}
            />
            <StatCard
              icon={FileText}
              label="Sentences"
              value={stats.sentences.toLocaleString()}
            />
            <StatCard
              icon={Hash}
              label="Paragraphs"
              value={stats.paragraphs.toLocaleString()}
            />
            <StatCard
              icon={Hash}
              label="Lines"
              value={stats.lines.toLocaleString()}
            />
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">
              Reading Time
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{stats.readingTime}</p>
                <p className="text-xs text-muted-foreground">min read</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.speakingTime}</p>
                <p className="text-xs text-muted-foreground">min speak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Type className="h-5 w-5 text-blue-500" />
            What is Word Counting?
          </h3>
          <p className="text-muted-foreground mb-4">
            Word counting analyzes text to count words, characters, sentences, and paragraphs. This is essential for meeting content requirements, tracking writing progress, and ensuring text meets length specifications.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste or enter your text</li>
            <li>The tool analyzes the content</li>
            <li>Counts words, characters, sentences</li>
            <li>Displays detailed statistics</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Count Metrics</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Word count</li>
                <li>• Character count</li>
                <li>• Sentence count</li>
                <li>• Paragraph count</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Meeting length requirements</li>
                <li>• Essay word limits</li>
                <li>• Social media limits</li>
                <li>• SEO content optimization</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What counts as a word?",
            answer: "Words are typically defined as sequences of characters separated by spaces or punctuation. Hyphenated words and contractions may be counted differently by different tools."
          },
          {
            question: "Do spaces count as characters?",
            answer: "Character count typically includes spaces, but some tools offer options to include or exclude them. Check your requirements to know which count to use."
          },
          {
            question: "How are sentences counted?",
            answer: "Sentences are counted by detecting sentence-ending punctuation (., !, ?). Abbreviations with periods may be miscounted. Review results for accuracy."
          },
          {
            question: "Why is word count important for SEO?",
            answer: "Word count affects SEO as search engines prefer comprehensive content. Too short may lack depth, too long may be overwhelming. Aim for optimal length for your topic."
          },
          {
            question: "Can I count words in multiple languages?",
            answer: "Word counting works for most languages, but accuracy may vary. Some languages don't use spaces between words, which can affect count accuracy."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
}

const StatCard = ({ icon: Icon, label, value, subValue }: StatCardProps) => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground">{subValue}</p>
      )}
    </div>
  </div>
);

export default WordCounterTool;
