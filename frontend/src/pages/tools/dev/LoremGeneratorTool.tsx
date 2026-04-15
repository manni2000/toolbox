import { useState } from "react";
import { Copy, Check, FileText, RefreshCw, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "210 80% 55%";

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
    const words: string[] = [];
    for (let i = 0; i < length; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ") + ".";
  };

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 3) + 4;
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(" ");
  };

  const generate = () => {
    let result = "";
    
    if (type === "words") {
      const words: string[] = [];
      for (let i = 0; i < paragraphs; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      result = words.join(" ");
    } else if (type === "sentences") {
      const sentences: string[] = [];
      for (let i = 0; i < paragraphs; i++) {
        sentences.push(generateSentence());
      }
      result = sentences.join(" ");
    } else {
      const paras: string[] = [];
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
              <FileText className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Lorem Ipsum Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate placeholder text for your designs and mockups
              </p>
            </div>
          </div>
        </motion.div>

        {/* Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lorem-type" className="mb-2 block text-sm font-medium">Type</label>
            <select
              id="lorem-type"
              title="Select output type"
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
            <label htmlFor="lorem-count" className="mb-2 block text-sm font-medium">
              Number of {type}
            </label>
            <input
              id="lorem-count"
              title={`Number of ${type} to generate`}
              placeholder={`Enter number of ${type}`}
              type="number"
              min="1"
              max="100"
              value={paragraphs}
              onChange={(e) => setParagraphs(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="input-tool"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generate}
          className="btn-primary w-full text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
          }}
        >
          <RefreshCw className="h-5 w-5" />
          Generate Lorem Ipsum
        </motion.button>
        </motion.div>

        {/* Output */}
        {output && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
          >
            <div className="flex items-center justify-between mb-4">
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
            <div className="max-h-96 overflow-y-auto rounded-lg bg-muted p-4 whitespace-pre-wrap">
              {output}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {output.split(/\s+/).length} words • {output.length} characters
            </p>
          </motion.div>
        )}

        {!output && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center"
          >
            <FileText className="mx-auto h-12 w-12" style={{ color: `hsl(${categoryColor})` }} />
            <p className="mt-4 text-muted-foreground">
              Click generate to create placeholder text
            </p>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-muted/30 p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Lorem Ipsum Tips
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h5 className="font-medium text-foreground mb-2">📝 Output Types</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Paragraphs:</strong> Full blocks of text</li>
                <li>• <strong>Sentences:</strong> Individual sentences</li>
                <li>• <strong>Words:</strong> Random word count</li>
                <li>• Great for layout testing</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">✨ Best Uses</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• UI/UX mockups and wireframes</li>
                <li>• Testing text overflow</li>
                <li>• Placeholder content</li>
                <li>• Typography testing</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default LoremGeneratorTool;
