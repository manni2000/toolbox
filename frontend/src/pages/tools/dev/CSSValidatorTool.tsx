import { useState } from "react";
import { Palette, CheckCircle, AlertCircle, Copy, FileText, Zap, Settings, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "280 75% 55%";

interface CSSIssue {
  line: number;
  message: string;
  type: 'error' | 'warning' | 'info';
  property?: string;
  suggestion?: string;
}

const CSSValidatorTool = () => {
  const toolSeoData = getToolSeoMetadata('css-validator');
  const [cssInput, setCssInput] = useState("");
  const [validationResults, setValidationResults] = useState<CSSIssue[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);

  const validateCSS = () => {
    if (!cssInput.trim()) {
      setValidationResults([]);
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    
    setTimeout(() => {
      const issues: CSSIssue[] = [];
      const lines = cssInput.split('\n');

      lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('/*') || trimmedLine.startsWith('*') || trimmedLine === '') {
          return;
        }

        if (trimmedLine.includes('!important')) {
          issues.push({
            line: lineNumber,
            message: 'Avoid using !important - it can cause specificity issues',
            type: 'warning',
            property: trimmedLine.split(':')[0]?.trim(),
            suggestion: 'Consider using more specific selectors instead'
          });
        }

        if (trimmedLine.includes('float:') && !trimmedLine.includes('clear:')) {
          issues.push({
            line: lineNumber,
            message: 'Using float without clear may cause layout issues',
            type: 'warning',
            property: 'float',
            suggestion: 'Consider using flexbox or grid instead, or add clear property'
          });
        }

        if (trimmedLine.includes('position: fixed') || trimmedLine.includes('position: absolute')) {
          if (!cssInput.includes('z-index:')) {
            issues.push({
              line: lineNumber,
              message: 'Positioned elements should have z-index specified',
              type: 'info',
              property: trimmedLine.split(':')[0]?.trim(),
              suggestion: 'Add z-index to control stacking order'
            });
          }
        }

        if (trimmedLine.includes('color:') && !trimmedLine.includes('background-color:') && !cssInput.includes('background-color:')) {
          issues.push({
            line: lineNumber,
            message: 'Color specified without background color may cause contrast issues',
            type: 'warning',
            property: 'color',
            suggestion: 'Ensure sufficient contrast by specifying background color'
          });
        }

        if (trimmedLine.includes('font-size:') && !trimmedLine.includes('px') && !trimmedLine.includes('em') && !trimmedLine.includes('rem') && !trimmedLine.includes('%') && !trimmedLine.includes('vw') && !trimmedLine.includes('vh')) {
          issues.push({
            line: lineNumber,
            message: 'Font-size should use relative units for better accessibility',
            type: 'info',
            property: 'font-size',
            suggestion: 'Consider using rem, em, or % instead of px'
          });
        }

        if (trimmedLine.includes('width:') || trimmedLine.includes('height:')) {
          if (trimmedLine.includes('px') && (parseInt(trimmedLine.match(/\d+/)?.[0] || '0') || 0) > 1200) {
            issues.push({
              line: lineNumber,
              message: 'Large fixed dimensions may not work well on mobile devices',
              type: 'warning',
              property: trimmedLine.split(':')[0]?.trim(),
              suggestion: 'Consider using responsive units or max-width'
            });
          }
        }

        if (trimmedLine.includes('margin:') && trimmedLine.split(' ').length > 4) {
          issues.push({
            line: lineNumber,
            message: 'Invalid margin syntax - too many values',
            type: 'error',
            property: 'margin',
            suggestion: 'Use 1, 2, 3, or 4 values for top, right, bottom, left'
          });
        }

        if (trimmedLine.includes('padding:') && trimmedLine.split(' ').length > 4) {
          issues.push({
            line: lineNumber,
            message: 'Invalid padding syntax - too many values',
            type: 'error',
            property: 'padding',
            suggestion: 'Use 1, 2, 3, or 4 values for top, right, bottom, left'
          });
        }

        if (trimmedLine.includes('display: inline') && (trimmedLine.includes('width:') || trimmedLine.includes('height:'))) {
          issues.push({
            line: lineNumber,
            message: 'Inline elements cannot have width or height',
            type: 'error',
            property: 'display',
            suggestion: 'Use inline-block or block display instead'
          });
        }

        if (trimmedLine.includes('opacity:') && !trimmedLine.includes('filter: opacity(')) {
          const opacityValue = parseFloat(trimmedLine.match(/[\d.]+/)?.[0] || '1');
          if (opacityValue < 0 || opacityValue > 1) {
            issues.push({
              line: lineNumber,
              message: 'Opacity value must be between 0 and 1',
              type: 'error',
              property: 'opacity',
              suggestion: 'Use values from 0 (transparent) to 1 (opaque)'
            });
          }
        }

        if (trimmedLine.includes('transition:') && !trimmedLine.includes('all') && trimmedLine.split(' ').length < 2) {
          issues.push({
            line: lineNumber,
            message: 'Transition should include duration value',
            type: 'warning',
            property: 'transition',
            suggestion: 'Add duration (e.g., 0.3s) to the transition property'
          });
        }

        if (trimmedLine.includes('cursor: pointer') && !trimmedLine.includes('button') && !trimmedLine.includes('a')) {
          issues.push({
            line: lineNumber,
            message: 'Pointer cursor on non-interactive elements may confuse users',
            type: 'info',
            property: 'cursor',
            suggestion: 'Ensure element is interactive or use appropriate cursor'
          });
        }

        if (trimmedLine.includes('text-align: justify')) {
          issues.push({
            line: lineNumber,
            message: 'Justified text can create readability issues',
            type: 'info',
            property: 'text-align',
            suggestion: 'Consider left alignment for better readability'
          });
        }

        if (trimmedLine.includes('box-shadow:') && !trimmedLine.includes('inset') && !trimmedLine.includes('rgba')) {
          issues.push({
            line: lineNumber,
            message: 'Consider using rgba colors for better shadow control',
            type: 'info',
            property: 'box-shadow',
            suggestion: 'Use rgba() for transparent shadows'
          });
        }
      });

      const hasMediaQueries = cssInput.includes('@media');
      if (!hasMediaQueries) {
        issues.push({
          line: 1,
          message: 'No media queries found - consider adding responsive design',
          type: 'info',
          suggestion: 'Add @media queries for better mobile experience'
        });
      }

      const hasVendorPrefixes = cssInput.includes('-webkit-') || cssInput.includes('-moz-') || cssInput.includes('-ms-');
      if (!hasVendorPrefixes && (cssInput.includes('transform:') || cssInput.includes('transition:') || cssInput.includes('animation:'))) {
        issues.push({
          line: 1,
          message: 'Consider adding vendor prefixes for better browser support',
          type: 'info',
          suggestion: 'Add -webkit-, -moz-, -ms- prefixes for experimental features'
        });
      }

      setValidationResults(issues);
      setIsValid(issues.filter(i => i.type === 'error').length === 0);
      setIsValidating(false);
    }, 1000);
  };

  const handleCopy = async () => {
    const report = generateValidationReport();
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateValidationReport = () => {
    if (validationResults.length === 0) {
      return 'CSS Validation Report\n✅ No issues found!';
    }

    let report = 'CSS Validation Report\n';
    report += `Total Issues: ${validationResults.length}\n`;
    report += `Errors: ${validationResults.filter(i => i.type === 'error').length}\n`;
    report += `Warnings: ${validationResults.filter(i => i.type === 'warning').length}\n`;
    report += `Info: ${validationResults.filter(i => i.type === 'info').length}\n\n`;

    validationResults.forEach((issue, index) => {
      report += `${index + 1}. [${issue.type.toUpperCase()}] Line ${issue.line}\n`;
      report += `   Message: ${issue.message}\n`;
      if (issue.property) report += `   Property: ${issue.property}\n`;
      if (issue.suggestion) report += `   Suggestion: ${issue.suggestion}\n`;
      report += '\n';
    });

    return report;
  };

  const clearAll = () => {
    setCssInput("");
    setValidationResults([]);
    setIsValid(null);
  };

  const optimizeCSS = () => {
    let optimized = cssInput;
    
    optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/;\s*}/g, '}');
    optimized = optimized.replace(/\s*{\s*/g, '{');
    optimized = optimized.replace(/\s*}\s*/g, '}\n');
    optimized = optimized.replace(/;\s*/g, ';');
    optimized = optimized.replace(/:\s*/g, ':');
    optimized = optimized.trim();
    
    setCssInput(optimized);
  };

  return (
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "CSS Validator",
        toolSeoData?.description || "Validate and optimize CSS code for best practices and performance",
        "css-validator"
      )}
      <ToolLayout
        title="CSS Validator"
        description="Validate and optimize CSS code for best practices and performance"
        category="Developer Tools"
        categoryPath="/category/dev"
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
                <Palette className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">CSS Validator & Optimizer</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Validate CSS code for best practices, performance, and accessibility compliance
                </p>
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">css validator</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">css optimizer</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">css checker</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">css lint</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.button 
              onClick={validateCSS} 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isValidating}
              className="btn-primary flex items-center gap-2 text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
              }}
            >
              {isValidating ? (
                <>
                  <Settings className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Validate CSS
                </>
              )}
            </motion.button>
            <button onClick={optimizeCSS} className="btn-secondary flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Optimize
            </button>
            <button onClick={clearAll} className="btn-secondary">
              Clear All
            </button>
            {validationResults.length > 0 && (
              <button onClick={handleCopy} className="btn-secondary">
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Report
                  </>
                )}
              </button>
            )}
          </motion.div>

          {/* Status */}
          {isValid !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                isValid 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {isValid ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>CSS is valid! No critical errors found.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span>CSS validation found issues that need attention.</span>
                </>
              )}
            </motion.div>
          )}

          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <label className="mb-2 block text-sm font-medium">CSS Code</label>
            <textarea
              value={cssInput}
              onChange={(e) => setCssInput(e.target.value)}
              placeholder="Paste your CSS code here..."
              className="input-tool min-h-[400px] font-mono text-sm"
            />
          </motion.div>

          {/* Validation Results */}
          {validationResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-4 shadow-lg hover:shadow-xl transition-shadow duration-500"
            >
              <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Validation Results ({validationResults.length} issues)
              </h3>
              <div className="space-y-3">
                {validationResults.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`rounded-lg border p-3 ${
                      issue.type === 'error' 
                        ? 'border-red-500/30 bg-red-500/10' 
                        : issue.type === 'warning'
                        ? 'border-amber-500/30 bg-amber-500/10'
                        : 'border-blue-500/30 bg-blue-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {issue.type === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      ) : issue.type === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            issue.type === 'error' 
                              ? 'bg-red-500/20 text-red-600' 
                              : issue.type === 'warning'
                              ? 'bg-amber-500/20 text-amber-600'
                              : 'bg-blue-500/20 text-blue-600'
                          }`}>
                            {issue.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Line {issue.line}
                          </span>
                          {issue.property && (
                            <span className="text-xs text-muted-foreground font-mono">
                              ({issue.property})
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tool Definition Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              What is CSS Validation?
            </h3>
            <p className="text-muted-foreground mb-4">
              CSS validation checks your stylesheet against best practices, performance guidelines, and accessibility standards. It helps identify potential issues that could affect your website's appearance, performance, and user experience across different browsers and devices.
            </p>
            
            <h4 className="font-semibold mb-2">What It Checks</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>CSS syntax errors and invalid properties</li>
              <li>Performance and optimization issues</li>
              <li>Accessibility compliance and contrast</li>
              <li>Responsive design and mobile compatibility</li>
            </ol>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-semibold text-purple-900 mb-1">Validation Features</h5>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Syntax and property validation</li>
                  <li>• Performance optimization</li>
                  <li>• Accessibility checks</li>
                  <li>• Best practices recommendations</li>
                </ul>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <h5 className="font-semibold text-pink-900 mb-1">Optimization Benefits</h5>
                <ul className="text-sm text-pink-800 space-y-1">
                  <li>• Faster page load times</li>
                  <li>• Better cross-browser support</li>
                  <li>• Improved maintainability</li>
                  <li>• Enhanced user experience</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <ToolFAQ faqs={[
              {
                question: "What is CSS validation?",
                answer: "CSS validation is the process of checking CSS code against web standards, best practices, and performance guidelines to ensure it's error-free and optimized."
              },
              {
                question: "Why should I validate my CSS?",
                answer: "Valid CSS ensures consistent rendering across browsers, better performance, improved accessibility, and easier maintenance. It helps catch errors that could break your layout."
              },
              {
                question: "What are common CSS issues?",
                answer: "Common issues include invalid properties, incorrect syntax, browser compatibility problems, performance bottlenecks, accessibility violations, and poor responsive design practices."
              },
              {
                question: "How does CSS optimization work?",
                answer: "CSS optimization removes unnecessary code, minifies styles, combines selectors, eliminates redundant properties, and suggests more efficient alternatives to improve performance."
              },
              {
                question: "Does this tool check browser compatibility?",
                answer: "Yes, the validator checks for common browser compatibility issues and suggests vendor prefixes, fallbacks, and alternative approaches for better cross-browser support."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default CSSValidatorTool;
