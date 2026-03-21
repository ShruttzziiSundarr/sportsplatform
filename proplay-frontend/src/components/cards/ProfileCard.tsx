"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Dumbbell } from "lucide-react";
import { Profile } from "@/lib/api";
import { cn, getRankColor } from "@/lib/utils";

interface ProfileCardProps {
  profile: Profile;
  showRising?: boolean;
  index?: number;
}

const SPORT_ICONS: Record<string, string> = {
  cricket: "🏏", basketball: "🏀", football: "⚽",
  tennis: "🎾", athletics: "🏃", swimming: "🏊", default: "🏅",
};

export function ProfileCard({ profile, showRising = false, index = 0 }: ProfileCardProps) {
  const icon = SPORT_ICONS[profile.sport?.toLowerCase()] ?? SPORT_ICONS.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Link href={`/profile/${profile.id}`}>
        <div className="glass glass-hover rounded-2xl p-5 h-full flex flex-col gap-4 transition-all duration-300 group accent-glow-hover">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-white text-sm leading-tight">
                  {profile.full_name}
                </p>
                <p className="text-xs text-slate-500 capitalize mt-0.5">
                  {profile.sport}
                  {profile.primary_position && ` · ${profile.primary_position}`}
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">Score</span>
            </div>
            <div className="flex items-center gap-2">
              {showRising && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                  Rising
                </span>
              )}
              <span className={cn(
                "text-xs px-2.5 py-0.5 rounded-full border font-semibold",
                getRankColor("Developing")
              )}>
                {profile.visibility_score?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
