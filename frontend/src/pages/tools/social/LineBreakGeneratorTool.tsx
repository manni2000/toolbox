import { useState } from "react";
import { Copy, Check, SeparatorHorizontal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "330 80% 55%";

const LineBreakGeneratorTool = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const lineBreaks = [
    { id: "invisible", name: "Invisible Line Break", content: "⠀\n⠀\n⠀\n⠀\n⠀", description: "Uses invisible Braille characters" },
    { id: "dots", name: "Dot Separator", content: ".\n.\n.\n.\n.", description: "Simple dots for clean breaks" },
    { id: "dashes", name: "Dash Line", content: "—————————", description: "Elegant dash separator" },
    { id: "stars", name: "Star Line", content: "✦ ✦ ✦ ✦ ✦", description: "Decorative stars" },
    { id: "hearts", name: "Heart Line", content: "♡ ♡ ♡ ♡ ♡", description: "Cute heart separators" },
    { id: "arrows", name: "Arrow Down", content: "↓\n↓\n↓", description: "Directional arrows" },
    { id: "sparkles", name: "Sparkle Line", content: "✨ ✨ ✨ ✨ ✨", description: "Sparkling divider" },
    { id: "wave", name: "Wave Line", content: "〰️〰️〰️〰️〰️", description: "Wavy separator" },
    { id: "flowers", name: "Flower Line", content: "✿ ❀ ✿ ❀ ✿", description: "Floral divider" },
    { id: "minimal", name: "Minimal Dots", content: "· · ·", description: "Minimalist middle dots" },
  ];

  const customBreaks = [
    { id: "5lines", name: "5 Line Breaks", content: "\n\n\n\n\n" },
    { id: "10lines", name: "10 Line Breaks", content: "\n\n\n\n\n\n\n\n\n\n" },
    { id: "15lines", name: "15 Line Breaks", content: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n" },
  ];

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolLayout
      title="Line Break Generator"
      description="Create invisible line breaks and separators for Instagram captions"
      category="Social Media"
      categoryPath="/category/social"
    >
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Invisible Line Breaks */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Invisible Line Breaks</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {customBreaks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleCopy(item.id, item.content)}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-accent"
              >
                <span className="font-medium">{item.name}</span>
                {copied === item.id ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative Separators */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Decorative Separators</h3>
          <div className="grid gap-3">
            {lineBreaks.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                  <div className="mt-2 rounded bg-muted/50 px-3 py-2 font-mono text-sm whitespace-pre">
                    {item.content}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(item.id, item.content)}
                  className="ml-4 flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                >
                  {copied === item.id ? (
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
            ))}
          </div>
        </div>

        {/* How to Use */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold">📝 How to Use</h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Click the "Copy" button next to the separator you want</li>
            <li>2. Open Instagram (or other social media) and create a new post</li>
            <li>3. Paste the copied separator in your caption where you want the break</li>
            <li>4. The invisible characters will create clean line spacing</li>
          </ol>
        </div>

        {/* Why Use Line Breaks */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-2 font-semibold">✨ Why Use Line Breaks?</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Hide hashtags below the "more" fold</li>
            <li>• Create clean, organized captions</li>
            <li>• Separate different sections of your post</li>
            <li>• Make your captions more readable</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
};

export default LineBreakGeneratorTool;
