import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { toolCategories } from "@/data/toolCategories";

// Priority categories to show first
const priorityCategoryIds = ["audio", "social", "finance", "viewers", "dev"];
// Categories to move to the end (already featured in Popular Tools)
const featuredCategoryIds = ["image", "pdf", "video", "education", "zip"];

const CategoryGrid = () => {
  // Reorder: priority first, then others, then featured at the end
  const reorderedCategories = [
    ...toolCategories.filter(cat => priorityCategoryIds.includes(cat.id)),
    ...toolCategories.filter(cat => !priorityCategoryIds.includes(cat.id) && !featuredCategoryIds.includes(cat.id)),
    ...toolCategories.filter(cat => featuredCategoryIds.includes(cat.id)),
  ];

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-muted/50" />
      
      <div className="container relative">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <LayoutGrid className="h-4 w-4" />
            Categories
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            Explore by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Browse our comprehensive collection of tools organized by category
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reorderedCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/category/${category.id}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Hover gradient */}
                  <div 
                    className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: `linear-gradient(135deg, hsl(${category.color} / 0.08) 0%, transparent 100%)` }}
                  />
                  
                  <div className="relative">
                    <div
                      className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `hsl(${category.color} / 0.12)` }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color: `hsl(${category.color})` }}
                      />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-card-foreground transition-colors group-hover:text-primary">
                      {category.name}
                    </h3>
                    
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                    
                    <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                      <div className="flex items-center gap-2">
                        <span 
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: `hsl(${category.color})` }}
                        >
                          {category.tools.length}
                        </span>
                        <span className="text-sm text-muted-foreground">tools</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
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
