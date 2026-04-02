import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { toolCategories } from "@/data/toolCategories";
import CategoryCard from "@/components/CategoryCard";
import { staggerContainer } from "@/lib/animations";

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
      {/* Enhanced Background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-muted/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container relative">
        {/* Section Header with enhanced animations */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <LayoutGrid className="h-4 w-4" />
            </motion.div>
            Categories
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            Explore by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Browse our comprehensive collection of tools organized by category
          </motion.p>
        </div>

        {/* Enhanced Categories Grid with stagger animation */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {reorderedCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              description={category.description}
              icon={category.icon}
              color={category.color}
              toolCount={category.tools.length}
              delay={index * 0.05}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;
