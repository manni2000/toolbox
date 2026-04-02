import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageTransition } from "@/lib/animations";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
}

const AnimatedContainer = ({ children, className = "" }: AnimatedContainerProps) => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;
