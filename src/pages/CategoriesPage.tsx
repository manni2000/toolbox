import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toolCategories } from "@/data/toolCategories";

const CategoriesPage = () => {
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
                Browse all our tool categories and find what you need
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {toolCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="tool-card"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
                      >
                        <Icon
                          className="h-7 w-7"
                          style={{ color: `hsl(${category.color})` }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-card-foreground">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {category.tools.length} tools
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                      {category.description}
                    </p>
                    <div className="mt-6 space-y-2">
                      {category.tools.slice(0, 3).map((tool) => (
                        <Link
                          key={tool.id}
                          to={tool.path}
                          className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2 text-sm transition-colors hover:bg-muted"
                        >
                          <span>{tool.name}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                    {category.tools.length > 3 && (
                      <Link
                        to={`/category/${category.id}`}
                        className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        View all {category.tools.length} tools
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
