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

  // Define trending tools for each category
  const getTrendingTools = () => {
    const trendingMap: Record<string, string[]> = {
      "pdf": ["pdf-to-word", "pdf-to-png", "pdf-merger", "pdf-compressor"],
      "image": ["png-to-jpg-converter", "qr-generator", "image-compressor", "background-remover"],
      "video": ["video-to-audio", "video-trim", "video-speed", "video-thumbnail"],
      "audio": ["audio-converter", "speech-to-text", "audio-trimmer", "audio-merger"],
      "text": ["word-counter", "case-converter", "color-converter", "text-diff"],
      "security": ["password-generator", "password-strength", "hash-generator", "base64-tool"],
      "finance": ["invoice-generator", "gst-calculator", "emi-calculator", "currency-converter"],
      "dev": ["json-formatter", "regex-tester", "jwt-decoder", "url-encoder"],
      "education": ["scientific-calculator", "percentage-calc", "unit-converter", "compound-interest"],
      "internet": ["ip-lookup", "dns-lookup", "ssl-checker", "website-ping", "website-screenshot"],
      "seo": ["meta-title-description", "keyword-density", "robots-txt", "page-seo"],
      "social": ["hashtag-generator", "bio-generator", "caption-formatter", "meme-generator"],
      "zip": ["create-zip", "extract-zip", "password-zip", "compression-zip"],
      "date-time": ["date-difference", "age-calculator", "working-days", "countdown"]
    };
    
    return trendingMap[categoryId || ""] || [];
  };

  const trendingTools = getTrendingTools();
  const isTrending = (toolId: string) => trendingTools.includes(toolId);

  return (
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
  );
};

export default CategoryPage;
