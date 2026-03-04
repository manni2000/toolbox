import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ChevronRight, ArrowRight, TrendingUp, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCategoryById } from "@/data/toolCategories";

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
      "internet": ["ip-lookup", "dns-lookup", "ssl-checker", "website-ping"],
      "seo": ["meta-title-description", "keyword-density", "robots-txt", "page-seo"],
      "social": ["hashtag-generator", "bio-generator", "caption-formatter", "meme-generator"],
      "zip": ["create-zip", "extract-zip", "password-zip", "compression-zip"],
      "date-time": ["date-difference", "age-calculator", "working-days", "countdown"]
    };
    
    return trendingMap[categoryId] || [];
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

        {/* Category Header */}
        <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background py-8 sm:py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 sm:gap-6"
            >
              <div
                className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl flex-shrink-0"
                style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
              >
                <Icon
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  style={{ color: `hsl(${category.color})` }}
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
                  {category.name}
                </h1>
                <p className="mt-2 text-base sm:text-lg text-muted-foreground">
                  {category.description}
                </p>
                <p className="mt-1 sm:mt-2 text-sm text-muted-foreground">
                  {category.tools.length} tools available
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* All Tools Section */}
        <section className="py-8 sm:py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">All {category.name}</h2>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">Complete collection of {category.name.toLowerCase()} - Trending tools shown first</p>
            </motion.div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.tools
                .sort((a, b) => {
                  const aIsTrending = isTrending(a.id);
                  const bIsTrending = isTrending(b.id);
                  if (aIsTrending && !bIsTrending) return -1;
                  if (!aIsTrending && bIsTrending) return 1;
                  return 0;
                })
                .map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={tool.path}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-xl border p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 ${
                      isTrending(tool.id)
                        ? "border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                        : "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                    }`}
                  >
                    {/* Trending Indicator - Small icon */}
                    {isTrending(tool.id) && (
                      <div className="absolute top-3 right-3 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm">
                        <TrendingUp className="h-3 w-3 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold line-clamp-2 ${
                        isTrending(tool.id)
                          ? "text-foreground group-hover:text-primary"
                          : "text-card-foreground group-hover:text-primary"
                      }`}>
                        {tool.name}
                      </h3>
                      <p className="mt-2 flex-1 text-muted-foreground line-clamp-3">
                        {tool.description}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                      <span>Use tool</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
