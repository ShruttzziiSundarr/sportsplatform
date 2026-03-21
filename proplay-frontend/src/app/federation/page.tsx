"use client";
import { useState, useEffect } from "react";
import { Loader2, Globe, TrendingUp, Users, Zap, ShieldCheck, AlertTriangle } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface Profile {
  id: string; full_name: string; sport: string; district?: string; state?: string;
  visibility_score: number; speed?: number; strength?: number; stamina?: number; tactical?: number;
}

const SPORT_COLORS: Record<string,string> = {
  cricket:"#3b82f6", basketball:"#f97316", football:"#22c55e", tennis:"#a855f7",
  athletics:"#eab308", swimming:"#06b6d4", volleyball:"#ec4899", badminton:"#14b8a6", kabaddi:"#f43f5e",
};

const METRIC_COLORS: Record<string,string> = { speed:"#3b82f6", strength:"#f97316", stamina:"#22c55e", tactical:"#a855f7" };

export default function FederationPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sport, setSport]       = useState("all");

  useEffect(() => {
    setLoading(true);
    const url = sport === "all"
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/profiles`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/profiles?sport=${sport}`;
    fetch(url).then((r) => r.json()).then((j) => setProfiles(j.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, [sport]);

  const filtered = sport === "all" ? profiles : profiles.filter((p) => p.sport?.toLowerCase() === sport);

  // Sport distribution
  const sportDist = Object.entries(
    filtered.reduce((acc, p) => { acc[p.sport] = (acc[p.sport] ?? 0) + 1; return acc; }, {} as Record<string,number>)
  ).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);

  // Score distribution buckets
  const buckets = [
    { label: "Elite (85+)",    min: 85, max: 101, color: "#3b82f6" },
    { label: "High (70-84)",   min: 70, max: 85,  color: "#22c55e" },
    { label: "Dev (55-69)",    min: 55, max: 70,  color: "#eab308" },
    { label: "Early (<55)",    min: 0,  max: 55,  color: "#ef4444" },
  ].map((b) => ({
    ...b,
    count: filtered.filter((p) => (p.visibility_score ?? 0) >= b.min && (p.visibility_score ?? 0) < b.max).length,
  }));

  // Average metrics
  const n = filtered.length || 1;
  const avgMetrics = [
    { metric: "Speed",    value: filtered.reduce((s,p) => s + (p.speed ?? 50), 0) / n },
    { metric: "Strength", value: filtered.reduce((s,p) => s + (p.strength ?? 50), 0) / n },
    { metric: "Stamina",  value: filtered.reduce((s,p) => s + (p.stamina ?? 50), 0) / n },
    { metric: "Tactical", value: filtered.reduce((s,p) => s + (p.tactical ?? 50), 0) / n },
  ];

  // Top talent (highest composite)
  const topTalent = [...filtered].sort((a,b) => (b.visibility_score ?? 0) - (a.visibility_score ?? 0)).slice(0, 5);

  // Rising (spotlight: score 45-84 — needs coach attention)
  const risingCount = filtered.filter((p) => (p.visibility_score ?? 0) >= 45 && (p.visibility_score ?? 0) < 85).length;

  const SPORTS = ["all","cricket","basketball","football","tennis","athletics","swimming","volleyball","badminton","kabaddi"];

  return (
    <div className="min-h-screen dot-bg px-6 py-16 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Federation Intelligence</h1>
        </div>
        <p className="text-sm text-slate-400">Operational view of the talent pipeline. Filter by sport, identify gaps, surface hidden talent.</p>
      </div>

      {/* Sport filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SPORTS.map((s) => (
          <button key={s} onClick={() => setSport(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${sport === s ? "bg-blue-600 text-white" : "glass glass-hover text-slate-400"}`}>
            {s === "all" ? "All Sports" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
      ) : (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users,       label: "Total Athletes",    value: filtered.length,                        color: "text-blue-400"   },
              { icon: Zap,         label: "Elite Prospects",   value: buckets[0].count,                       color: "text-yellow-400" },
              { icon: TrendingUp,  label: "Rising Talent",     value: risingCount,                            color: "text-green-400"  },
              { icon: ShieldCheck, label: "Avg. Composite",    value: (filtered.reduce((s,p)=>s+(p.visibility_score??0),0)/n).toFixed(1), color: "text-purple-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <GlassPanel key={label}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </GlassPanel>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score distribution */}
            <GlassPanel>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">Pipeline Health</p>
              <div className="space-y-3">
                {buckets.map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{b.label}</span>
                      <span className="text-xs font-bold text-white">{b.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${filtered.length ? (b.count/filtered.length)*100 : 0}%`, backgroundColor: b.color }} />
                    </div>
                  </div>
                ))}
              </div>
              {buckets[3].count > filtered.length * 0.5 && (
                <div className="mt-4 flex items-start gap-2 text-xs text-orange-400 bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>Over 50% of athletes are in early stage. Recommend structured coaching intervention.</span>
                </div>
              )}
            </GlassPanel>

            {/* Average metric radar */}
            <GlassPanel>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">Average Metric Profile</p>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={avgMetrics}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} />
                </RadarChart>
              </ResponsiveContainer>
            </GlassPanel>

            {/* Sport distribution */}
            <GlassPanel>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">Sport Distribution</p>
              {sportDist.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sportDist} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={70} />
                    <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#fff", fontSize:12 }} />
                    <Bar dataKey="count" radius={[0,4,4,0]}>
                      {sportDist.map((entry) => <Cell key={entry.name} fill={SPORT_COLORS[entry.name] ?? "#3b82f6"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassPanel>
          </div>

          {/* Top 5 talent */}
          <GlassPanel>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">Top Talent — Priority Review</p>
            {topTalent.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-6">No athletes yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-white/8">
                      <th className="pb-3 font-medium">Athlete</th>
                      <th className="pb-3 font-medium">Sport</th>
                      <th className="pb-3 font-medium">District</th>
                      <th className="pb-3 font-medium text-right">Composite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {topTalent.map((p, i) => (
                      <tr key={p.id} className="hover:bg-white/3 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-slate-500/20 text-slate-400" : "bg-orange-500/10 text-orange-400"}`}>{i + 1}</span>
                            <span className="text-white font-medium">{p.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-400 capitalize">{p.sport}</td>
                        <td className="py-3 text-slate-500">{p.district ?? "—"}</td>
                        <td className="py-3 text-right font-bold text-blue-400">{(p.visibility_score ?? 0).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
