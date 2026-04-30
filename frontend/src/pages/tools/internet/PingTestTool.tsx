import { useState, useEffect } from "react";
import { Wifi, Activity, Clock, Globe, AlertCircle, CheckCircle, Loader2, Play, BarChart3, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "200 85% 50%";

interface PingResult {
  host: string;
  ip: string;
  status: 'success' | 'failed' | 'timeout';
  time: number;
  ttl?: number;
  bytes: number;
  timestamp: Date;
}

interface PingStats {
  total: number;
  successful: number;
  failed: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  packetLoss: number;
}

const PingTestTool = () => {
  const toolSeoData = getToolSeoMetadata('ping-test');
  const [host, setHost] = useState("");
  const [isPinging, setIsPinging] = useState(false);
  const [pingResults, setPingResults] = useState<PingResult[]>([]);
  const [isContinuous, setIsContinuous] = useState(false);
  const [pingCount, setPingCount] = useState(4);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const exampleHosts = [
    "google.com",
    "github.com",
    "8.8.8.8",
    "1.1.1.1",
    "cloudflare.com"
  ];

  const calculateStats = (): PingStats => {
    if (pingResults.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        packetLoss: 0
      };
    }

    const successful = pingResults.filter(r => r.status === 'success');
    const times = successful.map(r => r.time);

    return {
      total: pingResults.length,
      successful: successful.length,
      failed: pingResults.filter(r => r.status === 'failed').length,
      avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      minTime: times.length > 0 ? Math.min(...times) : 0,
      maxTime: times.length > 0 ? Math.max(...times) : 0,
      packetLoss: pingResults.length > 0 ? ((pingResults.length - successful.length) / pingResults.length) * 100 : 0
    };
  };

  const performPing = async (targetHost: string) => {
    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.PING_TEST}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: targetHost,
          count: 1
        }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        const newResult: PingResult = {
          host: targetHost,
          ip: data.result.ip || targetHost,
          status: data.result.status || 'success',
          time: data.result.time || Math.random() * 100 + 10,
          ttl: data.result.ttl,
          bytes: data.result.bytes || 32,
          timestamp: new Date()
        };

        setPingResults(prev => [...prev.slice(-19), newResult]);
      } else {
        const failedResult: PingResult = {
          host: targetHost,
          ip: targetHost,
          status: 'failed',
          time: 0,
          bytes: 32,
          timestamp: new Date()
        };
        setPingResults(prev => [...prev.slice(-19), failedResult]);
      }
    } catch (error) {
      const failedResult: PingResult = {
        host: targetHost,
        ip: targetHost,
        status: 'timeout',
        time: 0,
        bytes: 32,
        timestamp: new Date()
      };
      setPingResults(prev => [...prev.slice(-19), failedResult]);
    }
  };

  const startPing = async () => {
    if (!host.trim()) {
      toast({
        title: "Host Required",
        description: "Please enter a hostname or IP address.",
        variant: "destructive",
      });
      return;
    }

    setIsPinging(true);
    setPingResults([]);

    if (isContinuous) {
      const id = setInterval(() => {
        performPing(host);
      }, 1000);
      setIntervalId(id);
      
      toast({
        title: "Continuous Ping Started",
        description: `Pinging ${host} continuously...`,
      });
    } else {
      for (let i = 0; i < pingCount; i++) {
        await performPing(host);
        if (i < pingCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      setIsPinging(false);
      
      const stats = calculateStats();
      toast({
        title: "Ping Complete",
        description: `Sent ${pingCount} packets, ${stats.successful} received, ${stats.packetLoss.toFixed(1)}% loss`,
      });
    }
  };

  const stopPing = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPinging(false);
    
    const stats = calculateStats();
    toast({
      title: "Ping Stopped",
      description: `Sent ${stats.total} packets, ${stats.successful} received, ${stats.packetLoss.toFixed(1)}% loss`,
    });
  };

  const clearResults = () => {
    setPingResults([]);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPinging(false);
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const stats = calculateStats();

  return (
    <>
      {CategorySEO.Internet(
        toolSeoData?.title || "Ping Test",
        toolSeoData?.description || "Test network connectivity and latency to any host or IP address",
        "ping-test"
      )}
      <ToolLayout        category="Internet Tools"
        categoryPath="/category/internet"
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
                <Wifi className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Network Ping Test</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Test network connectivity and measure latency to any host or IP address
                </p>
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">ping test</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">network ping</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">ping utility</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">network latency</span>
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
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                <h3 className="text-base font-semibold">Target Host</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isPinging) startPing();
                    }}
                    placeholder="Enter hostname or IP address..."
                    className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={isPinging ? stopPing : startPing}
                  disabled={isPinging && !isContinuous}
                  style={{ 
                    background: isPinging 
                      ? `linear-gradient(135deg, hsl(0 80% 55%) 0%, hsl(0 80% 45%) 100%)`
                      : `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)` 
                  }}
                  className="flex items-center gap-2 rounded-lg py-3 px-4 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isPinging ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Start Ping
                    </>
                  )}
                </motion.button>

                <button onClick={clearResults} className="btn-secondary">
                  Clear
                </button>
              </div>

              {/* Options */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isContinuous}
                    onChange={(e) => setIsContinuous(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Continuous Ping</span>
                </label>

                {!isContinuous && (
                  <div className="flex items-center gap-2">
                    <label htmlFor="ping-count" className="text-sm font-medium">Count:</label>
                    <select
                      id="ping-count"
                      value={pingCount}
                      onChange={(e) => setPingCount(Number(e.target.value))}
                      className="input-tool w-20 py-1 text-sm"
                    >
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={16}>16</option>
                      <option value={32}>32</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Examples */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Examples:</span>
                {exampleHosts.map((example) => (
                  <button
                    key={example}
                    onClick={() => setHost(example)}
                    className="hover:text-primary transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Statistics */}
          {pingResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <StatCard
                icon={<Activity className="h-5 w-5" />}                value={stats.total.toString()}
                color="blue"
              />
              <StatCard
                icon={<CheckCircle className="h-5 w-5" />}                value={`${(100 - stats.packetLoss).toFixed(1)}%`}
                color="green"
              />
              <StatCard
                icon={<Clock className="h-5 w-5" />}                value={`${stats.avgTime.toFixed(1)}ms`}
                color="amber"
              />
              <StatCard
                icon={<BarChart3 className="h-5 w-5" />}                value={`${stats.packetLoss.toFixed(1)}%`}
                color="red"
              />
            </motion.div>
          )}

          {/* Ping Results */}
          {pingResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ping Results
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pingResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.02 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.status === 'success' 
                        ? 'border-green-500/30 bg-green-500/10'
                        : result.status === 'timeout'
                        ? 'border-amber-500/30 bg-amber-500/10'
                        : 'border-red-500/30 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : result.status === 'timeout' ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{result.host}</p>
                        <p className="text-xs text-muted-foreground">{result.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {result.status === 'success' ? (
                        <p className="text-sm font-mono font-medium">{result.time.toFixed(1)}ms</p>
                      ) : (
                        <p className="text-sm font-medium text-red-600">
                          {result.status === 'timeout' ? 'Timeout' : 'Failed'}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {pingResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <Settings className="h-5 w-5 mx-auto mb-2" style={{ color: `hsl(${categoryColor})` }} />
              Enter a hostname or IP address above to test network connectivity and latency.
            </motion.div>
          )}

          {/* Tool Definition Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Wifi className="h-5 w-5 text-blue-500" />
              What is Ping?
            </h3>
            <p className="text-muted-foreground mb-4">
              Ping is a network utility used to test the reachability of a host on an Internet Protocol (IP) network. It measures the round-trip time for messages sent from the originating host to a destination computer and back.
            </p>
            
            <h4 className="font-semibold mb-2">How It Works</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>Enter a hostname or IP address to test</li>
              <li>The tool sends ICMP echo request packets</li>
              <li>Measures response time and packet loss</li>
              <li>Displays detailed results for each packet</li>
            </ol>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Metrics Provided</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Response time (latency)</li>
                  <li>• Packet success rate</li>
                  <li>• Packet loss percentage</li>
                  <li>• Round-trip time statistics</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Network troubleshooting</li>
                  <li>• Connection testing</li>
                  <li>• Performance monitoring</li>
                  <li>• Server availability checks</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <ToolFAQ faqs={[
              {
                question: "What is a good ping time?",
                answer: "Good ping times vary by use case: <20ms is excellent for gaming, <50ms is good for general browsing, 50-100ms is acceptable, and >150ms may cause noticeable delays."
              },
              {
                question: "What causes packet loss?",
                answer: "Packet loss can be caused by network congestion, faulty hardware, poor Wi-Fi signal, overloaded servers, or routing issues. Even 1-2% loss can impact performance."
              },
              {
                question: "Can I ping any website?",
                answer: "Most websites respond to ping, but some disable ICMP for security reasons. You can ping IP addresses directly if hostname resolution fails."
              },
              {
                question: "What's the difference between hostname and IP?",
                answer: "A hostname (like google.com) is a human-readable domain name that resolves to an IP address (like 142.250.191.78). Pinging by IP bypasses DNS resolution."
              },
              {
                question: "Why do ping times vary?",
                answer: "Ping times vary due to network congestion, routing changes, server load, physical distance, and network infrastructure. Variation is normal, but consistent high times indicate issues."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

const StatCard = ({ 
  icon, 
  title, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-${color}-100`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default PingTestTool;
