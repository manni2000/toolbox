import { useState } from "react";
import { Copy, Check, FileText, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const LoremGeneratorTool = () => {
  const [paragraphs, setParagraphs] = useState(3);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
    "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
    "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo",
    "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta",
    "explicabo", "nemo", "ipsam", "quia", "voluptas", "aspernatur", "aut", "odit",
    "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi",
    "nesciunt", "neque", "porro", "quisquam", "nihil", "impedit", "quo", "minus"
  ];

  const generateSentence = () => {
    const length = Math.floor(Math.random() * 10) + 8;
    const words = [];
    for (let i = 0; i < length; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ") + ".";
  };

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 3) + 4;
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(" ");
  };

  const generate = () => {
    let result = "";
    
    if (type === "words") {
      const words = [];
      for (let i = 0; i < paragraphs; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      result = words.join(" ");
    } else if (type === "sentences") {
      const sentences = [];
      for (let i = 0; i < paragraphs; i++) {
        sentences.push(generateSentence());
      }
      result = sentences.join(" ");
    } else {
      const paras = [];
      for (let i = 0; i < paragraphs; i++) {
        paras.push(generateParagraph());
      }
      result = paras.join("\n\n");
    }
    
    setOutput(result);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for your designs"
      category="Developer Tools"
      categoryPath="/category/dev"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="input-tool"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Number of {type}
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={paragraphs}
              onChange={(e) => setParagraphs(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="input-tool"
            />
          </div>
        </div>

        <button onClick={generate} className="btn-primary w-full">
          <RefreshCw className="h-5 w-5" />
          Generate Lorem Ipsum
        </button>

        {/* Output */}
        {output && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Text</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
            </div>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-border bg-card p-4 whitespace-pre-wrap">
              {output}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {output.split(/\s+/).length} words • {output.length} characters
            </p>
          </div>
        )}

        {!output && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Click generate to create placeholder text
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default LoremGeneratorTool;
