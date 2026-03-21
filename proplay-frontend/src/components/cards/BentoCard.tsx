"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
  className?: string;
  children: ReactNode;
  index?: number;
}

export function BentoCard({ className, children, index = 0 }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      className={cn(
        "glass rounded-2xl p-6 relative overflow-hidden",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
