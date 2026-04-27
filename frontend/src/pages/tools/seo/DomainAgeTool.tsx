import { useState } from "react";
import { Copy, Check, Calendar, Search, Download, Globe, Clock, AlertCircle, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

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
  const toolSeoData = getToolSeoMetadata('domain-age-checker');
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [inputDomains, setInputDomains] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const checkDomainAge = async (domain: string): Promise<DomainInfo> => {
    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.DOMAIN_AGE}`, {
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
      // console.error('Error checking domain:', error);
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
      // console.error('Error checking domains:', error);
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
    <>
      {CategorySEO.SEO(
        toolSeoData?.title || "Domain Age Checker",
        toolSeoData?.description || "Check domain age and expiration dates for SEO analysis and domain management",
        "domain-age"
      )}
      <ToolLayout
      title="Domain Age Checker"
      description="Check domain age and expiration dates for SEO analysis and domain management"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
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
              <Globe className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Domain Age Checker</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Analyze domain age and expiration dates for SEO insights and domain management.
              </p>
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
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <h3 className="font-semibold">Enter Domains</h3>
            </div>
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

            <motion.button
              type="button"
              onClick={checkDomains}
              disabled={isChecking || !inputDomains.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
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
            </motion.button>
          </div>
        </motion.div>

        {/* Results */}
        {domains.length > 0 && (
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
                Domain Analysis Results
              </h3>
              <motion.button
                type="button"
                onClick={downloadReport}
                title="Download domain age report"
                aria-label="Download domain age report"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </motion.button>
            </div>

            {domains.map((domain, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
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
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            What is Domain Age Checking?
          </h3>
          <p className="text-muted-foreground mb-4">
            Domain age checking determines how long a domain has been registered. Older domains are often viewed as more trustworthy by search engines and can have SEO advantages. This tool helps you assess domain history and credibility.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter a domain name to check</li>
            <li>The tool queries WHOIS databases</li>
            <li>View registration date and age</li>
            <li>Assess domain credibility</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Domain Information</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Registration date</li>
                <li>• Domain age calculation</li>
                <li>• Expiry information</li>
                <li>• Registrar details</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">SEO Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Trust factor</li>
                <li>• Authority building</li>
                <li>• Search ranking</li>
                <li>• Credibility assessment</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why does domain age matter for SEO?",
            answer: "Older domains are often seen as more trustworthy by search engines. They have established history, backlinks, and authority. New domains start with no trust and need time to build credibility."
          },
          {
            question: "How accurate is the domain age calculation?",
            answer: "Domain age is calculated from the initial registration date shown in WHOIS records. This is generally accurate, though some domains may have changed hands without registration date changes."
          },
          {
            question: "Can a new domain rank well in search results?",
            answer: "Yes, new domains can rank well with quality content, good SEO practices, and backlinks. Domain age is one factor among many. Quality and relevance are more important than age alone."
          },
          {
            question: "What's considered an old domain?",
            answer: "Domains older than 3-5 years are typically considered established. Domains over 10 years old are seen as very established. However, the quality of the domain's history matters more than just age."
          },
          {
            question: "Does buying an expired domain help SEO?",
            answer: "Buying expired domains can help if they have clean history and existing backlinks. However, domains with spam history or penalties can hurt your SEO. Always check the domain's history before purchasing."
          }
        ]} />

      </div>
    </ToolLayout>
      </>
  );
};

export default DomainAgeTool;
