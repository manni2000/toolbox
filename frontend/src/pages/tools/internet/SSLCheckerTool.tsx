import { useState } from "react";
import {
  Shield,
  Lock,
  Loader2,
  Search,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";

import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";

const categoryColor = "200 85% 50%";

interface SSLCheckResult {
  domain: string;
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validUntil: string;
  daysUntilExpiry: number;
  protocol: string;
  cipherSuite: string;
  note?: string;
}

const SSLCheckerTool = () => {

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SSLCheckResult | null>(null);

  const { toast } = useToast();

  const exampleDomains = [
    "google.com",
    "github.com",
    "cloudflare.com"
  ];

  const handleCheck = async () => {

    if (!domain) {
      toast({
        title: "Domain Required",
        description: "Please enter a valid domain.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(API_URLS.SSL_CHECKER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ domain })
      });

      const data = await response.json();

      if (data.success && data.result) {

        setResult(data.result);

        toast({
          title: "SSL Check Complete",
          description: `Certificate fetched for ${data.result.domain}`
        });

      } else {
        throw new Error(data.error || "SSL check failed");
      }

    } catch (error) {

      toast({
        title: "Check Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to check SSL certificate",
        variant: "destructive"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="SSL Certificate Checker"
      description="Verify SSL certificate validity, issuer, and expiry date for any domain."
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">

        {/* Input Section */}

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">
              SSL Certificate Check
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-3">

            <div className="relative flex-1">

              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCheck();
                }}
                placeholder="example.com"
                className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />

            </div>

            <button
              onClick={handleCheck}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >

              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Check SSL
                </>
              )}

            </button>

          </div>

          {/* Examples */}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">

            <span>
              Supports domain names and HTTPS URLs.
            </span>

            <div className="flex gap-3">

              {exampleDomains.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className="hover:text-primary"
                >
                  {d}
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* Results */}

        {result && (

          <div className="space-y-4">

            {/* Certificate Status */}

            <div
              className={`rounded-xl border p-6 ${
                result.valid
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >

              <div className="flex items-center gap-3">

                <Shield
                  className={`h-8 w-8 ${
                    result.valid
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />

                <div>

                  <p
                    className={`font-semibold ${
                      result.valid
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {result.valid
                      ? "Valid SSL Certificate"
                      : "Invalid SSL Certificate"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Certificate for {result.domain}
                  </p>

                </div>

              </div>

            </div>

            {/* Details Grid */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <ResultCard
                title="Issuer"
                value={result.issuer}
              />

              <ResultCard
                title="Subject"
                value={result.subject}
              />

              <ResultCard
                title="Valid From"
                value={new Date(result.validFrom).toLocaleDateString()}
              />

              <ResultCard
                title="Valid Until"
                value={new Date(result.validUntil).toLocaleDateString()}
              />

              <ResultCard
                title="Days Remaining"
                value={`${result.daysUntilExpiry} days`}
                danger={result.daysUntilExpiry < 30}
              />

              <ResultCard
                title="Protocol"
                value={result.protocol}
              />

              <ResultCard
                title="Cipher Suite"
                value={result.cipherSuite}
                small
              />

            </div>

            {result.note && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">

                <strong className="text-amber-600 dark:text-amber-400">
                  Note:
                </strong>

                <span className="ml-2 text-muted-foreground">
                  {result.note}
                </span>

              </div>
            )}

          </div>

        )}

        {/* Empty State */}

        {!result && (

          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Enter a domain above to check SSL certificate details.
          </div>

        )}

      </div>
    </ToolLayout>
  );
};


const ResultCard = ({
  title,
  value,
  danger,
  small
}: {
  title: string;
  value: string;
  danger?: boolean;
  small?: boolean;
}) => (

  <div className="rounded-xl border border-border bg-card p-5">

    <p className="text-sm text-muted-foreground">
      {title}
    </p>

    <p
      className={`font-medium ${
        danger ? "text-red-500" : ""
      } ${small ? "text-sm" : ""}`}
    >
      {value}
    </p>

  </div>

);

export default SSLCheckerTool;