import { useState } from "react";
import { Copy, Check, Code } from "lucide-react";
import { marked } from "marked";
import ToolLayout from "@/components/layout/ToolLayout";

const MarkdownHTMLTool = () => {
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const html = markdown ? marked(markdown, { breaks: true }) : "";

  const handleCopy = async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Markdown → HTML"
      description="Convert Markdown to HTML"
      category="Text Tools"
      categoryPath="/category/text"
    >
      <div className="space-y-6">
        {/* Toggle */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`rounded-lg px-6 py-2 text-sm font-medium transition-all ${
              !showPreview
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Code className="mr-2 inline-block h-4 w-4" />
            HTML Code
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`rounded-lg px-6 py-2 text-sm font-medium transition-all ${
              showPreview
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Input/Output */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Markdown Input</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="# Hello World\n\nThis is **bold** and this is *italic*."
              className="input-tool min-h-[400px] font-mono text-sm"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">
                {showPreview ? "Preview" : "HTML Output"}
              </label>
              {!showPreview && (
                <button
                  onClick={handleCopy}
                  disabled={!html}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            {showPreview ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border bg-card p-4 min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: html as string }}
              />
            ) : (
              <textarea
                value={html as string}
                readOnly
                placeholder="HTML output will appear here..."
                className="input-tool min-h-[400px] font-mono text-sm"
              />
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default MarkdownHTMLTool;
