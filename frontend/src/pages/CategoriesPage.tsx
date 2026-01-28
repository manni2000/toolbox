import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Grid3x3, List, Star, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toolCategories, getAllTools } from "@/data/toolCategories";

const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const totalTools = getAllTools().length;

  const popularTools = getAllTools().slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Enhanced Header Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/3">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-1/4 -top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-1/4 -bottom-1/4 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="container relative py-16 md:py-24">
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
                className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm"
              >
                <Grid3x3 className="h-4 w-4" />
                Complete Tool Collection
              </motion.div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                All
                <span className="relative ml-2">
                  <span className="gradient-text">Categories</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute -bottom-2 left-0 right-0 h-1 origin-left rounded-full bg-gradient-to-r from-primary to-primary/50"
                  />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
              >
                Browse {totalTools}+ powerful tools across {toolCategories.length} professional categories
              </motion.p>

              {/* View Mode Toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex justify-center gap-2"
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <List className="h-4 w-4" />
                  List View
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12">
          <div className="container">
            <div className={viewMode === "grid" ? "space-y-8" : "space-y-6"}>
              {toolCategories.map((category, categoryIndex) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: categoryIndex * 0.05 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Category Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                      <div
                        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
                      >
                        <Icon
                          className="h-7 w-7"
                          style={{ color: `hsl(${category.color})` }}
                        />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-card-foreground">
                          {category.name}
                        </h2>
                        <p className="text-muted-foreground">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            <Zap className="h-3 w-3" />
                            {category.tools.length} tools
                          </span>
                          <Link
                            to={`/category/${category.id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            View category
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Tools Grid/List */}
                    <div className={
                      viewMode === "grid"
                        ? "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                        : "space-y-2"
                    }>
                      {category.tools.map((tool) => (
                        <Link
                          key={tool.id}
                          to={tool.path}
                          className={
                            viewMode === "grid"
                              ? "group flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                              : "group flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                          }
                        >
                          <div className="flex-1 min-w-0">
                            <span className="block font-medium text-sm text-foreground group-hover:text-primary truncate">
                              {tool.name}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate">
                              {tool.description}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 flex-shrink-0 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/30 to-background py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">Platform Statistics</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Trusted by thousands of users worldwide with our comprehensive suite of professional tools
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <p className="text-4xl font-bold text-primary">{totalTools}+</p>
                <p className="text-sm text-muted-foreground mt-2">Total Tools</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Grid3x3 className="h-8 w-8 text-primary" />
                </div>
                <p className="text-4xl font-bold text-primary">{toolCategories.length}</p>
                <p className="text-sm text-muted-foreground mt-2">Categories</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <p className="text-4xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground mt-2">Free Tools</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <p className="text-4xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground mt-2">Daily Users</p>
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
