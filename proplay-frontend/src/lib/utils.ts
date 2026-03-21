import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function getRankColor(rank: string): string {
  switch (rank?.toLowerCase()) {
    case "elite":         return "text-amber-400 border-amber-400/30 bg-amber-400/10";
    case "high potential": return "text-blue-400 border-blue-400/30 bg-blue-400/10";
    default:              return "text-slate-400 border-slate-400/30 bg-slate-400/10";
  }
}

export function getVelocityColor(velocity: number): string {
  if (velocity > 2)  return "text-green-400";
  if (velocity > 0)  return "text-blue-400";
  if (velocity === 0) return "text-slate-400";
  return "text-red-400";
}
