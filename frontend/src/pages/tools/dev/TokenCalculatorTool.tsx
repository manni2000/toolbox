import { useState } from "react";
import { Copy, Check, Hash, Type, Sparkles, Settings, Calculator, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

const TokenCalculatorTool = () => {
  const toolSeoData = getToolSeoMetadata('token-calculator');
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
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "Token Calculator",
        toolSeoData?.description || "Estimate token count for LLM APIs",
        "token-calculator"
      )}
      <ToolLayout
      title="Token Calculator"
      description="Estimate token count for LLM APIs"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-3xl space-y-6">
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
              <Calculator className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Token Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Estimate token count for LLM APIs with cost estimation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Model Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
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
        </motion.div>

        {/* Text Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="mb-2 block text-sm font-medium">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here to count tokens..."
            rows={8}
            className="input-tool resize-none font-mono text-sm"
          />
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={<Hash className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
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
        </motion.div>

        {/* Cost Estimate */}
        {stats.tokens > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Estimated Cost (Input)</p>
                <p className="text-xs text-muted-foreground">
                  Based on typical API pricing
                </p>
              </div>
              <p className="text-xl font-bold" style={{ color: `hsl(${categoryColor})` }}>${estimateCost()}</p>
            </div>
          </motion.div>
        )}

        {/* Copy Button */}
        {stats.tokens > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="mx-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy stats
              </>
            )}
          </motion.button>
        )}

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-border bg-muted/50 p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <p className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
            Estimation Note
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Token counts are approximations (~4 characters per token for English). 
            Actual counts vary by model and text content. For precise counts, use 
            the official tokenizer (e.g., tiktoken for OpenAI).
          </p>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-500" />
            What is Token Calculation?
          </h3>
          <p className="text-muted-foreground mb-4">
            Token calculation estimates the number of tokens in text for AI language models like GPT, Claude, and LLaMA. Tokens are the basic units that AI models process, and understanding token count helps manage API costs and model limits.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter or paste your text into the input area</li>
            <li>Select the AI model (GPT, Claude, or LLaMA)</li>
            <li>The tool calculates token count in real-time</li>
            <li>View character, word, and token statistics</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Metrics Provided</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Token count estimate</li>
                <li>• Word count</li>
                <li>• Character count</li>
                <li>• Characters without spaces</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• API cost estimation</li>
                <li>• Context window planning</li>
                <li>• Text length optimization</li>
                <li>• Model limit checking</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is a token in AI models?",
            answer: "A token is the basic unit of text that AI models process. It can be a word, part of a word, or a character. Models don't read text word-by-word, but token-by-token."
          },
          {
            question: "How accurate is the token count?",
            answer: "Token counts are estimates based on average character-to-token ratios (~4 chars per token for English). For precise counts, use the official tokenizer for your specific model."
          },
          {
            question: "Why do different models have different token counts?",
            answer: "Different AI models use different tokenization methods. GPT, Claude, and LLaMA each have their own tokenizers, so the same text may have different token counts."
          },
          {
            question: "How does token count affect API costs?",
            answer: "Most AI APIs charge based on token usage (both input and output tokens). Knowing your token count helps estimate costs before making API calls."
          },
          {
            question: "What is the character-to-token ratio?",
            answer: "For English text, the average is about 4 characters per token. However, this varies by language, with some languages requiring more or fewer characters per token."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
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
