import { useMemo, useState } from "react";
import { Copy, Check, Search, Download, Globe, AlertCircle, CheckCircle, XCircle, FileText, Filter, Sparkles, Settings, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "25 90% 50%";

interface SEOIssue {
  type: 'error' | 'warning' | 'info' | 'success';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestion?: string;
}

interface SEOAnalysis {
  url: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  viewport: string;
  lang: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  structuredDataCount: number;
  h1: string;
  h1Count: number;
  h2: string[];
  images: number;
  imagesMissingAlt: number;
  internalLinks: number;
  externalLinks: number;
  links: number;
  wordCount: number;
  readingTimeMinutes: number;
  issues: SEOIssue[];
  score: number;
}

const safeText = (value: string) => value.replace(/\s+/g, " ").trim();

const getMetaContentByName = (doc: Document, name: string) => {
  const el = doc.querySelector(`meta[name="${CSS.escape(name)}"]`) as HTMLMetaElement | null;
  return safeText(el?.content ?? "");
};

const getMetaContentByProperty = (doc: Document, property: string) => {
  const el = doc.querySelector(`meta[property="${CSS.escape(property)}"]`) as HTMLMetaElement | null;
  return safeText(el?.content ?? "");
};

const getLinkHrefByRel = (doc: Document, rel: string) => {
  const el = doc.querySelector(`link[rel="${CSS.escape(rel)}"]`) as HTMLLinkElement | null;
  return safeText(el?.href ?? el?.getAttribute("href") ?? "");
};

const clampScore = (score: number) => Math.max(0, Math.min(100, score));

const PageSEOTool = () => {
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [issueFilter, setIssueFilter] = useState<'all' | SEOIssue['type']>('all');

  const analyzeSEO = async () => {
    if (!htmlContent && !url) {
      alert('Please enter either a URL to analyze or HTML content');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      let content = htmlContent;
      
      // If URL is provided, fetch the HTML content
      if (url && !htmlContent) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }
        content = await response.text();
      }

      const issues: SEOIssue[] = [];
      let score = 100;

      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");

      const baseUrl = url || "";
      const resolveUrl = (href: string) => {
        const cleaned = safeText(href);
        if (!cleaned) return "";
        try {
          return baseUrl ? new URL(cleaned, baseUrl).toString() : cleaned;
        } catch {
          return cleaned;
        }
      };

      // Extract title
      const title = safeText(doc.querySelector("title")?.textContent ?? "");
      
      if (!title) {
        issues.push({
          type: 'error',
          category: 'Meta Tags',
          title: 'Missing Title Tag',
          description: 'Page has no title tag',
          impact: 'high',
          suggestion: 'Add a descriptive title tag (50-60 characters)'
        });
        score -= 20;
      } else if (title.length > 60) {
        issues.push({
          type: 'warning',
          category: 'Meta Tags',
          title: 'Title Too Long',
          description: `Title is ${title.length} characters (recommended: 50-60)`,
          impact: 'medium',
          suggestion: 'Shorten title to 50-60 characters for better SEO'
        });
        score -= 10;
      } else if (title.length < 30) {
        issues.push({
          type: 'warning',
          category: 'Meta Tags',
          title: 'Title Too Short',
          description: `Title is only ${title.length} characters (recommended: 50-60)`,
          impact: 'medium',
          suggestion: 'Expand title to 50-60 characters for better visibility'
        });
        score -= 5;
      }

      // Extract meta description
      const description = getMetaContentByName(doc, "description");
      
      if (!description) {
        issues.push({
          type: 'error',
          category: 'Meta Tags',
          title: 'Missing Meta Description',
          description: 'Page has no meta description',
          impact: 'high',
          suggestion: 'Add a compelling meta description (150-160 characters)'
        });
        score -= 15;
      } else if (description.length > 160) {
        issues.push({
          type: 'warning',
          category: 'Meta Tags',
          title: 'Meta Description Too Long',
          description: `Description is ${description.length} characters (recommended: 150-160)`,
          impact: 'medium',
          suggestion: 'Shorten description to 150-160 characters'
        });
        score -= 8;
      }

      // Extract H1
      const h1Els = Array.from(doc.querySelectorAll("h1"));
      const h1Count = h1Els.length;
      const h1 = safeText(h1Els[0]?.textContent ?? "");
      
      if (!h1) {
        issues.push({
          type: 'error',
          category: 'Structure',
          title: 'Missing H1 Tag',
          description: 'Page has no H1 heading',
          impact: 'high',
          suggestion: 'Add one H1 tag describing the main topic'
        });
        score -= 15;
      } else if (h1Count > 1) {
        issues.push({
          type: 'warning',
          category: 'Structure',
          title: 'Multiple H1 Tags',
          description: `Page has ${h1Count} H1 headings (recommended: 1)`,
          impact: 'medium',
          suggestion: 'Keep a single H1 for the primary page topic; convert extra H1s to H2/H3'
        });
        score -= 7;
      }

      // Count H2 tags
      const h2Els = Array.from(doc.querySelectorAll("h2"));
      const h2Texts = h2Els.map(el => safeText(el.textContent ?? "")).filter(Boolean);
      const h2Count = h2Texts.length;
      
      if (h2Count === 0) {
        issues.push({
          type: 'warning',
          category: 'Structure',
          title: 'No H2 Tags',
          description: 'Page has no H2 headings',
          impact: 'medium',
          suggestion: 'Add H2 tags to structure content properly'
        });
        score -= 5;
      }

      // Count images
      const imgEls = Array.from(doc.querySelectorAll("img"));
      const imageCount = imgEls.length;
      
      // Check for alt attributes
      const imgsWithoutAlt = imgEls.filter(img => {
        const alt = img.getAttribute("alt");
        return alt === null || safeText(alt) === "";
      });
      
      if (imgsWithoutAlt.length > 0) {
        issues.push({
          type: 'warning',
          category: 'Images',
          title: 'Images Missing Alt Text',
          description: `${imgsWithoutAlt.length} images missing alt attributes`,
          impact: 'medium',
          suggestion: 'Add descriptive alt text to all images'
        });
        score -= 10;
      }

      // Count links
      const linkEls = Array.from(doc.querySelectorAll("a[href]")) as HTMLAnchorElement[];
      const linkCount = linkEls.length;

      const internalExternal = (() => {
        if (!baseUrl) return { internal: 0, external: 0 };
        let internal = 0;
        let external = 0;
        for (const a of linkEls) {
          const rawHref = a.getAttribute("href") ?? "";
          const href = resolveUrl(rawHref);
          if (!href) continue;
          try {
            const u = new URL(href);
            const b = new URL(baseUrl);
            if (u.host && b.host && u.host === b.host) internal += 1;
            else external += 1;
          } catch {
            // ignore
          }
        }
        return { internal, external };
      })();

      // Count words
      const textContent = safeText(doc.body?.textContent ?? "");
      const wordCount = textContent ? textContent.split(/\s+/).length : 0;
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
      
      if (wordCount < 300) {
        issues.push({
          type: 'warning',
          category: 'Content',
          title: 'Low Word Count',
          description: `Page has only ${wordCount} words (recommended: 300+)`,
          impact: 'medium',
          suggestion: 'Add more valuable content to reach at least 300 words'
        });
        score -= 8;
      }

      // Check for html lang
      const lang = safeText(doc.documentElement.getAttribute("lang") ?? "");
      if (!lang) {
        issues.push({
          type: 'info',
          category: 'Technical',
          title: 'Missing lang Attribute',
          description: 'The <html> tag has no lang attribute',
          impact: 'low',
          suggestion: 'Add a language attribute like <html lang="en"> for accessibility and SEO'
        });
        score -= 2;
      }

      // Check viewport
      const viewport = getMetaContentByName(doc, "viewport");
      if (!viewport) {
        issues.push({
          type: 'warning',
          category: 'Technical',
          title: 'Missing Viewport Meta Tag',
          description: 'No viewport meta tag found (may impact mobile usability)',
          impact: 'medium',
          suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
        });
        score -= 6;
      }

      // Check meta robots
      const robots = getMetaContentByName(doc, "robots");
      if (robots && /noindex|nofollow/i.test(robots)) {
        issues.push({
          type: 'warning',
          category: 'Indexing',
          title: 'Robots Meta Restricts Indexing',
          description: `meta robots is set to: ${robots}`,
          impact: 'high',
          suggestion: 'Remove noindex/nofollow if this page should appear in search results'
        });
        score -= 15;
      } else if (!robots) {
        issues.push({
          type: 'info',
          category: 'Indexing',
          title: 'No Robots Meta Tag',
          description: 'No meta robots tag found (usually OK)',
          impact: 'low'
        });
      }

      // Check for canonical tag
      const canonical = resolveUrl(getLinkHrefByRel(doc, "canonical"));
      if (!canonical) {
        issues.push({
          type: 'info',
          category: 'Meta Tags',
          title: 'Missing Canonical Tag',
          description: 'No canonical tag found',
          impact: 'low',
          suggestion: 'Add canonical tag to prevent duplicate content issues'
        });
        score -= 3;
      } else {
        try {
          const c = new URL(canonical);
          if (c.protocol !== 'http:' && c.protocol !== 'https:') {
            issues.push({
              type: 'warning',
              category: 'Meta Tags',
              title: 'Canonical URL Looks Invalid',
              description: `Canonical is: ${canonical}`,
              impact: 'medium',
              suggestion: 'Use an absolute http(s) canonical URL'
            });
            score -= 6;
          }
        } catch {
          issues.push({
            type: 'warning',
            category: 'Meta Tags',
            title: 'Canonical URL Looks Invalid',
            description: `Canonical is: ${canonical}`,
            impact: 'medium',
            suggestion: 'Use a valid absolute canonical URL'
          });
          score -= 6;
        }
      }

      // Check for Open Graph tags
      const ogTitle = getMetaContentByProperty(doc, "og:title");
      const ogDescription = getMetaContentByProperty(doc, "og:description");
      const ogImage = resolveUrl(getMetaContentByProperty(doc, "og:image"));
      
      if (!ogTitle || !ogDescription) {
        issues.push({
          type: 'info',
          category: 'Social',
          title: 'Missing Open Graph Tags',
          description: 'Missing OG tags for social media',
          impact: 'low',
          suggestion: 'Add Open Graph tags for better social media sharing'
        });
        score -= 5;
      }
      if (!ogImage) {
        issues.push({
          type: 'info',
          category: 'Social',
          title: 'Missing og:image',
          description: 'No Open Graph image found',
          impact: 'low',
          suggestion: 'Add og:image to improve link previews'
        });
        score -= 2;
      }

      // Twitter card
      const twitterCard = getMetaContentByName(doc, "twitter:card");
      if (!twitterCard) {
        issues.push({
          type: 'info',
          category: 'Social',
          title: 'Missing Twitter Card',
          description: 'No twitter:card meta tag found',
          impact: 'low',
          suggestion: 'Add twitter:card (e.g., summary_large_image) and related Twitter meta tags'
        });
        score -= 2;
      }

      // Structured data
      const structuredDataCount = doc.querySelectorAll('script[type="application/ld+json"]').length;
      if (structuredDataCount === 0) {
        issues.push({
          type: 'info',
          category: 'Structured Data',
          title: 'No Structured Data Detected',
          description: 'No JSON-LD (application/ld+json) scripts found',
          impact: 'low',
          suggestion: 'Consider adding structured data (JSON-LD) to qualify for rich results'
        });
        score -= 2;
      }

      // Add success messages
      if (title && title.length >= 30 && title.length <= 60) {
        issues.push({
          type: 'success',
          category: 'Meta Tags',
          title: 'Good Title Length',
          description: `Title is ${title.length} characters`,
          impact: 'low'
        });
      }

      if (description && description.length >= 120 && description.length <= 160) {
        issues.push({
          type: 'success',
          category: 'Meta Tags',
          title: 'Good Meta Description',
          description: `Description is ${description.length} characters`,
          impact: 'low'
        });
      }

      if (h1) {
        issues.push({
          type: 'success',
          category: 'Structure',
          title: 'H1 Tag Present',
          description: 'Page has proper H1 heading',
          impact: 'low'
        });
      }

      if (canonical) {
        issues.push({
          type: 'success',
          category: 'Meta Tags',
          title: 'Canonical Tag Present',
          description: 'Page includes a canonical link tag',
          impact: 'low'
        });
      }

      setAnalysis({
        url: url || 'HTML Content',
        title,
        description,
        canonical,
        robots,
        viewport,
        lang,
        ogTitle,
        ogDescription,
        ogImage,
        twitterCard,
        structuredDataCount,
        h1,
        h1Count,
        h2: h2Texts.length ? h2Texts : Array(h2Count).fill('H2'),
        images: imageCount,
        imagesMissingAlt: imgsWithoutAlt.length,
        internalLinks: internalExternal.internal,
        externalLinks: internalExternal.external,
        links: linkCount,
        wordCount,
        readingTimeMinutes,
        issues,
        score: clampScore(score)
      });

    } catch (error) {
      setAnalysis({
        url: url || 'HTML Content',
        title: '',
        description: '',
        canonical: '',
        robots: '',
        viewport: '',
        lang: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterCard: '',
        structuredDataCount: 0,
        h1: '',
        h1Count: 0,
        h2: [],
        images: 0,
        imagesMissingAlt: 0,
        internalLinks: 0,
        externalLinks: 0,
        links: 0,
        wordCount: 0,
        readingTimeMinutes: 0,
        issues: [{
          type: 'error',
          category: 'Analysis',
          title: 'Analysis Failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          impact: 'high'
        }],
        score: 0
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredIssues = useMemo(() => {
    if (!analysis) return [] as SEOIssue[];
    if (issueFilter === 'all') return analysis.issues;
    return analysis.issues.filter(i => i.type === issueFilter);
  }, [analysis, issueFilter]);

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadReport = () => {
    if (!analysis) return;

    const report = {
      timestamp: new Date().toISOString(),
      url: analysis.url,
      seoScore: analysis.score,
      metadata: {
        title: analysis.title,
        description: analysis.description,
        h1: analysis.h1
      },
      content: {
        wordCount: analysis.wordCount,
        readingTimeMinutes: analysis.readingTimeMinutes,
        images: analysis.images,
        imagesMissingAlt: analysis.imagesMissingAlt,
        links: analysis.links,
        internalLinks: analysis.internalLinks,
        externalLinks: analysis.externalLinks,
        h2Count: analysis.h2.length
      },
      technical: {
        canonical: analysis.canonical,
        robots: analysis.robots,
        viewport: analysis.viewport,
        lang: analysis.lang,
        structuredDataCount: analysis.structuredDataCount
      },
      social: {
        ogTitle: analysis.ogTitle,
        ogDescription: analysis.ogDescription,
        ogImage: analysis.ogImage,
        twitterCard: analysis.twitterCard
      },
      issues: analysis.issues.map(issue => ({
        type: issue.type,
        category: issue.category,
        title: issue.title,
        description: issue.description,
        impact: issue.impact,
        suggestion: issue.suggestion
      }))
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-analysis-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'info': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-orange-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <>
      {CategorySEO.SEO(
        "Page SEO Analyzer",
        "Comprehensive SEO analysis tool to optimize your web pages for better search rankings",
        "page-seo-analyzer"
      )}
      <ToolLayout
      title="Page SEO Analyzer"
      description="Comprehensive SEO analysis tool to optimize your web pages for better search rankings"
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
              <h2 className="text-2xl font-bold">Page SEO Analyzer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Comprehensive SEO analysis for better search engine optimization.
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
            <div>
              <label className="block text-sm font-medium mb-2">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Or paste HTML content</label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Paste your HTML content here..."
                  rows={4}
                  className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            <motion.button
              onClick={analyzeSEO}
              disabled={isAnalyzing || (!htmlContent && !url)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader className="inline h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="inline h-4 w-4 mr-2" />
                  Analyze SEO
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results */}
        {analysis && (
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* SEO Score */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">SEO Score</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    title="Copy SEO score"
                    aria-label="Copy SEO score"
                    onClick={() => handleCopy("score", analysis.score.toString())}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied === "score" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    title="Download SEO report"
                    aria-label="Download SEO report"
                    onClick={downloadReport}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBg(analysis.score)}`}>
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {analysis.score >= 80 ? 'Excellent' :
                   analysis.score >= 60 ? 'Good' :
                   analysis.score >= 40 ? 'Fair' : 'Poor'}
                </p>
              </div>
            </motion.div>

            {/* Page Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h3 className="font-semibold mb-4">Page Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analysis.wordCount}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analysis.readingTimeMinutes}m</div>
                  <div className="text-sm text-muted-foreground">Reading Time</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analysis.images}</div>
                  <div className="text-sm text-muted-foreground">Images</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analysis.links}</div>
                  <div className="text-sm text-muted-foreground">Links</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analysis.h1Count}</div>
                  <div className="text-sm text-muted-foreground">H1 Tags</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analysis.h2.length}</div>
                  <div className="text-sm text-muted-foreground">H2 Tags</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analysis.internalLinks}</div>
                  <div className="text-sm text-muted-foreground">Internal Links</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{analysis.externalLinks}</div>
                  <div className="text-sm text-muted-foreground">External Links</div>
                </div>
              </div>
            </motion.div>

            {/* SERP Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h3 className="font-semibold mb-4">Search Preview</h3>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-green-700">{analysis.canonical || analysis.url}</p>
                <p className="text-lg font-semibold text-blue-700 mt-1">{analysis.title || "(No title found)"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.description || "(No meta description found)"}
                </p>
              </div>
            </motion.div>

            {/* Issues */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold">SEO Issues</h3>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    title="Filter SEO issues by type"
                    aria-label="Filter SEO issues by type"
                    value={issueFilter}
                    onChange={(e) => setIssueFilter(e.target.value as typeof issueFilter)}
                    className="rounded-lg bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All</option>
                    <option value="error">Errors</option>
                    <option value="warning">Warnings</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      issue.type === 'error' ? 'border-red-200 bg-red-50' :
                      issue.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                      issue.type === 'info' ? 'border-blue-200 bg-blue-50' :
                      'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{issue.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            issue.impact === 'high' ? 'bg-red-100 text-red-700' :
                            issue.impact === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {issue.impact}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {issue.description}
                        </p>
                        {issue.suggestion && (
                          <p className="text-sm text-blue-600">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            SEO Best Practices
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">✅ Must-Haves</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unique title (50-60 chars)</li>
                <li>• Meta description (150-160 chars)</li>
                <li>• One H1 tag per page</li>
                <li>• Proper heading structure</li>
                <li>• Alt text for images</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🎯 Recommendations</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 300+ words of content</li>
                <li>• Internal linking</li>
                <li>• Canonical URL</li>
                <li>• Open Graph tags</li>
                <li>• Mobile-friendly design</li>
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
            What is Page SEO Analysis?
          </h3>
          <p className="text-muted-foreground mb-4">
            Page SEO analysis evaluates how well a webpage is optimized for search engines. It checks technical SEO factors, on-page elements, content quality, and provides actionable recommendations to improve search rankings.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your page URL to analyze</li>
            <li>The tool crawls and analyzes the page</li>
            <li>Checks multiple SEO factors</li>
            <li>Get comprehensive optimization report</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Analysis Factors</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Meta tags analysis</li>
                <li>• Heading structure</li>
                <li>• Content quality</li>
                <li>• Technical SEO checks</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Optimization Areas</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Title optimization</li>
                <li>• Description improvement</li>
                <li>• Content enhancement</li>
                <li>• Technical fixes</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What does page SEO analysis check?",
            answer: "Analysis checks title tags, meta descriptions, headings, content quality, internal links, images, page speed, mobile-friendliness, and technical SEO factors."
          },
          {
            question: "How often should I analyze my pages?",
            answer: "Analyze pages when creating new content, making major updates, or if rankings drop. Regular audits (quarterly) help maintain optimal SEO performance."
          },
          {
            question: "What's the most important on-page SEO factor?",
            answer: "Content quality and relevance are most important. Technical SEO and on-page optimization support good content but can't compensate for poor or irrelevant content."
          },
          {
            question: "Does page speed affect SEO?",
            answer: "Yes, page speed is a ranking factor, especially for mobile. Faster pages provide better user experience and rank higher in search results."
          },
          {
            question: "Should I focus on single keywords or topics?",
            answer: "Focus on topics and user intent rather than single keywords. Modern SEO rewards comprehensive content that covers topics thoroughly rather than keyword stuffing."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default PageSEOTool;
