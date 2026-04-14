import { useState } from "react";
import { Server, Search, Loader2, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";

const categoryColor = "200 85% 50%";

interface DNSRecord {
  type: string;
  value: string;
  ttl?: number;
}

interface DNSLookupResult {
  domain: string;
  recordType: string;
  records: DNSRecord[];
  note?: string;
}

const DNSLookupTool = () => {
  const [domain, setDomain] = useState("");
  const [selectedRecordType, setSelectedRecordType] = useState("A");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DNSLookupResult | null>(null);

  const { toast } = useToast();

  const recordTypes = ["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA"];

  const exampleDomains = ["google.com", "github.com", "cloudflare.com"];

  const handleLookup = async () => {
    if (!domain) {
      toast({
        title: "Domain required",
        description: "Please enter a valid domain name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.DNS_LOOKUP}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          recordType: selectedRecordType,
        }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        setResult(data.result);

        toast({
          title: "DNS Lookup Complete",
          description: `Records fetched for ${domain}`,
        });
      } else {
        throw new Error(data.error || "DNS lookup failed");
      }
    } catch (error) {
      toast({
        title: "Lookup Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to fetch DNS records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="DNS Lookup"
      description="Query DNS records such as A, MX, TXT, NS, and more for any domain."
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">

        {/* Animated Hero Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}
            >
              <Server className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">DNS Lookup</h2>
              <p className="mt-2 text-sm text-muted-foreground">Query DNS records such as A, MX, TXT, NS, and more for any domain.</p>
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

          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            <h3 className="text-base font-semibold">
              Domain DNS Lookup
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-3">

            {/* Domain Input */}
            <div className="relative flex-1">
              <Server className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLookup();
                }}
                placeholder="example.com"
                className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Record Type Selector */}
            <select
              title="DNS record type"
              aria-label="DNS record type"
              value={selectedRecordType}
              onChange={(e) =>
                setSelectedRecordType(e.target.value)
              }
              className="rounded-lg border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
            >
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {type} Record
                </option>
              ))}
            </select>

          </div>

          {/* Examples */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">

            <span>
              Lookup DNS records like A, MX, TXT, NS for any domain.
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

        </motion.div>

        {/* Lookup Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLookup}
          disabled={loading || !domain}
          style={{ background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)` }}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Looking up DNS records...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Lookup DNS Records
            </>
          )}
        </motion.button>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >

            <h3 className="text-lg font-semibold">
              DNS Records for {result.domain}
            </h3>

            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">

              <div className="space-y-3 font-mono text-sm">

                {result.records.length > 0 ? (
                  result.records.map((record, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 p-3"
                    >
                      <span className="text-primary font-semibold">
                        {record.type}
                      </span>

                      <span className="text-muted-foreground break-all">
                        {record.value}
                      </span>

                      {record.ttl && (
                        <span className="text-xs text-muted-foreground">
                          TTL: {record.ttl}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No DNS records found.
                  </div>
                )}

              </div>

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

          </motion.div>
        )}

        {/* Empty State */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >

            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              <h3 className="font-semibold">
                Example DNS Records
              </h3>
            </div>

            <div className="space-y-3 font-mono text-sm">

              <div className="rounded-lg bg-muted/40 p-3">
                <span style={{ color: `hsl(${categoryColor})` }}>A</span>
                <span className="ml-4 text-muted-foreground">
                  93.184.216.34
                </span>
              </div>

              <div className="rounded-lg bg-muted/40 p-3">
                <span style={{ color: `hsl(${categoryColor})` }}>MX</span>
                <span className="ml-4 text-muted-foreground">
                  10 mail.example.com
                </span>
              </div>

              <div className="rounded-lg bg-muted/40 p-3">
                <span style={{ color: `hsl(${categoryColor})` }}>NS</span>
                <span className="ml-4 text-muted-foreground">
                  ns1.example.com
                </span>
              </div>

            </div>

          </motion.div>
        )}

      </div>
    </ToolLayout>
  );
};

export default DNSLookupTool;