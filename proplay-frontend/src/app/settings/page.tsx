"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, EyeOff, Lock, Server, Settings } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";

export default function SettingsPage() {
  const [visibility, setVisibility] = useState<"public" | "scouts">("public");
  const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");

  return (
    <div className="relative min-h-screen dot-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-slate-600/6 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Configuration</p>
          </div>
          <h1 className="text-3xl font-bold text-white">Settings & Privacy</h1>
        </motion.div>

        <div className="space-y-4">
          {/* Visibility */}
          <GlassPanel>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Profile Visibility</p>
                <p className="text-xs text-slate-500">Control who can discover and view your athlete profile.</p>
              </div>
              <Lock className="w-4 h-4 text-slate-500 mt-0.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "public" as const,  label: "Public",      desc: "Visible to all scouts", icon: Eye },
                { key: "scouts" as const,  label: "Scouts Only", desc: "Verified scouts only",  icon: EyeOff },
              ].map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setVisibility(key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    visibility === key
                      ? "border-blue-500/40 bg-blue-500/10"
                      : "border-white/8 glass glass-hover"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${visibility === key ? "text-blue-400" : "text-slate-500"}`} />
                  <div>
                    <p className={`text-sm font-medium ${visibility === key ? "text-white" : "text-slate-400"}`}>{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* API Config */}
          <GlassPanel>
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-white">API Configuration</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "API Gateway",   value: apiUrl },
                { label: "AI Service",    value: process.env.NEXT_PUBLIC_AI_URL ?? "http://localhost:8080" },
                { label: "Transformer",   value: "MiniGPT v2.0 · 4L × 128d" },
                { label: "Database",      value: "Supabase PostgreSQL" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-white/6 last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <code className="text-xs text-slate-300 font-mono">{value}</code>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Danger zone */}
          <GlassPanel className="border border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-sm font-semibold text-red-400">Danger Zone</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Reset All Metrics</p>
                <p className="text-xs text-slate-500">Deletes all session history. Scout report will regenerate.</p>
              </div>
              <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
                Reset
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
