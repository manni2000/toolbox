import { useState } from "react";
import { Copy, Check, Code, Sparkles } from "lucide-react";
import { marked } from "marked";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";

const categoryColor = "260 70% 55%";

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
    <>
      {CategorySEO.Text(
        "Markdown → HTML",
        "Convert Markdown to HTML",
        "markdown--html"
      )}
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

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            What is Markdown to HTML Conversion?
          </h3>
          <p className="text-muted-foreground mb-4">
            Markdown to HTML conversion transforms Markdown formatting into HTML code. Markdown is a lightweight markup language for formatted text, and HTML is the standard for web pages.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Write or paste your Markdown text</li>
            <li>The tool parses the Markdown</li>
            <li>Converts to HTML code</li>
            <li>Copy the HTML output</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Supported Markdown</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Headers (#)</li>
                <li>• Bold/Italic</li>
                <li>• Links and images</li>
                <li>• Lists and code</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Web content creation</li>
                <li>• Documentation writing</li>
                <li>• Blog posts</li>
                <li>• README files</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is Markdown used for?",
            answer: "Markdown is used for writing formatted text in plain text editors. It's popular for README files, documentation, blog posts, and any content that needs simple formatting."
          },
          {
            question: "Is Markdown better than HTML?",
            answer: "Markdown is simpler and more readable than HTML for writing. HTML provides more control but is verbose. Use Markdown for writing, convert to HTML for display."
          },
          {
            question: "Can I use HTML within Markdown?",
            answer: "Yes, most Markdown parsers allow raw HTML within Markdown. This gives you the simplicity of Markdown with the power of HTML when needed."
          },
          {
            question: "What happens to unsupported Markdown?",
            answer: "Unsupported Markdown syntax typically passes through unchanged. Check your parser documentation for specific features and extensions supported."
          },
          {
            question: "Should I learn Markdown?",
            answer: "Yes, Markdown is easy to learn and widely used. It makes writing formatted text faster and more portable. Most developers and technical writers use Markdown daily."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default MarkdownHTMLTool;
