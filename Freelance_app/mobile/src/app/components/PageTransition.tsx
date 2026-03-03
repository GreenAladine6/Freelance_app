import { motion } from "motion/react";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Material Design 3 transition specs
// Using shared axis transition for page changes (Android standard)
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1], // Material Design standard easing
      }}
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </motion.div>
  );
}
