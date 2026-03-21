"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart2,
  Brain,
  Building2,
  Calendar,
  Compass,
  MessageCircle,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { BentoCard } from "@/components/cards/BentoCard";

const STATS = [
  { label: "Athletes Tracked", value: "2,400+", icon: Users },
  { label: "AI Scout Reports", value: "18k", icon: Brain },
  { label: "Sports Covered", value: "12", icon: Trophy },
  { label: "Avg Score Gain", value: "+14%", icon: Activity },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen dot-bg">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-20 w-[300px] h-[300px] rounded-full bg-violet-600/8 blur-[80px]" />
        <div className="absolute bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-emerald-600/6 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-32">
        {/* Hero */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-blue-400 border border-blue-500/20 mb-8">
            <Sparkles className="w-3 h-3" />
            AI + Web3 Powered Sports Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
            <span className="gradient-text">Find the Next</span>
            <br />
            <span className="text-white">Champion</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 text-balance">
            Proplay uses a custom-built Transformer to generate professional
            scout insights, blockchain-verified performance records, and a full
            sports ecosystem. Built for Shiv Nadar University Chennai.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/onboarding"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
            >
              Create Athlete Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/discover"
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-slate-300 font-semibold text-sm transition-all"
            >
              <Compass className="w-4 h-4" />
              Discover Talent
            </Link>
            <Link
              href="/academy/create"
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-emerald-400 font-semibold text-sm transition-all border border-emerald-500/20"
            >
              <Building2 className="w-4 h-4" />
              Start Academy
            </Link>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">

          {/* Stat tiles row */}
          {STATS.map(({ label, value, icon: Icon }, i) => (
            <BentoCard key={label} index={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            </BentoCard>
          ))}

          {/* Wide: AI Engine card */}
          <BentoCard index={4} className="md:col-span-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">AI Engine</p>
                <h3 className="text-xl font-bold text-white">MiniGPT Virtual Scout</h3>
              </div>
              <Brain className="w-6 h-6 text-blue-400 opacity-60" />
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              A 4-layer, 128-dim decoder-only Transformer built from scratch using the
              Raschka methodology. It tokenizes athlete performance sequences with a
              character-level tokenizer and generates professional scouting narratives.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[["4 Layers", "Transformer"], ["4 Heads", "Attention"], ["128-dim", "Embeddings"]].map(([val, lab]) => (
                <div key={lab} className="glass rounded-xl p-3 text-center">
                  <p className="text-white font-bold text-base">{val}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{lab}</p>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Web3 Verification card */}
          <BentoCard index={5} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-cyan-400 font-semibold uppercase tracking-widest mb-1">Web3</p>
                <h3 className="text-lg font-bold text-white">Blockchain Verified</h3>
              </div>
              <Shield className="w-5 h-5 text-cyan-400 opacity-60" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              Performance records are hashed and stored on-chain via our ProofOfPerformance
              smart contract. Scouts see verified badges they can trust.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              SHA-256 Metric Hashing
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              Polygon L2 Settlement
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              Tamper-Proof Records
            </div>
          </BentoCard>

          {/* Academies card */}
          <BentoCard index={6} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/8 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-1">Academy</p>
                <h3 className="text-lg font-bold text-white">Start & Discover</h3>
              </div>
              <Building2 className="w-5 h-5 text-emerald-400 opacity-60" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Launch a training academy for any sport. Set fees, capacity, and connect
              with aspiring athletes across India.
            </p>
            <Link
              href="/academy/create"
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Start Academy <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </BentoCard>

          {/* Events card */}
          <BentoCard index={7} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/8 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-1">Events</p>
                <h3 className="text-lg font-bold text-white">Open Matches</h3>
              </div>
              <Calendar className="w-5 h-5 text-amber-400 opacity-60" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Find tournaments, open matches, and training sessions happening near you.
              Create your own events and rally players.
            </p>
            <Link
              href="/events"
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Browse Events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </BentoCard>

          {/* Messages card */}
          <BentoCard index={8} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-1">Connect</p>
                <h3 className="text-lg font-bold text-white">Messaging</h3>
              </div>
              <MessageCircle className="w-5 h-5 text-violet-400 opacity-60" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Direct messaging between athletes, coaches, and scouts. Build your
              sports network through real conversations.
            </p>
            <Link
              href="/messages"
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Open Inbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </BentoCard>

          {/* Dashboard Preview */}
          <BentoCard index={9} className="md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-green-500/5 to-transparent pointer-events-none" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Live Analytics</p>
            <h3 className="text-lg font-bold text-white mb-4">Athlete Dashboard</h3>
            <div className="grid grid-cols-4 gap-3">
              {[["Speed", 78], ["Strength", 82], ["Stamina", 71], ["Tactical", 85]].map(([metric, score]) => (
                <div key={metric} className="glass rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{metric}</p>
                  <p className="text-lg font-bold text-white">{score}</p>
                  <div className="mt-2 h-1 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </BentoCard>

          {/* CTA */}
          <BentoCard index={10} className="relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-600/10 to-transparent pointer-events-none rounded-2xl" />
            <div>
              <Zap className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Start Your Journey</h3>
              <p className="text-sm text-slate-400">
                Join the Proplay network and get your first AI scout report in minutes.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/onboarding"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl glass glass-hover text-slate-300 text-sm font-medium transition-all"
              >
                <BarChart2 className="w-4 h-4" />
                View Leaderboard
              </Link>
            </div>
          </BentoCard>

        </div>
      </div>
    </div>
  );
}
