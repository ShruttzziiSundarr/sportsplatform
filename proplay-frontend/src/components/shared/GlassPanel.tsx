"use client";
import { cn } from "@/lib/utils";
import { motion, MotionProps } from "framer-motion";

interface GlassPanelProps extends MotionProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function GlassPanel({ className, children, hover = false, ...rest }: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        "glass rounded-2xl p-6",
        hover && "glass-hover transition-all duration-300 cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
