import { useState } from "react";
import { Copy, Check, FileText, Search, Zap, Globe, Target, BarChart3, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "25 90% 50%";

const MetaTitleDescriptionTool = () => {
  const toolSeoData = getToolSeoMetadata('meta-title-description-generator');
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
    <>
      {CategorySEO.SEO(
        toolSeoData?.title || "Meta Title & Description Generator",
        toolSeoData?.description || "Generate SEO-optimized meta titles and descriptions for better search engine rankings",
        "meta-title-description-generator"
      )}
      <ToolLayout
      title="Meta Title & Description Generator"
      description="Generate SEO-optimized meta titles and descriptions for better search engine rankings"
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
              <FileText className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">SEO Meta Tags Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create perfect meta titles and descriptions that rank higher in search results.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">meta tags generator</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">meta title</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">meta description</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">seo meta tags</span>
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
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <h3 className="font-semibold">Meta Tag Options</h3>
            </div>
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

            <motion.button
              onClick={generateMetaTags}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg px-4 py-3 font-medium transition-colors text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <Zap className="inline h-4 w-4 mr-2" />
              Generate Meta Tags
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        {(generatedTitle || generatedDescription) && (
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Generated Title */}
            {generatedTitle && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
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
              </motion.div>
            )}

            {/* Generated Description */}
            {generatedDescription && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
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
              </motion.div>
            )}

            {/* HTML Output */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
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
            </motion.div>
          </motion.div>
        )}

        {/* SEO Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
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
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            What is Meta Tag Optimization?
          </h3>
          <p className="text-muted-foreground mb-4">
            Meta tag optimization creates effective title tags and meta descriptions for web pages. These tags appear in search results and significantly impact click-through rates and search engine rankings.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Enter your page title and description</li>
            <li>The tool checks length and optimization</li>
            <li>View preview in search results</li>
            <li>Get recommendations for improvement</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Optimization Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Length checking</li>
                <li>• SERP preview</li>
                <li>• Keyword analysis</li>
                <li>• CTR prediction</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Best Practices</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Compelling titles</li>
                <li>• Accurate descriptions</li>
                <li>• Include keywords</li>
                <li>• Match user intent</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What's the ideal length for meta titles?",
            answer: "Meta titles should be 50-60 characters for optimal display in search results. Longer titles may be truncated. Keep them concise, descriptive, and include your primary keyword."
          },
          {
            question: "How long should meta descriptions be?",
            answer: "Meta descriptions should be 150-160 characters. This length ensures they display fully in search results. Use them to entice users to click with compelling, accurate descriptions."
          },
          {
            question: "Do meta descriptions affect rankings?",
            answer: "Meta descriptions don't directly affect rankings but significantly impact click-through rates. Higher CTR can indirectly improve rankings. Write descriptions that encourage clicks."
          },
          {
            question: "Should every page have unique meta tags?",
            answer: "Yes, each page should have unique, relevant meta tags that accurately describe the page content. Duplicate or generic tags miss optimization opportunities."
          },
          {
            question: "What makes a good meta title?",
            answer: "Good meta titles are descriptive, include primary keywords, match user intent, and are compelling enough to encourage clicks. They should accurately represent the page content."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default MetaTitleDescriptionTool;
