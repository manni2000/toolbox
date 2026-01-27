import { useState } from "react";
import { Shield, AlertCircle, Lock } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const SSLCheckerTool = () => {
  const [domain, setDomain] = useState("");

  return (
    <ToolLayout
      title="SSL Certificate Checker"
      description="Check SSL certificate validity and expiry date"
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
                SSL certificate checking requires server-side connection. Enable Lovable Cloud to unlock.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <label className="mb-3 block text-sm font-medium">Domain Name</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="input-field w-full pl-12"
            />
          </div>
        </div>

        <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
          <Shield className="h-5 w-5" />
          Check SSL Certificate
        </button>

        {/* Example output */}
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">Valid Certificate</p>
              <p className="text-sm text-muted-foreground">Example output for demo</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Issuer</p>
            <p className="font-medium">Let's Encrypt (Example)</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Valid Until</p>
            <p className="font-medium">Mar 15, 2025 (Example)</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Days Remaining</p>
            <p className="font-medium">90 days (Example)</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Certificate Type</p>
            <p className="font-medium">Domain Validated (DV)</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default SSLCheckerTool;
