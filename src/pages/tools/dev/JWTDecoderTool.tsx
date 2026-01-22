import { useState } from "react";
import { Key, Copy, Check, AlertCircle } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

const JWTDecoderTool = () => {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const decode = () => {
    setError(null);
    setDecoded(null);

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format. Expected 3 parts separated by dots.");
      }

      const decodeBase64 = (str: string) => {
        const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
      };

      const header = decodeBase64(parts[0]);
      const payload = decodeBase64(parts[1]);

      setDecoded({
        header,
        payload,
        signature: parts[2],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to decode JWT");
    }
  };

  const handleCopy = async (section: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isExpired = decoded?.payload?.exp
    ? (decoded.payload.exp as number) * 1000 < Date.now()
    : false;

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode and inspect JSON Web Tokens"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">JWT Token</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            className="input-field h-32 w-full resize-none font-mono text-sm"
          />
        </div>

        <button onClick={decode} className="btn-primary w-full">
          <Key className="h-5 w-5" />
          Decode Token
        </button>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mr-2 inline h-4 w-4" />
            {error}
          </div>
        )}

        {decoded && (
          <div className="space-y-4">
            {isExpired && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                This token has expired!
              </div>
            )}

            {/* Header */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-red-500">Header</h3>
                <button
                  onClick={() => handleCopy("header", JSON.stringify(decoded.header, null, 2))}
                  className="btn-secondary text-sm"
                >
                  {copied === "header" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <pre className="overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-purple-500">Payload</h3>
                <button
                  onClick={() => handleCopy("payload", JSON.stringify(decoded.payload, null, 2))}
                  className="btn-secondary text-sm"
                >
                  {copied === "payload" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <pre className="overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>

              {/* Common claims */}
              {(decoded.payload.iat || decoded.payload.exp || decoded.payload.sub) && (
                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  {decoded.payload.sub && (
                    <p><span className="text-muted-foreground">Subject:</span> {String(decoded.payload.sub)}</p>
                  )}
                  {decoded.payload.iat && (
                    <p><span className="text-muted-foreground">Issued:</span> {formatDate(decoded.payload.iat as number)}</p>
                  )}
                  {decoded.payload.exp && (
                    <p><span className="text-muted-foreground">Expires:</span> {formatDate(decoded.payload.exp as number)}</p>
                  )}
                </div>
              )}
            </div>

            {/* Signature */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-3 font-semibold text-cyan-500">Signature</h3>
              <p className="break-all rounded-lg bg-muted/50 p-4 font-mono text-sm text-muted-foreground">
                {decoded.signature}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Note: Signature verification requires the secret key and is done server-side.
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default JWTDecoderTool;
