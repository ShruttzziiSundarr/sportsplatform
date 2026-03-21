"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Brain, TrendingUp, Zap } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { VisibilityBadge } from "@/components/shared/VisibilityBadge";
import { AthleteRadarChart } from "@/components/charts/RadarChart";
import { SparkLine } from "@/components/charts/SparkLine";
import { api, Profile } from "@/lib/api";
import { getVelocityColor } from "@/lib/utils";

// Demo profile ID — in a real app this comes from auth session
const DEMO_PROFILE_ID = "demo";

const DEMO_PROFILE: Profile = {
  id: "demo",
  full_name: "Arjun Mehta",
  sport: "cricket",
  primary_position: "All-Rounder",
  visibility_score: 74.5,
  scout_summary: "CLASSIFICATION: HIGH POTENTIAL\n\nFollowing transformer-assisted analysis of 5 performance record(s), this candidate presents a composite talent score of 74.5/100. The profile indicates a strong developmental trajectory with targeted coaching investment recommended.",
};

const DEMO_METRICS = { speed: 78, strength: 65, stamina: 82, tactical: 71 };
const DEMO_HISTORY  = [62, 65, 68, 71, 74.5];

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In production, fetch from /api/profiles/:id using session profile_id
    setLoading(false);
  }, []);

  const velocity = 2.4;
  const composite = profile.visibility_score;

  return (
    <div className="relative min-h-screen dot-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-8">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Athlete Dashboard</p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">{profile.full_name}</h1>
            <Link
              href="/log"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              <Activity className="w-4 h-4" />
              Log Session
            </Link>
          </div>
          <div className="mt-2">
            <VisibilityBadge
              score={profile.visibility_score}
              rank="High Potential"
            />
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}
        >
          {[
            { label: "Visibility Score", value: composite.toFixed(1), sub: "/ 100", icon: Zap, color: "text-blue-400" },
            { label: "Composite Score",  value: "74.5",  sub: "sport-weighted", icon: Brain,     color: "text-violet-400" },
            { label: "Growth Velocity",  value: `+${velocity}`, sub: "pts/session",   icon: TrendingUp, color: "text-green-400" },
            { label: "Sessions Logged",  value: "5",     sub: "all time",     icon: Activity,  color: "text-amber-400" },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <GlassPanel key={label} className="flex flex-col gap-1 p-5">
              <Icon className={`w-4 h-4 ${color} mb-1`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500">{sub}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </GlassPanel>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Radar */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="md:col-span-1">
            <GlassPanel className="h-full">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4">Performance Profile</p>
              <AthleteRadarChart metrics={DEMO_METRICS} height={260} />
              <div className="grid grid-cols-2 gap-2 mt-4">
                {Object.entries(DEMO_METRICS).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/4">
                    <span className="text-xs text-slate-400 capitalize">{k}</span>
                    <span className="text-xs font-semibold text-white">{v}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>

          {/* Growth + Scout summary */}
          <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="md:col-span-2 flex flex-col gap-4">
            {/* Growth Sparkline */}
            <GlassPanel>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Growth Trajectory</p>
                <span className={`text-sm font-bold ${getVelocityColor(velocity)}`}>
                  +{velocity} pts/session
                </span>
              </div>
              <SparkLine data={DEMO_HISTORY} height={100} showAxes color="#22c55e" />
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>Session 1</span>
                <span>Latest</span>
              </div>
            </GlassPanel>

            {/* Scout Summary */}
            <GlassPanel className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Scout Summary</p>
                <Link
                  href={`/report/${profile.id}`}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Full Report <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {profile.scout_summary ? (
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-5">
                  {profile.scout_summary.split("\n").find((l) => l.trim().length > 40) ??
                    profile.scout_summary.slice(0, 300)}
                </p>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Scout report generating… check back in a moment.
                </p>
              )}
              <div className="mt-4 pt-3 border-t border-white/6 flex items-center gap-2 text-xs text-slate-600">
                <Brain className="w-3.5 h-3.5" />
                Generated by Proplay MiniGPT · 4 transformer layers · 128-dim embeddings
              </div>
            </GlassPanel>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="grid grid-cols-3 gap-4">
          {[
            { label: "Log New Session",   href: "/log",             icon: Activity },
            { label: "View Full Report",  href: `/report/${profile.id}`, icon: Brain },
            { label: "Public Profile",    href: `/profile/${profile.id}`, icon: Zap },
          ].map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href}>
              <GlassPanel hover className="flex items-center gap-3 p-4">
                <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-300 font-medium">{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
              </GlassPanel>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
