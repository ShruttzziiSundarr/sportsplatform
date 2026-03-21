"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ClipboardList, ChevronRight, Loader2, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";

const TEST_CATALOG = [
  { test_type: "100m_sprint",           label: "100m Sprint",          unit: "s",      metric: "speed",    placeholder: "e.g. 12.4" },
  { test_type: "30m_dash",              label: "30m Dash",             unit: "s",      metric: "speed",    placeholder: "e.g. 4.8"  },
  { test_type: "vertical_jump",         label: "Vertical Jump",        unit: "cm",     metric: "strength", placeholder: "e.g. 55"   },
  { test_type: "pushups_60s",           label: "Push-ups (60s)",       unit: "reps",   metric: "strength", placeholder: "e.g. 35"   },
  { test_type: "beep_test",             label: "Beep Test",            unit: "level",  metric: "stamina",  placeholder: "e.g. 8.4"  },
  { test_type: "12min_cooper_run",      label: "12-min Cooper Run",    unit: "m",      metric: "stamina",  placeholder: "e.g. 2200" },
  { test_type: "reaction_time",         label: "Reaction Time",        unit: "ms",     metric: "tactical", placeholder: "e.g. 220"  },
  { test_type: "coach_tactical_rating", label: "Tactical Rating",      unit: "/100",   metric: "tactical", placeholder: "e.g. 72"   },
];

const METRIC_COLORS: Record<string,string> = { speed:"text-blue-400", strength:"text-orange-400", stamina:"text-green-400", tactical:"text-purple-400" };

interface Profile { id: string; full_name: string; sport: string; visibility_score: number; }
interface TestRecord { id: string; test_type: string; raw_value: number; raw_unit: string; derived_score: number; metric_mapped: string; recorded_at: string; notes?: string; }

