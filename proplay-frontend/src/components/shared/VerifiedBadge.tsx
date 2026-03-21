"use client";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface VerifiedBadgeProps {
    txHash?: string;
    size?: "sm" | "md";
}

export function VerifiedBadge({ txHash, size = "sm" }: VerifiedBadgeProps) {
    const isSmall = size === "sm";

    const badge = (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 cursor-pointer transition-all hover:bg-cyan-500/20 ${isSmall ? "px-2 py-0.5" : "px-3 py-1"
                }`}
        >
            <Shield className={isSmall ? "w-2.5 h-2.5 text-cyan-400" : "w-3.5 h-3.5 text-cyan-400"} />
            <span className={`font-semibold text-cyan-400 ${isSmall ? "text-[9px]" : "text-xs"}`}>
                On-Chain Verified
            </span>
        </motion.div>
    );

    if (txHash) {
        return (
            <a href={`/verify/${txHash}`} className="no-underline">
                {badge}
            </a>
        );
    }

    return badge;
}
