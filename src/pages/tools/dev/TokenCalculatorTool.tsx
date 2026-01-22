import { useState } from "react";
import { Copy, Check, Hash, Type } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const TokenCalculatorTool = () => {
  const [text, setText] = useState("");
  const [model, setModel] = useState<"gpt" | "claude" | "llama">("gpt");
  const [copied, setCopied] = useState(false);

  // Approximate token counting (real tokenizers vary, but ~4 chars per token is a common estimate)
  const countTokens = (text: string, model: string) => {
    if (!text) return { tokens: 0, words: 0, chars: 0, charsNoSpaces: 0 };

    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim().split(/\s+/).filter(Boolean).length;

    // Different models have slightly different tokenization
    let tokensPerChar: number;
    switch (model) {
      case "gpt":
        // GPT-3.5/4 uses ~4 chars per token on average for English
        tokensPerChar = 0.25;
        break;
      case "claude":
        // Claude uses similar tokenization
        tokensPerChar = 0.25;
        break;
      case "llama":
        // LLaMA tends to be slightly more efficient
        tokensPerChar = 0.23;
        break;
      default:
        tokensPerChar = 0.25;
    }

    // Adjust for whitespace and punctuation
    const tokens = Math.ceil(chars * tokensPerChar);

    return { tokens, words, chars, charsNoSpaces };
  };

  const stats = countTokens(text, model);

  const models = [
    { id: "gpt", name: "GPT-3.5/4", description: "OpenAI models" },
    { id: "claude", name: "Claude", description: "Anthropic models" },
    { id: "llama", name: "LLaMA", description: "Meta models" },
  ];

  const handleCopy = async () => {
    const result = `Tokens: ~${stats.tokens}\nWords: ${stats.words}\nCharacters: ${stats.chars}`;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cost estimation (approximate, based on typical pricing)
  const estimateCost = () => {
    const inputCostPer1k: Record<string, number> = {
      gpt: 0.0015, // GPT-3.5-turbo
      claude: 0.003, // Claude 3 Haiku
      llama: 0.0001, // Self-hosted estimate
    };
    return ((stats.tokens / 1000) * inputCostPer1k[model]).toFixed(6);
  };

  return (
    <ToolLayout
      title="Token Calculator"
      description="Estimate token count for LLM APIs"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Model Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium">Model</label>
          <div className="grid grid-cols-3 gap-2">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id as typeof model)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  model === m.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <p className={`font-medium ${model === m.id ? "text-primary" : ""}`}>
                  {m.name}
                </p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div>
          <label className="mb-2 block text-sm font-medium">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here to count tokens..."
            rows={8}
            className="input-tool resize-none font-mono text-sm"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Hash className="h-5 w-5" />}
            label="Tokens"
            value={`~${stats.tokens.toLocaleString()}`}
            highlight
          />
          <StatCard
            icon={<Type className="h-5 w-5" />}
            label="Words"
            value={stats.words.toLocaleString()}
          />
          <StatCard
            label="Characters"
            value={stats.chars.toLocaleString()}
          />
          <StatCard
            label="No Spaces"
            value={stats.charsNoSpaces.toLocaleString()}
          />
        </div>

        {/* Cost Estimate */}
        {stats.tokens > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Estimated Cost (Input)</p>
                <p className="text-xs text-muted-foreground">
                  Based on typical API pricing
                </p>
              </div>
              <p className="text-xl font-bold text-primary">${estimateCost()}</p>
            </div>
          </div>
        )}

        {/* Copy Button */}
        {stats.tokens > 0 && (
          <button
            onClick={handleCopy}
            className="mx-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-primary" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy stats
              </>
            )}
          </button>
        )}

        {/* Info */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm font-medium">⚠️ Estimation Note</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Token counts are approximations (~4 characters per token for English). 
            Actual counts vary by model and text content. For precise counts, use 
            the official tokenizer (e.g., tiktoken for OpenAI).
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className={`rounded-lg border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <p className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>
      {value}
    </p>
  </div>
);

export default TokenCalculatorTool;
