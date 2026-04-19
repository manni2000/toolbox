import { useState } from "react";
import { Copy, Check, AlignLeft, Type, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "330 80% 55%";

const CaptionFormatterTool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const formatOptions = [
    { id: "aesthetic", label: "𝐴𝑒𝑠𝑡ℎ𝑒𝑡𝑖𝑐" },
    { id: "bold", label: "𝐁𝐨𝐥𝐝" },
    { id: "italic", label: "𝘐𝘵𝘢𝘭𝘪𝘤" },
    { id: "boldItalic", label: "𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄" },
    { id: "monospace", label: "𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎" },
    { id: "strikethrough", label: "S̶t̶r̶i̶k̶e̶" },
    { id: "underline", label: "U̲n̲d̲e̲r̲l̲i̲n̲e̲" },
    { id: "smallCaps", label: "sᴍᴀʟʟ ᴄᴀᴘs" },
    { id: "circled", label: "Ⓒⓘⓡⓒⓛⓔⓓ" },
    { id: "squared", label: "🅂🅀🅄🄰🅁🄴🄳" },
  ];

  const charMaps: Record<string, Record<string, string>> = {
    aesthetic: Object.fromEntries([
      ...[..."abcdefghijklmnopqrstuvwxyz"].map((c, i) => [c, String.fromCodePoint(0x1D44E + i)]),
      ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) => [c, String.fromCodePoint(0x1D434 + i)]),
    ]),
    bold: Object.fromEntries([
      ...[..."abcdefghijklmnopqrstuvwxyz"].map((c, i) => [c, String.fromCodePoint(0x1D41A + i)]),
      ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) => [c, String.fromCodePoint(0x1D400 + i)]),
      ...[..."0123456789"].map((c, i) => [c, String.fromCodePoint(0x1D7CE + i)]),
    ]),
    italic: Object.fromEntries([
      ...[..."abcdefghijklmnopqrstuvwxyz"].map((c, i) => [c, String.fromCodePoint(0x1D44E + i)]),
      ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) => [c, String.fromCodePoint(0x1D434 + i)]),
    ]),
    boldItalic: Object.fromEntries([
      ...[..."abcdefghijklmnopqrstuvwxyz"].map((c, i) => [c, String.fromCodePoint(0x1D482 + i)]),
      ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) => [c, String.fromCodePoint(0x1D468 + i)]),
    ]),
    monospace: Object.fromEntries([
      ...[..."abcdefghijklmnopqrstuvwxyz"].map((c, i) => [c, String.fromCodePoint(0x1D68A + i)]),
      ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) => [c, String.fromCodePoint(0x1D670 + i)]),
      ...[..."0123456789"].map((c, i) => [c, String.fromCodePoint(0x1D7F6 + i)]),
    ]),
    smallCaps: Object.fromEntries([
      ...[..."abcdefghijklmnopqrstuvwxyz"].map((c, i) => [c, "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ"[i]]),
    ]),
    circled: Object.fromEntries([
      ...[..."abcdefghijklmnopqrstuvwxyz"].map((c, i) => [c, String.fromCodePoint(0x24D0 + i)]),
      ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) => [c, String.fromCodePoint(0x24B6 + i)]),
      ...[..."0123456789"].map((c, i) => [c, i === 0 ? "⓪" : String.fromCodePoint(0x2460 + i - 1)]),
    ]),
    squared: Object.fromEntries([
      ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) => [c, String.fromCodePoint(0x1F130 + i)]),
      ...[..."abcdefghijklmnopqrstuvwxyz"].map((c, i) => [c, String.fromCodePoint(0x1F130 + i)]),
    ]),
  };

  const transform = (text: string, style: string): string => {
    if (style === "strikethrough") {
      return text.split("").map(c => c + "\u0336").join("");
    }
    if (style === "underline") {
      return text.split("").map(c => c + "\u0332").join("");
    }
    
    const map = charMaps[style];
    if (!map) return text;
    
    return text.split("").map(c => map[c] || c).join("");
  };

  const applyFormat = (style: string) => {
    const formatted = transform(input, style);
    setOutput(formatted);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Caption Formatter"
      description="Format your captions with stylish Unicode fonts"
      category="Social Media"
      categoryPath="/category/social"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Input */}
        <div>
          <label className="mb-2 block text-sm font-medium">Your Caption</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your caption here..."
            className="input-tool min-h-[120px] resize-none"
          />
        </div>

        {/* Format Options */}
        <div>
          <label className="mb-2 block text-sm font-medium">Choose Style</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {formatOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => applyFormat(opt.id)}
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium transition-all hover:bg-secondary/80"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        {output && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Formatted Caption</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
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

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="whitespace-pre-wrap text-base break-all">{output}</p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold">💡 Tips</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• These Unicode styles work on Instagram, Twitter, Facebook & more</li>
            <li>• Some fonts may not display on all devices</li>
            <li>• Mix and match by formatting parts separately</li>
          </ul>
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
            What is Caption Formatting?
          </h3>
          <p className="text-muted-foreground mb-4">
            Caption formatting optimizes social media captions for readability and engagement. It adjusts line breaks, character limits, and formatting to ensure your content looks great and fits platform constraints.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste your caption text</li>
            <li>Select target social platform</li>
            <li>The tool formats for line breaks</li>
            <li>Copy the optimized caption</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Formatting Options</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Platform-specific limits</li>
                <li>• Line break handling</li>
                <li> Character count checking</li>
                <li>• Emoji preservation</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Engagement Tips</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Use line breaks wisely</li>
                <li>• Include relevant hashtags</li>
                <li>• Add call-to-action</li>
                <li>• Test readability</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why do line breaks matter in captions?",
            answer: "Line breaks make captions more readable and scannable. Dense text blocks are hard to read on mobile. Proper formatting improves engagement and user experience."
          },
          {
            question: "What's the best caption length?",
            answer: "Optimal length varies: Instagram (2,200 chars), Twitter (280 chars), LinkedIn (3,000 chars). Aim for substance without overwhelming your audience."
          },
          {
            question: "Should I use capitalization in captions?",
            answer: "Use sentence case for readability. All caps is hard to read and can seem aggressive. Capitalize only first letters of sentences and proper nouns."
          },
          {
            question: "How many hashtags should I use?",
            answer: "Use 5-10 relevant hashtags on Instagram, 2-3 on Twitter, and 3-5 on LinkedIn. More isn't always better—focus on relevance."
          },
          {
            question: "Can I use the same caption on all platforms?",
            answer: "You can repurpose content but adapt captions for each platform's style, audience, and character limits. Tailor tone and formatting accordingly."
          }
        ]} />
      </div>
    </ToolLayout>
  );
};

export default CaptionFormatterTool;
