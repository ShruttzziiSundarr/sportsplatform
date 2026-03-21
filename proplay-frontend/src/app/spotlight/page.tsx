"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gem, TrendingUp } from "lucide-react";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { api, Profile } from "@/lib/api";

const DEMO_GEMS: Profile[] = [
  { id: "3", full_name: "Rahul Nair",     sport: "football",  primary_position: "Midfielder", visibility_score: 63.1 },
  { id: "5", full_name: "Karthik Menon",  sport: "athletics", primary_position: "Sprinter",   visibility_score: 55.8 },
];

export default function SpotlightPage() {
  const [gems, setGems] = useState<Profile[]>(DEMO_GEMS);

  useEffect(() => {
    api.getProfiles()
      .then((data) => {
        if (data?.length) {
          // Hidden gems = NOT Elite (score < 85) but improving
          const filtered = data.filter((p) => p.visibility_score < 85 && p.visibility_score > 45);
          if (filtered.length) setGems(filtered.slice(0, 9));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen dot-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-green-600/6 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <Gem className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-1">Hidden Gem Spotlight</p>
              <h1 className="text-2xl font-bold text-white">Underrated Talent</h1>
              <p className="text-sm text-slate-400 mt-1">
                Athletes with high improvement velocity who haven't yet reached Elite classification.
                Identified by the Proplay AI growth prediction engine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: "Growth Threshold",    value: ">1.5 pts/session", icon: TrendingUp },
              { label: "Score Range",         value: "45 – 84",          icon: Gem },
              { label: "Rising Athletes",     value: `${gems.length}`,   icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass rounded-xl p-3">
                <Icon className="w-4 h-4 text-green-400 mb-1" />
                <p className="text-sm font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gems.map((p, i) => (
            <ProfileCard key={p.id} profile={p} index={i} showRising />
          ))}
        </div>
      </div>
    </div>
  );
}
