"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, ChevronRight, Cpu, Layers, TrendingUp, Zap } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { api, Profile } from "@/lib/api";

const DEMO_REPORT = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PROPLAY VIRTUAL SCOUT ASSESSMENT
  Sport: CRICKET  |  Classification: HIGH POTENTIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY
Following transformer-assisted analysis of 5 performance record(s), this candidate presents a composite talent score of 74.5/100. The profile indicates a strong developmental trajectory with targeted coaching investment recommended.

PHYSICAL ASSESSMENT
  • Speed       [ABOVE-AVERAGE  ]  Candidate exhibits strong speed characteristics, consistently outperforming peers in sprint and agility benchmarks across observed sessions.
  • Strength    [DEVELOPING     ]  Strength foundation is emerging. Consistent resistance work has produced measurable gains across the observation window.
  • Stamina     [ABOVE-AVERAGE  ]  Stamina readings indicate a high-work-rate athlete with superior recovery capacity and sustainable high-intensity output.

COGNITIVE & TACTICAL ASSESSMENT
  • Tactical IQ [ABOVE-AVERAGE  ]  Tactical metrics reflect a mature athlete with strong positional awareness and above-average decision-making under competitive pressure.

GROWTH TRAJECTORY
  Improvement Velocity: +2.40 pts/session — Candidate exhibits high-velocity growth with a steep positive performance trajectory. Accelerated development pathway recommended.

─────────────────────────────────────────────────
  Proplay AI  |  MiniGPT Virtual Scout Engine
  Transformer: 4 layers × 128-dim embeddings
  Architecture: Decoder-only Causal Transformer (Raschka methodology)
─────────────────────────────────────────────────`;

const SECTIONS = [
  { key: "EXECUTIVE SUMMARY",              color: "text-blue-400" },
  { key: "PHYSICAL ASSESSMENT",            color: "text-violet-400" },
  { key: "COGNITIVE & TACTICAL ASSESSMENT",color: "text-amber-400" },
  { key: "GROWTH TRAJECTORY",              color: "text-green-400" },
];

function parseReport(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const isSep  = line.includes("━") || line.includes("─");
    const isHead = SECTIONS.some((s) => line.trim().startsWith(s.key));
    const section = SECTIONS.find((s) => line.trim().startsWith(s.key));
    return { line, isSep, isHead, color: section?.color ?? "text-slate-300" };
  });
}

export default function ScoutReportPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [report, setReport]   = useState(DEMO_REPORT);

  useEffect(() => {
    if (id === "demo") return;
    api.getProfileById(id)
      .then((p) => {
        setProfile(p);
        if (p.scout_summary) setReport(p.scout_summary);
      })
      .catch(() => {});
  }, [id]);

  const parsed = parseReport(report);

  return (
    <div className="relative min-h-screen dot-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <span>Profiles</span>
            <ChevronRight className="w-3 h-3" />
            <span>{profile?.full_name ?? "Athlete"}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-400">Scout Report</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Virtual Scout Assessment</p>
              <h1 className="text-3xl font-bold text-white">{profile?.full_name ?? "Athlete"}</h1>
              <p className="text-sm text-slate-400 capitalize mt-1">{profile?.sport ?? "Cricket"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-slate-400 font-mono">MiniGPT v2.0</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main report */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassPanel className="font-mono text-sm leading-relaxed">
              {parsed.map(({ line, isSep, isHead, color }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 + i * 0.015 }}
                  className={
                    isSep  ? "text-white/20 text-xs my-2" :
                    isHead ? `${color} font-bold text-xs uppercase tracking-widest mt-4 mb-1` :
                    line.trim().startsWith("•") ? "text-slate-300 pl-2 my-1" :
                    line.trim().startsWith("Improvement") ? "text-green-300 my-1" :
                    line.trim().startsWith("Proplay") || line.trim().startsWith("Transformer") || line.trim().startsWith("Architecture") ? "text-slate-500 text-xs" :
                    "text-slate-300 my-0.5"
                  }
                >
                  {line || <span className="invisible">.</span>}
                </motion.div>
              ))}
            </GlassPanel>
          </motion.div>

          {/* Sidebar metadata */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassPanel className="p-5">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4">Model Info</p>
              <div className="space-y-3">
                {[
                  { icon: Layers, label: "Transformer Layers", value: "4" },
                  { icon: Cpu,    label: "Embedding Dim",      value: "128" },
                  { icon: Brain,  label: "Attention Heads",    value: "4" },
                  { icon: Zap,    label: "Architecture",       value: "Causal Decoder" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-400">{label}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4">Scores</p>
              <div className="space-y-3">
                {[
                  { label: "Composite Score", value: `${profile?.visibility_score?.toFixed(1) ?? "74.5"} / 100` },
                  { label: "Classification",  value: "High Potential" },
                  { label: "Improvement Vel", value: "+2.4 pts/session" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Pipeline</p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                {["Tokenize metrics", "Embed to 128-dim", "4× Causal blocks", "Mean-pool hidden state", "Template decode"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
