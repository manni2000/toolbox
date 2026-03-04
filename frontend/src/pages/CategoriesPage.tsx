import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Grid3x3, List, Star, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toolCategories, getAllTools } from "@/data/toolCategories";

const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const totalTools = getAllTools().length;

  const popularTools = getAllTools().slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        {/* Enhanced Header Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/3">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-1/4 -top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-1/4 -bottom-1/4 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="container relative px-4 py-12 sm:py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4 sm:mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary backdrop-blur-sm"
              >
                <Grid3x3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Complete Tool Collection</span>
                <span className="sm:hidden">All Tools</span>
              </motion.div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground">
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
                className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground"
              >
                Browse {totalTools}+ tools across {toolCategories.length} categories
              </motion.p>

              {/* View Mode Toggle - Hidden on Mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 sm:mt-8 justify-center gap-1.5 sm:gap-2 hidden sm:flex"
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors active:scale-[0.95] ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Grid3x3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Grid View</span>
                  <span className="sm:hidden">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors active:scale-[0.95] ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">List View</span>
                  <span className="sm:hidden">List</span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 sm:py-12">
          <div className="container px-4">
            <div className={viewMode === "grid" ? "space-y-6 sm:space-y-8" : "space-y-4 sm:space-y-6"}>
              {toolCategories.map((category, categoryIndex) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: categoryIndex * 0.05 }}
                    className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Category Header */}
                    <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div
                          className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl"
                          style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
                        >
                          <Icon
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            style={{ color: `hsl(${category.color})` }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
                            {category.name}
                          </h2>
                          <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pl-0 sm:pl-16">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <Zap className="h-3 w-3" />
                          {category.tools.length} tools
                        </span>
                        <Link
                          to={`/category/${category.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors active:scale-[0.95]"
                        >
                          View category
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Tools Grid/List - Always List on Mobile */}
                    {viewMode === "grid" ? (
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {category.tools.map((tool) => (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="tool-card group"
                          >
                            <Link
                              to={tool.path}
                              className="flex flex-col p-3 sm:p-4 min-h-[100px] justify-between h-full"
                            >
                              <div className="flex-1">
                                <span className="block font-medium text-xs sm:text-sm text-card-foreground group-hover:text-primary line-clamp-2">
                                  {tool.name}
                                </span>
                                <span className="block text-xs text-muted-foreground mt-1 line-clamp-3">
                                  {tool.description}
                                </span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-2.5">
                        {category.tools.map((tool) => (
                          <Link
                            key={tool.id}
                            to={tool.path}
                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-border bg-background p-3 sm:p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm active:scale-[0.98] min-h-[80px]"
                          >
                            <div className="flex-1 min-w-0 pr-2 mb-2 sm:mb-0">
                              <span className="block font-medium text-xs sm:text-sm text-foreground group-hover:text-primary truncate">
                                {tool.name}
                              </span>
                              <span className="block text-xs text-muted-foreground truncate mt-0.5 line-clamp-2">
                                {tool.description}
                              </span>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-auto sm:mt-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/30 to-background py-12 sm:py-16">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Platform Statistics</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                Trusted by thousands of users worldwide with our comprehensive suite of professional tools
              </p>
            </motion.div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{totalTools}+</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Total Tools</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10">
                  <Grid3x3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{toolCategories.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Categories</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10">
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">100%</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Free Tools</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">10K+</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Daily Users</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
