import { useState } from "react";
import { Copy, Check, Link, Unlink } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const URLEncoderTool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input));
        setError("");
      } else {
        setOutput(decodeURIComponent(input));
        setError("");
      }
    } catch (e) {
      setError("Invalid input for " + (mode === "decode" ? "decoding" : "encoding"));
      setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="URL Encoder/Decoder"
      description="Encode or decode URLs and query parameters"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Mode Toggle */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => { setMode("encode"); setOutput(""); setError(""); }}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              mode === "encode"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Link className="h-4 w-4" />
            Encode
          </button>
          <button
            onClick={() => { setMode("decode"); setOutput(""); setError(""); }}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              mode === "decode"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Unlink className="h-4 w-4" />
            Decode
          </button>
        </div>

        {/* Input */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            {mode === "encode" ? "Text to Encode" : "URL to Decode"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Hello World! Special chars: #&=" : "Hello%20World%21"}
            className="input-tool min-h-[120px] font-mono text-sm"
          />
        </div>

        <button onClick={convert} className="btn-primary w-full">
          {mode === "encode" ? "Encode URL" : "Decode URL"}
        </button>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        {/* Output */}
        {output && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Result</label>
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
            <div className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm break-all">
              {output}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default URLEncoderTool;
