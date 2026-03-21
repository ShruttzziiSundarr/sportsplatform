"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, CreateAcademyBody } from "@/lib/api";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    Mail,
    MapPin,
    Phone,
    Trophy,
    Users,
    Wallet,
} from "lucide-react";
import Link from "next/link";

const SPORTS = [
    "Cricket", "Basketball", "Football", "Tennis", "Badminton",
    "Swimming", "Athletics", "Hockey", "Volleyball", "Kabaddi",
    "Table Tennis", "Boxing",
];

const STEPS = ["Basics", "Details", "Contact", "Review"];

export default function CreateAcademyPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState<CreateAcademyBody>({
        name: "",
        sport: "",
        description: "",
        location: "",
        contact_email: "",
        contact_phone: "",
        fee_monthly: undefined,
        max_capacity: undefined,
    });

    const update = (key: keyof CreateAcademyBody, value: any) =>
        setForm((f) => ({ ...f, [key]: value }));

    const canNext =
        step === 0 ? form.name.length >= 2 && form.sport !== "" :
            step === 1 ? true :
                step === 2 ? true : true;

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.createAcademy(form);
            setSuccess(true);
            setTimeout(() => router.push("/academies"), 1500);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen dot-bg flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass rounded-3xl p-12 text-center max-w-md"
                >
                    <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Academy Created!</h2>
                    <p className="text-slate-400 text-sm">Redirecting to your academy listing...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen dot-bg">
            <div className="relative mx-auto max-w-2xl px-6 pt-16 pb-24">
                {/* Back link */}
                <Link href="/academies" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Academies
                </Link>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-emerald-400 border border-emerald-500/20 mb-4">
                        <Building2 className="w-3 h-3" /> Start Your Academy
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create a Sports Academy</h1>
                    <p className="text-slate-400 text-sm">Set up a training academy for athletes in your preferred sport.</p>
                </motion.div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-10">
                    {STEPS.map((label, i) => (
                        <div key={label} className="flex-1">
                            <div className={`h-1 rounded-full transition-all ${i <= step ? "bg-blue-500" : "bg-white/10"}`} />
                            <p className={`text-[10px] mt-1.5 ${i <= step ? "text-white" : "text-slate-600"}`}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Step 0: Basics */}
                {step === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div>
                            <label className="block text-xs text-slate-400 mb-2">Academy Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => update("name", e.target.value)}
                                placeholder="e.g. Chennai Speed Academy"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-2">Sport *</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {SPORTS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => update("sport", s.toLowerCase())}
                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${form.sport === s.toLowerCase()
                                                ? "bg-blue-500 text-white"
                                                : "glass glass-hover text-slate-400"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 1: Details */}
                {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div>
                            <label className="block text-xs text-slate-400 mb-2">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => update("description", e.target.value)}
                                rows={4}
                                placeholder="Describe what your academy offers, coaching philosophy, etc."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                    <Wallet className="w-3 h-3" /> Monthly Fee (₹)
                                </label>
                                <input
                                    type="number"
                                    value={form.fee_monthly ?? ""}
                                    onChange={(e) => update("fee_monthly", e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="e.g. 5000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                    <Users className="w-3 h-3" /> Max Capacity
                                </label>
                                <input
                                    type="number"
                                    value={form.max_capacity ?? ""}
                                    onChange={(e) => update("max_capacity", e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="e.g. 50"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Contact */}
                {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div>
                            <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                <MapPin className="w-3 h-3" /> Location
                            </label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={(e) => update("location", e.target.value)}
                                placeholder="e.g. SNU Chennai Campus, Kalavakkam"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                <Mail className="w-3 h-3" /> Contact Email
                            </label>
                            <input
                                type="email"
                                value={form.contact_email}
                                onChange={(e) => update("contact_email", e.target.value)}
                                placeholder="academy@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                <Phone className="w-3 h-3" /> Contact Phone
                            </label>
                            <input
                                type="tel"
                                value={form.contact_phone}
                                onChange={(e) => update("contact_phone", e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white mb-4">Review Your Academy</h3>
                            {[
                                ["Name", form.name],
                                ["Sport", form.sport],
                                ["Description", form.description || "—"],
                                ["Location", form.location || "—"],
                                ["Email", form.contact_email || "—"],
                                ["Phone", form.contact_phone || "—"],
                                ["Monthly Fee", form.fee_monthly ? `₹${form.fee_monthly}` : "—"],
                                ["Capacity", form.max_capacity ? `${form.max_capacity} athletes` : "—"],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                    <span className="text-xs text-slate-500">{label}</span>
                                    <span className="text-sm text-white font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10">
                    <button
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-slate-400 text-sm disabled:opacity-30 hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canNext}
                            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                        >
                            <Trophy className="w-4 h-4" />
                            {submitting ? "Creating..." : "Launch Academy"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
