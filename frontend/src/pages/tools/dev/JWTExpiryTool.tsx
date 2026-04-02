import { useState } from "react";
import { Copy, Check, Clock, AlertCircle, RefreshCw, FileText, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "210 80% 55%";

interface JWTInfo {
  header: any;
  payload: any;
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
    <ToolLayout
      title="JWT Token Expiry Calculator"
      description="Analyze JWT tokens, check expiry times, and decode payload information"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">JWT Token Expiry Calculator</h3>
              <p className="text-sm text-muted-foreground">
                Decode JWT tokens and check expiry times
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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
              <button
                onClick={analyzeJWT}
                disabled={!jwtInput.trim()}
                className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="inline h-4 w-4 mr-2" />
                Analyze JWT
              </button>
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
        </div>

        {/* JWT Analysis Results */}
        {jwtInfo && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="rounded-xl border border-border bg-card p-6">
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
            </div>

            {/* Time Information */}
            <div className="rounded-xl border border-border bg-card p-6">
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
            </div>

            {/* JWT Header */}
            {jwtInfo.header && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Header</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {JSON.stringify(jwtInfo.header, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* JWT Payload */}
            {jwtInfo.payload && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Payload</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {JSON.stringify(jwtInfo.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
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
        </div>
      </div>
    </ToolLayout>
  );
};

export default JWTExpiryTool;
