"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, CheckCircle, Cpu, FlaskConical, Layers, Loader2, Zap } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";

const AI_URL = process.env.NEXT_PUBLIC_AI_URL ?? "http://localhost:8080";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface HealthStatus { online: boolean; data?: any }

const DEFAULT_METRICS = [
  { speed: 72, strength: 68, stamina: 75, tactical: 80 },
  { speed: 76, strength: 71, stamina: 78, tactical: 82 },
];

export default function AILabPage() {
  const [aiHealth,  setAiHealth]  = useState<HealthStatus>({ online: false });
  const [apiHealth, setApiHealth] = useState<HealthStatus>({ online: false });
  const [report,    setReport]    = useState("");
  const [generating, setGenerating] = useState(false);
  const [metricsJson, setMetricsJson] = useState(JSON.stringify(DEFAULT_METRICS, null, 2));

  useEffect(() => {
    fetch(`${AI_URL}/`).then((r) => r.json()).then((d) => setAiHealth({ online: true, data: d })).catch(() => setAiHealth({ online: false }));
    fetch(`${API_URL}/health`).then((r) => r.json()).then((d) => setApiHealth({ online: true, data: d })).catch(() => setApiHealth({ online: false }));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setReport("");
    try {
      const metrics = JSON.parse(metricsJson);
      const res = await fetch(`${AI_URL}/generate-scout-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: "lab-test", sport: "default", metrics_history: metrics }),
      });
      const data = await res.json();
      setReport(data.scout_report ?? JSON.stringify(data, null, 2));
    } catch (e: any) {
      setReport(`Error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative min-h-screen dot-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-violet-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-4 h-4 text-violet-400" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Developer Console</p>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">AI Lab</h1>
          <p className="text-slate-400 text-sm">Monitor the MiniGPT transformer pipeline and test the scout report endpoint.</p>
        </motion.div>

        {/* Service health */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: "Python AI Service",    url: AI_URL,  health: aiHealth,  port: "8080", icon: Brain },
            { label: "Node.js API Gateway",  url: API_URL, health: apiHealth, port: "8000", icon: Activity },
          ].map(({ label, url, health, port, icon: Icon }) => (
            <motion.div key={port} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassPanel className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${health.online ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <Icon className={`w-5 h-5 ${health.online ? "text-green-400" : "text-red-400"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <span className={`w-2 h-2 rounded-full ${health.online ? "bg-green-400" : "bg-red-400"}`} />
                  </div>
                  <p className="text-xs text-slate-500">:{port} · {health.online ? "Online" : "Offline"}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${health.online ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {health.online ? "OK" : "DOWN"}
                </span>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Transformer config */}
        <GlassPanel className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-violet-400" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Transformer Configuration</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Architecture", value: "Decoder-only", icon: Brain },
              { label: "Layers",       value: "4",            icon: Layers },
              { label: "Embed Dim",    value: "128",          icon: Cpu },
              { label: "Attn Heads",   value: "4",            icon: Zap },
              { label: "Block Size",   value: "64 tokens",    icon: Activity },
              { label: "Dropout",      value: "0.1",          icon: Activity },
              { label: "Tokenizer",    value: "Char-level",   icon: Activity },
              { label: "Methodology",  value: "Raschka",      icon: Brain },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          {aiHealth.online && aiHealth.data && (
            <div className="mt-4 pt-4 border-t border-white/8">
              <p className="text-xs text-slate-500 mb-2">Live response from <code className="text-violet-400">{AI_URL}/</code></p>
              <pre className="text-xs text-slate-300 font-mono overflow-auto">
                {JSON.stringify(aiHealth.data, null, 2)}
              </pre>
            </div>
          )}
        </GlassPanel>

        {/* Live test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassPanel>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">Test Input — Metrics History (JSON)</p>
            <textarea
              className="w-full h-52 glass rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none border border-white/8 resize-none"
              value={metricsJson}
              onChange={(e) => setMetricsJson(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : <><Brain className="w-4 h-4" /> Run MiniGPT Scout</>}
            </button>
          </GlassPanel>

          <GlassPanel>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">Scout Report Output</p>
            {generating ? (
              <div className="flex flex-col items-center justify-center h-52 gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-6 rounded-full bg-violet-500"
                      animate={{ scaleY: [1, 1.8, 1] }}
                      transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.8 }}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">Running transformer pipeline…</p>
              </div>
            ) : report ? (
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-auto h-52 leading-relaxed">
                {report}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-52 text-slate-600 text-sm text-center">
                <div>
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Run the test above to see the<br />MiniGPT output here.
                </div>
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
