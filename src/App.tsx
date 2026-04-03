/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Activity, Wind, Zap, Award, AlertTriangle,
    Leaf, Droplets, Car, Bike, TrendingUp, CheckCircle2,
    Search, Trophy, Radio, ChevronRight, Bell
} from "lucide-react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const MOCK_USER = {
    name: "Elgün Məmmədov",
    initials: "EM",
    rank: 4,
    blueCoins: 1_240,
    redCoins: 850,
    level: 24,
};

const DAILY_QUESTS = [
    { id: 1, title: "Walk 2 km for Green Points", reward: 50, type: "blue", completed: false, icon: <Bike size={12} /> },
    { id: 2, title: "Maintain eco-speed for 15 min", reward: 35, type: "red", completed: true, icon: <Car size={12} /> },
    { id: 3, title: "Use public transport to 28 May", reward: 40, type: "blue", completed: false, icon: <MapPin size={12} /> },
];

const LEADERBOARD = [
    { rank: 1, name: "Aysel B.", score: 3_200, avatar: "AB", medal: "🥇" },
    { rank: 2, name: "Ceyhun M.", score: 2_950, avatar: "CM", medal: "🥈" },
    { rank: 3, name: "Nigar R.", score: 2_800, avatar: "NR", medal: "🥉" },
];

const ZONES = [
    { id: 1, x: 43, y: 32, label: "28 May", initialType: "pollution" },
    { id: 2, x: 58, y: 62, label: "Port Baku", initialType: "pollution" },
    { id: 3, x: 28, y: 72, label: "Içərişəhər", initialType: "green" },
    { id: 4, x: 76, y: 42, label: "H. Əliyev Mərkəzi", initialType: "pollution" },
];

const AGENT_MESSAGES = [
    { agent: "Traffic Agent", type: "traffic", msg: "Analyzing congestion at 28 May..." },
    { agent: "Air Agent", type: "air", msg: "High CO₂ detected in Center. Wind moving North." },
    { agent: "Green Route Agent", type: "route", msg: "Alternative cycling path identified (85% cleaner)." },
    { agent: "Decision Agent", type: "decision", msg: "Initiating 'What-if' simulation: rerouting 300 vehicles." },
    { agent: "Traffic Agent", type: "traffic", msg: "Baku ring road flow optimized (+12%)." },
    { agent: "Air Agent", type: "air", msg: "Sahil AQI updated: 24 (Excellent)." },
    { agent: "Green Route Agent", type: "route", msg: "Metro Line 2 ridership spike → 900 t CO₂ avoided." },
    { agent: "Decision Agent", type: "decision", msg: "Green Zone expansion approved for Nizami St." },
];

