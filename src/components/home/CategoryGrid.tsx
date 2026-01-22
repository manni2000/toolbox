import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toolCategories } from "@/data/toolCategories";

const CategoryGrid = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Explore by Category
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse our collection of powerful tools organized by category
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {toolCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/category/${category.id}`}
                  className="tool-card group flex flex-col"
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: `hsl(${category.color})` }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {category.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {category.tools.length} tools
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
