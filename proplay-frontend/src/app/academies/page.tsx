"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, Academy } from "@/lib/api";
import Link from "next/link";
import {
    Building2,
    MapPin,
    Mail,
    Phone,
    Users,
    Wallet,
    Plus,
    Search,
    Trophy,
} from "lucide-react";

const SPORT_FILTERS = ["All", "Cricket", "Basketball", "Football", "Tennis", "Badminton", "Swimming", "Athletics"];

export default function AcademiesPage() {
    const [academies, setAcademies] = useState<Academy[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const sport = filter === "All" ? undefined : filter.toLowerCase();
                const data = await api.getAcademies(sport);
                setAcademies(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [filter]);

    const filtered = academies.filter(
        (a) =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.sport.toLowerCase().includes(search.toLowerCase()) ||
            (a.location ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen dot-bg">
            <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-24">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-600/8 blur-[120px]" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-emerald-400 border border-emerald-500/20 mb-4">
                            <Building2 className="w-3 h-3" /> Sports Academies
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-1">Discover Academies</h1>
                        <p className="text-slate-400 text-sm">Find and join training academies or start your own.</p>
                    </div>
                    <Link
                        href="/academy/create"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Start Academy
                    </Link>
                </motion.div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search academies..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {SPORT_FILTERS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === s ? "bg-blue-500 text-white" : "glass text-slate-400 hover:text-white"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
                                <div className="h-3 bg-white/5 rounded w-1/3 mb-6" />
                                <div className="h-20 bg-white/5 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-2xl p-16 text-center"
                    >
                        <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Academies Found</h3>
                        <p className="text-sm text-slate-400 mb-6">Be the first to start an academy in this sport!</p>
                        <Link
                            href="/academy/create"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Start Academy
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((academy, i) => (
                            <motion.div
                                key={academy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass rounded-2xl p-6 hover:border-white/15 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                                            {academy.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Trophy className="w-3 h-3 text-emerald-400" />
                                            <span className="text-xs text-emerald-400 capitalize">{academy.sport}</span>
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-4 h-4 text-emerald-400" />
                                    </div>
                                </div>

                                {academy.description && (
                                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{academy.description}</p>
                                )}

                                <div className="space-y-2">
                                    {academy.location && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <MapPin className="w-3 h-3" /> {academy.location}
                                        </div>
                                    )}
                                    {academy.contact_email && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Mail className="w-3 h-3" /> {academy.contact_email}
                                        </div>
                                    )}
                                    {academy.contact_phone && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Phone className="w-3 h-3" /> {academy.contact_phone}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                                    {academy.fee_monthly != null && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Wallet className="w-3 h-3" /> ₹{academy.fee_monthly}/mo
                                        </div>
                                    )}
                                    {academy.max_capacity != null && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Users className="w-3 h-3" /> {academy.max_capacity} slots
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
