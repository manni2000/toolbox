import { useState } from "react";
import { Code, CheckCircle, AlertCircle, Copy, FileText, Zap, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

interface ValidationIssue {
  line: number;
  column: number;
  message: string;
  type: 'error' | 'warning';
  rule: string;
}

const HTMLValidatorTool = () => {
  const toolSeoData = getToolSeoMetadata('html-validator');
  const [htmlInput, setHtmlInput] = useState("");
  const [validationResults, setValidationResults] = useState<ValidationIssue[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);

  const validateHTML = () => {
    if (!htmlInput.trim()) {
      setValidationResults([]);
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    
    setTimeout(() => {
      const issues: ValidationIssue[] = [];
      const lines = htmlInput.split('\n');

      lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        
        if (line.includes('<img') && !line.includes('alt=')) {
          issues.push({
            line: lineNumber,
            column: line.indexOf('<img') + 1,
            message: 'IMG tag missing alt attribute for accessibility',
            type: 'warning',
            rule: 'WCAG 1.1.1'
          });
        }

        if (line.includes('<br>') && !line.includes('<br/>') && !line.includes('</br>')) {
          issues.push({
            line: lineNumber,
            column: line.indexOf('<br>') + 1,
            message: 'Use <br/> instead of <br> for XHTML compatibility',
            type: 'warning',
            rule: 'HTML5'
          });
        }

        if (line.includes('<div') && line.includes('</div>')) {
          const openTags = (line.match(/<div/g) || []).length;
          const closeTags = (line.match(/<\/div>/g) || []).length;
          if (openTags !== closeTags) {
            issues.push({
              line: lineNumber,
              column: line.indexOf('<div') + 1,
              message: 'Mismatched DIV tags',
              type: 'error',
              rule: 'HTML Structure'
            });
          }
        }

        if (line.includes('<script') && !line.includes('type=')) {
          issues.push({
            line: lineNumber,
            column: line.indexOf('<script') + 1,
            message: 'SCRIPT tag should specify type attribute',
            type: 'warning',
            rule: 'HTML5'
          });
        }

        if (line.includes('&') && !line.includes('&amp;') && !line.includes('&lt;') && !line.includes('&gt;') && !line.includes('&quot;') && !line.includes('&#')) {
          issues.push({
            line: lineNumber,
            column: line.indexOf('&') + 1,
            message: 'Unescaped ampersand (&) should be written as &amp;',
            type: 'error',
            rule: 'HTML Entities'
          });
        }

        if (line.includes('<table') && !line.includes('<thead>') && !line.includes('<tbody>')) {
          issues.push({
            line: lineNumber,
            column: line.indexOf('<table') + 1,
            message: 'TABLE should use THEAD and TBODY for better structure',
            type: 'warning',
            rule: 'HTML5 Semantics'
          });
        }

        if (line.includes('<input') && !line.includes('type=')) {
          issues.push({
            line: lineNumber,
            column: line.indexOf('<input') + 1,
            message: 'INPUT tag should specify type attribute',
            type: 'warning',
            rule: 'HTML Forms'
          });
        }

        if (line.includes('<meta') && !line.includes('charset=') && !line.includes('name=') && !line.includes('property=')) {
          issues.push({
            line: lineNumber,
            column: line.indexOf('<meta') + 1,
            message: 'META tag should have charset, name, or property attribute',
            type: 'error',
            rule: 'HTML Head'
          });
        }
      });

      const hasDoctype = htmlInput.trim().toLowerCase().startsWith('<!doctype');
      if (!hasDoctype) {
        issues.push({
          line: 1,
          column: 1,
          message: 'Missing DOCTYPE declaration',
          type: 'warning',
          rule: 'HTML5'
        });
      }

      const hasTitle = /<title>.*<\/title>/i.test(htmlInput);
      if (!hasTitle) {
        issues.push({
          line: 1,
          column: 1,
          message: 'Missing TITLE tag in head section',
          type: 'warning',
          rule: 'HTML Head'
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
      return 'HTML Validation Report\n✅ No issues found!';
    }

    let report = 'HTML Validation Report\n';
    report += `Total Issues: ${validationResults.length}\n`;
    report += `Errors: ${validationResults.filter(i => i.type === 'error').length}\n`;
    report += `Warnings: ${validationResults.filter(i => i.type === 'warning').length}\n\n`;

    validationResults.forEach((issue, index) => {
      report += `${index + 1}. [${issue.type.toUpperCase()}] Line ${issue.line}, Column ${issue.column}\n`;
      report += `   Message: ${issue.message}\n`;
      report += `   Rule: ${issue.rule}\n\n`;
    });

    return report;
  };

  const clearAll = () => {
    setHtmlInput("");
    setValidationResults([]);
    setIsValid(null);
  };

  return (
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "HTML Validator",
        toolSeoData?.description || "Validate and check HTML code for errors and best practices",
        "html-validator"
      )}
      <ToolLayout
      breadcrumbTitle="HTML Validator"
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
                <Code className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">HTML Validator</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Validate HTML code for syntax errors, accessibility issues, and best practices
                </p>
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">html validator</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">html checker</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">html validation</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">html lint</span>
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
              onClick={validateHTML} 
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
                  Validate HTML
                </>
              )}
            </motion.button>
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
                  <span>HTML is valid! No critical errors found.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span>HTML validation found issues that need attention.</span>
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
            <label className="mb-2 block text-sm font-medium">HTML Code</label>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste your HTML code here..."
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
                        : 'border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {issue.type === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            issue.type === 'error' 
                              ? 'bg-red-500/20 text-red-600' 
                              : 'bg-amber-500/20 text-amber-600'
                          }`}>
                            {issue.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Line {issue.line}, Column {issue.column}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{issue.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rule: {issue.rule}
                        </p>
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
              <Code className="h-5 w-5 text-blue-500" />
              What is HTML Validation?
            </h3>
            <p className="text-muted-foreground mb-4">
              HTML validation checks your HTML code against web standards and best practices. It helps identify syntax errors, accessibility issues, and potential problems that could affect how your website displays and functions across different browsers and devices.
            </p>
            
            <h4 className="font-semibold mb-2">What It Checks</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>HTML syntax errors and structural issues</li>
              <li>Missing required attributes (alt, type, etc.)</li>
              <li>Accessibility compliance (WCAG guidelines)</li>
              <li>HTML5 semantic structure and best practices</li>
            </ol>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-1">Validation Features</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Real-time syntax checking</li>
                  <li>• Accessibility validation</li>
                  <li>• Best practices recommendations</li>
                  <li>• Detailed error reporting</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Benefits</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Better cross-browser compatibility</li>
                  <li>• Improved accessibility</li>
                  <li>• Enhanced SEO performance</li>
                  <li>• Cleaner, maintainable code</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <ToolFAQ faqs={[
              {
                question: "What is HTML validation?",
                answer: "HTML validation is the process of checking HTML documents against web standards and specifications to ensure they follow proper syntax, structure, and best practices."
              },
              {
                question: "Why is HTML validation important?",
                answer: "Valid HTML ensures better cross-browser compatibility, improved accessibility, enhanced SEO, and easier maintenance. It helps catch errors that could cause display issues or functionality problems."
              },
              {
                question: "What are common HTML validation errors?",
                answer: "Common errors include unclosed tags, missing alt attributes on images, improper nesting, unescaped characters, missing DOCTYPE, and deprecated attributes or elements."
              },
              {
                question: "Does valid HTML improve SEO?",
                answer: "Yes, valid HTML can improve SEO by ensuring search engines can properly crawl and index your content. It also enhances accessibility and user experience, which are important ranking factors."
              },
              {
                question: "Is this validator W3C compliant?",
                answer: "This tool provides comprehensive validation based on HTML5 standards and web accessibility guidelines. For official W3C validation, you can also use the W3C Markup Validation Service."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default HTMLValidatorTool;
