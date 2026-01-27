import { useState } from "react";
import { Copy, Check, Lock, Unlock } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const Base64Tool = () => {
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
        setOutput(btoa(unescape(encodeURIComponent(input))));
        setError("");
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
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

  const swap = () => {
    setInput(output);
    setOutput("");
    setMode(mode === "encode" ? "decode" : "encode");
    setError("");
  };

  return (
    <ToolLayout
      title="Base64 Encode/Decode"
      description="Encode or decode Base64 strings"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="space-y-6">
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
            <Lock className="h-4 w-4" />
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
            <Unlock className="h-4 w-4" />
            Decode
          </button>
        </div>

        {/* Input/Output */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {mode === "encode" ? "Plain Text" : "Base64 String"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
              className="input-tool min-h-[200px] font-mono text-sm"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </label>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
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
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className="input-tool min-h-[200px] font-mono text-sm"
            />
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-center gap-4">
          <button onClick={convert} className="btn-primary">
            {mode === "encode" ? "Encode" : "Decode"}
          </button>
          <button onClick={swap} disabled={!output} className="btn-secondary">
            Swap & Convert Back
          </button>
        </div>
      </div>
    </ToolLayout>
  );
};

export default Base64Tool;
