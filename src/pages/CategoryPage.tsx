import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ChevronRight, ArrowRight } from "lucide-react";
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
        <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-6"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
              >
                <Icon
                  className="h-8 w-8"
                  style={{ color: `hsl(${category.color})` }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {category.name}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  {category.description}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {category.tools.length} tools available
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-12">
          <div className="container">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={tool.path}
                    className="tool-card group flex flex-col"
                  >
                    <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary">
                      {tool.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                      Use tool
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
