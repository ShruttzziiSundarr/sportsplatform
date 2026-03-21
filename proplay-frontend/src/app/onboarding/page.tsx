"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, User, Zap } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { api } from "@/lib/api";

const SPORTS = ["Cricket", "Basketball", "Football", "Tennis", "Athletics", "Swimming", "Volleyball", "Badminton"];

interface FormData {
  full_name: string;
  sport: string;
  primary_position: string;
  height_cm: string;
  weight_kg: string;
  speed: number;
  strength: number;
  stamina: number;
  tactical: number;
}

const STEPS = ["Identity", "Physical Stats", "Baseline Metrics", "Review & Submit"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [form, setForm] = useState<FormData>({
    full_name: "", sport: "", primary_position: "",
    height_cm: "", weight_kg: "",
    speed: 50, strength: 50, stamina: 50, tactical: 50,
  });

  const update = (field: keyof FormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canNext = () => {
    if (step === 0) return form.full_name.length >= 2 && form.sport.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setStatus("loading");
    try {
      const profile = await api.createProfile({
        full_name: form.full_name,
        sport: form.sport.toLowerCase(),
        primary_position: form.primary_position || undefined,
        height_cm: form.height_cm ? Number(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
      });
      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (e) {
      setStatus("error");
    }
  };

  const slideVariants = {
    enter:  { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit:   { opacity: 0, x: -40 },
  };

  return (
    <div className="relative min-h-screen dot-bg flex items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/8 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create Your Profile</h1>
          <p className="text-sm text-slate-400">Join Proplay and get your first AI scout report</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step  ? "bg-blue-600 text-white" :
                i === step ? "bg-blue-600/20 border border-blue-600 text-blue-400" :
                "bg-white/5 text-slate-600"
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-all ${i < step ? "bg-blue-600/50" : "bg-white/8"}`} />
              )}
            </div>
          ))}
        </div>

        {status === "done" ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-10 text-center">
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Profile Created!</h2>
            <p className="text-slate-400 text-sm">Redirecting to your dashboard…</p>
          </motion.div>
        ) : (
          <GlassPanel className="relative overflow-hidden">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-6">
              Step {step + 1}: {STEPS[step]}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }}
              >
                {/* Step 0: Identity */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 block">Full Name *</label>
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(e) => update("full_name", e.target.value)}
                        placeholder="e.g. Arjun Mehta"
                        className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 border border-white/8 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 block">Sport *</label>
                      <div className="grid grid-cols-4 gap-2">
                        {SPORTS.map((s) => (
                          <button
                            key={s}
                            onClick={() => update("sport", s)}
                            className={`py-2 rounded-xl text-xs font-medium transition-all ${
                              form.sport === s ? "bg-blue-600 text-white" : "glass glass-hover text-slate-400"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 block">Position <span className="text-slate-600">(optional)</span></label>
                      <input
                        type="text"
                        value={form.primary_position}
                        onChange={(e) => update("primary_position", e.target.value)}
                        placeholder="e.g. All-Rounder, Point Guard"
                        className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none border border-white/8"
                      />
                    </div>
                  </div>
                )}

                {/* Step 1: Physical */}
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400 mb-4">Optional but helpful for accurate scouting.</p>
                    {[
                      { field: "height_cm" as const, label: "Height (cm)", placeholder: "e.g. 182" },
                      { field: "weight_kg" as const, label: "Weight (kg)", placeholder: "e.g. 74" },
                    ].map(({ field, label, placeholder }) => (
                      <div key={field}>
                        <label className="text-xs text-slate-400 font-medium mb-1.5 block">{label}</label>
                        <input
                          type="number"
                          value={form[field]}
                          onChange={(e) => update(field, e.target.value)}
                          placeholder={placeholder}
                          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none border border-white/8"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2: Baseline metrics */}
                {step === 2 && (
                  <div className="space-y-5">
                    <p className="text-sm text-slate-400">Rate yourself honestly. These are your starting baseline scores.</p>
                    {(["speed", "strength", "stamina", "tactical"] as const).map((key) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white capitalize">{key}</span>
                          <span className="text-sm font-bold text-blue-400 font-mono">{form[key]}</span>
                        </div>
                        <input
                          type="range" min={0} max={100}
                          value={form[key]}
                          onChange={(e) => update(key, Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 ${form[key]}%, rgba(255,255,255,0.1) ${form[key]}%)`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-3">
                    <div className="glass rounded-xl p-4 space-y-2">
                      {[
                        ["Name",     form.full_name],
                        ["Sport",    form.sport],
                        ["Position", form.primary_position || "—"],
                        ["Height",   form.height_cm ? `${form.height_cm} cm` : "—"],
                        ["Weight",   form.weight_kg ? `${form.weight_kg} kg` : "—"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">{label}</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="glass rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-2">Baseline Metrics</p>
                      <div className="grid grid-cols-4 gap-2">
                        {(["speed", "strength", "stamina", "tactical"] as const).map((k) => (
                          <div key={k} className="text-center">
                            <p className="text-lg font-bold text-white">{form[k]}</p>
                            <p className="text-xs text-slate-500 capitalize">{k}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {status === "error" && (
                      <p className="text-xs text-red-400 text-center">Submission failed. Is the API gateway running?</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/8">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass glass-hover text-slate-400 text-sm font-medium disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><User className="w-4 h-4" /> Create Profile</>}
                </button>
              )}
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
