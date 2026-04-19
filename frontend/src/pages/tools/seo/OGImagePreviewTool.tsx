import { useState } from "react";
import { Copy, Check, Image, Download, Globe, Share2, Eye, Settings, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "25 90% 50%";

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
    title: "",
    description: "",
    url: "",
    siteName: "",
    image: "",
    type: "website",
    locale: "en_US",
    author: ""
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
              <h2 className="text-2xl font-bold">OG Image Preview Tool</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Preview and optimize Open Graph tags for perfect social media sharing.
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
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            OG Meta Data
          </h3>
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
                <label htmlFor="og-type" className="block text-sm font-medium mb-2">Type</label>
                <select
                  id="og-type"
                  title="Type"
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
                <label htmlFor="og-locale" className="block text-sm font-medium mb-2">Locale</label>
                <select
                  id="og-locale"
                  title="Locale"
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
        </motion.div>

        {/* Preview Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              Social Media Preview
            </h3>
            <div className="flex flex-wrap gap-2">
              {['facebook', 'twitter', 'linkedin'].map((platform) => (
                <motion.button
                  key={platform}
                  type="button"
                  onClick={() => setPreviewSize(platform as 'facebook' | 'twitter' | 'linkedin')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1 text-sm rounded capitalize ${
                    previewSize === platform 
                      ? 'text-white' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  style={previewSize === platform ? {
                    background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                  } : {}}
                >
                  {platform}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div 
              className="border border-gray-300 rounded-lg overflow-hidden bg-white w-full max-w-[500px]"
              style={{ aspectRatio: `${dimensions.width}/${dimensions.height}` }}
            >
              {/* Preview Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-sm flex-shrink-0"></div>
                  <span className="text-xs text-gray-600 truncate">
                    {previewSize === 'facebook' ? 'facebook.com' : previewSize === 'twitter' ? 'twitter.com' : 'linkedin.com'}
                  </span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-3">
                <div className="flex gap-3">
                  {ogData.image ? (
                    <img
                      src={ogData.image}
                      alt="OG Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/80x80/e0e0e0/666666?text=Image";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                      <Image className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                      {ogData.title || "Your page title"}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {ogData.description || "Your page description will appear here..."}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Globe className="h-3 w-3 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 truncate">
                        {ogData.url || "yoursite.com"}
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
        </motion.div>

        {/* Generated Tags */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Generated Meta Tags</h3>
            <div className="flex gap-2">
              <button
                type="button"
                title="Copy generated meta tags"
                aria-label="Copy generated meta tags"
                onClick={() => handleCopy("tags", generateOGTags())}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied === "tags" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                type="button"
                title="Download generated meta tags"
                aria-label="Download generated meta tags"
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
        </motion.div>

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Image className="h-5 w-5 text-blue-500" />
            What is OG Image Preview?
          </h3>
          <p className="text-muted-foreground mb-4">
            OG (Open Graph) image preview tests how your website's image appears when shared on social media platforms. This ensures your content looks appealing and professional when shared on Facebook, Twitter, LinkedIn, and other platforms.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your website URL</li>
            <li>The tool fetches OG image metadata</li>
            <li>Preview how it appears on social platforms</li>
            <li>Get optimization recommendations</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Preview Platforms</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Facebook</li>
                <li>• Twitter/X</li>
                <li>• LinkedIn</li>
                <li>• Generic preview</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Optimization Tips</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Use high-quality images</li>
                <li>• Recommended dimensions</li>
                <li>• Include branding</li>
                <li>• Test on mobile</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What are the recommended OG image dimensions?",
            answer: "Recommended dimensions are 1200x630 pixels for optimal display across platforms. Minimum is 200x200 pixels. Use 1.91:1 aspect ratio for best results."
          },
          {
            question: "Why is OG image preview important?",
            answer: "OG images make your content more engaging when shared on social media. Good images increase click-through rates, brand recognition, and social engagement."
          },
          {
            question: "Do all social platforms use OG tags?",
            answer: "Most major platforms (Facebook, LinkedIn, Pinterest) use OG tags. Twitter uses its own Twitter Card tags but can fall back to OG tags. Always implement both for best coverage."
          },
          {
            question: "What file format should OG images use?",
            answer: "Use JPG or PNG formats. JPG is recommended for better compression and smaller file sizes. Ensure file size is under 5MB for faster loading."
          },
          {
            question: "How do I implement OG images?",
            answer: "Add meta tags to your HTML head: <meta property=\"og:image\" content=\"image-url\">. Also specify width, height, and alt text for accessibility and better rendering."
          }
        ]} />
      </div>
    </ToolLayout>
  );
};

export default OGImagePreviewTool;
