import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, QrCode, Type, Lock, FileJson, Calendar, Image } from "lucide-react";

const popularTools = [
  {
    id: "qr-generator",
    name: "QR Code Generator",
    description: "Create QR codes from any URL or text instantly",
    path: "/tools/image/qr-generator",
    icon: QrCode,
    color: "173 80% 40%",
  },
  {
    id: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs",
    path: "/tools/text/word-counter",
    icon: Type,
    color: "280 80% 50%",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure random passwords instantly",
    path: "/tools/security/password-generator",
    icon: Lock,
    color: "0 80% 55%",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data",
    path: "/tools/dev/json-formatter",
    icon: FileJson,
    color: "210 80% 55%",
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    description: "Calculate exact age from your birthdate",
    path: "/tools/date-time/age-calculator",
    icon: Calendar,
    color: "45 90% 50%",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress images without losing quality",
    path: "/tools/image/compressor",
    icon: Image,
    color: "150 60% 45%",
  },
];

const PopularTools = () => {
  return (
    <section className="border-y border-border bg-muted/30 py-20">
      <div className="container">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Popular Tools</h2>
            <p className="mt-2 text-muted-foreground">
              Most used tools by our users
            </p>
          </div>
          <Link
            to="/categories"
            className="hidden items-center gap-2 text-sm font-medium text-primary hover:underline md:flex"
          >
            View all tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={tool.path}
                  className="tool-card group flex items-start gap-4"
                >
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `hsl(${tool.color} / 0.15)` }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: `hsl(${tool.color})` }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <Link
          to="/categories"
          className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline md:hidden"
        >
          View all tools
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default PopularTools;
