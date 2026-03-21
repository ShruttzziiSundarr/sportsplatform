"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass, SlidersHorizontal } from "lucide-react";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { api, Profile } from "@/lib/api";

const SPORTS = ["All", "Cricket", "Basketball", "Football", "Tennis", "Athletics"];
const RANKS  = ["All", "Elite", "High Potential", "Developing"];

const DEMO_PROFILES: Profile[] = [
  { id: "1", full_name: "Arjun Mehta",    sport: "cricket",    primary_position: "All-Rounder", visibility_score: 74.5 },
  { id: "2", full_name: "Priya Sharma",   sport: "basketball", primary_position: "Point Guard",  visibility_score: 88.2 },
  { id: "3", full_name: "Rahul Nair",     sport: "football",   primary_position: "Midfielder",   visibility_score: 63.1 },
  { id: "4", full_name: "Ananya Rao",     sport: "tennis",     primary_position: "Singles",      visibility_score: 91.0 },
  { id: "5", full_name: "Karthik Menon",  sport: "athletics",  primary_position: "Sprinter",     visibility_score: 55.8 },
  { id: "6", full_name: "Divya Krishnan", sport: "cricket",    primary_position: "Wicketkeeper",  visibility_score: 79.3 },
];

export default function DiscoverPage() {
  const [profiles, setProfiles]     = useState<Profile[]>(DEMO_PROFILES);
  const [sportFilter, setSport]     = useState("All");
  const [rankFilter, setRank]       = useState("All");
  const [sort, setSort]             = useState<"score" | "name">("score");
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProfiles()
      .then((data) => { if (data?.length) setProfiles(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = profiles
    .filter((p) => sportFilter === "All" || p.sport?.toLowerCase() === sportFilter.toLowerCase())
    .sort((a, b) => sort === "score" ? b.visibility_score - a.visibility_score : a.full_name.localeCompare(b.full_name));

  return (
    <div className="relative min-h-screen dot-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-600/6 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Talent Discovery</p>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Discover Athletes</h1>
          <p className="text-slate-400 text-sm">Browse and filter AI-ranked athletes from Shiv Nadar University Chennai.</p>
        </motion.div>

        {/* Filters */}
        <GlassPanel className="mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Filter</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${sportFilter === s ? "bg-blue-600 text-white" : "glass glass-hover text-slate-400"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setSort("score")}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${sort === "score" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
              >
                By Score
              </button>
              <button
                onClick={() => setSort("name")}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${sort === "name" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
              >
                By Name
              </button>
            </div>
          </div>
        </GlassPanel>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((p, i) => (
              <ProfileCard key={p.id} profile={p} index={i} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20 text-slate-500">
                No athletes match the selected filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
