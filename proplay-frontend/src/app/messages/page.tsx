"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { api, Conversation, Message } from "@/lib/api";
import {
    MessageCircle,
    Send,
    Plus,
    User,
    ArrowLeft,
    Search,
} from "lucide-react";

const DEMO_USER = "current-user";

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvo, setActiveConvo] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [newMsg, setNewMsg] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [newParticipant, setNewParticipant] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getConversations(DEMO_USER);
                setConversations(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const openThread = async (convoId: string) => {
        setActiveConvo(convoId);
        setMsgLoading(true);
        try {
            const thread = await api.getThread(convoId);
            setMessages(thread.messages);
        } catch (err) {
            console.error(err);
        } finally {
            setMsgLoading(false);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMsg.trim() || !activeConvo) return;
        const content = newMsg;
        setNewMsg("");
        try {
            const msg = await api.sendMessage(activeConvo, DEMO_USER, content);
            setMessages((prev) => [...prev, msg]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNewConvo = async () => {
        if (!newParticipant.trim()) return;
        try {
            const convo = await api.createConversation(DEMO_USER, newParticipant.trim());
            setConversations((prev) => [convo, ...prev]);
            setShowNew(false);
            setNewParticipant("");
            openThread(convo.id);
        } catch (err) {
            console.error(err);
        }
    };

    const getOtherUser = (c: Conversation) =>
        c.participant_a === DEMO_USER ? c.participant_b : c.participant_a;

    return (
        <div className="min-h-screen dot-bg">
            <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-24">
                <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-violet-400 border border-violet-500/20 mb-4">
                        <MessageCircle className="w-3 h-3" /> Messages
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Inbox</h1>
                    <p className="text-slate-400 text-sm">Connect with athletes, scouts, and coaches.</p>
                </motion.div>

                {/* Split Panel */}
                <div className="glass rounded-2xl overflow-hidden" style={{ minHeight: 520 }}>
                    <div className="flex h-[520px]">
                        {/* Left: Conversation List */}
                        <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${activeConvo ? "hidden md:flex" : "flex"}`}>
                            <div className="p-4 border-b border-white/5 flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowNew(true)}
                                    className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* New conversation modal */}
                            {showNew && (
                                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                    <p className="text-xs text-slate-400 mb-2">Start a new conversation</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newParticipant}
                                            onChange={(e) => setNewParticipant(e.target.value)}
                                            placeholder="Username or ID"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
                                            onKeyDown={(e) => e.key === "Enter" && handleNewConvo()}
                                        />
                                        <button
                                            onClick={handleNewConvo}
                                            className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium"
                                        >
                                            Start
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="animate-pulse flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10" />
                                                <div className="flex-1">
                                                    <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
                                                    <div className="h-2 bg-white/5 rounded w-1/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                        <MessageCircle className="w-8 h-8 text-slate-600 mb-3" />
                                        <p className="text-sm text-slate-400 mb-1">No conversations yet</p>
                                        <p className="text-xs text-slate-600">Click + to start messaging</p>
                                    </div>
                                ) : (
                                    conversations.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => openThread(c.id)}
                                            className={`w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors ${activeConvo === c.id ? "bg-white/[0.05] border-l-2 border-violet-500" : ""
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-violet-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{getOtherUser(c)}</p>
                                                <p className="text-[10px] text-slate-500">
                                                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right: Message Thread */}
                        <div className={`flex-1 flex flex-col ${activeConvo ? "flex" : "hidden md:flex"}`}>
                            {!activeConvo ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-sm text-slate-500">Select a conversation to start messaging</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Thread header */}
                                    <div className="p-4 border-b border-white/5 flex items-center gap-3">
                                        <button
                                            onClick={() => setActiveConvo(null)}
                                            className="md:hidden p-1.5 rounded-lg glass text-slate-400"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                                            <User className="w-3.5 h-3.5 text-violet-400" />
                                        </div>
                                        <p className="text-sm font-medium text-white">
                                            {conversations.find((c) => c.id === activeConvo)
                                                ? getOtherUser(conversations.find((c) => c.id === activeConvo)!)
                                                : ""}
                                        </p>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {msgLoading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-xs text-slate-500">No messages yet. Say hello! 👋</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => {
                                                const isMine = msg.sender === DEMO_USER;
                                                return (
                                                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                                        <div
                                                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine
                                                                    ? "bg-violet-600 text-white rounded-br-md"
                                                                    : "bg-white/[0.06] text-slate-300 rounded-bl-md"
                                                                }`}
                                                        >
                                                            <p>{msg.content}</p>
                                                            <p className={`text-[10px] mt-1 ${isMine ? "text-violet-200/60" : "text-slate-600"}`}>
                                                                {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={endRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="p-4 border-t border-white/5">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMsg}
                                                onChange={(e) => setNewMsg(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                                placeholder="Type a message..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
                                            />
                                            <button
                                                onClick={handleSend}
                                                disabled={!newMsg.trim()}
                                                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-colors"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
