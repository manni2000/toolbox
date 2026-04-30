import { useState } from "react";
import { Copy, Check, Search, Download, AlertTriangle, Image, Link, Globe, Loader, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "25 90% 50%";

interface BrokenImage {
  url: string;
  status: 'broken' | 'working' | 'checking';
  error?: string;
  size?: string;
  type?: string;
}

const BrokenImageFinderTool = () => {
  const toolSeoData = getToolSeoMetadata('broken-image-finder');
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [images, setImages] = useState<BrokenImage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const extractImagesFromHTML = (html: string) => {
    const imgRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/gi;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const imgTag = match[0];
      const srcMatch = imgTag.match(/src\s*=\s*['"]([^'"]+)['"]/i);
      if (srcMatch?.[1]) {
        matches.push(srcMatch[1]);
      }
    }
    
    return [...new Set(matches)]; // Remove duplicates
  };

  const checkImageStatus = async (imageUrl: string, baseUrl: string): Promise<BrokenImage> => {
    try {
      // Convert relative URLs to absolute if needed
      let testUrl = imageUrl;
      if (imageUrl.startsWith('//')) {
        testUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const base = new URL(baseUrl);
        testUrl = base.origin + imageUrl;
      } else if (!imageUrl.startsWith('http')) {
        testUrl = new URL(imageUrl, baseUrl).href;
      }

      const response = await fetch(testUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const contentLength = response.headers.get('content-length') || '';
        
        return {
          url: imageUrl,
          status: 'working',
          type: contentType.split(';')[0],
          size: contentLength ? `${(parseInt(contentLength) / 1024).toFixed(1)} KB` : 'Unknown'
        };
      } else {
        return {
          url: imageUrl,
          status: 'broken',
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        url: imageUrl,
        status: 'broken',
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  };

  const scanForImages = async () => {
    if (!htmlContent && !url) {
      alert('Please enter either a URL to scan or HTML content');
      return;
    }

    setIsScanning(true);
    setImages([]);

    try {
      let contentToScan = htmlContent;
      
      // If URL is provided, fetch the HTML content
      if (url && !htmlContent) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }
        contentToScan = await response.text();
      }

      const imageUrls = extractImagesFromHTML(contentToScan);
      
      if (imageUrls.length === 0) {
        setImages([{
          url: 'No images found',
          status: 'broken',
          error: 'No img tags found in the HTML content'
        }]);
        return;
      }

      // Check each image
      const initialImages: BrokenImage[] = imageUrls.map(imageUrl => ({
        url: imageUrl,
        status: 'checking' as const,
        error: undefined,
        size: undefined,
        type: undefined
      }));

      setImages(initialImages);

      // Check images in batches to avoid overwhelming the browser
      const batchSize = 5;
      const results: BrokenImage[] = [];
      
      for (let i = 0; i < imageUrls.length; i += batchSize) {
        const batch = imageUrls.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(imgUrl => checkImageStatus(imgUrl, url))
        );
        results.push(...batchResults);
        
        // Update UI with progress
        setImages([
          ...results,
          ...imageUrls.slice(i + batchSize).map(url => ({
            url,
            status: 'checking' as const,
            error: undefined,
            size: undefined,
            type: undefined
          }))
        ]);
      }

      setImages(results);
    } catch (error) {
      setImages([{
        url: 'Error',
        status: 'broken',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsScanning(false);
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
      url,
      totalImages: images.length,
      workingImages: images.filter(img => img.status === 'working').length,
      brokenImages: images.filter(img => img.status === 'broken').length,
      images: images.map(img => ({
        url: img.url,
        status: img.status,
        error: img.error,
        size: img.size,
        type: img.type
      }))
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'broken-images-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'broken':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'border-green-200 bg-green-50';
      case 'broken':
        return 'border-red-200 bg-red-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const workingCount = images.filter(img => img.status === 'working').length;
  const brokenCount = images.filter(img => img.status === 'broken').length;
  const checkingCount = images.filter(img => img.status === 'checking').length;

  return (
    <>
      {CategorySEO.SEO(
        toolSeoData?.title || "Broken Image Finder",
        toolSeoData?.description || "Find and analyze broken images on your website for better SEO and user experience",
        "broken-image"
      )}
      <ToolLayout
      breadcrumbTitle="Broken Image Finder"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="space-y-6">
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
              <Image className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Broken Image Finder</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Scan your website for broken images and optimize user experience.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">broken image finder</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">image checker</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">404 images</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">seo image audit</span>
              </div>
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
                placeholder="https://yoursite.com"
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a URL to scan the entire website
              </p>
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
              type="button"
              onClick={scanForImages}
              disabled={isScanning || (!htmlContent && !url)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              {isScanning ? (
                <>
                  <Loader className="inline h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="inline h-4 w-4 mr-2" />
                  Scan for Images
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Summary */}
        {images.length > 0 && (
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <h3 className="font-semibold mb-4">Scan Results</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{images.length}</div>
                <div className="text-sm text-muted-foreground">Total Images</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{workingCount}</div>
                <div className="text-sm text-muted-foreground">Working</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-500">{brokenCount}</div>
                <div className="text-sm text-muted-foreground">Broken</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Images List */}
        {images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Image Analysis</h3>
              <button
                type="button"
                onClick={downloadReport}
                title="Download report"
                aria-label="Download report"
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(image.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(image.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{image.url}</p>
                        {image.status === 'working' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Working
                          </span>
                        )}
                        {image.status === 'broken' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Broken
                          </span>
                        )}
                      </div>
                      
                      {image.error && (
                        <p className="text-sm text-red-600">{image.error}</p>
                      )}
                      
                      {image.status === 'working' && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {image.type && (
                            <span>Type: {image.type}</span>
                          )}
                          {image.size && (
                            <span>Size: {image.size}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {image.status === 'working' && (
                        <button
                          type="button"
                          onClick={() => window.open(image.url, '_blank')}
                          title={`Open image URL: ${image.url}`}
                          aria-label={`Open image URL: ${image.url}`}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Link className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopy(`url-${index}`, image.url)}
                        title={`Copy image URL: ${image.url}`}
                        aria-label={`Copy image URL: ${image.url}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied === `url-${index}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <AlertTriangle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Broken Image Impact
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">⚠️ SEO Impact</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Lower search rankings</li>
                <li>• Poor user experience</li>
                <li>• Higher bounce rates</li>
                <li>• Reduced crawl efficiency</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">✅ Solutions</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use absolute URLs</li>
                <li>• Implement image fallbacks</li>
                <li>• Use CDN for images</li>
                <li>• Regular image audits</li>
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
            What is Broken Image Finding?
          </h3>
          <p className="text-muted-foreground mb-4">
            Broken image finding scans your website for images that fail to load. Broken images hurt user experience, SEO rankings, and site credibility. This tool helps you identify and fix image issues quickly.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your website URL</li>
            <li>The tool crawls your site for images</li>
            <li>Checks each image for proper loading</li>
            <li>Report broken images with details</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Detection Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Image status checking</li>
                <li>• HTTP error detection</li>
                <li>• Response time analysis</li>
                <li>• Alt text verification</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">SEO Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Better user experience</li>
                <li>• Improved rankings</li>
                <li>• Faster page loads</li>
                <li>• Enhanced credibility</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why are broken images bad for SEO?",
            answer: "Broken images hurt user experience, increase bounce rates, and signal poor site quality to search engines. They also waste crawl budget and can negatively impact rankings."
          },
          {
            question: "What causes broken images?",
            answer: "Common causes: deleted images, incorrect URLs, server issues, permission problems, hotlinking protection, or changed file paths."
          },
          {
            question: "How do I fix broken images?",
            answer: "Replace broken images with valid alternatives, correct URLs, ensure files exist on server, check file permissions, or implement fallback images."
          },
          {
            question: "Should I use alt text for all images?",
            answer: "Yes, alt text is essential for accessibility and SEO. It describes images for screen readers and helps search engines understand image content."
          },
          {
            question: "How often should I check for broken images?",
            answer: "Check regularly, especially after site updates, content changes, or migrations. Automated monitoring can alert you to new broken images."
          }
        ]} />

      </div>
    </ToolLayout>
      </>
  );
};

export default BrokenImageFinderTool;