const AGENT_COLOR: Record<string, string> = {
    traffic: "#f59e0b",
    air: "#60a5fa",
    route: "#34d399",
    decision: "#a78bfa",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl ${className}`}>
        {children}
    </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">{children}</p>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function GreenStepDashboard() {
    const [optimizationLevel, setOptimizationLevel] = useState(0);
    const [logs, setLogs] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Simulate real-time AI agent logs
    useEffect(() => {
        let idx = 0;
        const tick = () => {
            setLogs((prev) =>
                [{ ...AGENT_MESSAGES[idx % AGENT_MESSAGES.length], id: Date.now() + idx }, ...prev].slice(0, 20)
            );
            idx++;
        };
        tick(); // show first log immediately
        const id = setInterval(tick, 4_000);
        return () => clearInterval(id);
    }, []);

    const aqi = Math.round(Math.max(22, 115 - optimizationLevel * 0.93));
    const oxygen = Math.round(Math.min(98, 48 + optimizationLevel * 0.5));
    const aqiGood = aqi < 60;
    const aqiColor = aqiGood ? "#34d399" : aqi < 90 ? "#f59e0b" : "#f87171";

    return (
        <div className="min-h-screen bg-[#030712] text-neutral-100 flex overflow-hidden font-sans">

            {/* ── Background Ambient Glows ─────────────────────────────────── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-emerald-800/20 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-900/15 rounded-full blur-[200px] translate-y-1/3 -translate-x-1/4" />
                <div className="absolute inset-0 bg-[#030712]/60" />
                {/* Subtle grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* ═══════════════════════════════════════════════════
          LEFT SIDEBAR
      ═══════════════════════════════════════════════════ */}
            <aside className="w-[300px] shrink-0 hidden lg:flex flex-col border-r border-white/[0.06] bg-black/50 backdrop-blur-3xl z-20 relative p-7 gap-8">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center"
                        style={{ boxShadow: "0 0 24px rgba(52,211,153,0.5)" }}
                    >
                        <Leaf className="text-black" size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-black text-lg tracking-tight text-white leading-none">GREEN STEP</h1>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.25em] mt-0.5">Baku Eco-OS</p>
                    </div>
                </div>

                {/* User Profile */}
                <GlassCard className="p-5 relative overflow-hidden">
                    {/* Decorative corner glow */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                    <div className="flex items-center gap-4 mb-5">
                        <div
                            className="w-[56px] h-[56px] rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 p-[2px]"
                            style={{ boxShadow: "0 0 20px rgba(52,211,153,0.25)" }}
                        >
                            <div className="w-full h-full rounded-2xl bg-neutral-900 flex items-center justify-center font-black text-base">
                                {MOCK_USER.initials}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Elite Eco-Citizen</p>
                            <h2 className="font-bold text-white text-sm leading-tight">{MOCK_USER.name}</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4">
                        <div>
                            <SectionLabel>Eco Rank</SectionLabel>
                            <p
                                className="text-3xl font-black mt-1 text-emerald-400"
                                style={{ textShadow: "0 0 20px rgba(52,211,153,0.6)" }}
                            >
                                #{MOCK_USER.rank < 10 ? `0${MOCK_USER.rank}` : MOCK_USER.rank}
                            </p>
                        </div>
                        <div>
                            <SectionLabel>Level</SectionLabel>
                            <p className="text-3xl font-black text-white mt-1">{MOCK_USER.level}</p>
                        </div>
                    </div>
                    {/* XP bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-neutral-500 mb-2">
                            <span>XP Progress</span><span className="text-emerald-400 font-bold">74%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "74%" }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                style={{ boxShadow: "0 0 8px rgba(52,211,153,0.6)" }}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Wallets */}
                <div className="space-y-3">
                    <SectionLabel>Eco Wallets</SectionLabel>
                    {/* Blue Coins */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between cursor-default"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                                <Bike size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Blue Coins</p>
                                <p className="text-xs font-semibold text-neutral-300">Active Mobility</p>
                            </div>
                        </div>
                        <p
                            className="text-xl font-black text-blue-400"
                            style={{ textShadow: "0 0 14px rgba(96,165,250,0.7)" }}
                        >
                            {MOCK_USER.blueCoins.toLocaleString()}
                        </p>
                    </motion.div>

                    {/* Red Coins */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between cursor-default"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
                                <Car size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Red Coins</p>
                                <p className="text-xs font-semibold text-neutral-300">Eco Driving</p>
                            </div>
                        </div>
                        <p
                            className="text-xl font-black text-rose-400"
                            style={{ textShadow: "0 0 14px rgba(251,113,133,0.7)" }}
                        >
                            {MOCK_USER.redCoins.toLocaleString()}
                        </p>
                    </motion.div>
                </div>

                {/* Mini Leaderboard */}
                <GlassCard className="p-5 mt-auto">
                    <div className="flex items-center justify-between mb-5">
                        <SectionLabel>Global Top</SectionLabel>
                        <Trophy size={15} className="text-yellow-400" style={{ filter: "drop-shadow(0 0 5px rgba(234,179,8,0.6))" }} />
                    </div>
                    <div className="space-y-4">
                        {LEADERBOARD.map((item) => (
                            <div key={item.rank} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-base">{item.medal}</span>
                                    <div className="w-8 h-8 rounded-xl bg-neutral-800/80 border border-white/10 flex items-center justify-center text-[10px] font-black">
                                        {item.avatar}
                                    </div>
                                    <span className="text-xs font-medium text-neutral-300">{item.name}</span>
                                </div>
                                <span
                                    className="text-xs font-black text-emerald-400"
                                    style={{ textShadow: "0 0 8px rgba(52,211,153,0.5)" }}
                                >
                                    {item.score.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </aside>

            {/* ═══════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════ */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">

                {/* ── Navbar ─────────────────────────────────────── */}
                <header className="shrink-0 h-[72px] px-8 flex items-center justify-between border-b border-white/[0.06] bg-black/30 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex items-center gap-2">
                            <Leaf className="text-emerald-400" size={22} />
                            <span className="font-black tracking-wider">GS</span>
                        </div>

                        {/* Search */}
                        <div className="hidden md:flex bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-2.5 w-[380px] items-center gap-3 focus-within:border-emerald-500/40 transition-colors">
                            <Search size={16} className="text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Search eco-routes, zones..."
                                className="bg-transparent text-sm outline-none w-full text-neutral-200 placeholder:text-neutral-600 font-medium"
                            />
                        </div>
                    </div>

                    {/* Stats & Notifications */}
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex gap-6">
                            <div className="text-right">
                                <SectionLabel>Baku AQI</SectionLabel>
                                <motion.div
                                    animate={{ color: aqiColor }}
                                    className="flex items-center justify-end gap-2 font-black text-xl mt-0.5"
                                >
                                    <Wind size={16} />
                                    {aqi}
                                </motion.div>
                            </div>
                            <div className="w-px h-10 bg-white/10 self-center" />
                            <div className="text-right">
                                <SectionLabel>O₂ Balance</SectionLabel>
                                <div className="flex items-center justify-end gap-2 font-black text-xl text-blue-400 mt-0.5"
                                    style={{ textShadow: "0 0 12px rgba(96,165,250,0.6)" }}>
                                    <Droplets size={16} />
                                    {oxygen}%
                                </div>
                            </div>
                        </div>

                        <button className="relative p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-colors">
                            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full"
                                style={{ boxShadow: "0 0 6px rgba(52,211,153,0.9)" }} />
                            <Bell size={18} className="text-neutral-400" />
                        </button>
                    </div>
                </header>

                {/* ── Page Title ─────────────────────────────────── */}
                <div className="shrink-0 px-8 pt-7 pb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                            <span className="text-emerald-400 italic" style={{ textShadow: "0 0 20px rgba(52,211,153,0.4)" }}>
                                AI-Based
                            </span>{" "}
                            Eco Mobility
                        </h2>
                        <p className="text-neutral-500 text-sm font-medium mt-1">Baku city optimization — real-time</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-300 hover:bg-white/[0.08] transition-colors">
                            Report
                        </button>
                        <button
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95"
                            style={{ boxShadow: "0 0 24px rgba(52,211,153,0.35)" }}
                        >
                            Deploy Agents
                        </button>
                    </div>
                </div>

                {/* ── Content Grid ───────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-full">

                        {/* ── MAP CARD (2/3 width) ─────────────────── */}
                        <GlassCard className="xl:col-span-2 relative overflow-hidden flex flex-col min-h-[520px]">

                            {/* Map BG — stylized Baku grid */}
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 to-blue-950/20" />
                                <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#34d399" strokeWidth="0.6" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#mapgrid)" />
                                    {/* Conceptual Caspian coastline */}
                                    <path d="M0 75 Q25 68 40 50 T75 40 T100 55 T120 48" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.4" vectorEffect="non-scaling-stroke" />
                                    {/* Roads */}
                                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#34d399" strokeWidth="0.8" opacity="0.25" />
                                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#34d399" strokeWidth="0.8" opacity="0.25" />
                                    <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#34d399" strokeWidth="0.4" opacity="0.15" />
                                    <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#34d399" strokeWidth="0.4" opacity="0.15" />
                                    <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#34d399" strokeWidth="0.4" opacity="0.15" />
                                </svg>
                            </div>

                            {/* Vignette */}
                            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#030712]/60 via-transparent to-[#030712]/90 pointer-events-none" />

                            {/* Live tag */}
                            <div className="absolute top-5 left-5 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 font-mono">Baku Live Scan</span>
                            </div>

                            {/* Coords badge */}
                            <div className="absolute top-5 right-5 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
                                <span className="text-[10px] font-mono text-neutral-500">40.4093°N, 49.8671°E</span>
                            </div>

                            {/* Zone markers */}
                            <div className="relative z-[2] flex-1 flex items-center justify-center p-12">
                                <div className="relative w-full h-full" style={{ minHeight: 300 }}>
                                    {ZONES.map((zone, i) => {
                                        const isPollution = zone.initialType === "pollution";
                                        const threshold = 30 * (i + 1) - 20;
                                        const cured = isPollution && optimizationLevel >= threshold;
                                        const isGreen = !isPollution || cured;
                                        const color = isGreen ? "#34d399" : "#f87171";
                                        const shadow = isGreen
                                            ? "0 0 24px rgba(52,211,153,0.8)"
                                            : "0 0 24px rgba(248,113,113,0.8)";

                                        return (
                                            <motion.div
                                                key={zone.id}
                                                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-help"
                                                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
                                            >
                                                {/* Pulse ring */}
                                                <AnimatePresence>
                                                    {!isGreen && (
                                                        <motion.div
                                                            key="pulse"
                                                            className="absolute inset-0 rounded-full pointer-events-none"
                                                            style={{ background: "rgba(248,113,113,0.25)" }}
                                                            initial={{ scale: 1, opacity: 0.8 }}
                                                            animate={{ scale: 3, opacity: 0 }}
                                                            exit={{ scale: 1, opacity: 0 }}
                                                            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                                                        />
                                                    )}
                                                </AnimatePresence>

                                                {/* Circle icon */}
                                                <motion.div
                                                    animate={{ backgroundColor: color, boxShadow: shadow }}
                                                    transition={{ duration: 0.8 }}
                                                    className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center relative"
                                                >
                                                    <motion.div animate={{ rotate: isGreen ? 0 : 180 }} transition={{ duration: 0.6 }}>
                                                        {isGreen ? <Leaf size={16} className="text-black" /> : <AlertTriangle size={14} className="text-white" />}
                                                    </motion.div>
                                                </motion.div>

                                                {/* Zone label tooltip */}
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-bold font-mono text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    {zone.label}: <span style={{ color }}>{isGreen ? "GREEN ✓" : "POLLUTED"}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Optimization Slider ── */}
                            <div className="relative z-10 m-5 bg-black/60 backdrop-blur-2xl rounded-2xl p-5 border border-white/[0.08]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-white">Optimize City Flow</p>
                                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Running Simulation v4.0 — AI Mode</p>
                                        </div>
                                    </div>
                                    <motion.p
                                        key={optimizationLevel}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-3xl font-black text-emerald-400 font-mono tabular-nums"
                                        style={{ textShadow: "0 0 20px rgba(52,211,153,0.5)" }}
                                    >
                                        {optimizationLevel}%
                                    </motion.p>
                                </div>

                                {/* Custom slider */}
                                <div className="relative">
                                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                                            animate={{ width: `${optimizationLevel}%` }}
                                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                            style={{ boxShadow: "0 0 12px rgba(52,211,153,0.5)" }}
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min={0} max={100}
                                        value={optimizationLevel}
                                        onChange={(e) => setOptimizationLevel(+e.target.value)}
                                        onMouseDown={() => setIsDragging(true)}
                                        onMouseUp={() => setIsDragging(false)}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
                                        style={{ margin: 0 }}
                                    />
                                    {/* Thumb visual */}
                                    <motion.div
                                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-2 border-emerald-400 pointer-events-none"
                                        animate={{ left: `calc(${optimizationLevel}% - 10px)`, scale: isDragging ? 1.4 : 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        style={{ boxShadow: "0 0 10px rgba(52,211,153,0.6)" }}
                                    />
                                </div>

                                <div className="flex justify-between mt-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest font-mono">
                                    <span>Current State</span>
                                    <span className="text-blue-500">AI-Optimized Future</span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* ── RIGHT COLUMN ─────────────────────────── */}
                        <div className="flex flex-col gap-6">

                            {/* Analytics */}
                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <SectionLabel>City Analytics</SectionLabel>
                                    <TrendingUp size={16} className="text-emerald-400" />
                                </div>

                                {/* AQI bar */}
                                <div className="mb-5">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-neutral-400 font-medium flex items-center gap-2">
                                            <Wind size={13} className="text-blue-400" /> AQI Index
                                        </span>
                                        <motion.span
                                            animate={{ color: aqiColor }}
                                            className="font-black tabular-nums"
                                        >
                                            {aqi}
                                        </motion.span>
                                    </div>
                                    <div className="h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            animate={{ width: `${(aqi / 150) * 100}%`, backgroundColor: aqiColor }}
                                            transition={{ duration: 0.6 }}
                                            style={{ boxShadow: `0 0 10px ${aqiColor}80` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-neutral-600 mt-1.5 font-mono">
                                        <span>Excellent (0)</span><span>Hazardous (150+)</span>
                                    </div>
                                </div>

                                {/* O2 Balance bar */}
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-neutral-400 font-medium flex items-center gap-2">
                                            <Droplets size={13} className="text-emerald-400" /> O₂ Balance
                                        </span>
                                        <span className="font-black text-emerald-400 tabular-nums">{oxygen}%</span>
                                    </div>
                                    <div className="h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                                            animate={{ width: `${oxygen}%` }}
                                            transition={{ duration: 0.6 }}
                                            style={{ boxShadow: "0 0 10px rgba(52,211,153,0.5)" }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-neutral-600 mt-1.5 font-mono">
                                        <span>Critical (0)</span><span>Optimal (100%)</span>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* AI Agent Live Feed */}
                            <GlassCard className="p-6 flex flex-col flex-1 overflow-hidden" style={{ maxHeight: 340 }}>
                                <div className="flex items-center justify-between mb-5 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400">
                                            <Zap size={16} />
                                        </div>
                                        <SectionLabel>Agent Live Feed</SectionLabel>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" style={{ boxShadow: "0 0 5px #34d399" }} />
                                        <span className="text-[10px] font-bold text-neutral-500 uppercase font-mono">Live</span>
                                    </div>
                                </div>

                                <div
                                    ref={logContainerRef}
                                    className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar font-mono text-[11px]"
                                >
                                    <AnimatePresence initial={false}>
                                        {logs.map((log) => (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: 20, height: 0 }}
                                                animate={{ opacity: 1, x: 0, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="relative pl-4 border-l-2"
                                                style={{ borderColor: AGENT_COLOR[log.type] ?? "#fff" }}
                                            >
                                                <p className="font-bold mb-0.5" style={{ color: AGENT_COLOR[log.type] }}>
                                                    {log.agent}
                                                </p>
                                                <p className="text-neutral-400 leading-relaxed">{log.msg}</p>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2 shrink-0">
                                    <Radio size={12} className="text-emerald-400 animate-pulse" />
                                    <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest font-mono">
                                        Synced · Baku Mainframe
                                    </span>
                                </div>
                            </GlassCard>

                            {/* Daily Quests */}
                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <SectionLabel>Daily Quests</SectionLabel>
                                    <Award size={15} className="text-blue-400" />
                                </div>
                                <div className="space-y-3">
                                    {DAILY_QUESTS.map((quest) => (
                                        <motion.div
                                            key={quest.id}
                                            whileHover={{ scale: 1.015 }}
                                            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors cursor-default ${quest.completed
                                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                                    : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07]"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${quest.completed
                                                            ? "bg-emerald-500 border-emerald-500 text-black"
                                                            : "border-neutral-700"
                                                        }`}
                                                >
                                                    {quest.completed && <CheckCircle2 size={13} />}
                                                </div>
                                                <span
                                                    className={`text-xs font-medium ${quest.completed ? "text-neutral-600 line-through" : "text-neutral-300"
                                                        }`}
                                                >
                                                    {quest.title}
                                                </span>
                                            </div>
                                            <div
                                                className={`text-[10px] font-black px-2.5 py-1 rounded-lg bg-black/40 shrink-0 ${quest.type === "blue" ? "text-blue-400" : "text-rose-400"
                                                    }`}
                                            >
                                                +{quest.reward} {quest.type === "blue" ? "BC" : "RC"}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <button className="mt-4 w-full py-2.5 text-xs font-bold text-neutral-500 hover:text-white border border-white/[0.07] rounded-2xl flex items-center justify-center gap-2 hover:bg-white/[0.04] transition-all">
                                    View All Quests <ChevronRight size={13} />
                                </button>
                            </GlassCard>

                        </div>
                        {/* end right column */}
                    </div>
                    {/* end grid */}
                </div>
                {/* end content */}
            </main>
        </div>
    );
}
