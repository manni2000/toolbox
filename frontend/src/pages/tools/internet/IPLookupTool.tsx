import { useState, useEffect } from "react";
import {
  Globe,
  MapPin,
  Server,
  Wifi,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";

import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";

const categoryColor = "200 85% 50%";

interface IPLookupResult {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  note?: string;
}

const IPLookupTool = () => {
  const [ip, setIp] = useState("");
  const [myIp, setMyIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IPLookupResult | null>(null);

  const { toast } = useToast();

  const exampleIps = ["8.8.8.8", "1.1.1.1", "208.67.222.222"];

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setMyIp(data.ip))
      .catch(() => setMyIp("Unable to detect"));
  }, []);

  const handleLookup = async () => {
    if (!ip && !myIp) {
      toast({
        title: "IP Required",
        description: "Please enter a valid IP address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URLS.IP_LOOKUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ip: ip || undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        setResult(data.result);

        toast({
          title: "Lookup Complete",
          description: `Information fetched for ${data.result.ip}`,
        });
      } else {
        throw new Error(data.error || "IP lookup failed");
      }
    } catch (error) {
      toast({
        title: "Lookup Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to lookup IP address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="IP Address Lookup"
      description="Find geographic location, ISP, and other information for any IP address."
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">

        {/* Your IP */}
        <div className="rounded-xl border border-primary bg-primary/10 p-6">
          <div className="flex items-center gap-3">
            <Wifi className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Your IP Address
              </p>
              <p className="font-mono text-2xl font-bold">
                {myIp || "Detecting..."}
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">
              IP Address Lookup
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-3">

            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLookup();
                }}
                placeholder="8.8.8.8"
                className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={() => setIp(myIp || "")}
              className="btn-secondary"
            >
              Use My IP
            </button>

            <button
              onClick={handleLookup}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Lookup
                </>
              )}
            </button>

          </div>

          {/* Examples */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">

            <span>
              Supports IPv4 and IPv6 addresses.
            </span>

            <div className="flex gap-3">
              {exampleIps.map((e) => (
                <button
                  key={e}
                  onClick={() => setIp(e)}
                  className="hover:text-primary"
                >
                  {e}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">

            <h3 className="text-lg font-semibold">
              Lookup Results
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <ResultCard
                icon={<MapPin className="h-5 w-5 text-primary" />}
                title="Location"
                value={`${result.city}, ${result.region}`}
                sub={result.country}
              />

              <ResultCard
                icon={<Server className="h-5 w-5 text-primary" />}
                title="ISP"
                value={result.isp}
              />

              <ResultCard
                icon={<Globe className="h-5 w-5 text-primary" />}
                title="Country"
                value={`${result.country} (${result.countryCode})`}
              />

              <ResultCard
                icon={<Wifi className="h-5 w-5 text-primary" />}
                title="IP Address"
                value={result.ip}
                mono
              />

              <ResultCard
                icon={<Globe className="h-5 w-5 text-primary" />}
                title="Timezone"
                value={result.timezone}
              />

              <ResultCard
                icon={<Server className="h-5 w-5 text-primary" />}
                title="Organization"
                value={result.org}
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
            Enter an IP address above to view location and network details.
          </div>
        )}

      </div>
    </ToolLayout>
  );
};

const ResultCard = ({
  icon,
  title,
  value,
  sub,
  mono,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
  mono?: boolean;
}) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="mb-2">{icon}</div>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className={`font-medium ${mono ? "font-mono" : ""}`}>
      {value}
    </p>
    {sub && (
      <p className="text-sm text-muted-foreground">{sub}</p>
    )}
  </div>
);

export default IPLookupTool;