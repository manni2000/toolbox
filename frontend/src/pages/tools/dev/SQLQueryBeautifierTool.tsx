import { useState } from "react";
import { Copy, Check, Download, Database, RefreshCw, FileText, AlertCircle, Code } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const SQLQueryBeautifierTool = () => {
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
    <ToolLayout
      title="SQL Query Beautifier"
      description="Format and beautify SQL queries with customizable indentation and keyword formatting"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">SQL Query Beautifier</h3>
              <p className="text-sm text-muted-foreground">
                Format and beautify SQL queries for better readability
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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
              <button
                onClick={beautifySQL}
                disabled={!sqlInput.trim()}
                className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="inline h-4 w-4 mr-2" />
                Beautify SQL
              </button>
              <button
                onClick={loadExample}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Load Example
              </button>
            </div>
          </div>
        </div>

        {/* Formatting Options */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Indent Size</label>
                <select
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
              <button
                onClick={beautifySQL}
                disabled={!sqlInput.trim()}
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="inline h-4 w-4 mr-2" />
                Reformat
              </button>
              <button
                onClick={minifySQL}
                disabled={!formattedSQL.trim()}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Minify
              </button>
            </div>
          </div>
        </div>

        {/* Formatted Output */}
        {formattedSQL && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Formatted SQL</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy("sql", formattedSQL)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "sql" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
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
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
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
        </div>
      </div>
    </ToolLayout>
  );
};

export default SQLQueryBeautifierTool;
