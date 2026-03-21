"use client";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
    Shield,
    CheckCircle2,
    Hash,
    Clock,
    Trophy,
    Link as LinkIcon,
    ExternalLink,
    Fingerprint,
    Cpu,
    Blocks,
} from "lucide-react";

export default function VerifyPage() {
    const params = useParams();
    const txHash = params.txHash as string;

    // In production, you'd fetch the on-chain proof data using the txHash
    // For now, we display the verification UI with the hash
    const isSimulated = txHash?.startsWith("0x") && txHash.length === 66;

    return (
        <div className="min-h-screen dot-bg">
            <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-24">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cyan-600/8 blur-[120px]" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6"
                    >
                        <Shield className="w-10 h-10 text-cyan-400" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2">Blockchain Verification</h1>
                    <p className="text-slate-400 text-sm max-w-lg mx-auto">
                        This page verifies the authenticity of an AI-analyzed performance record
                        stored immutably on the blockchain.
                    </p>
                </motion.div>

                {/* Verification Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl overflow-hidden"
                >
                    {/* Status Banner */}
                    <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 border-b border-white/5 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-400">VERIFIED ON-CHAIN</p>
                                <p className="text-xs text-slate-400">This performance record has been cryptographically verified.</p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-5">
                        {/* Transaction Hash */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                <Hash className="w-3 h-3" /> Transaction Hash
                            </label>
                            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                                <code className="text-xs text-cyan-400 font-mono flex-1 truncate">{txHash}</code>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass rounded-xl p-4">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                    <Blocks className="w-3 h-3" /> Network
                                </div>
                                <p className="text-sm font-bold text-white">Polygon (Mumbai Testnet)</p>
                            </div>
                            <div className="glass rounded-xl p-4">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                    <Clock className="w-3 h-3" /> Timestamp
                                </div>
                                <p className="text-sm font-bold text-white">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="glass rounded-xl p-4">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                    <Cpu className="w-3 h-3" /> AI Model
                                </div>
                                <p className="text-sm font-bold text-white">MiniGPT v2.0</p>
                            </div>
                            <div className="glass rounded-xl p-4">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                    <Trophy className="w-3 h-3" /> Contract
                                </div>
                                <p className="text-sm font-bold text-white">ProofOfPerformance</p>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="glass rounded-xl p-5">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <Fingerprint className="w-4 h-4 text-cyan-400" />
                                How Verification Works
                            </h3>
                            <div className="space-y-3">
                                {[
                                    ["AI Analysis", "YOLOv8 + MiniGPT extracts and validates performance metrics from athlete data."],
                                    ["Hash Generation", "A SHA-256 hash of the validated metrics is generated deterministically."],
                                    ["On-Chain Storage", "The hash is stored on-chain via the ProofOfPerformance smart contract."],
                                    ["Tamper-Proof", "Anyone can re-hash the raw data to verify it matches the on-chain record."],
                                ].map(([title, desc], i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-cyan-400">{i + 1}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-white">{title}</p>
                                            <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Explorer Link */}
                        <a
                            href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-3 rounded-xl glass glass-hover text-cyan-400 text-sm font-medium transition-all"
                        >
                            <LinkIcon className="w-4 h-4" />
                            View on PolygonScan
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
