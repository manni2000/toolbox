import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  path: string;
  categoryColor?: string;
  isTrending?: boolean;
  isNew?: boolean;
  delay?: number;
}

const ToolCard = ({
  name,
  description,
  path,
  categoryColor = "220 70% 50%",
  isTrending = false,
  isNew = false,
  delay = 0,
}: ToolCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="group h-full"
    >
      <Link to={path} className="block h-full">
        <motion.div
          initial="rest"
          whileHover="hover"
          animate="rest"
          variants={{
            rest: {
              scale: 1,
              y: 0,
              transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
            },
            hover: {
              scale: 1.02,
              y: -4,
              transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
            },
          }}
          className={`relative flex h-full flex-col overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-500 hover:shadow-xl ${
            isTrending
              ? "border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 hover:border-primary/50 hover:shadow-primary/20"
              : "border-border bg-card hover:border-primary/30 hover:shadow-primary/10"
          }`}
        >
          {/* Trending/New Badge */}
          {(isTrending || isNew) && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.2, duration: 0.5, type: "spring" }}
              className="absolute right-3 top-3 z-10"
            >
              {isTrending ? (
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
                  style={{
                    boxShadow: "0 4px 15px rgba(251, 146, 60, 0.4)",
                  }}
                >
                  <TrendingUp className="h-4 w-4 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg"
                  style={{
                    boxShadow: "0 4px 15px rgba(147, 51, 234, 0.4)",
                  }}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Gradient overlay on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, hsl(${categoryColor} / 0.08) 0%, transparent 60%)`,
            }}
          />

          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <motion.div
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col">
            {/* Title */}
            <h3
              className={`font-semibold line-clamp-2 transition-colors duration-300 ${
                isTrending
                  ? "text-foreground group-hover:text-primary"
                  : "text-card-foreground group-hover:text-primary"
              }`}
            >
              {name}
            </h3>

            {/* Description */}
            <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>

            {/* Action button */}
            <motion.div
              className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.3 }}
            >
              <span>Use tool</span>
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </div>

          {/* Bottom glow effect */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `linear-gradient(90deg, transparent, hsl(${categoryColor}), transparent)`,
              boxShadow: `0 0 20px hsl(${categoryColor} / 0.5)`,
            }}
          />

          {/* Corner accent for trending */}
          {isTrending && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-0 h-20 w-20 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, transparent 70%)",
              }}
            />
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ToolCard;
