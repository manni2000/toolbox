import { useState } from "react";
import { Key, Copy, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "210 80% 55%";

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
              <Key className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">JWT Decoder</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Decode and inspect JSON Web Tokens to view header, payload, and signature
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <label className="mb-3 block text-sm font-medium">JWT Token</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            className="input-field h-32 w-full resize-none font-mono text-sm"
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={decode}
          className="btn-primary w-full text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          <Key className="h-5 w-5" />
          Decode Token
        </motion.button>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <AlertCircle className="mr-2 inline h-4 w-4" />
            {error}
          </motion.div>
        )}

        {decoded && (
          <div className="space-y-4">
            {isExpired && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              >
                <AlertCircle className="mr-2 inline h-4 w-4" />
                This token has expired!
              </motion.div>
            )}

            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
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
            </motion.div>

            {/* Payload */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
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
              {!!(decoded.payload.iat || decoded.payload.exp || decoded.payload.sub) && (
                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  {!!decoded.payload.sub && (
                    <p><span className="text-muted-foreground">Subject:</span> {String(decoded.payload.sub)}</p>
                  )}
                  {!!decoded.payload.iat && (
                    <p><span className="text-muted-foreground">Issued:</span> {formatDate(decoded.payload.iat as number)}</p>
                  )}
                  {!!decoded.payload.exp && (
                    <p><span className="text-muted-foreground">Expires:</span> {formatDate(decoded.payload.exp as number)}</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Signature */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h3 className="mb-3 font-semibold text-cyan-500">Signature</h3>
              <p className="break-all rounded-lg bg-muted/50 p-4 font-mono text-sm text-muted-foreground">
                {decoded.signature}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Note: Signature verification requires the secret key and is done server-side.
              </p>
            </motion.div>
          </div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            JWT Token Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🔑 JWT Structure</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Header:</strong> Algorithm and token type</li>
                <li>• <strong>Payload:</strong> Claims and user data</li>
                <li>• <strong>Signature:</strong> Verification hash</li>
                <li>• Parts are Base64URL encoded</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">⚠️ Security Notes</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Never expose secret keys</li>
                <li>• Validate tokens server-side</li>
                <li>• Check expiration claims</li>
                <li>• Use HTTPS for transmission</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default JWTDecoderTool;
