/**
 * Reusable Tool Enhancement Wrapper
 * 
 * This HOC (Higher Order Component) wraps any tool component with modern UI enhancements:
 * - Animated hero section with category-specific colors
 * - Enhanced card layouts
 * - Modern loading states
 * - Smooth animations throughout
 * 
 * Usage:
 * export default withToolEnhancements(YourToolComponent, {
 *   categoryColor: "173 80% 40%",
 *   icon: YourIcon
 * });
 */

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

interface ToolEnhancementConfig {
  categoryColor: string;
  icon?: LucideIcon;
  heroTitle?: string;
  heroDescription?: string;
}

export const ToolHeroSection: React.FC<ToolEnhancementConfig & {
  title: string;
  description: string;
}> = ({ categoryColor, icon: Icon = Sparkles, title, description }) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
    >
      {/* Animated background blob */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
        style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
      />

      <div className="relative flex items-start gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `hsl(${categoryColor} / 0.15)`,
            boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
          }}
        >
          <Icon className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const EnhancedCard: React.FC<{ 
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`border-border shadow-lg hover:shadow-xl transition-shadow duration-500 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const EnhancedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  categoryColor?: string;
  disabled?: boolean;
  variant?: "primary" | "outline";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  children, 
  onClick, 
  categoryColor, 
  disabled, 
  variant = "primary",
  className = "",
  ...props 
}) => {
  const style = categoryColor && variant === "primary" && !disabled ? {
    background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
  } : undefined;

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={className}
    >
      <button onClick={onClick} disabled={disabled} style={style} {...props}>
        {children}
      </button>
    </motion.div>
  );
};

// Category colors for quick reference
export const CATEGORY_COLORS = {
  image: "173 80% 40%",      // Teal
  pdf: "0 70% 50%",          // Red
  video: "350 80% 55%",      // Pink/Red
  audio: "290 80% 55%",      // Purple
  text: "280 80% 50%",       // Purple
  security: "0 80% 55%",     // Red
  dateTime: "45 90% 50%",    // Orange/Yellow
  dev: "210 80% 55%",        // Blue
  internet: "200 80% 50%",   // Blue
  education: "150 60% 45%",  // Green
  finance: "35 85% 55%",     // Orange
  zip: "260 80% 50%",        // Purple
  social: "320 80% 55%",     // Pink
  seo: "120 60% 40%",        // Green
} as const;
