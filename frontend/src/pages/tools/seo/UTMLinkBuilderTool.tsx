import { useState } from "react";
import { Copy, Check, Link, Download, Plus, Trash2, Share2, Globe } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

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
  const [links, setLinks] = useState<UTMLLink[]>([
    {
      id: '1',
      baseUrl: 'https://yoursite.com',
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
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">UTM Link Builder</h3>
              <p className="text-sm text-muted-foreground">
                Create trackable URLs with UTM parameters for marketing campaigns
              </p>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Quick Presets</h3>
          <div className="flex gap-3">
            <button
              onClick={() => loadPreset('email')}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
            >
              Email Campaign
            </button>
            <button
              onClick={() => loadPreset('social')}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
            >
              Social Media
            </button>
            <button
              onClick={() => loadPreset('search')}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
            >
              Search Ads
            </button>
            <button
              onClick={() => loadPreset('referral')}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
            >
              Referral
            </button>
          </div>
        </div>

        {/* UTM Links */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={link.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">UTM Link #{index + 1}</h3>
                <div className="flex gap-2">
                  {links.length > 1 && (
                    <button
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
            </div>
          ))}
        </div>

        {/* Add Link Button */}
        <button
          onClick={addLink}
          className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="inline h-4 w-4 mr-2" />
          Add Another UTM Link
        </button>

        {/* Export Button */}
        {links.some(link => link.generatedUrl) && (
          <div className="flex justify-center">
            <button
              onClick={downloadUTMLinks}
              className="rounded-lg bg-muted px-6 py-3 font-medium hover:bg-muted/80 transition-colors"
            >
              <Download className="inline h-4 w-4 mr-2" />
              Export UTM Links
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
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
        </div>
      </div>
    </ToolLayout>
  );
};

export default UTMLinkBuilderTool;
