import { useState } from "react";
import { Copy, Check, Calendar, Search, Download, Globe, Clock, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";

const categoryColor = "25 90% 50%";

interface DomainInfo {
  domain: string;
  creationDate: string;
  expirationDate: string;
  age: number;
  daysUntilExpiration: number;
  registrar: string;
  status: 'valid' | 'invalid' | 'error';
  error?: string;
}

const DomainAgeTool = () => {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [inputDomains, setInputDomains] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const checkDomainAge = async (domain: string): Promise<DomainInfo> => {
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/seo/domain-age`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.result) {
        return data.result;
      } else {
        return {
          domain: domain,
          creationDate: '',
          expirationDate: '',
          age: 0,
          daysUntilExpiration: 0,
          registrar: '',
          status: 'error',
          error: data.error || 'Failed to check domain'
        };
      }
    } catch (error) {
      console.error('Error checking domain:', error);
      return {
        domain: domain,
        creationDate: '',
        expirationDate: '',
        age: 0,
        daysUntilExpiration: 0,
        registrar: '',
        status: 'error',
        error: 'Network error'
      };
    }
  };

  const checkDomains = async () => {
    if (!inputDomains.trim()) return;

    setIsChecking(true);
    const domainList = inputDomains
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    try {
      const results = await Promise.all(
        domainList.map(domain => checkDomainAge(domain))
      );
      setDomains(results);
    } catch (error) {
      console.error('Error checking domains:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      domains: domains.map(domain => ({
        domain: domain.domain,
        creationDate: domain.creationDate,
        expirationDate: domain.expirationDate,
        age: domain.age,
        daysUntilExpiration: domain.daysUntilExpiration,
        registrar: domain.registrar,
        status: domain.status
      }))
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domain-age-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getAgeColor = (age: number) => {
    if (age >= 10) return 'text-green-500';
    if (age >= 5) return 'text-blue-500';
    if (age >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getExpirationColor = (days: number) => {
    if (days >= 365) return 'text-green-500';
    if (days >= 90) return 'text-blue-500';
    if (days >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getAgeText = (age: number) => {
    if (age === 1) return '1 year';
    if (age < 1) return `${Math.floor(age * 12)} months`;
    return `${age} years`;
  };

  return (
    <ToolLayout
      title="Domain Age Checker"
      description="Check domain age and expiration dates for SEO analysis and domain management"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Domain Age Checker</h3>
              <p className="text-sm text-muted-foreground">
                Analyze domain age and expiration dates for SEO insights
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Domains (one per line)</label>
              <textarea
                value={inputDomains}
                onChange={(e) => setInputDomains(e.target.value)}
                placeholder="google.com&#10;facebook.com&#10;amazon.com"
                rows={4}
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter domain names, one per line (e.g., google.com, facebook.com)
              </p>
            </div>

            <button
              type="button"
              onClick={checkDomains}
              disabled={isChecking || !inputDomains.trim()}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <>
                  <Clock className="inline h-4 w-4 mr-2 animate-spin" />
                  Checking Domains...
                </>
              ) : (
                <>
                  <Search className="inline h-4 w-4 mr-2" />
                  Check Domain Age
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {domains.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Domain Analysis Results</h3>
              <button
                type="button"
                onClick={downloadReport}
                title="Download domain age report"
                aria-label="Download domain age report"
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            {domains.map((domain, index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-lg">{domain.domain}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      domain.status === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {domain.status === 'valid' ? 'Valid' : 'Error'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`domain-${index}`, domain.domain)}
                      title={`Copy ${domain.domain}`}
                      aria-label={`Copy ${domain.domain}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copied === `domain-${index}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className={`text-2xl font-bold ${getAgeColor(domain.age)}`}>
                      {getAgeText(domain.age)}
                    </div>
                    <div className="text-sm text-muted-foreground">Domain Age</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {domain.creationDate}
                    </div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className={`text-2xl font-bold ${getExpirationColor(domain.daysUntilExpiration)}`}>
                      {domain.daysUntilExpiration} days
                    </div>
                    <div className="text-sm text-muted-foreground">Until Expiration</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary truncate">
                      {domain.registrar}
                    </div>
                    <div className="text-sm text-muted-foreground">Registrar</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SEO Impact:</span>
                    <span className={`text-sm font-bold ${getAgeColor(domain.age)}`}>
                      {domain.age >= 10 ? 'Excellent' : 
                       domain.age >= 5 ? 'Good' : 
                       domain.age >= 2 ? 'Fair' : 'New Domain'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {domain.age >= 10 ? 'Established authority and trust' :
                     domain.age >= 5 ? 'Good domain authority' :
                     domain.age >= 2 ? 'Building authority' :
                     'New domain, building trust'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Domain Age & SEO
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">📈 SEO Benefits</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Older domains have more authority</li>
                <li>• Better search engine trust</li>
                <li>• Established backlink profile</li>
                <li>• Historical ranking data</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">⚠️ Considerations</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Age is just one ranking factor</li>
                <li>• Content quality matters more</li>
                <li>• New domains can rank well</li>
                <li>• Monitor expiration dates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default DomainAgeTool;
