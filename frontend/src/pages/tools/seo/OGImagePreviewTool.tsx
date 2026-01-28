import { useState } from "react";
import { Copy, Check, Image, Download, Globe, Share2, Eye, Settings } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface OGData {
  title: string;
  description: string;
  url: string;
  siteName: string;
  image: string;
  type: string;
  locale: string;
  author: string;
}

const OGImagePreviewTool = () => {
  const [ogData, setOgData] = useState<OGData>({
    title: "Your Amazing Page Title",
    description: "This is a compelling description that will appear when your content is shared on social media platforms like Facebook, Twitter, and LinkedIn.",
    url: "https://yoursite.com/page",
    siteName: "Your Website",
    image: "https://via.placeholder.com/1200x630/4f46e5/ffffff?text=OG+Image+Preview",
    type: "website",
    locale: "en_US",
    author: "Your Name"
  });

  const [previewSize, setPreviewSize] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');
  const [copied, setCopied] = useState<string | null>(null);

  const generateOGTags = () => {
    const tags = [
      `<!-- Open Graph / Facebook -->`,
      `<meta property="og:type" content="${ogData.type}">`,
      `<meta property="og:url" content="${ogData.url}">`,
      `<meta property="og:title" content="${ogData.title}">`,
      `<meta property="og:description" content="${ogData.description}">`,
      `<meta property="og:image" content="${ogData.image}">`,
      `<meta property="og:image:width" content="1200">`,
      `<meta property="og:image:height" content="630">`,
      `<meta property="og:site_name" content="${ogData.siteName}">`,
      `<meta property="og:locale" content="${ogData.locale}">`,
      ``,
      `<!-- Twitter Card -->`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:url" content="${ogData.url}">`,
      `<meta name="twitter:title" content="${ogData.title}">`,
      `<meta name="twitter:description" content="${ogData.description}">`,
      `<meta name="twitter:image" content="${ogData.image}">`,
      `<meta name="twitter:site" content="@${ogData.author}">`,
      `<meta name="twitter:creator" content="@${ogData.author}">`,
      ``,
      `<!-- Additional Meta -->`,
      `<meta name="author" content="${ogData.author}">`,
      `<meta property="article:author" content="${ogData.author}">`
    ];

    return tags.join('\n');
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadOGTags = () => {
    const tags = generateOGTags();
    const blob = new Blob([tags], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'og-meta-tags.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPreviewDimensions = () => {
    switch (previewSize) {
      case 'facebook':
        return { width: 500, height: 263 };
      case 'twitter':
        return { width: 500, height: 280 };
      case 'linkedin':
        return { width: 500, height: 262 };
      default:
        return { width: 500, height: 263 };
    }
  };

  const getPlatformName = () => {
    switch (previewSize) {
      case 'facebook':
        return 'Facebook';
      case 'twitter':
        return 'Twitter';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return 'Social Media';
    }
  };

  const dimensions = getPreviewDimensions();

  return (
    <ToolLayout
      title="OG Image Preview Tool"
      description="Preview and generate Open Graph meta tags for perfect social media sharing"
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
              <h3 className="text-lg font-semibold text-foreground">OG Image Preview Tool</h3>
              <p className="text-sm text-muted-foreground">
                Preview and optimize Open Graph tags for perfect social media sharing
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">OG Meta Data</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={ogData.title}
                  onChange={(e) => setOgData({...ogData, title: e.target.value})}
                  placeholder="Page title"
                  maxLength={60}
                  className="w-full rounded-lg bg-muted px-4 py-3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {ogData.title.length}/60 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={ogData.siteName}
                  onChange={(e) => setOgData({...ogData, siteName: e.target.value})}
                  placeholder="Your website name"
                  className="w-full rounded-lg bg-muted px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={ogData.description}
                onChange={(e) => setOgData({...ogData, description: e.target.value})}
                placeholder="Page description"
                maxLength={160}
                rows={3}
                className="w-full rounded-lg bg-muted px-4 py-3 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {ogData.description.length}/160 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={ogData.url}
                  onChange={(e) => setOgData({...ogData, url: e.target.value})}
                  placeholder="https://yoursite.com/page"
                  className="w-full rounded-lg bg-muted px-4 py-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={ogData.image}
                  onChange={(e) => setOgData({...ogData, image: e.target.value})}
                  placeholder="https://yoursite.com/image.jpg"
                  className="w-full rounded-lg bg-muted px-4 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={ogData.type}
                  onChange={(e) => setOgData({...ogData, type: e.target.value})}
                  className="w-full rounded-lg bg-muted px-4 py-3"
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Locale</label>
                <select
                  value={ogData.locale}
                  onChange={(e) => setOgData({...ogData, locale: e.target.value})}
                  className="w-full rounded-lg bg-muted px-4 py-3"
                >
                  <option value="en_US">English (US)</option>
                  <option value="en_GB">English (UK)</option>
                  <option value="es_ES">Spanish</option>
                  <option value="fr_FR">French</option>
                  <option value="de_DE">German</option>
                  <option value="ja_JP">Japanese</option>
                  <option value="zh_CN">Chinese</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <input
                  type="text"
                  value={ogData.author}
                  onChange={(e) => setOgData({...ogData, author: e.target.value})}
                  placeholder="Author name"
                  className="w-full rounded-lg bg-muted px-4 py-3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Social Media Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewSize('facebook')}
                className={`px-3 py-1 text-sm rounded ${
                  previewSize === 'facebook' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Facebook
              </button>
              <button
                onClick={() => setPreviewSize('twitter')}
                className={`px-3 py-1 text-sm rounded ${
                  previewSize === 'twitter' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Twitter
              </button>
              <button
                onClick={() => setPreviewSize('linkedin')}
                className={`px-3 py-1 text-sm rounded ${
                  previewSize === 'linkedin' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                LinkedIn
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div 
              className="border border-gray-300 rounded-lg overflow-hidden bg-white"
              style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
            >
              {/* Preview Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                  <span className="text-xs text-gray-600">facebook.com</span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-3">
                <div className="flex gap-3">
                  <img
                    src={ogData.image}
                    alt="OG Preview"
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/80x80/e0e0e0/666666?text=Image";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {ogData.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {ogData.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Globe className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500 truncate">
                        {ogData.url}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {getPlatformName()} preview ({dimensions.width}x{dimensions.height}px)
          </div>
        </div>

        {/* Generated Tags */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Generated Meta Tags</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy("tags", generateOGTags())}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied === "tags" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={downloadOGTags}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
              {generateOGTags()}
            </pre>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            OG Image Best Practices
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">📐 Image Guidelines</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use 1200x630px for Facebook</li>
                <li>• Use 1200x600px for Twitter</li>
                <li>• Keep file size under 8MB</li>
                <li>• Use JPG for photos, PNG for graphics</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">✍️ Content Guidelines</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Title: 60 characters max</li>
                <li>• Description: 160 characters max</li>
                <li>• Use compelling, action-oriented language</li>
                <li>• Include brand name consistently</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default OGImagePreviewTool;
