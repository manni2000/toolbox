import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

/**
 * Syntax-highlighted code block with dark mode support
 * Uses CSS-based syntax highlighting for better performance
 */
export const CodeBlock = ({
  code,
  language = 'javascript',
  className,
  showLineNumbers = false,
}: CodeBlockProps) => {
  const lines = code.split('\n');

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      {language && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-muted/80 rounded text-xs font-mono text-muted-foreground">
          {language}
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-muted/30 dark:bg-muted/50">
        <code className={cn('font-mono text-sm', `language-${language}`)}>
          {showLineNumbers ? (
            <table className="w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="pr-4 text-right text-muted-foreground select-none w-12">
                      {i + 1}
                    </td>
                    <td>
                      <HighlightedLine code={line} language={language} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
};

/**
 * Simple syntax highlighting for common languages
 */
const HighlightedLine = ({ code, language }: { code: string; language: string }) => {
  if (language === 'json') {
    return <span dangerouslySetInnerHTML={{ __html: highlightJSON(code) }} />;
  }
  if (language === 'javascript' || language === 'typescript') {
    return <span dangerouslySetInnerHTML={{ __html: highlightJS(code) }} />;
  }
  return <span>{code}</span>;
};

const highlightJSON = (code: string): string => {
  return code
    .replace(/"([^"]+)":/g, '<span class="text-blue-500 dark:text-blue-400">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="text-green-600 dark:text-green-400">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="text-orange-500 dark:text-orange-400">$1</span>')
    .replace(/: (true|false|null)/g, ': <span class="text-purple-500 dark:text-purple-400">$1</span>');
};

const highlightJS = (code: string): string => {
  const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const numbers = /\b\d+\.?\d*\b/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;

  return code
    .replace(comments, '<span class="text-muted-foreground italic">$1</span>')
    .replace(strings, '<span class="text-green-600 dark:text-green-400">$&</span>')
    .replace(keywords, '<span class="text-purple-600 dark:text-purple-400">$&</span>')
    .replace(numbers, '<span class="text-orange-500 dark:text-orange-400">$&</span>');
};

/**
 * Inline code snippet
 */
export const InlineCode = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <code
      className={cn(
        'px-1.5 py-0.5 rounded bg-muted/50 dark:bg-muted/80 font-mono text-sm',
        'text-foreground/90 dark:text-foreground/80',
        className
      )}
    >
      {children}
    </code>
  );
};
