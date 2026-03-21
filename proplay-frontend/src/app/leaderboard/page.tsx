"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Crown, Medal, Trophy } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { api, Profile } from "@/lib/api";

const SPORTS = ["All", "Cricket", "Basketball", "Football", "Tennis", "Athletics"];

const DEMO: Profile[] = [
  { id: "4", full_name: "Ananya Rao",     sport: "tennis",     primary_position: "Singles",      visibility_score: 91.0 },
  { id: "2", full_name: "Priya Sharma",   sport: "basketball", primary_position: "Point Guard",  visibility_score: 88.2 },
  { id: "6", full_name: "Divya Krishnan", sport: "cricket",    primary_position: "Wicketkeeper",  visibility_score: 79.3 },
  { id: "1", full_name: "Arjun Mehta",    sport: "cricket",    primary_position: "All-Rounder",  visibility_score: 74.5 },
  { id: "3", full_name: "Rahul Nair",     sport: "football",   primary_position: "Midfielder",   visibility_score: 63.1 },
  { id: "5", full_name: "Karthik Menon",  sport: "athletics",  primary_position: "Sprinter",     visibility_score: 55.8 },
];

const MEDAL = [
  <Crown  key={0} className="w-5 h-5 text-amber-400" />,
  <Medal  key={1} className="w-5 h-5 text-slate-300" />,
  <Trophy key={2} className="w-5 h-5 text-amber-700" />,
];

const SPORT_ICONS: Record<string, string> = { cricket: "🏏", basketball: "🏀", football: "⚽", tennis: "🎾", athletics: "🏃", default: "🏅" };

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>(DEMO);
  const [sport, setSport]       = useState("All");

  useEffect(() => {
    api.getProfiles()
      .then((data) => { if (data?.length) setProfiles(data); })
      .catch(() => {});
  }, []);

  const filtered = profiles
    .filter((p) => sport === "All" || p.sport?.toLowerCase() === sport.toLowerCase())
    .sort((a, b) => b.visibility_score - a.visibility_score);

  return (
    <div className="relative min-h-screen dot-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-amber-600/6 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Campus Rankings</p>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Leaderboard</h1>
          <p className="text-slate-400 text-sm">Shiv Nadar University Chennai — ranked by AI Visibility Score</p>
        </motion.div>

        {/* Sport tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${sport === s ? "bg-amber-500/20 border border-amber-500/30 text-amber-400" : "glass glass-hover text-slate-400"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        {filtered.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 0, 2].map((rankIdx) => {
              const p = filtered[rankIdx];
              if (!p) return null;
              const actualRank = rankIdx;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rankIdx * 0.1 }}
                >
                  <Link href={`/profile/${p.id}`}>
                    <GlassPanel hover className={`text-center p-5 ${actualRank === 0 ? "border-amber-500/30 accent-glow" : ""}`}>
                      <div className="flex items-center justify-center mb-2">{MEDAL[actualRank]}</div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xl mx-auto mb-2">
                        {SPORT_ICONS[p.sport?.toLowerCase()] ?? SPORT_ICONS.default}
                      </div>
                      <p className="text-sm font-bold text-white mb-0.5">{p.full_name}</p>
                      <p className="text-xs text-slate-500 capitalize mb-2">{p.sport}</p>
                      <p className={`text-xl font-bold ${actualRank === 0 ? "text-amber-400" : "text-white"}`}>
                        {p.visibility_score.toFixed(1)}
                      </p>
                    </GlassPanel>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <GlassPanel className="p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-widest px-5 py-3">Rank</th>
                <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-widest px-4 py-3">Athlete</th>
                <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-widest px-4 py-3 hidden md:table-cell">Sport</th>
                <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-widest px-4 py-3 hidden md:table-cell">Position</th>
                <th className="text-right text-xs text-slate-500 font-semibold uppercase tracking-widest px-5 py-3">Score</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="border-b border-white/4 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {i < 3 ? MEDAL[i] : <span className="text-sm font-bold text-slate-500 w-5 text-center">{i + 1}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">{p.full_name}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-slate-400 capitalize">{p.sport}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-500">{p.primary_position ?? "—"}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-bold text-white font-mono">{p.visibility_score.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/profile/${p.id}`}>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 hover:text-blue-400 transition-colors" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      </div>
    </div>
  );
}
