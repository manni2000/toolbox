import { useState } from "react";
import { Wifi, Activity, Loader2, Globe, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";

const categoryColor = "200 85% 50%";

interface PingResult {
  sequence: number;
  time: number;
  ttl: number;
  status?: number;
  success: boolean;
  error?: string;
}

interface PingInfo {
  url: string;
  host: string;
  packetsTransmitted: number;
  packetsReceived: number;
  packetLoss: number;
  minTime: number;
  maxTime: number;
  avgTime: number;
  results: PingResult[];
  note?: string;
}

const WebsitePingTool = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PingInfo | null>(null);
  const { toast } = useToast();

  const exampleWebsites = ["google.com", "github.com", "stackoverflow.com", "youtube.com"];

  const handlePing = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid website URL.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(API_URLS.WEBSITE_PING, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, count: 4 }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        setResult(data.result);
        toast({
          title: "Ping Complete",
          description: `Tested ${data.result.host} successfully`,
        });
      } else {
        throw new Error(data.error || "Ping test failed");
      }
    } catch (error) {
      toast({
        title: "Ping Failed",
        description: error instanceof Error ? error.message : "Unable to ping website",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Website Ping Test"
      description="Test website availability and response time."
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

          <div className="flex items-center gap-2 mb-4">
            <Wifi className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">
              Website Ping Test
            </h3>
          </div>

          <div className="space-y-4">

            {/* URL Input */}
            <div className="relative">
              <Wifi className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePing();
                }}
                placeholder="google.com"
                className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Examples and Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">

              <span>
                Test website availability, response time, and connection quality.
                <br />
                Press Enter to ping quickly.
              </span>

              <div className="flex gap-3">
                {exampleWebsites.map((site) => (
                  <button
                    key={site}
                    onClick={() => setUrl(site)}
                    className="hover:text-primary"
                    title={`Ping ${site}`}
                  >
                    {site}
                  </button>
                ))}
              </div>

            </div>

          </div>

        </div>

        {/* Ping Button */}
        <button
          onClick={handlePing}
          disabled={loading || !url.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Pinging Website...
            </>
          ) : (
            <>
              <Activity className="h-5 w-5" />
              Ping Website
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4">

            <h3 className="text-lg font-semibold">
              Ping Results
            </h3>

            {/* Status Card */}
            <div className={`rounded-xl border p-6 ${
              result.packetLoss === 0
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-red-500/30 bg-red-500/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 animate-pulse rounded-full ${
                    result.packetLoss === 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={`font-semibold ${
                    result.packetLoss === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {result.packetLoss === 0 ? 'Online' : 'Connection Issues'}
                  </span>
                </div>
                <span className="font-mono text-2xl font-bold">{result.avgTime}ms</span>
              </div>
            </div>

            {/* Individual Pings */}
            <div className="grid gap-4 sm:grid-cols-4">
              {result.results.map((ping) => (
                <ResultCard
                  key={ping.sequence}
                  icon={<Activity className={`h-5 w-5 ${ping.success ? 'text-green-500' : 'text-red-500'}`} />}
                  title={`Ping ${ping.sequence}`}
                  value={`${ping.time}ms`}
                  sub={ping.success ? 'Success' : 'Failed'}
                />
              ))}
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <ResultCard
                icon={<Activity className="h-5 w-5 text-primary" />}
                title="Average"
                value={`${result.avgTime}ms`}
              />
              <ResultCard
                icon={<Activity className="h-5 w-5 text-primary" />}
                title="Min"
                value={`${result.minTime}ms`}
              />
              <ResultCard
                icon={<Activity className="h-5 w-5 text-primary" />}
                title="Max"
                value={`${result.maxTime}ms`}
              />
            </div>

            {/* Additional Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                icon={<Globe className="h-5 w-5 text-primary" />}
                title="Host"
                value={result.host}
              />
              <ResultCard
                icon={<Activity className={`h-5 w-5 ${result.packetLoss > 0 ? 'text-red-500' : 'text-green-500'}`} />}
                title="Packet Loss"
                value={`${result.packetLoss}%`}
                sub={result.packetLoss > 0 ? 'Issues detected' : 'No packet loss'}
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
            Enter a website URL above to test availability and response time.
          </div>
        )}

      </div>
    </ToolLayout>
  );
};

export default WebsitePingTool;

const ResultCard = ({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="mb-2">{icon}</div>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="font-medium">{value}</p>
    {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
  </div>
);
