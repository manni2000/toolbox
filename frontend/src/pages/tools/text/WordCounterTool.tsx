import { useState } from "react";
import { Copy, Check, Type, AlignLeft, Hash, FileText } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

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
      </div>
    </ToolLayout>
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