export default function CoachPage() {
  const [profiles, setProfiles]       = useState<Profile[]>([]);
  const [selected, setSelected]       = useState<Profile | null>(null);
  const [history, setHistory]         = useState<TestRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [test, setTest]               = useState(TEST_CATALOG[0]);
  const [rawValue, setRawValue]       = useState("");
  const [notes, setNotes]             = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [lastScore, setLastScore]     = useState<number | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles`)
      .then((r) => r.json()).then((j) => setProfiles(j.data ?? [])).catch(() => {});
  }, []);

  const selectAthlete = async (p: Profile) => {
    setSelected(p); setLoadingHistory(true); setHistory([]);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${p.id}/tests`);
      const j = await res.json();
      setHistory(j.data ?? []);
    } catch { /* ignore */ } finally { setLoadingHistory(false); }
  };

  const handleLog = async () => {
    if (!selected || !rawValue) return;
    setSubmitStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${selected.id}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_type: test.test_type, raw_value: parseFloat(rawValue), notes: notes || undefined }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setLastScore(j.data.derivedScore);
      setSubmitStatus("done");
      setRawValue(""); setNotes("");
      // refresh history
      const r2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${selected.id}/tests`);
      const j2 = await r2.json();
      setHistory(j2.data ?? []);
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (e: any) { setSubmitStatus("error"); setTimeout(() => setSubmitStatus("idle"), 3000); }
  };

  const metricGroups = ["speed","strength","stamina","tactical"].map((m) => ({
    metric: m,
    latest: history.filter((r) => r.metric_mapped === m).sort((a,b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0],
  }));

  return (
    <div className="min-h-screen dot-bg px-6 py-16 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Coach Portal</h1>
        </div>
        <p className="text-sm text-slate-400">Select an athlete to view their history and log new test results.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Athlete roster */}
        <div className="lg:col-span-1">
          <GlassPanel>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">Roster</p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {profiles.map((p) => (
                <button key={p.id} onClick={() => selectAthlete(p)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selected?.id === p.id ? "bg-blue-600/20 border-blue-500/40 text-white" : "glass glass-hover text-slate-300 border-white/8"}`}>
                  <p className="font-medium text-sm">{p.full_name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-slate-500 capitalize">{p.sport}</p>
                    <span className="text-xs text-blue-400 font-mono">{p.visibility_score?.toFixed(0) ?? "–"}</span>
                  </div>
                </button>
              ))}
              {profiles.length === 0 && <p className="text-sm text-slate-600 text-center py-4">No profiles found</p>}
            </div>
          </GlassPanel>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-6">
          {!selected ? (
            <GlassPanel>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-slate-500">Select an athlete from the roster</p>
              </div>
            </GlassPanel>
          ) : (
            <>
              {/* Athlete header */}
              <GlassPanel>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selected.full_name}</h2>
                    <p className="text-sm text-slate-400 capitalize">{selected.sport}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-400">{selected.visibility_score?.toFixed(0) ?? "–"}</p>
                    <p className="text-xs text-slate-500">composite</p>
                  </div>
                </div>

                {/* Latest scores per metric */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {metricGroups.map(({ metric, latest }) => (
                    <div key={metric} className="glass rounded-xl p-3 text-center">
                      <p className={`text-xs font-bold uppercase ${METRIC_COLORS[metric]}`}>{metric}</p>
                      <p className="text-xl font-bold text-white mt-1">{latest ? latest.derived_score.toFixed(0) : "–"}</p>
                      {latest && <p className="text-xs text-slate-600 mt-0.5">{latest.test_type.replace(/_/g," ")}</p>}
                    </div>
                  ))}
                </div>
              </GlassPanel>

              {/* Log new test */}
              <GlassPanel>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">
                  <ClipboardList className="w-3.5 h-3.5 inline mr-1.5" />Log New Test
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {TEST_CATALOG.map((t) => (
                    <button key={t.test_type} onClick={() => { setTest(t); setRawValue(""); }}
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${test.test_type === t.test_type ? `${METRIC_COLORS[t.metric]} bg-white/5 border-current/40 font-semibold` : "glass glass-hover text-slate-400 border-white/8"}`}>
                      <p>{t.label}</p>
                      <p className="opacity-50 mt-0.5">{t.unit}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mb-3">
                  <input type="number" value={rawValue} onChange={(e) => setRawValue(e.target.value)}
                    placeholder={test.placeholder}
                    className="flex-1 glass rounded-xl px-4 py-3 text-white font-mono border border-white/8 focus:outline-none focus:border-blue-500/50" />
                  <div className="glass rounded-xl px-4 py-3 text-slate-400 text-sm border border-white/8 whitespace-nowrap">{test.unit}</div>
                </div>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (optional)" className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 border border-white/8 focus:outline-none mb-4" />

                <button onClick={handleLog} disabled={!rawValue || submitStatus === "loading"}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-sm transition-colors">
                  {submitStatus === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Recording...</> : <><ClipboardList className="w-4 h-4" /> Record Test</>}
                </button>

                <AnimatePresence>
                  {submitStatus === "done" && (
                    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" /> Recorded — score: <span className="font-bold">{lastScore}</span>
                    </motion.div>
                  )}
                  {submitStatus === "error" && (
                    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" /> Submission failed
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassPanel>

              {/* Test history */}
              <GlassPanel>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">
                  <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />Test History
                </p>
                {loadingHistory ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
                ) : history.length === 0 ? (
                  <p className="text-slate-600 text-sm text-center py-6">No tests recorded yet</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {history.map((r) => (
                      <div key={r.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm text-white font-medium">{r.test_type.replace(/_/g," ")}</p>
                          <p className="text-xs text-slate-500">{new Date(r.recorded_at).toLocaleDateString("en-IN")} {r.notes ? "· " + r.notes : ""}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${METRIC_COLORS[r.metric_mapped]}`}>{r.derived_score.toFixed(0)}</p>
                          <p className="text-xs text-slate-600">{r.raw_value} {r.raw_unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassPanel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
