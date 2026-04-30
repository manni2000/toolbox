import { useState } from "react";
import { Copy, Check, Search, BarChart3, FileText, TrendingUp, AlertCircle, Target, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "25 90% 50%";

interface KeywordAnalysis {
  word: string;
  count: number;
  density: number;
  percentage: number;
}

const KeywordDensityTool = () => {
  const toolSeoData = getToolSeoMetadata('keyword-density-analyzer');
  const [text, setText] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [analysis, setAnalysis] = useState<KeywordAnalysis[]>([]);
  const [targetAnalysis, setTargetAnalysis] = useState<KeywordAnalysis | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const analyzeKeywordDensity = () => {
    if (!text.trim()) return;

    // Clean and split text into words
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const totalWords = words.length;
    const wordFrequency: { [key: string]: number } = {};
    
    // Count word frequency
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Calculate density for each word
    const keywordAnalysis: KeywordAnalysis[] = Object.entries(wordFrequency)
      .map(([word, count]) => ({
        word,
        count,
        density: (count / totalWords) * 100,
        percentage: (count / totalWords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 keywords
    
    setAnalysis(keywordAnalysis);
    
    // Analyze target keyword if provided
    if (targetKeyword.trim()) {
      const targetLower = targetKeyword.toLowerCase();
      const targetCount = wordFrequency[targetLower] || 0;
      const targetDensity = (targetCount / totalWords) * 100;
      
      setTargetAnalysis({
        word: targetKeyword,
        count: targetCount,
        density: targetDensity,
        percentage: targetDensity
      });
    }
  };

  const getDensityColor = (density: number) => {
    if (density >= 5) return 'text-red-500';
    if (density >= 3) return 'text-orange-500';
    if (density >= 1) return 'text-green-500';
    return 'text-gray-500';
  };

  const getDensityStatus = (density: number) => {
    if (density >= 5) return 'Too High';
    if (density >= 3) return 'Good';
    if (density >= 1) return 'Low';
    return 'Very Low';
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportAnalysis = () => {
    const analysisData = {
      totalWords: text.split(/\s+/).filter(word => word.length > 0).length,
      targetKeyword: targetKeyword,
      targetAnalysis,
      topKeywords: analysis.slice(0, 10),
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(analysisData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'keyword-density-analysis.json');
    linkElement.click();
  };

  return (
    <>
      {CategorySEO.SEO(
        toolSeoData?.title || "Keyword Density Checker",
        toolSeoData?.description || "Analyze keyword density and optimize your content for better SEO performance",
        "keyword-density-checker"
      )}
      <ToolLayout
      breadcrumbTitle="Keyword Density"
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
              <Search className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Keyword Density Analyzer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Optimize your content with perfect keyword density for better search rankings.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">keyword density</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">keyword analyzer</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-800">seo keyword</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">content optimization</span>
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
              <h3 className="font-semibold">Content Analysis</h3>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your content text to analyze..."
                rows={8}
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <div className="text-sm text-muted-foreground mt-1">
                {text.split(/\s+/).filter(word => word.length > 0).length} words
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Keyword (Optional)</label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="Enter target keyword to track..."
                className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <motion.button
              onClick={analyzeKeywordDensity}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg px-4 py-3 font-medium transition-colors text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              <TrendingUp className="inline h-4 w-4 mr-2" />
              Analyze Keyword Density
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        {(analysis.length > 0 || targetAnalysis) && (
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Target Keyword Analysis */}
            {targetAnalysis && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Target Keyword Analysis</h3>
                  </div>
                  <button
                    type="button"
                    title="Copy target keyword analysis"
                    aria-label="Copy target keyword analysis"
                    onClick={() => handleCopy("target", JSON.stringify(targetAnalysis, null, 2))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied === "target" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{targetAnalysis.word}</div>
                    <div className="text-sm text-muted-foreground">Keyword</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{targetAnalysis.count}</div>
                    <div className="text-sm text-muted-foreground">Occurrences</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className={`text-2xl font-bold ${getDensityColor(targetAnalysis.density)}`}>
                      {targetAnalysis.density.toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Density</div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SEO Recommendation:</span>
                    <span className={`text-sm font-bold ${getDensityColor(targetAnalysis.density)}`}>
                      {getDensityStatus(targetAnalysis.density)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-colors ${
                          targetAnalysis.density >= 5 ? 'bg-red-500' : 
                          targetAnalysis.density >= 3 ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(targetAnalysis.density * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Top Keywords */}
            {analysis.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Top Keywords</h3>
                  </div>
                  <button
                    type="button"
                    title="Export keyword density analysis"
                    aria-label="Export keyword density analysis"
                    onClick={exportAnalysis}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {analysis.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-8">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-medium">{keyword.word}</div>
                          <div className="text-sm text-muted-foreground">
                            {keyword.count} occurrences
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getDensityColor(keyword.density)}`}>
                          {keyword.density.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getDensityStatus(keyword.density)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Density Chart */}
            {analysis.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Density Distribution</h3>
                </div>
                
                <div className="space-y-2">
                  {analysis.slice(0, 10).map((keyword, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20 truncate">
                        {keyword.word}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-colors ${
                            keyword.density >= 5 ? 'bg-red-500' : 
                            keyword.density >= 3 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(keyword.density * 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {keyword.density.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
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
            <AlertCircle className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Keyword Density Guidelines
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">✅ Best Practices</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Target 1-3% keyword density</li>
                <li>• Use variations and synonyms</li>
                <li>• Place keywords naturally</li>
                <li>• Focus on user intent</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">⚠️ Avoid</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keyword stuffing (&gt;5%)</li>
                <li>• Irrelevant keywords</li>
                <li>• Forced keyword placement</li>
                <li>• Ignoring readability</li>
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
            <Target className="h-5 w-5 text-blue-500" />
            What is Keyword Density Analysis?
          </h3>
          <p className="text-muted-foreground mb-4">
            Keyword density analysis measures how frequently keywords appear in content relative to total word count. This helps optimize content for search engines without overusing keywords, which can be penalized as keyword stuffing.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste your content or enter URL</li>
            <li>The tool analyzes word frequency</li>
            <li>Calculate keyword density percentages</li>
            <li>View optimization recommendations</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Analysis Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Word frequency count</li>
                <li>• Density percentage</li>
                <li>• Keyword positioning</li>
                <li>• Readability score</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">SEO Best Practices</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Natural keyword usage</li>
                <li>• Avoid stuffing</li>
                <li>• Focus on relevance</li>
                <li>• User experience priority</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is the ideal keyword density?",
            answer: "There's no ideal percentage, but 1-3% is generally recommended. Focus on natural usage rather than hitting a specific number. Write for readers first, search engines second."
          },
          {
            question: "Is keyword density still important for SEO?",
            answer: "Keyword density is less important than it used to be. Search engines now focus on context, intent, and natural language. Over-optimizing for density can actually hurt your rankings."
          },
          {
            question: "What is keyword stuffing?",
            answer: "Keyword stuffing is unnaturally repeating keywords to manipulate rankings. It's penalized by search engines. Use keywords naturally and focus on providing valuable content."
          },
          {
            question: "Should I use variations of my keyword?",
            answer: "Yes, using keyword variations, synonyms, and related terms helps search engines understand context and improves readability. It also helps rank for related searches."
          },
          {
            question: "How often should I include my main keyword?",
            answer: "Include your main keyword in important places: title, first paragraph, headings, and naturally throughout the content. Don't force it where it doesn't belong."
          }
        ]} />

      </div>
    </ToolLayout>
      </>
  );
};

export default KeywordDensityTool;
