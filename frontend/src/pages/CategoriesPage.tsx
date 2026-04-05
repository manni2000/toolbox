import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Grid3x3, 
  List, 
  Star, 
  TrendingUp, 
  Zap, 
  Search, 
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toolCategories, getAllTools } from "@/data/toolCategories";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SEOHelmet from "@/components/SEOHelmet";
import { useIsMobile } from "@/hooks/use-mobile";

type SortOption = "alphabetical" | "most-tools" | "default";

const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  const totalTools = getAllTools().length;

  useEffect(() => {
    if (isMobile && viewMode !== "list") {
      setViewMode("list");
    }
  }, [isMobile, viewMode]);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let filtered = toolCategories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.tools.some(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Sort categories
    switch (sortBy) {
      case "alphabetical":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "most-tools":
        return [...filtered].sort((a, b) => b.tools.length - a.tools.length);
      default:
        return filtered;
    }
  }, [searchQuery, sortBy]);

  const popularTools = getAllTools().slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SEOHelmet
        title="All Categories - Browse 200+ Free Online Tools"
        description={`Explore ${totalTools}+ free online tools across ${toolCategories.length} categories including PDF tools, image editors, calculators, text processors, security tools, and more. No signup required.`}
        keywords="online tools categories, free tools, PDF tools, image tools, text tools, calculators, converters, security tools, developer tools, finance tools"
        canonical="https://dailytools247.com/categories"
      />
      <Header />
      <main className="flex-1 overflow-x-hidden">
        {/* Enhanced Header Section */}
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-primary/5">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-1/4 -top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-1/4 -bottom-1/4 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="container relative px-4 py-12 sm:py-16 md:py-20">
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm mb-6 sm:mb-8"
            >
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground rotate-[-90deg]" />
              <span className="text-foreground font-medium">Categories</span>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-4xl rounded-2xl border border-border/70 bg-background/70 p-4 text-center shadow-sm backdrop-blur-sm sm:p-6 md:p-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4 sm:mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary backdrop-blur-sm"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Complete Tool Collection</span>
                <span className="sm:hidden">All Tools</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                All
                <span className="relative ml-1 sm:ml-2">
                  <span className="gradient-text">Categories</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 origin-left rounded-full bg-gradient-to-r from-primary to-primary/50"
                  />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed"
              >
                Browse {totalTools}+ professional tools across {toolCategories.length} categories
              </motion.p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs sm:text-sm">
                  {toolCategories.length} Categories
                </Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs sm:text-sm">
                  {totalTools}+ Tools
                </Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs sm:text-sm">
                  No Signup Required
                </Badge>
              </div>

              {/* Search & Filter Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 sm:mt-8 mx-auto max-w-2xl"
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:h-5 sm:w-5" />
                  <Input
                    type="text"
                    placeholder="Search categories or tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 border-2 bg-background/90 pl-11 pr-20 text-sm shadow-sm backdrop-blur-sm transition-all focus:border-primary sm:h-12 sm:text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      title="Clear search"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-14 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Toggle filters"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                      showFilters ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Filter Options */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-lg bg-muted/50 backdrop-blur-sm border border-border"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <span className="text-sm font-medium text-foreground">Sort by:</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSortBy("default")}
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                              sortBy === "default"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-background text-muted-foreground hover:bg-background/80"
                            }`}
                          >
                            Default
                          </button>
                          <button
                            onClick={() => setSortBy("alphabetical")}
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                              sortBy === "alphabetical"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-background text-muted-foreground hover:bg-background/80"
                            }`}
                          >
                            A-Z
                          </button>
                          <button
                            onClick={() => setSortBy("most-tools")}
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                              sortBy === "most-tools"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-background text-muted-foreground hover:bg-background/80"
                            }`}
                          >
                            Most Tools
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* View Mode Toggle & Results Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>
                    Showing {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
                  </span>
                </div>
                
                <div className="hidden gap-1.5 sm:gap-2 md:flex">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all active:scale-[0.95] ${
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Grid3x3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all active:scale-[0.95] ${
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container px-4">
            {/* No Results State */}
            {filteredCategories.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 sm:py-16"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">No categories found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSortBy("default");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              </motion.div>
            )}

            {/* Categories List */}
            <div className={viewMode === "grid" ? "space-y-6 sm:space-y-8" : "space-y-4 sm:space-y-6"}>
              <AnimatePresence mode="popLayout">
                {filteredCategories.map((category, categoryIndex) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ 
                        delay: Math.min(categoryIndex * 0.05, 0.3),
                        layout: { duration: 0.3 }
                      }}
                      className="group rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                      {/* Category Header */}
                      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div
                            className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
                          >
                            <Icon
                              className="h-6 w-6 sm:h-7 sm:w-7"
                              style={{ color: `hsl(${category.color})` }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-xl sm:text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                                {category.name}
                              </h2>
                              <Badge 
                                variant="secondary" 
                                className="hidden sm:inline-flex text-xs"
                              >
                                {category.tools.length}
                              </Badge>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pl-0 sm:pl-16">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              <Zap className="h-3 w-3" />
                              {category.tools.length} {category.tools.length === 1 ? 'tool' : 'tools'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              100% Free
                            </span>
                          </div>
                          <Link
                            to={`/category/${category.id}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-all hover:gap-2 active:scale-[0.95]"
                          >
                            Explore category
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Tools Grid/List */}
                      {viewMode === "grid" ? (
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          {category.tools.map((tool, toolIndex) => (
                            <motion.div
                              key={tool.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: toolIndex * 0.02 }}
                              className="tool-card group/tool"
                            >
                              <Link
                                to={tool.path}
                                className="flex flex-col p-3 sm:p-4 min-h-[100px] justify-between h-full"
                              >
                                <div className="flex-1">
                                  <span className="block font-medium text-xs sm:text-sm text-card-foreground group-hover/tool:text-primary line-clamp-2 transition-colors">
                                    {tool.name}
                                  </span>
                                  <span className="block text-xs text-muted-foreground mt-1 line-clamp-3">
                                    {tool.description}
                                  </span>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground group-hover/tool:text-primary group-hover/tool:translate-x-1 transition-all mt-2" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-2.5">
                          {category.tools.map((tool, toolIndex) => (
                            <motion.div
                              key={tool.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: toolIndex * 0.02 }}
                            >
                              <Link
                                to={tool.path}
                                className="group/tool flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-border bg-background p-3 sm:p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm active:scale-[0.98] min-h-[70px]"
                              >
                                <div className="flex-1 min-w-0 pr-2 mb-2 sm:mb-0">
                                  <span className="block font-medium text-xs sm:text-sm text-foreground group-hover/tool:text-primary truncate transition-colors">
                                    {tool.name}
                                  </span>
                                  <span className="block text-xs text-muted-foreground truncate mt-0.5 line-clamp-2">
                                    {tool.description}
                                  </span>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground group-hover/tool:text-primary group-hover/tool:translate-x-1 transition-all mt-auto sm:mt-0" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/30 to-background py-12 sm:py-16 md:py-20">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Platform Statistics
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
                Trusted by thousands of users worldwide with our comprehensive suite of professional tools
              </p>
            </motion.div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative group"
              >
                <div className="text-center p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                  <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">{totalTools}+</p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Tools</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <div className="text-center p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg">
                  <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Grid3x3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{toolCategories.length}</p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Categories</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative group"
              >
                <div className="text-center p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg">
                  <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-1">100%</p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Free Tools</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                <div className="text-center p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg">
                  <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">10K+</p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Daily Users</p>
                </div>
              </motion.div>
            </div>

            {/* Additional Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 sm:mt-16 text-center max-w-3xl mx-auto"
            >
              <div className="p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">Why Choose Our Tools?</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 text-sm sm:text-base">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <p className="font-medium text-foreground">Easy to Use</p>
                    <p className="text-xs text-muted-foreground">Intuitive interfaces</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                    <Zap className="h-6 w-6 text-primary" />
                    <p className="font-medium text-foreground">Lightning Fast</p>
                    <p className="text-xs text-muted-foreground">Instant results</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <p className="font-medium text-foreground">100% Secure</p>
                    <p className="text-xs text-muted-foreground">Privacy first</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
