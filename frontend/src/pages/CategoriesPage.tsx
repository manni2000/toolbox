import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toolCategories, getAllTools } from "@/data/toolCategories";

const CategoriesPage = () => {
  const totalTools = getAllTools().length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                All Categories
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Browse all {totalTools}+ tools across {toolCategories.length} categories
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories with All Tools */}
        <section className="py-12">
          <div className="container space-y-12">
            {toolCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.05 }}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: `hsl(${category.color})` }}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-card-foreground">
                        {category.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {category.description} • {category.tools.length} tools
                      </p>
                    </div>
                  </div>

                  {/* All Tools Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className="group flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
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
        </section>

        {/* Quick Stats */}
        <section className="border-t border-border bg-muted/30 py-12">
          <div className="container">
            <div className="grid gap-6 sm:grid-cols-3 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{totalTools}+</p>
                <p className="text-sm text-muted-foreground">Total Tools</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{toolCategories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Free & Browser-Based</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
