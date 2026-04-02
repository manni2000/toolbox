import { useState } from "react";
import { Copy, Check, Search, Download, AlertTriangle, Image, Link, Globe, Loader, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";

const categoryColor = "25 90% 50%";

interface BrokenImage {
  url: string;
  status: 'broken' | 'working' | 'checking';
  error?: string;
  size?: string;
  type?: string;
}

const BrokenImageFinderTool = () => {
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [images, setImages] = useState<BrokenImage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const extractImagesFromHTML = (html: string) => {
    const imgRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/gi;
    const matches = [];
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const imgTag = match[0];
      const srcMatch = imgTag.match(/src\s*=\s*['"]([^'"]+)['"]/i);
      if (srcMatch) {
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
    <ToolLayout
      title="Broken Image Finder"
      description="Find and analyze broken images on your website for better SEO and user experience"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Broken Image Finder</h3>
              <p className="text-sm text-muted-foreground">
                Scan your website for broken images and optimize user experience
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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

            <button
              type="button"
              onClick={scanForImages}
              disabled={isScanning || (!htmlContent && !url)}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {images.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
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
          </div>
        )}

        {/* Images List */}
        {images.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
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
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
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
        </div>
      </div>
    </ToolLayout>
  );
};

export default BrokenImageFinderTool;
