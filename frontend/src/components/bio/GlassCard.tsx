import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  strong?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = false,
  delay = 0,
  strong = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        strong ? "glass-strong" : "glass",
        "min-h-0 rounded-3xl transition-all duration-300",
        hover && "hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}