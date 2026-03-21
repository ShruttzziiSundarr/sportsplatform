"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Copy, ExternalLink, MapPin } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { VisibilityBadge } from "@/components/shared/VisibilityBadge";
import { AthleteRadarChart } from "@/components/charts/RadarChart";
import { api, Profile } from "@/lib/api";
import Link from "next/link";

const DEMO: Profile = {
  id: "demo",
  full_name: "Arjun Mehta",
  sport: "cricket",
  primary_position: "All-Rounder",
  height_cm: 182,
  weight_kg: 74,
  visibility_score: 74.5,
  scout_summary: "CLASSIFICATION: HIGH POTENTIAL\n\nFollowing transformer-assisted analysis of 5 performance record(s), this candidate presents a composite talent score of 74.5/100. The profile indicates a strong developmental trajectory with targeted coaching investment recommended.\n\nPHYSICAL ASSESSMENT\n• Speed: Candidate exhibits strong speed characteristics.\n• Strength: Solid power-to-weight ratios across all disciplines.\n• Stamina: Aerobic endurance indicators are outstanding.",
};

const SPORT_ICONS: Record<string, string> = { cricket: "🏏", basketball: "🏀", football: "⚽", tennis: "🎾", default: "🏅" };

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id === "demo") { setProfile(DEMO); return; }
    api.getProfileById(id).then(setProfile).catch(() => setProfile(DEMO));
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const icon = SPORT_ICONS[profile.sport?.toLowerCase()] ?? SPORT_ICONS.default;
  const metrics = { speed: 78, strength: 65, stamina: 82, tactical: 71 };

  return (
    <div className="relative min-h-screen dot-bg">
      {/* Glassmorphism ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/6 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-600/6 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Hero glass card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-6 relative overflow-hidden"
        >
          {/* Background gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-transparent to-violet-600/6 rounded-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-3xl flex-shrink-0">
              {icon}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">{profile.full_name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-sm text-slate-400 capitalize">
                      {profile.sport}
                      {profile.primary_position && ` · ${profile.primary_position}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass glass-hover text-xs text-slate-300 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copied!" : "Share"}
                  </button>
                  <Link
                    href={`/report/${profile.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Scout Report
                  </Link>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <VisibilityBadge score={profile.visibility_score} rank="High Potential" />
                {profile.height_cm && (
                  <span className="text-xs text-slate-500">{profile.height_cm}cm</span>
                )}
                {profile.weight_kg && (
                  <span className="text-xs text-slate-500">{profile.weight_kg}kg</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Radar */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <GlassPanel className="h-full">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4">Performance Profile</p>
              <AthleteRadarChart metrics={metrics} height={240} />
            </GlassPanel>
          </motion.div>

          {/* Scout summary */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <GlassPanel className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">AI Scout Summary</p>
              </div>
              {profile.scout_summary ? (
                <div className="flex-1 space-y-2">
                  {profile.scout_summary
                    .split("\n")
                    .filter((l) => l.trim())
                    .slice(0, 8)
                    .map((line, i) => (
                      <p
                        key={i}
                        className={`text-sm leading-relaxed ${line.startsWith("CLASSIFICATION") || line.startsWith("PHYSICAL") || line.startsWith("COGNITIVE") ? "text-blue-400 font-semibold text-xs uppercase tracking-wider" : "text-slate-300"}`}
                      >
                        {line}
                      </p>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic flex-1">Scout report generating…</p>
              )}
              <Link
                href={`/report/${profile.id}`}
                className="mt-4 text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                Read full report <ExternalLink className="w-3 h-3" />
              </Link>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
