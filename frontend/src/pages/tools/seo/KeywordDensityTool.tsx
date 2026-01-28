import { useState } from "react";
import { Copy, Check, Search, BarChart3, FileText, TrendingUp, AlertCircle, Target } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface KeywordAnalysis {
  word: string;
  count: number;
  density: number;
  percentage: number;
}

const KeywordDensityTool = () => {
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
    <ToolLayout
      title="Keyword Density Checker"
      description="Analyze keyword density and optimize your content for better SEO performance"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Keyword Density Analyzer</h3>
              <p className="text-sm text-muted-foreground">
                Optimize your content with perfect keyword density for better search rankings
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
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

            <button
              onClick={analyzeKeywordDensity}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              <TrendingUp className="inline h-4 w-4 mr-2" />
              Analyze Keyword Density
            </button>
          </div>
        </div>

        {/* Results Section */}
        {(analysis.length > 0 || targetAnalysis) && (
          <div className="space-y-6">
            {/* Target Keyword Analysis */}
            {targetAnalysis && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Target Keyword Analysis</h3>
                  </div>
                  <button
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
              </div>
            )}

            {/* Top Keywords */}
            {analysis.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Top Keywords</h3>
                  </div>
                  <button
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
              </div>
            )}

            {/* Density Chart */}
            {analysis.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
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
              </div>
            )}
          </div>
        )}

        {/* SEO Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
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
        </div>
      </div>
    </ToolLayout>
  );
};

export default KeywordDensityTool;
