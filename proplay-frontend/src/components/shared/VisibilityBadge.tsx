import { cn, getRankColor } from "@/lib/utils";

interface VisibilityBadgeProps {
  score: number;
  rank?: string;
  className?: string;
}

export function VisibilityBadge({ score, rank = "Developing", className }: VisibilityBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
          getRankColor(rank)
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {rank}
      </span>
      <span className="text-sm font-mono text-slate-300">
        {score.toFixed(1)}
        <span className="text-slate-500">/100</span>
      </span>
    </div>
  );
}
