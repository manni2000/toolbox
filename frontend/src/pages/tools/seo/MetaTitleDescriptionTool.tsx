import { useState } from "react";
import { Copy, Check, FileText, Search, Zap, Globe, Target, BarChart3 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const MetaTitleDescriptionTool = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const generateMetaTags = () => {
    if (!title && !keywords) return;

    // Generate optimized title
    let optimizedTitle = title;
    if (keywords) {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      if (keywordArray.length > 0 && !title.toLowerCase().includes(keywordArray[0].toLowerCase())) {
        optimizedTitle = `${keywordArray[0]} - ${title}`;
      }
    }
    
    // Limit title to 60 characters for SEO
    if (optimizedTitle.length > 60) {
      optimizedTitle = optimizedTitle.substring(0, 57) + "...";
    }
    
    setGeneratedTitle(optimizedTitle);

    // Generate optimized description
    let optimizedDescription = description;
    if (keywords && !description) {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      optimizedDescription = `Discover ${keywordArray.join(', ')} with our comprehensive guide. Learn about ${keywordArray[0]} and related topics to improve your understanding.`;
    }
    
    // Limit description to 160 characters for SEO
    if (optimizedDescription.length > 160) {
      optimizedDescription = optimizedDescription.substring(0, 157) + "...";
    }
    
    setGeneratedDescription(optimizedDescription);
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCharacterCount = (text: string, limit: number) => {
    return {
      count: text.length,
      remaining: limit - text.length,
      isOverLimit: text.length > limit,
      percentage: Math.min((text.length / limit) * 100, 100)
    };
  };

  const titleStats = getCharacterCount(generatedTitle, 60);
  const descriptionStats = getCharacterCount(generatedDescription, 160);

  return (
    <ToolLayout
      title="Meta Title & Description Generator"
      description="Generate SEO-optimized meta titles and descriptions for better search engine rankings"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">SEO Meta Tags Generator</h3>
              <p className="text-sm text-muted-foreground">
                Create perfect meta titles and descriptions that rank higher in search results
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your page title..."
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your page description..."
                rows={3}
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Keywords (comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3..."
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={generateMetaTags}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              <Zap className="inline h-4 w-4 mr-2" />
              Generate Meta Tags
            </button>
          </div>
        </div>

        {/* Results Section */}
        {(generatedTitle || generatedDescription) && (
          <div className="space-y-6">
            {/* Generated Title */}
            {generatedTitle && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Meta Title</h3>
                  </div>
                  <button
                    onClick={() => handleCopy("title", generatedTitle)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied === "title" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-mono text-sm">{generatedTitle}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {titleStats.count} / 60 characters
                    </span>
                    <span className={`font-medium ${
                      titleStats.isOverLimit ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {titleStats.isOverLimit ? 'Too long' : 'Good length'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-colors ${
                        titleStats.isOverLimit ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${titleStats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Generated Description */}
            {generatedDescription && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Meta Description</h3>
                  </div>
                  <button
                    onClick={() => handleCopy("description", generatedDescription)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied === "description" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-mono text-sm">{generatedDescription}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {descriptionStats.count} / 160 characters
                    </span>
                    <span className={`font-medium ${
                      descriptionStats.isOverLimit ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {descriptionStats.isOverLimit ? 'Too long' : 'Good length'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-colors ${
                        descriptionStats.isOverLimit ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${descriptionStats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HTML Output */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">HTML Output</h3>
                </div>
                <button
                  onClick={() => {
                    const htmlOutput = generatedTitle ? `<title>${generatedTitle}</title>\n` : '';
                    const metaDescription = generatedDescription ? `<meta name="description" content="${generatedDescription}">` : '';
                    const fullOutput = htmlOutput + metaDescription;
                    handleCopy("html", fullOutput);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "html" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <pre className="font-mono text-sm text-foreground">
                  {generatedTitle && `<title>${generatedTitle}</title>`}
                  {generatedTitle && generatedDescription && '\n'}
                  {generatedDescription && `<meta name="description" content="${generatedDescription}">`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            SEO Best Practices
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">📝 Title Guidelines</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep under 60 characters</li>
                <li>• Include primary keyword</li>
                <li>• Make it compelling and clickable</li>
                <li>• Avoid keyword stuffing</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">📄 Description Guidelines</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep under 160 characters</li>
                <li>• Include target keywords naturally</li>
                <li>• Write compelling copy</li>
                <li>• Match page content accurately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default MetaTitleDescriptionTool;
