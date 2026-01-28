import { useState } from "react";
import { Copy, Check, FileText, Download, Zap, Gauge, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  checked: boolean;
}

const PageSpeedChecklistTool = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // Performance
    {
      id: 'perf-1',
      category: 'Performance',
      title: 'Optimize Images',
      description: 'Compress images and use next-gen formats (WebP, AVIF)',
      priority: 'high',
      checked: false
    },
    {
      id: 'perf-2',
      category: 'Performance',
      title: 'Minify CSS/JS',
      description: 'Remove unnecessary characters from code',
      priority: 'high',
      checked: false
    },
    {
      id: 'perf-3',
      category: 'Performance',
      title: 'Enable Browser Caching',
      description: 'Set appropriate cache headers for static assets',
      priority: 'high',
      checked: false
    },
    {
      id: 'perf-4',
      category: 'Performance',
      title: 'Reduce Server Response Time',
      description: 'Aim for TTFB under 200ms',
      priority: 'high',
      checked: false
    },
    {
      id: 'perf-5',
      category: 'Performance',
      title: 'Use CDN',
      description: 'Distribute content via Content Delivery Network',
      priority: 'medium',
      checked: false
    },
    {
      id: 'perf-6',
      category: 'Performance',
      title: 'Lazy Load Images',
      description: 'Load images only when they enter viewport',
      priority: 'medium',
      checked: false
    },
    {
      id: 'perf-7',
      category: 'Performance',
      title: 'Minimize HTTP Requests',
      description: 'Combine files and reduce external resources',
      priority: 'medium',
      checked: false
    },
    {
      id: 'perf-8',
      category: 'Performance',
      title: 'Use HTTP/2',
      description: 'Enable HTTP/2 for faster multiplexing',
      priority: 'medium',
      checked: false
    },

    // Core Web Vitals
    {
      id: 'cwv-1',
      category: 'Core Web Vitals',
      title: 'Largest Contentful Paint (LCP)',
      description: 'LCP should be under 2.5s',
      priority: 'high',
      checked: false
    },
    {
      id: 'cwv-2',
      category: 'Core Web Vitals',
      title: 'First Input Delay (FID)',
      description: 'FID should be under 100ms',
      priority: 'high',
      checked: false
    },
    {
      id: 'cwv-3',
      category: 'Core Web Vitals',
      title: 'Cumulative Layout Shift (CLS)',
      description: 'CLS should be under 0.1',
      priority: 'high',
      checked: false
    },

    // Mobile
    {
      id: 'mob-1',
      category: 'Mobile',
      title: 'Responsive Design',
      description: 'Ensure proper mobile layout and functionality',
      priority: 'high',
      checked: false
    },
    {
      id: 'mob-2',
      category: 'Mobile',
      title: 'Viewport Meta Tag',
      description: 'Add proper viewport meta tag',
      priority: 'high',
      checked: false
    },
    {
      id: 'mob-3',
      category: 'Mobile',
      title: 'Touch-Friendly Elements',
      description: 'Buttons should be at least 48x48px',
      priority: 'medium',
      checked: false
    },
    {
      id: 'mob-4',
      category: 'Mobile',
      title: 'Avoid Flash',
      description: 'Flash is not supported on most mobile devices',
      priority: 'medium',
      checked: false
    },

    // SEO
    {
      id: 'seo-1',
      category: 'SEO',
      title: 'Meta Tags',
      description: 'Include title, description, and meta tags',
      priority: 'high',
      checked: false
    },
    {
      id: 'seo-2',
      category: 'SEO',
      title: 'Structured Data',
      description: 'Add JSON-LD or microdata markup',
      priority: 'medium',
      checked: false
    },
    {
      id: 'seo-3',
      category: 'SEO',
      title: 'XML Sitemap',
      description: 'Submit sitemap to search engines',
      priority: 'medium',
      checked: false
    },
    {
      id: 'seo-4',
      category: 'SEO',
      title: 'Robots.txt',
      description: 'Control search engine crawling',
      priority: 'low',
      checked: false
    },

    // Security
    {
      id: 'sec-1',
      category: 'Security',
      title: 'HTTPS',
      description: 'Use SSL/TLS encryption',
      priority: 'high',
      checked: false
    },
    {
      id: 'sec-2',
      category: 'Security',
      title: 'Security Headers',
      description: 'Implement HSTS, CSP, and other security headers',
      priority: 'medium',
      checked: false
    },
    {
      id: 'sec-3',
      category: 'Security',
      title: 'XSS Protection',
      description: 'Prevent cross-site scripting attacks',
      priority: 'medium',
      checked: false
    }
  ]);

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [generatedChecklist, setGeneratedChecklist] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const toggleCategory = (category: string) => {
    const categoryItems = checklist.filter(item => item.category === category);
    const allChecked = categoryItems.every(item => item.checked);
    
    setChecklist(checklist.map(item => 
      item.category === category ? { ...item, checked: !allChecked } : item
    ));
  };

  const generateChecklist = () => {
    const categories = ['Performance', 'Core Web Vitals', 'Mobile', 'SEO', 'Security'];
    let checklistContent = `# Page Speed Optimization Checklist
${websiteUrl ? `Website: ${websiteUrl}` : ''}
Generated: ${new Date().toLocaleDateString()}

`;

    categories.forEach(category => {
      const categoryItems = checklist.filter(item => item.category === category);
      const checkedItems = categoryItems.filter(item => item.checked);
      
      checklistContent += `\n## ${category}\n`;
      checklistContent += `Progress: ${checkedItems.length}/${categoryItems.length} completed\n\n`;
      
      categoryItems.forEach(item => {
        const status = item.checked ? '✅' : '⭕';
        const priority = item.priority.toUpperCase();
        checklistContent += `${status} [${priority}] ${item.title}\n`;
        checklistContent += `   ${item.description}\n\n`;
      });
    });

    // Add summary
    const totalItems = checklist.length;
    const completedItems = checklist.filter(item => item.checked).length;
    const completionRate = Math.round((completedItems / totalItems) * 100);
    
    checklistContent += `\n## Summary\n`;
    checklistContent += `Overall Progress: ${completedItems}/${totalItems} (${completionRate}%)\n`;
    
    if (completionRate === 100) {
      checklistContent += `🎉 Congratulations! All optimizations are complete!\n`;
    } else if (completionRate >= 75) {
      checklistContent += `👍 Great progress! You're almost there!\n`;
    } else if (completionRate >= 50) {
      checklistContent += `💪 Good start! Keep going!\n`;
    } else {
      checklistContent += `🚀 Let's get started on these optimizations!\n`;
    }

    // Add next steps
    const highPriorityItems = checklist.filter(item => !item.checked && item.priority === 'high');
    if (highPriorityItems.length > 0) {
      checklistContent += `\n## Next Steps (High Priority)\n`;
      highPriorityItems.slice(0, 5).forEach(item => {
        checklistContent += `• ${item.title}\n`;
      });
    }

    setGeneratedChecklist(checklistContent);
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadChecklist = () => {
    const blob = new Blob([generatedChecklist], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-speed-checklist.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const categories = ['Performance', 'Core Web Vitals', 'Mobile', 'SEO', 'Security'];
  const completedCount = checklist.filter(item => item.checked).length;
  const totalCount = checklist.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  return (
    <ToolLayout
      title="Page Speed Checklist Generator"
      description="Generate comprehensive page speed optimization checklists for better performance"
      category="SEO Tools"
      categoryPath="/category/seo"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Gauge className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Page Speed Checklist</h3>
              <p className="text-sm text-muted-foreground">
                Create comprehensive optimization checklists for better website performance
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Overall Progress</h3>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-primary">{completionRate}%</span>
            <span className="text-sm text-muted-foreground ml-2">Complete</span>
          </div>
        </div>

        {/* Website URL */}
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="block text-sm font-medium mb-2">Website URL (Optional)</label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full rounded-lg bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Checklist Categories */}
        <div className="space-y-6">
          {categories.map(category => {
            const categoryItems = checklist.filter(item => item.category === category);
            const categoryCompleted = categoryItems.filter(item => item.checked).length;
            const categoryTotal = categoryItems.length;
            
            return (
              <div key={category} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{category}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {categoryCompleted}/{categoryTotal}
                    </span>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20"
                    >
                      {categoryCompleted === categoryTotal ? 'Uncheck All' : 'Check All'}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        item.checked ? 'border-green-200 bg-green-50' : 'border-border'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          item.checked
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {item.checked && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${item.checked ? 'text-green-700' : ''}`}>
                            {item.title}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded ${getPriorityBg(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Generate Button */}
        <button
          onClick={generateChecklist}
          className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
        >
          <FileText className="inline h-4 w-4 mr-2" />
          Generate Checklist
        </button>

        {/* Generated Checklist */}
        {generatedChecklist && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated Checklist</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy("checklist", generatedChecklist)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "checklist" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={downloadChecklist}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                {generatedChecklist}
              </pre>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Optimization Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🚀 Quick Wins</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Compress images first</li>
                <li>• Enable browser caching</li>
                <li>• Minify CSS/JS files</li>
                <li>• Use CDN for static assets</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">📊 Measure Impact</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use Google PageSpeed Insights</li>
                <li>• Monitor Core Web Vitals</li>
                <li>• Track load time metrics</li>
                <li>• Test on real devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PageSpeedChecklistTool;
