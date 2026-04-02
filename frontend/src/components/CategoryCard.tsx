import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cardHover, iconScale } from "@/lib/animations";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  toolCount: number;
  delay?: number;
}

const CategoryCard = ({
  id,
  name,
  description,
  icon: Icon,
  color,
  toolCount,
  delay = 0,
}: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="group h-full"
    >
      <Link to={`/category/${id}`} className="block h-full">
        <motion.div
          initial="rest"
          whileHover="hover"
          animate="rest"
          variants={cardHover}
          className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, hsl(${color} / 0.15) 0%, hsl(${color} / 0.05) 50%, transparent 100%)`,
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />

          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
              }}
            />
          </div>

          {/* Border glow effect */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              boxShadow: `0 0 30px hsl(${color} / 0.3)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col p-6">
            {/* Icon with animated background */}
            <motion.div
              variants={iconScale}
              className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500"
              style={{
                backgroundColor: `hsl(${color} / 0.15)`,
                boxShadow: `0 4px 20px hsl(${color} / 0.2)`,
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              >
                <Icon className="h-8 w-8" style={{ color: `hsl(${color})` }} />
              </motion.div>
            </motion.div>

            {/* Title */}
            <h3 className="text-xl font-bold text-card-foreground transition-colors duration-300 group-hover:text-primary">
              {name}
            </h3>

            {/* Description */}
            <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
              {/* Tool count badge */}
              <div className="flex items-center gap-2">
                <motion.span
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
                  style={{
                    backgroundColor: `hsl(${color})`,
                    boxShadow: `0 2px 10px hsl(${color} / 0.4)`,
                  }}
                >
                  {toolCount}
                </motion.span>
                <span className="text-sm font-medium text-muted-foreground">
                  tools
                </span>
              </div>

              {/* Arrow icon */}
              <motion.div
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="hidden sm:inline">Explore</span>
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </div>
          </div>

          {/* Corner accent */}
          <div
            className="absolute right-0 top-0 h-24 w-24 opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
            style={{
              background: `radial-gradient(circle, hsl(${color}) 0%, transparent 70%)`,
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
