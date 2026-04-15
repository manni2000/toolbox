import { useState } from "react";
import { Wifi, Activity, Loader2, Globe, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";

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
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.WEBSITE_PING}`, {
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
              <Wifi className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Website Ping Test</h2>
              <p className="mt-2 text-sm text-muted-foreground">Test website availability and response time.</p>
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
            <Wifi className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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

        </motion.div>

        {/* Ping Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePing}
          disabled={loading || !url.trim()}
          style={{ background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)` }}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
              Ping Results
            </h3>

            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl border p-6 shadow-lg hover:shadow-xl transition-shadow duration-500 ${
                result.packetLoss === 0
                  ? 'border-green-500/30 bg-green-500/10'
                  : 'border-red-500/30 bg-red-500/10'
              }`}
            >
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
            </motion.div>

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
                icon={<Activity className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="Average"
                value={`${result.avgTime}ms`}
              />
              <ResultCard
                icon={<Activity className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="Min"
                value={`${result.minTime}ms`}
              />
              <ResultCard
                icon={<Activity className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="Max"
                value={`${result.maxTime}ms`}
              />
            </div>

            {/* Additional Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                icon={<Globe className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
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

          </motion.div>
        )}

        {/* Empty State */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <Settings className="h-5 w-5 mx-auto mb-2" style={{ color: `hsl(${categoryColor})` }} />
            Enter a website URL above to test availability and response time.
          </motion.div>
        )}

        {/* FAQ Section */}
        <ToolFAQ />
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
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-xl border border-border bg-card p-5 shadow-lg hover:shadow-xl transition-shadow duration-500"
  >
    <div className="mb-2">{icon}</div>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="font-medium">{value}</p>
    {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
  </motion.div>
);
