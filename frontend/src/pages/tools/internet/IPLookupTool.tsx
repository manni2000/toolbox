import { useState, useEffect } from "react";
import {
  Globe,
  MapPin,
  Server,
  Wifi,
  Loader2,
  Search,
  Sparkles,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";

import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";

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
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.IP_LOOKUP}`, {
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
              <Globe className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">IP Address Lookup</h2>
              <p className="mt-2 text-sm text-muted-foreground">Find geographic location, ISP, and other information for any IP address.</p>
            </div>
          </div>
        </motion.div>

        {/* Your IP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          style={{ borderColor: `hsl(${categoryColor} / 0.3)`, backgroundColor: `hsl(${categoryColor} / 0.1)` }}
        >
          <div className="flex items-center gap-3">
            <Wifi className="h-6 w-6" style={{ color: `hsl(${categoryColor})` }} />
            <div>
              <p className="text-sm text-muted-foreground">
                Your IP Address
              </p>
              <p className="font-mono text-2xl font-bold">
                {myIp || "Detecting..."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >

          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLookup}
              disabled={loading}
              style={{ background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)` }}
              className="flex items-center gap-2 rounded-lg py-3 px-4 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
            </motion.button>

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

        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >

            <h3 className="text-lg font-semibold">
              Lookup Results
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <ResultCard
                icon={<MapPin className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="Location"
                value={`${result.city}, ${result.region}`}
                sub={result.country}
              />

              <ResultCard
                icon={<Server className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="ISP"
                value={result.isp}
              />

              <ResultCard
                icon={<Globe className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="Country"
                value={`${result.country} (${result.countryCode})`}
              />

              <ResultCard
                icon={<Wifi className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="IP Address"
                value={result.ip}
                mono
              />

              <ResultCard
                icon={<Globe className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
                title="Timezone"
                value={result.timezone}
              />

              <ResultCard
                icon={<Server className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />}
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
            Enter an IP address above to view location and network details.
          </motion.div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            What is IP Lookup?
          </h3>
          <p className="text-muted-foreground mb-4">
            IP lookup retrieves information about an IP address, including its geographical location, ISP, organization, and other metadata. This helps identify where internet traffic originates and provides insights about network connections.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter an IP address to lookup</li>
            <li>The tool queries IP geolocation databases</li>
            <li>View the location and network details</li>
            <li>Get ISP and organization information</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Information Provided</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Geographical location</li>
                <li>• ISP and organization</li>
                <li>• Timezone</li>
                <li>• Connection type</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Security analysis</li>
                <li>• Fraud detection</li>
                <li>• Content localization</li>
                <li>• Network troubleshooting</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How accurate is IP geolocation?",
            answer: "IP geolocation accuracy varies by location type. City-level accuracy is typically 80-90% for IPv4 addresses. IPv6 and mobile IPs may have lower accuracy. It's generally accurate to within 25-50 miles."
          },
          {
            question: "Can IP addresses be hidden or spoofed?",
            answer: "Yes, IP addresses can be hidden using VPNs, proxies, or Tor. Spoofing is technically difficult for outbound connections but possible in certain network configurations. Always verify IP information for critical decisions."
          },
          {
            question: "What's the difference between IPv4 and IPv6?",
            answer: "IPv4 uses 32-bit addresses (e.g., 192.0.2.1) and has ~4.3 billion addresses. IPv6 uses 128-bit addresses (e.g., 2001:db8::1) providing virtually unlimited addresses for the growing internet."
          },
          {
            question: "Why might IP lookup show wrong location?",
            answer: "IP location is based on ISP registration, not physical device location. Mobile IPs may show carrier HQ, VPNs show server locations, and corporate networks may show proxy locations."
          },
          {
            question: "Is IP lookup privacy-compliant?",
            answer: "IP addresses are considered personal data in many jurisdictions. Geolocation databases aggregate public information. For compliance, avoid storing IP addresses without consent and follow data protection regulations."
          }
        ]} />

      </div>
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
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-xl border border-border bg-card p-5 shadow-lg hover:shadow-xl transition-shadow duration-500"
  >
    <div className="mb-2">{icon}</div>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className={`font-medium ${mono ? "font-mono" : ""}`}>
      {value}
    </p>
    {sub && (
      <p className="text-sm text-muted-foreground">{sub}</p>
    )}
  </motion.div>
);

export default IPLookupTool;