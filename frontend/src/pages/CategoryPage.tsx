import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ChevronRight, TrendingUp, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCategoryById } from "@/data/toolCategories";
import ToolCard from "@/components/ToolCard";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { universalToolFaqs } from "@/data/toolSeoEnhancements";
import CategoryFAQSection from "@/components/CategoryFAQSection";
import SEOHelmet from "@/components/SEOHelmet";

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getCategoryById(categoryId || "");

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const Icon = category.icon;

  const getCategoryDescription = () => {
    const descriptions: Record<string, string> = {
      "pdf": "Professional PDF tools for editing, converting, merging, and optimizing documents. Free online PDF editor, converter, and organizer tools without watermark.",
      "image": "Professional image tools for compressing, converting, resizing, and editing images. Free online image editor, converter, and optimizer tools without watermark.",
      "video": "Professional video tools for converting, trimming, and processing videos. Free online video editor, converter, and processor tools without watermark.",
      "audio": "Professional audio tools for converting, trimming, and processing audio files. Free online audio editor, converter, and processor tools without watermark.",
      "text": "Professional text tools for counting, converting, and processing text. Free online text editor, converter, and processor tools without watermark.",
      "security": "Professional security tools for generating passwords, hashing data, and encryption. Free online security tools, password generator, and encryption tools without watermark.",
      "finance": "Professional finance tools for calculating GST, EMI, and managing finances. Free online finance calculator, invoice generator, and financial tools without watermark.",
      "dev": "Professional development tools for formatting JSON, testing regex, and encoding data. Free online developer tools, code formatter, and programming utilities without watermark.",
      "education": "Professional educational tools for calculations, conversions, and learning. Free online education calculator, converter, and learning tools without watermark.",
      "internet": "Professional internet tools for IP lookup, DNS checking, and network analysis. Free online network tools, IP checker, and web utilities without watermark.",
      "seo": "Professional SEO tools for meta tags, keyword analysis, and search optimization. Free online SEO tools, meta generator, and optimization utilities without watermark.",
      "social": "Professional social media tools for generating hashtags, creating bios, and formatting content. Free online social media tools, hashtag generator, and content utilities without watermark.",
      "zip": "Professional compression tools for creating ZIP files, extracting archives, and compressing data. Free online compression tools, archive manager, and file utilities without watermark.",
      "date-time": "Professional date and time tools for calculating dates, managing time, and scheduling. Free online date calculator, time manager, and scheduling tools without watermark.",
      "govt-legal": "Professional government and legal tools for passport photos, document templates, and signatures. Free online legal tools, document creator, and government utilities without watermark.",
      "ecommerce": "Professional e-commerce tools for generating barcodes, creating invoices, and managing products. Free online business tools, barcode generator, and seller utilities without watermark."
    };

    return descriptions[categoryId || ""] || `Free online ${category.name.toLowerCase()} for all your needs. Professional tools without registration or watermark.`;
  };

  const getCategoryKeywords = () => {
    const keywords: Record<string, string[]> = {
      "pdf": ["free pdf editor", "pdf converter", "pdf merger", "pdf compressor", "pdf tools online", "edit pdf free", "convert pdf", "pdf organizer"],
      "image": ["image compressor", "image converter", "resize image", "crop image", "image editor free", "compress images", "convert images", "image tools"],
      "video": ["video editor", "video converter", "trim video", "video to audio", "video processing", "edit video free", "video tools", "video editor online"],
      "audio": ["audio converter", "audio editor", "trim audio", "merge audio", "audio processing", "edit audio free", "audio tools", "audio merger"],
      "text": ["word counter", "text editor", "case converter", "text tools", "text processing", "edit text free", "text utilities", "writing tools"],
      "security": ["password generator", "hash calculator", "security tools", "encryption tools", "privacy tools", "security utilities", "online security", "base64 encoder"],
      "finance": ["gst calculator", "emi calculator", "invoice generator", "finance tools", "business calculator", "tax tools", "currency converter", "financial calculator"],
      "dev": ["json formatter", "regex tester", "jwt decoder", "url encoder", "developer tools", "programming tools", "web development", "coding utilities"],
      "education": ["scientific calculator", "unit converter", "percentage calculator", "learning tools", "calculator", "educational utilities", "study tools", "math tools"],
      "internet": ["ip lookup", "dns checker", "ssl checker", "ping test", "network tools", "web tools", "internet utilities", "network analysis"],
      "seo": ["meta tags", "keyword analyzer", "robots txt", "page seo", "seo tools", "search optimization", "website seo", "optimization tools"],
      "social": ["hashtag generator", "bio creator", "caption formatter", "social media tools", "social utilities", "media tools", "content creator", "social marketing"],
      "zip": ["create zip", "extract zip", "compression zip", "file compression", "zip creator", "archive extractor", "file manager", "compression tools"],
      "date-time": ["date calculator", "age calculator", "countdown timer", "working days", "time tools", "scheduler", "planning tools", "date utilities"],
      "govt-legal": ["passport photo", "document creator", "signature maker", "legal tools", "legal utilities", "government forms", "document tools", "legal aid"],
      "ecommerce": ["barcode generator", "invoice creator", "gst invoice", "business tools", "seller tools", "online store", "e-commerce utilities", "online business tools"]
    };

    return keywords[categoryId || ""] || ["free online tools", "web utilities", "browser tools", "online applications"];
  };

  const getTrendingTools = () => {
    const trendingMap: Record<string, string[]> = {
      "pdf": ["pdf-to-word", "pdf-to-image", "pdf-merge", "pdf-compressor"],
      "image": ["png-to-jpg-converter", "qr-code-generator", "image-compressor", "background-remover"],
      "video": ["video-to-audio", "video-trim", "video-speed", "video-thumbnail"],
      "audio": ["audio-converter", "speech-to-text", "audio-trimmer", "audio-merger"],
      "text": ["word-counter", "case-converter", "color-converter", "text-diff"],
      "security": ["password-generator", "password-strength", "hash-generator", "base64-tool"],
      "finance": ["invoice-generator", "gst-calculator", "emi-calculator", "currency-converter"],
      "dev": ["json-formatter", "regex-tester", "jwt-decoder", "url-encoder"],
      "education": ["scientific-calculator", "percentage-calc", "unit-converter", "compound-interest"],
      "internet": ["ip-lookup", "dns-lookup", "ssl-checker", "ping-test"],
      "seo": ["meta-title-description-generator", "keyword-density-checker", "robots-txt-generator", "page-seo-analyzer"],
      "social": ["hashtag-generator", "bio-generator", "caption-formatter", "meme-generator"],
      "zip": ["create-zip", "extract-zip", "password-zip", "compression-zip"],
      "date-time": ["date-difference", "age-calculator", "working-days", "countdown-timer"],
      "govt-legal": ["passport-photo-resizer", "pdf-compressor", "signature-maker", "document-template"],
      "ecommerce": ["shadow-adder", "barcode-generator", "gst-invoice-generator", "ecommerce-calculator"]
    };

    return trendingMap[categoryId || ""] || [];
  };

  const trendingTools = getTrendingTools();
  const isTrending = (toolId: string) => trendingTools.includes(toolId);

  return (
    <>
      <SEOHelmet
        title={`${category.name} - Free Online Tools Without Watermark`}
        description={getCategoryDescription()}
        keywords={getCategoryKeywords()}
        category={category.name}
      />
      <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted/30">
          <div className="container py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Category Header - Enhanced */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 py-12 sm:py-16">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
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
            style={{ backgroundColor: `hsl(${category.color} / 0.2)` }}
          />
          
          <div className="container relative">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-center max-w-4xl mx-auto mb-12"
            >
              <p className="text-lg text-muted-foreground leading-relaxed">
                {getCategoryDescription()}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {getCategoryKeywords().slice(0, 6).map((keyword, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-sans font-medium bg-gray-100 text-gray-800 border border-gray-300 shadow-sm"
                    style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 sm:gap-6"
            >
              {/* Enhanced icon with glow effect */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="relative flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl"
                style={{
                  backgroundColor: `hsl(${category.color} / 0.15)`,
                  boxShadow: `0 8px 30px hsl(${category.color} / 0.3)`,
                }}
              >
                <Icon
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  style={{ color: `hsl(${category.color})` }}
                />
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl"
                  style={{
                    boxShadow: `inset 0 0 20px hsl(${category.color} / 0.2)`,
                  }}
                />
              </motion.div>
              
              <div className="text-left">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
                >
                  {category.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2 text-base text-muted-foreground sm:text-lg"
                >
                  {category.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 flex items-center gap-2 sm:mt-3"
                >
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold text-white sm:text-sm"
                    style={{ backgroundColor: `hsl(${category.color})` }}
                  >
                    {category.tools.length} tools
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500 sm:h-4 sm:w-4" />
                    <Star className="h-3 w-3 fill-current text-yellow-500 sm:h-4 sm:w-4" />
                    <Star className="h-3 w-3 fill-current text-yellow-500 sm:h-4 sm:w-4" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* All Tools Section - Enhanced */}
        <section className="py-12 sm:py-16">
          <div className="container">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mb-10"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg"
                >
                  <TrendingUp className="h-6 w-6 text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold tracking-tight">All {category.name}</h2>
                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                    </motion.div>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">
                Complete collection of {category.name.toLowerCase()} - Trending tools shown first
              </p>
            </motion.div>

            {/* Enhanced grid with stagger animation */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {category.tools
                .sort((a, b) => {
                  const aIsTrending = isTrending(a.id);
                  const bIsTrending = isTrending(b.id);
                  if (aIsTrending && !bIsTrending) return -1;
                  if (!aIsTrending && bIsTrending) return 1;
                  return 0;
                })
                .map((tool, index) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    name={tool.name}
                    description={tool.description}
                    path={tool.path}
                    categoryColor={category.color}
                    isTrending={isTrending(tool.id)}
                    delay={index * 0.05}
                  />
                ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <CategoryFAQSection faqs={universalToolFaqs} categoryName={category.name.toLowerCase()} />
      </main>
      <Footer />
    </div>
    </>
  );
};

export default CategoryPage;
