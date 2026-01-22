import { useState } from "react";
import { Server, AlertCircle, Search } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const DNSLookupTool = () => {
  const [domain, setDomain] = useState("");

  return (
    <ToolLayout
      title="DNS Lookup"
      description="Query DNS records for any domain"
      category="Internet Tools"
      categoryPath="/category/internet"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                Backend Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                DNS lookup requires server-side resolution. Enable Lovable Cloud to unlock this feature.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Domain Name</label>
          <div className="relative">
            <Server className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="input-field w-full pl-12"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA"].map((type) => (
            <button key={type} className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium">
              {type}
            </button>
          ))}
        </div>

        <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
          <Search className="h-5 w-5" />
          Lookup DNS Records
        </button>

        {/* Example output */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Example DNS Records (Demo)</h3>
          <div className="space-y-3 font-mono text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <span className="text-primary">A</span>
              <span className="ml-4 text-muted-foreground">93.184.216.34</span>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <span className="text-primary">MX</span>
              <span className="ml-4 text-muted-foreground">10 mail.example.com</span>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <span className="text-primary">NS</span>
              <span className="ml-4 text-muted-foreground">ns1.example.com</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default DNSLookupTool;
