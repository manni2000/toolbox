import { useState } from "react";
import { Copy, Check, Link, Download, Plus, Trash2, Share2, Globe, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "25 90% 50%";

interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
}

interface UTMLink {
  id: string;
  baseUrl: string;
  params: UTMParams;
  generatedUrl: string;
  description: string;
}

const UTMLinkBuilderTool = () => {
  const [links, setLinks] = useState<UTMLink[]>([
    {
      id: '1',
      baseUrl: '',
      params: {
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_term: '',
        utm_content: ''
      },
      generatedUrl: '',
      description: ''
    }
  ]);

  const [copied, setCopied] = useState<string | null>(null);

  const addLink = () => {
    const newLink: UTMLink = {
      id: Date.now().toString(),
      baseUrl: '',
      params: {
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_term: '',
        utm_content: ''
      },
      generatedUrl: '',
      description: ''
    };
    setLinks([...links, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const updateLink = (id: string, field: keyof UTMLink, value: string) => {
    setLinks(links.map(link => {
      if (link.id === id) {
        const updatedLink = { ...link, [field]: value };
        // Auto-generate URL when params change
        if (field === 'baseUrl' || field.startsWith('params.')) {
          updatedLink.generatedUrl = generateUTMUrl(updatedLink.baseUrl, updatedLink.params);
        }
        return updatedLink;
      }
      return link;
    }));
  };

  const updateParam = (id: string, param: keyof UTMParams, value: string) => {
    setLinks(links.map(link => {
      if (link.id === id) {
        const updatedLink = {
          ...link,
          params: { ...link.params, [param]: value }
        };
        updatedLink.generatedUrl = generateUTMUrl(updatedLink.baseUrl, updatedLink.params);
        return updatedLink;
      }
      return link;
    }));
  };

  const generateUTMUrl = (baseUrl: string, params: UTMParams): string => {
    const url = new URL(baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value.trim()) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadUTMLinks = () => {
    const data = {
      timestamp: new Date().toISOString(),
      links: links.map(link => ({
        baseUrl: link.baseUrl,
        description: link.description,
        params: link.params,
        generatedUrl: link.generatedUrl
      }))
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utm-links.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadPreset = (id: string) => {
    const presets = {
      email: {
        utm_source: 'email',
        utm_medium: 'email',
        utm_campaign: 'newsletter',
        utm_term: '',
        utm_content: ''
      },
      social: {
        utm_source: 'facebook',
        utm_medium: 'social',
        utm_campaign: 'social_media',
        utm_term: '',
        utm_content: ''
      },
      search: {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'search_ads',
        utm_term: '',
        utm_content: ''
      },
      referral: {
        utm_source: 'partner_site',
        utm_medium: 'referral',
        utm_campaign: 'partnership',
        utm_term: '',
        utm_content: ''
      }
    };

    const preset = presets[id as keyof typeof presets];
    if (preset && links.length > 0) {
      const firstLink = links[0];
      updateLink(firstLink.id, 'params', JSON.stringify(preset));
    }
  };

  return (
    <ToolLayout
      title="UTM Link Builder"
      description="Create UTM-tagged URLs for tracking marketing campaigns and traffic sources"
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
              <Share2 className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">UTM Link Builder</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create trackable URLs with UTM parameters for marketing campaigns.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Presets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Quick Presets
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'email', label: 'Email Campaign' },
              { id: 'social', label: 'Social Media' },
              { id: 'search', label: 'Search Ads' },
              { id: 'referral', label: 'Referral' }
            ].map((preset, index) => (
              <motion.button
                key={preset.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadPreset(preset.id)}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* UTM Links */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <motion.div 
              key={link.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" style={{ color: `hsl(${categoryColor})` }} />
                  UTM Link #{index + 1}
                </h3>
                <div className="flex gap-2">
                  {links.length > 1 && (
                    <button
                      type="button"
                      title="Remove UTM link"
                      aria-label="Remove UTM link"
                      onClick={() => removeLink(link.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Base URL</label>
                    <input
                      type="url"
                      value={link.baseUrl}
                      onChange={(e) => updateLink(link.id, 'baseUrl', e.target.value)}
                      placeholder="https://yoursite.com/page"
                      className="w-full rounded-lg bg-muted px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <input
                      type="text"
                      value={link.description}
                      onChange={(e) => updateLink(link.id, 'description', e.target.value)}
                      placeholder="Campaign description"
                      className="w-full rounded-lg bg-muted px-4 py-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">UTM Source *</label>
                    <input
                      type="text"
                      value={link.params.utm_source}
                      onChange={(e) => updateParam(link.id, 'utm_source', e.target.value)}
                      placeholder="google, facebook, email"
                      className="w-full rounded-lg bg-muted px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UTM Medium *</label>
                    <input
                      type="text"
                      value={link.params.utm_medium}
                      onChange={(e) => updateParam(link.id, 'utm_medium', e.target.value)}
                      placeholder="cpc, social, email"
                      className="w-full rounded-lg bg-muted px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UTM Campaign *</label>
                    <input
                      type="text"
                      value={link.params.utm_campaign}
                      onChange={(e) => updateParam(link.id, 'utm_campaign', e.target.value)}
                      placeholder="summer_sale, newsletter"
                      className="w-full rounded-lg bg-muted px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UTM Term</label>
                    <input
                      type="text"
                      value={link.params.utm_term}
                      onChange={(e) => updateParam(link.id, 'utm_term', e.target.value)}
                      placeholder="running_shoes, blue_widget"
                      className="w-full rounded-lg bg-muted px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UTM Content</label>
                    <input
                      type="text"
                      value={link.params.utm_content}
                      onChange={(e) => updateParam(link.id, 'utm_content', e.target.value)}
                      placeholder="header_link, sidebar_button"
                      className="w-full rounded-lg bg-muted px-4 py-3"
                    />
                  </div>
                </div>

                {/* Generated URL */}
                {link.generatedUrl && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Generated URL:</span>
                      <button
                        onClick={() => handleCopy(`url-${link.id}`, link.generatedUrl)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied === `url-${link.id}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="p-3 bg-background rounded border border-border">
                      <p className="font-mono text-sm break-all">{link.generatedUrl}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Link Button */}
        <motion.button
          onClick={addLink}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-lg px-4 py-3 font-medium transition-colors text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          <Plus className="inline h-4 w-4 mr-2" />
          Add Another UTM Link
        </motion.button>

        {/* Export Button */}
        {links.some(link => link.generatedUrl) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={downloadUTMLinks}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-muted px-6 py-3 font-medium hover:bg-muted/80 transition-colors"
            >
              <Download className="inline h-4 w-4 mr-2" />
              Export UTM Links
            </motion.button>
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
            <Globe className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            UTM Parameters Guide
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">📝 Required Parameters</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>utm_source:</strong> Traffic source (google, facebook)</li>
                <li>• <strong>utm_medium:</strong> Marketing medium (cpc, social)</li>
                <li>• <strong>utm_campaign:</strong> Campaign name (summer_sale)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🔍 Optional Parameters</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>utm_term:</strong> Search terms (running_shoes)</li>
                <li>• <strong>utm_content:</strong> Ad content (header_link)</li>
                <li>• Use for A/B testing and content tracking</li>
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
            <Link className="h-5 w-5 text-blue-500" />
            What is UTM Link Building?
          </h3>
          <p className="text-muted-foreground mb-4">
            UTM link building adds tracking parameters to URLs to monitor marketing campaign performance. These parameters help you identify which campaigns, sources, and mediums drive traffic to your website.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your base URL</li>
            <li>Add UTM parameters (source, medium, campaign)</li>
            <li>The tool generates the tracked URL</li>
            <li>Use in marketing to track performance</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">UTM Parameters</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• utm_source (referral source)</li>
                <li>• utm_medium (marketing channel)</li>
                <li>• utm_campaign (campaign name)</li>
                <li>• utm_content/term (details)</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Tracking Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Campaign performance</li>
                <li>• Traffic attribution</li>
                <li>• ROI measurement</li>
                <li>• Conversion tracking</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Which UTM parameters are required?",
            answer: "Only utm_source and utm_medium are required for basic tracking. Utm_campaign is highly recommended. Utm_content and utm_term are optional for additional detail."
          },
          {
            question: "What should I use for utm_source?",
            answer: "Use the specific referrer: google, newsletter, facebook, twitter, linkedin, etc. This identifies where the traffic originated from."
          },
          {
            question: "What values work for utm_medium?",
            answer: "Common values: cpc, email, social, organic, referral, display, etc. This describes the marketing channel or medium."
          },
          {
            question: "Can UTM parameters affect SEO?",
            answer: "UTM parameters don't directly affect SEO but can create duplicate URLs. Use canonical tags to consolidate them. They're essential for tracking marketing performance."
          },
          {
            question: "Should I use UTM links on my website?",
            answer: "Use UTM links for external marketing campaigns, not internal links. Internal linking with UTMs can confuse analytics. Keep internal links clean."
          }
        ]} />
      </div>
    </ToolLayout>
  );
};

export default UTMLinkBuilderTool;
