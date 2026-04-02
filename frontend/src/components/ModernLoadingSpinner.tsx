import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { spinnerRotate } from "@/lib/animations";

interface ModernLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  color?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

const ModernLoadingSpinner = ({ 
  size = "md", 
  text,
  color = "hsl(var(--primary))"
}: ModernLoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={spinnerRotate}
        className="relative"
      >
        {/* Outer ring */}
        <div 
          className={`${sizeClasses[size]} rounded-full border-4 border-muted`}
        />
        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0"
        >
          <Loader2 
            className={`${sizeClasses[size]}`}
            style={{ color }}
          />
        </motion.div>
        {/* Inner glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-full blur-md`}
          style={{ 
            backgroundColor: color,
            opacity: 0.3,
          }}
        />
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default ModernLoadingSpinner;
