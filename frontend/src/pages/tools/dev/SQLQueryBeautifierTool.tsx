import { useState } from "react";
import { Copy, Check, Download, Database, RefreshCw, FileText, AlertCircle, Code, Sparkles, Settings, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "210 80% 55%";

const SQLQueryBeautifierTool = () => {
  const toolSeoData = getToolSeoMetadata('sql-query-beautifier');
  const [sqlInput, setSqlInput] = useState('');
  const [formattedSQL, setFormattedSQL] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
    'TABLE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'JOIN', 'INNER',
    'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'UNION', 'GROUP', 'BY', 'ORDER',
    'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'AS', 'ON', 'AND', 'OR', 'NOT',
    'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'TRUE', 'FALSE', 'CASE',
    'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION'
  ];

  const beautifySQL = () => {
    let formatted = sqlInput.trim();
    
    // Remove extra whitespace and normalize line breaks
    formatted = formatted.replace(/\s+/g, ' ');
    formatted = formatted.replace(/\n\s*\n/g, '\n');
    
    // Split into lines
    const lines = formatted.split('\n');
    const beautifiedLines: string[] = [];
    let indentLevel = 0;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        beautifiedLines.push('');
        return;
      }
      
      // Adjust indentation based on keywords
      const upperLine = trimmedLine.toUpperCase();
      
      // Decrease indentation for closing keywords
      if (upperLine.startsWith('END') || 
          upperLine.startsWith('COMMIT') || 
          upperLine.startsWith('ROLLBACK') ||
          upperLine.startsWith('TRANSACTION') ||
          upperLine.startsWith('CASE') ||
          upperLine.startsWith('WHEN') ||
          upperLine.startsWith('ELSE')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add indentation
      const indent = ' '.repeat(indentSize * indentLevel);
      let processedLine = indent + trimmedLine;
      
      // Format keywords
      if (uppercaseKeywords) {
        processedLine = processedLine.replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|UNION|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|DISTINCT|AS|ON|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|TRUE|FALSE|CASE|WHEN|THEN|ELSE|END|IF|BEGIN|COMMIT|ROLLBACK|TRANSACTION)\b/g, (match) => match.toUpperCase());
      }
      
      // Format commas and operators
      processedLine = processedLine.replace(/,/g, ', ');
      processedLine = processedLine.replace(/\s*=\s*/g, ' = ');
      processedLine = processedLine.replace(/\s*<\s*/g, ' < ');
      processedLine = processedLine.replace(/>\s*/g, ' > ');
      processedLine = processedLine.replace(/\s*<=\s*/g, ' <= ');
      processedLine = processedLine.replace(/\s*>=\s*/g, ' >= ');
      processedLine = processedLine.replace(/\s*!=\s*/g, ' != ');
      
      beautifiedLines.push(processedLine);
      
      // Increase indentation for opening keywords
      if (upperLine.startsWith('SELECT') || 
          upperLine.startsWith('FROM') ||
          upperLine.startsWith('WHERE') ||
          upperLine.startsWith('INSERT') ||
          upperLine.startsWith('UPDATE') ||
          upperLine.startsWith('DELETE') ||
          upperLine.startsWith('CREATE') ||
          upperLine.startsWith('ALTER') ||
          upperLine.startsWith('DROP') ||
          upperLine.startsWith('TABLE') ||
          upperLine.startsWith('INDEX') ||
          upperLine.startsWith('VIEW') ||
          upperLine.startsWith('PROCEDURE') ||
          upperLine.startsWith('FUNCTION') ||
          upperLine.startsWith('TRIGGER') ||
          upperLine.startsWith('JOIN') ||
          upperLine.startsWith('CASE') ||
          upperLine.startsWith('IF') ||
          upperLine.startsWith('BEGIN')) {
        indentLevel++;
      }
    });
    
    setFormattedSQL(beautifiedLines.join('\n'));
  };

  const handleCopy = async (type: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSQL = () => {
    const data = new Blob([formattedSQL], { type: 'text/plain' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-query.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    const exampleSQL = `SELECT u.id, u.name, u.email, p.title, p.content, p.created_at FROM users u JOIN posts p ON u.id = p.user_id WHERE u.is_active = true AND p.status = 'published' ORDER BY p.created_at DESC LIMIT 10 OFFSET 0`;
    setSqlInput(exampleSQL);
  };

  const minifySQL = () => {
    const minified = formattedSQL
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*=\s*/g, '=')
      .replace(/\s*<\s*/g, '<')
      .replace(/>\s*/g, '>')
      .replace(/\s*<=\s*/g, '<=')
      .replace(/\s*>=\s*/g, '>=')
      .replace(/\s*!=\s*/g, '!=')
      .trim();
    setFormattedSQL(minified);
  };

  return (
    <>
      {CategorySEO.Dev(
        toolSeoData?.title || "SQL Query Beautifier",
        toolSeoData?.description || "Format and beautify SQL queries with customizable indentation and keyword formatting",
        "sql-query-beautifier"
      )}
      <ToolLayout
      title="SQL Query Beautifier"
      description="Format and beautify SQL queries with customizable indentation and keyword formatting"
      category="Developer Tools"
      categoryPath="/category/dev"
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
              <Database className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">SQL Query Beautifier</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Format and beautify SQL queries with customizable indentation and keyword formatting
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">sql formatter</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">sql beautifier</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">sql query formatter</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">format sql</span>
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
              <label className="block text-sm font-medium mb-2">SQL Query</label>
              <textarea
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                placeholder="Paste your SQL query here..."
                rows={8}
                className="w-full rounded-lg bg-muted px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your SQL query to format and beautify
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={beautifySQL}
                disabled={!sqlInput.trim()}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
              >
                <RefreshCw className="inline h-4 w-4 mr-2" />
                Beautify SQL
              </motion.button>
              <button
                onClick={loadExample}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Load Example
              </button>
            </div>
          </div>
        </motion.div>

        {/* Formatting Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="indent-size" className="block text-sm font-medium mb-2">Indent Size</label>
                <select
                  id="indent-size"
                  title="Indent Size"
                  value={indentSize}
                  onChange={(e) => setIndentSize(parseInt(e.target.value))}
                  className="w-full rounded-lg bg-muted px-4 py-2 text-sm"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Uppercase Keywords</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setUppercaseKeywords(!uppercaseKeywords)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      uppercaseKeywords
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {uppercaseKeywords ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={beautifySQL}
                disabled={!sqlInput.trim()}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
                }}
              >
                <RefreshCw className="inline h-4 w-4 mr-2" />
                Reformat
              </motion.button>
              <button
                onClick={minifySQL}
                disabled={!formattedSQL.trim()}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Minify
              </button>
            </div>
          </div>
        </motion.div>

        {/* Formatted Output */}
        {formattedSQL && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Formatted SQL</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  title="Copy formatted SQL"
                  aria-label="Copy formatted SQL"
                  onClick={() => handleCopy("sql", formattedSQL)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "sql" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  title="Download formatted SQL"
                  aria-label="Download formatted SQL"
                  onClick={downloadSQL}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                {formattedSQL}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            SQL Formatting Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">🎨 Formatting Rules</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Proper indentation for nested queries</li>
                <li>• Uppercase SQL keywords</li>
                <li>• Consistent spacing around operators</li>
                <li>• Logical line breaks</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🔧 Features</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Customizable indent size</li>
                <li>• Toggle keyword casing</li>
                <li>• Minify option</li>
                <li>• Copy & download support</li>
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
            <Database className="h-5 w-5 text-blue-500" />
            What is SQL Beautification?
          </h3>
          <p className="text-muted-foreground mb-4">
            SQL beautification formats SQL queries with proper indentation, line breaks, and keyword casing to improve readability. It transforms minified or poorly formatted SQL into clean, structured code that's easier to understand, debug, and maintain.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Paste or type your SQL query into the input area</li>
            <li>Choose indentation size and keyword casing options</li>
            <li>Click format to beautify the SQL query</li>
            <li>Copy or download the formatted result</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Formatting Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Customizable indentation</li>
                <li>• Keyword casing (upper/lower)</li>
                <li>• Minify option</li>
                <li>• Download support</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Use Cases</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Code review</li>
                <li>• Documentation</li>
                <li>• Debugging queries</li>
                <li>• Team collaboration</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What SQL dialects are supported?",
            answer: "The tool supports standard SQL syntax common across most databases including MySQL, PostgreSQL, SQL Server, and Oracle. Complex dialect-specific features may not be fully supported."
          },
          {
            question: "Can I minify SQL queries?",
            answer: "Yes, the tool includes a minify option that removes unnecessary whitespace and line breaks to compress SQL into a single line for storage or transmission."
          },
          {
            question: "What is keyword casing?",
            answer: "Keyword casing converts SQL keywords (SELECT, FROM, WHERE, etc.) to uppercase or lowercase. This improves consistency and readability according to your coding style."
          },
          {
            question: "How does indentation work?",
            answer: "Indentation adds spaces or tabs to show the hierarchical structure of SQL queries. You can choose 2, 4, or 8 spaces per indentation level."
          },
          {
            question: "Is my SQL data stored?",
            answer: "No, all formatting happens locally in your browser. Your SQL queries are never sent to any server, ensuring complete privacy for your database code."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default SQLQueryBeautifierTool;
