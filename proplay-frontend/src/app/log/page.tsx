"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, ClipboardList, Info, AlertCircle } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";

const TEST_CATALOG = [
  { test_type: "100m_sprint",           label: "100m Sprint",             unit: "seconds",       metric: "speed",    min: 9,   max: 20,   step: 0.1,  placeholder: "e.g. 12.4",  hint: "Lower is better. Elite: <10.5s, Average: ~13s" },
  { test_type: "30m_dash",              label: "30m Dash",                unit: "seconds",       metric: "speed",    min: 3,   max: 8,    step: 0.1,  placeholder: "e.g. 4.8",   hint: "Lower is better. Good: <4.5s" },
  { test_type: "agility_505",           label: "505 Agility Test",        unit: "seconds",       metric: "speed",    min: 1.5, max: 5,    step: 0.01, placeholder: "e.g. 2.35",  hint: "Lower is better. Elite: <2.1s" },
  { test_type: "vertical_jump",         label: "Vertical Jump",           unit: "cm",            metric: "strength", min: 10,  max: 100,  step: 1,    placeholder: "e.g. 55",    hint: "Higher is better. Good: >50cm" },
  { test_type: "standing_broad_jump",   label: "Standing Broad Jump",     unit: "cm",            metric: "strength", min: 50,  max: 350,  step: 1,    placeholder: "e.g. 210",   hint: "Higher is better. Good: >200cm" },
  { test_type: "pushups_60s",           label: "Push-ups (60s)",          unit: "reps",          metric: "strength", min: 0,   max: 100,  step: 1,    placeholder: "e.g. 35",    hint: "Higher is better. Good: >30 reps" },
  { test_type: "beep_test",             label: "Beep Test",               unit: "level",         metric: "stamina",  min: 1,   max: 21,   step: 0.1,  placeholder: "e.g. 8.4",   hint: "Higher is better. Good: >9, Elite: >13" },
  { test_type: "12min_cooper_run",      label: "12-min Cooper Run",       unit: "metres",        metric: "stamina",  min: 500, max: 4000, step: 10,   placeholder: "e.g. 2200",  hint: "Distance in 12 minutes. Good: >2000m" },
  { test_type: "yo_yo_ir1",             label: "Yo-Yo IR Level 1",        unit: "metres",        metric: "stamina",  min: 0,   max: 3200, step: 40,   placeholder: "e.g. 1120",  hint: "Total distance. Elite: >1600m" },
  { test_type: "reaction_time",         label: "Reaction Time",           unit: "milliseconds",  metric: "tactical", min: 100, max: 600,  step: 1,    placeholder: "e.g. 220",   hint: "Lower is better. Elite: <200ms" },
  { test_type: "coach_tactical_rating", label: "Tactical Rating (Coach)", unit: "score (0-100)", metric: "tactical", min: 0,   max: 100,  step: 1,    placeholder: "e.g. 72",    hint: "Coach assessment of game intelligence" },
];

const METRIC_COLORS: Record<string,string> = { speed:"text-blue-400", strength:"text-orange-400", stamina:"text-green-400", tactical:"text-purple-400" };
const METRIC_BG: Record<string,string>     = { speed:"bg-blue-500/10 border-blue-500/20", strength:"bg-orange-500/10 border-orange-500/20", stamina:"bg-green-500/10 border-green-500/20", tactical:"bg-purple-500/10 border-purple-500/20" };

interface Profile { id: string; full_name: string; sport: string; }
interface TestResult { testType: string; derivedScore: number; metricMapped: string; }

