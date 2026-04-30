import { useState } from "react";
import { Copy, Check, Clock, AlertCircle, RefreshCw, FileText, Download, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

interface JWTPayload {
  [key: string]: unknown;
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
  aud?: string;
  sub?: string;
}

interface JWTHeader {
  [key: string]: unknown;
  alg?: string;
  typ?: string;
}

interface JWTInfo {
  header: JWTHeader | null;
  payload: JWTPayload | null;
  signature: string;
  isValid: boolean;
  expiryTime?: Date;
  issuedAt?: Date;
  notBefore?: Date;
  issuer?: string;
  audience?: string;
  subject?: string;
  timeToExpiry?: string;
  isExpired?: boolean;
}

const JWTExpiryTool = () => {
  const toolSeoData = getToolSeoMetadata('jwt-expiry-calculator');
  const [jwtInput, setJwtInput] = useState('');
  const [jwtInfo, setJwtInfo] = useState<JWTInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const decodeJWT = (token: string): JWTInfo | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      const signature = parts[2];

      const now = new Date();
      const expiryTime = payload.exp ? new Date(payload.exp * 1000) : undefined;
      const issuedAt = payload.iat ? new Date(payload.iat * 1000) : undefined;
      const notBefore = payload.nbf ? new Date(payload.nbf * 1000) : undefined;

      const isExpired = expiryTime ? expiryTime < now : false;
      const timeToExpiry = expiryTime ? getTimeToExpiry(expiryTime, now) : undefined;

      return {
        header,
        payload,
        signature,
        isValid: true,
        expiryTime,
        issuedAt,
        notBefore,
        issuer: payload.iss,
        audience: payload.aud,
        subject: payload.sub,
        timeToExpiry,
        isExpired
      };
    } catch (error) {
      return {
        header: null,
        payload: null,
        signature: '',
        isValid: false
      };
    }
  };

  const getTimeToExpiry = (expiry: Date, now: Date): string => {
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const analyzeJWT = () => {
    const info = decodeJWT(jwtInput);
    setJwtInfo(info);
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadReport = () => {
    if (!jwtInfo) return;

    const report = {
      timestamp: new Date().toISOString(),
      jwt: jwtInput,
      analysis: {
        isValid: jwtInfo.isValid,
        isExpired: jwtInfo.isExpired,
        expiryTime: jwtInfo.expiryTime?.toISOString(),
        issuedAt: jwtInfo.issuedAt?.toISOString(),
        notBefore: jwtInfo.notBefore?.toISOString(),
        timeToExpiry: jwtInfo.timeToExpiry,
        issuer: jwtInfo.issuer,
        audience: jwtInfo.audience,
        subject: jwtInfo.subject,
        header: jwtInfo.header,
        payload: jwtInfo.payload
      }
    };

    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jwt-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    const exampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTYyMzkwMjJ9.4Adcj3UFYzP5aH8W5vZ5J5_x5d5Q5x5d5Q5x5d5Q5';
    setJwtInput(exampleJWT);
  };

  const generateTestJWT = () => {
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 hour from now
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: '1234567890',
      name: 'John Doe',
      iat: now,
      exp: expiry,
      iss: 'https://example.com',
      aud: 'example-client'
    };

    const testJWT = `${btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_')}.${btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_')}.signature`;
    setJwtInput(testJWT);
  };

  const getStatusColor = (isValid: boolean, isExpired?: boolean) => {
    if (!isValid) return 'text-red-500';
    if (isExpired) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusBg = (isValid: boolean, isExpired?: boolean) => {
    if (!isValid) return 'bg-red-100';
    if (isExpired) return 'bg-orange-100';
    return 'bg-green-100';
  };

  return (
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "JWT Token Expiry Calculator",
        toolSeoData?.description || "Analyze JWT tokens, check expiry times, and decode payload information",
        "jwt-expiry-calculator"
      )}
      <ToolLayout
      breadcrumbTitle="JWT Expiry Checker"
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
              <Clock className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">JWT Token Expiry Calculator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Decode JWT tokens and check expiry times
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">jwt expiry</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">jwt token</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">token expiry</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">jwt decoder</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">JWT Token</label>
              <textarea
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="Paste your JWT token here..."
                rows={4}
                className="w-full rounded-lg bg-muted px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the complete JWT token (header.payload.signature)
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeJWT}
                disabled={!jwtInput.trim()}
                className="flex-1 rounded-lg text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
              >
                <RefreshCw className="inline h-4 w-4 mr-2" />
                Analyze JWT
              </motion.button>
              <button
                onClick={loadExample}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Load Example
              </button>
              <button
                onClick={generateTestJWT}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Generate Test
              </button>
            </div>
          </div>
        </motion.div>

        {/* JWT Analysis Results */}
        {jwtInfo && (
          <div className="space-y-6">
            {/* Status Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Token Status</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Copy JWT token"
                    title="Copy JWT token"
                    onClick={() => handleCopy("jwt", jwtInput)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied === "jwt" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    aria-label="Download JWT analysis report"
                    title="Download JWT analysis report"
                    onClick={downloadReport}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`text-center p-4 rounded-lg ${getStatusBg(jwtInfo.isValid, jwtInfo.isExpired)}`}>
                  <div className={`text-2xl font-bold ${getStatusColor(jwtInfo.isValid, jwtInfo.isExpired)}`}>
                    {jwtInfo.isValid ? (jwtInfo.isExpired ? 'Expired' : 'Valid') : 'Invalid'}
                  </div>
                  <div className="text-sm text-muted-foreground">Token Status</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {jwtInfo.timeToExpiry || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Time to Expiry</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-primary">
                    {jwtInfo.issuer || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Issuer</div>
                </div>
              </div>
            </motion.div>

            {/* Time Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h3 className="font-semibold mb-4">Time Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Issued At</span>
                  <span className="text-sm">
                    {jwtInfo.issuedAt ? jwtInfo.issuedAt.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Expires At</span>
                  <span className="text-sm">
                    {jwtInfo.expiryTime ? jwtInfo.expiryTime.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Not Before</span>
                  <span className="text-sm">
                    {jwtInfo.notBefore ? jwtInfo.notBefore.toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* JWT Header */}
            {jwtInfo.header && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <h3 className="font-semibold mb-4">Header</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {JSON.stringify(jwtInfo.header, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* JWT Payload */}
            {jwtInfo.payload && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <h3 className="font-semibold mb-4">Payload</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {JSON.stringify(jwtInfo.payload, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            JWT Token Information
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🔑 JWT Structure</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Header:</strong> Algorithm and token type</li>
                <li>• <strong>Payload:</strong> Claims and user data</li>
                <li>• <strong>Signature:</strong> Verification signature</li>
                <li>• <strong>Claims:</strong> exp, iat, nbf, iss, aud, sub</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">⏰ Time Claims</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>exp:</strong> Expiration time (Unix timestamp)</li>
                <li>• <strong>iat:</strong> Issued at time</li>
                <li>• <strong>nbf:</strong> Not valid before time</li>
                <li>• All times are in seconds since epoch</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            What is JWT Expiry Check?
          </h3>
          <p className="text-muted-foreground mb-4">
            JWT expiry checking verifies whether a JSON Web Token has expired based on its 'exp' (expiration) claim. It decodes the token, extracts the expiration timestamp, and compares it with the current time to determine if the token is still valid.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste your JWT token into the input field</li>
            <li>The tool decodes and extracts the exp claim</li>
            <li>It compares expiration time with current time</li>
            <li>View expiry status, time remaining, and decoded payload</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Expiry Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Real-time expiry check</li>
                <li>• Time remaining display</li>
                <li>• Payload inspection</li>
                <li>• Status indicators</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Debugging auth issues</li>
                <li>• Token lifecycle management</li>
                <li>• Session monitoring</li>
                <li>• API testing</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How is JWT expiration calculated?",
            answer: "JWT expiration uses the 'exp' claim, which is a Unix timestamp (seconds since epoch). The tool compares this with the current time to determine if the token has expired."
          },
          {
            question: "What if the token has no exp claim?",
            answer: "If the token lacks an 'exp' claim, it never expires by default. This is generally not recommended for security, as tokens without expiration remain valid indefinitely."
          },
          {
            question: "Can I check tokens that are already expired?",
            answer: "Yes, the tool will show that the token is expired and display how long ago it expired. This is useful for debugging why authentication failed."
          },
          {
            question: "What time format is used for exp?",
            answer: "The 'exp' claim uses Unix timestamp format (seconds since January 1, 1970). The tool converts this to readable dates and times."
          },
          {
            question: "Is this check secure?",
            answer: "This is a client-side check for debugging purposes. For security, always validate token expiration server-side with proper signature verification."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default JWTExpiryTool;
