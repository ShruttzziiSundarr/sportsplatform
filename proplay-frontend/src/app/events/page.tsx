"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, SportEvent, CreateEventBody } from "@/lib/api";
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    Search,
    Trophy,
    Users,
    X,
    Zap,
} from "lucide-react";

const SPORT_FILTERS = ["All", "Cricket", "Basketball", "Football", "Tennis", "Badminton", "Swimming"];
const EVENT_TYPES = ["open_match", "tournament", "training", "trial"];

export default function EventsPage() {
    const [events, setEvents] = useState<SportEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<CreateEventBody>({
        title: "",
        sport: "",
        event_type: "open_match",
        description: "",
        location: "",
        date: "",
        max_players: 20,
    });

    const loadEvents = async () => {
        setLoading(true);
        try {
            const sport = filter === "All" ? undefined : filter.toLowerCase();
            const data = await api.getEvents(sport);
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadEvents(); }, [filter]);

    const filtered = events.filter(
        (e) =>
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.sport.toLowerCase().includes(search.toLowerCase()) ||
            (e.location ?? "").toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async () => {
        if (!form.title || !form.sport || !form.date) return;
        setCreating(true);
        try {
            await api.createEvent(form);
            setShowCreate(false);
            setForm({ title: "", sport: "", event_type: "open_match", description: "", location: "", date: "", max_players: 20 });
            loadEvents();
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const formatDate = (d: string) => {
        try {
            return new Date(d).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch { return d; }
    };

    const typeColor: Record<string, string> = {
        open_match: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        tournament: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        training: "text-green-400 bg-green-500/10 border-green-500/20",
        trial: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    };

    return (
        <div className="min-h-screen dot-bg">
            <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-24">
                <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[120px]" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-blue-400 border border-blue-500/20 mb-4">
                            <Zap className="w-3 h-3" /> Live Events
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-1">Open Matches & Events</h1>
                        <p className="text-slate-400 text-sm">Find matches, tournaments, and training sessions happening nearby.</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Create Event
                    </button>
                </motion.div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search events..."
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

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
                                <div className="h-3 bg-white/5 rounded w-1/2 mb-6" />
                                <div className="h-16 bg-white/5 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-16 text-center">
                        <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Upcoming Events</h3>
                        <p className="text-sm text-slate-400 mb-6">Be the first to organize a match or training session!</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Create Event
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass rounded-2xl p-6 hover:border-white/15 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${typeColor[event.event_type] ?? typeColor.open_match}`}>
                                                {event.event_type.replace("_", " ")}
                                            </span>
                                            <span className="text-xs text-slate-500 capitalize flex items-center gap-1">
                                                <Trophy className="w-3 h-3" /> {event.sport}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{event.title}</h3>
                                    </div>
                                </div>

                                {event.description && (
                                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{event.description}</p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" /> {formatDate(event.date)}
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3" /> {event.location}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3 h-3" /> {event.max_players} max
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Create Event Modal */}
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass rounded-2xl p-8 w-full max-w-lg relative"
                        >
                            <button
                                onClick={() => setShowCreate(false)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6">Create Event</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Title *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g. Sunday Cricket Match"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">Sport *</label>
                                        <select
                                            value={form.sport}
                                            onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                                        >
                                            <option value="" className="bg-zinc-900">Select sport</option>
                                            {SPORT_FILTERS.filter((s) => s !== "All").map((s) => (
                                                <option key={s} value={s.toLowerCase()} className="bg-zinc-900">{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">Type</label>
                                        <select
                                            value={form.event_type}
                                            onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                                        >
                                            {EVENT_TYPES.map((t) => (
                                                <option key={t} value={t} className="bg-zinc-900">{t.replace("_", " ")}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.date}
                                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Location</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                        placeholder="e.g. SNU Chennai Ground #2"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                        rows={2}
                                        placeholder="Tell people about this event..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Max Players</label>
                                    <input
                                        type="number"
                                        value={form.max_players}
                                        onChange={(e) => setForm((f) => ({ ...f, max_players: Number(e.target.value) }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={creating || !form.title || !form.sport || !form.date}
                                className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-40 transition-colors"
                            >
                                {creating ? "Creating..." : "Create Event"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