export default function LogPage() {
  const [profileId, setProfileId]       = useState("");
  const [profiles, setProfiles]         = useState<Profile[]>([]);
  const [selectedTest, setSelectedTest] = useState(TEST_CATALOG[0]);
  const [rawValue, setRawValue]         = useState("");
  const [notes, setNotes]               = useState("");
  const [status, setStatus]             = useState<"idle"|"loading"|"done"|"error">("idle");
  const [result, setResult]             = useState<TestResult|null>(null);
  const [errorMsg, setErrorMsg]         = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles`)
      .then((r) => r.json()).then((j) => setProfiles(j.data ?? [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!profileId || !rawValue) return;
    setStatus("loading"); setErrorMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${profileId}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_type: selectedTest.test_type, raw_value: parseFloat(rawValue), notes: notes || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      setResult({ testType: selectedTest.label, derivedScore: json.data.derivedScore, metricMapped: json.data.metricMapped });
      setStatus("done"); setRawValue(""); setNotes("");
    } catch (e: any) { setErrorMsg(e.message); setStatus("error"); }
  };

  const groupedTests = ["speed","strength","stamina","tactical"].map((metric) => ({
    metric, tests: TEST_CATALOG.filter((t) => t.metric === metric),
  }));

  return (
    <div className="min-h-screen dot-bg px-6 py-16 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Log Standardized Test</h1>
        </div>
        <p className="text-sm text-slate-400">
          Record an objective measurement. The system converts it to a verified 0-100 score.
          Only coaches and district officers can submit.
        </p>
      </div>

      <div className="space-y-6">
        <GlassPanel>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3 block">Athlete</label>
          <select value={profileId} onChange={(e) => setProfileId(e.target.value)}
            className="w-full glass rounded-xl px-4 py-3 text-sm text-white border border-white/8 focus:outline-none bg-transparent">
            <option value="" className="bg-slate-900">Select an athlete...</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900">{p.full_name} ({p.sport})</option>
            ))}
          </select>
        </GlassPanel>

        <GlassPanel>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4 block">Test Type</label>
          <div className="space-y-4">
            {groupedTests.map(({ metric, tests }) => (
              <div key={metric}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${METRIC_COLORS[metric]}`}>{metric}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tests.map((t) => (
                    <button key={t.test_type} onClick={() => { setSelectedTest(t); setRawValue(""); }}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${selectedTest.test_type === t.test_type ? `${METRIC_BG[metric]} ${METRIC_COLORS[metric]} font-semibold` : "glass glass-hover text-slate-400 border-white/8"}`}>
                      <p className="font-medium">{t.label}</p>
                      <p className="text-xs opacity-60 mt-0.5">{t.unit}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Recorded Value</label>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${METRIC_BG[selectedTest.metric]} ${METRIC_COLORS[selectedTest.metric]}`}>
              {selectedTest.metric.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-3 items-start mb-3">
            <input type="number" value={rawValue} onChange={(e) => setRawValue(e.target.value)}
              placeholder={selectedTest.placeholder} min={selectedTest.min} max={selectedTest.max} step={selectedTest.step}
              className="flex-1 glass rounded-xl px-4 py-3 text-white text-lg font-mono border border-white/8 focus:outline-none focus:border-blue-500/50" />
            <div className="glass rounded-xl px-4 py-3 text-slate-400 text-sm border border-white/8 whitespace-nowrap">{selectedTest.unit}</div>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500/60" />
            <span>{selectedTest.hint}</span>
          </div>
          <div className="mt-4">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-2 block">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Slight headwind, tested on grass track" rows={2}
              className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 border border-white/8 focus:outline-none resize-none" />
          </div>
        </GlassPanel>

        <button onClick={handleSubmit} disabled={!profileId || !rawValue || status === "loading"}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold transition-colors">
          {status === "loading"
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Recording...</>
            : <><ClipboardList className="w-4 h-4" /> Record Test Result</>}
        </button>

        <AnimatePresence>
          {status === "done" && result && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="glass rounded-2xl p-6 border border-green-500/20">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-white font-semibold">Test recorded and audit log updated</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-slate-500 mb-1">Test</p><p className="text-sm text-white font-medium">{result.testType}</p></div>
                <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-slate-500 mb-1">Score</p><p className={`text-2xl font-bold ${METRIC_COLORS[result.metricMapped]}`}>{result.derivedScore}</p></div>
                <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-slate-500 mb-1">Metric</p><p className={`text-sm font-bold capitalize ${METRIC_COLORS[result.metricMapped]}`}>{result.metricMapped}</p></div>
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">Scout report refreshes automatically within a few seconds.</p>
            </motion.div>
          )}
          {status === "error" && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="glass rounded-2xl p-4 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{errorMsg || "Submission failed. Is the gateway running?"}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}