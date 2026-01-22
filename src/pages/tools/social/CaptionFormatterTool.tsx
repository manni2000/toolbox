import { useState } from "react";
import { Copy, Check, AlignLeft, Type } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

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
      </div>
    </ToolLayout>
  );
};

export default CaptionFormatterTool;
