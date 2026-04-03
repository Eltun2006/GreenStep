/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import {
    Activity, Wind, Zap, AlertTriangle,
    Leaf, Droplets, Car, Bike, CheckCircle2,
    Search, Trophy, Radio, Bell, X, ShieldCheck,
    ShoppingBag, TreePine, Bus, Fuel, Gift,
    ChevronRight, Award, Star, Target, Info, Navigation, Footprints
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const BAKU_CENTER: [number, number] = [40.3798, 49.8488];

const ROUTES: Record<string, [number, number][]> = {
    "sahil": [
        [40.3798, 49.8488], [40.3760, 49.8480], [40.3720, 49.8470], [40.3700, 49.8430], [40.3680, 49.8400]
    ],
    "nizami": [
        [40.3798, 49.8488], [40.3820, 49.8450], [40.3840, 49.8420], [40.3860, 49.8380], [40.3880, 49.8350]
    ],
    "port": [
        [40.3798, 49.8488], [40.3780, 49.8550], [40.3770, 49.8620], [40.3760, 49.8660]
    ]
};

const LEADERBOARD_DATA = [
    { rank: 1, name: "Aysel B.", score: 3200, avatar: "AB", medal: "🥇", tier: "Emerald" },
    { rank: 2, name: "Ceyhun M.", score: 2950, avatar: "CM", medal: "🥈", tier: "Gold" },
    { rank: 3, name: "Nigar R.", score: 2800, avatar: "NR", medal: "🥉", tier: "Gold" },
    { rank: 4, name: "Elgün M.", score: 2450, avatar: "EM", medal: "⭐", tier: "Silver" },
    { rank: 5, name: "Tural S.", score: 2100, avatar: "TS", medal: "🎖️", tier: "Silver" },
];

const MARKETPLACE_ITEMS = [
    { id: 1, name: "Narimanov Green Zone", cost: 500, type: "blue", icon: <TreePine />, color: "text-emerald-400" },
    { id: 2, name: "BakuCard 10x Refill", cost: 300, type: "blue", icon: <Bus />, color: "text-blue-400" },
    { id: 3, name: "EV Hub Charging Pass", cost: 250, type: "red", icon: <Fuel />, color: "text-rose-400" },
    { id: 4, name: "Elite Driver Emblem", cost: 800, type: "red", icon: <Award />, color: "text-yellow-400" },
];

const ZONES = [
    { id: 1, coords: [40.3798, 49.8488] as [number, number], label: "28 May" },
    { id: 2, coords: [40.3776, 49.8660] as [number, number], label: "Port Baku" },
    { id: 3, coords: [40.3661, 49.8335] as [number, number], label: "Içərişəhər" },
    { id: 4, coords: [40.3953, 49.8671] as [number, number], label: "H. Əliyev Mərkəzi" },
];

const AGENT_MOCK_LOGS = [
    { agent: "Traffic Agent", type: "traffic", msg: "Optimizing Sahil junction." },
    { agent: "Air Agent", type: "air", msg: "Pollution drop at Nizami." },
    { agent: "Decision Agent", type: "decision", msg: "Rerouting to Green Path 4." },
    { agent: "Route Agent", type: "route", msg: "Bike lane priority active." },
];

// ─── STYLED COMPONENTS ──────────────────────────────────────────────────────────

const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <div onClick={onClick} className={`bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl ${className} ${onClick ? 'cursor-pointer hover:bg-white/[0.08] transition-all' : ''}`}>
        {children}
    </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">{children}</p>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-black text-xl text-white uppercase italic tracking-tighter">{title}</h3>
                        <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors"><X size={20} /></button>
                    </div>
                    <div className="p-8 overflow-y-auto max-h-[75vh] custom-scrollbar">{children}</div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function GreenStepDashboard() {
    const [optimization, setOptimization] = useState(0);
    const [coins, setCoins] = useState({ blue: 1240, red: 850 });
    const [logs, setLogs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeRoute, setActiveRoute] = useState<string | null>(null);
    const [transportMode, setTransportMode] = useState<"walk" | "drive">("walk");
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showMarket, setShowMarket] = useState(false);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const polylineRef = useRef<L.Polyline | null>(null);

    // Initialize Map
    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, { center: BAKU_CENTER, zoom: 13, zoomControl: false, attributionControl: false });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
            ZONES.forEach((z) => {
                L.marker(z.coords, { icon: DefaultIcon }).addTo(mapInstance.current!).bindPopup(`<b style="font-family:Inter; color:#000">${z.label}</b>`);
            });
        }
        return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
    }, []);

    // Update Route Polyline
    useEffect(() => {
        if (!mapInstance.current) return;

        if (polylineRef.current) {
            mapInstance.current.removeLayer(polylineRef.current);
            polylineRef.current = null;
        }

        if (activeRoute && ROUTES[activeRoute]) {
            polylineRef.current = L.polyline(ROUTES[activeRoute], {
                color: transportMode === 'walk' ? '#10b981' : '#f59e0b',
                weight: 6,
                opacity: 0.8,
                lineJoin: 'round',
                shadowBlur: 10,
                shadowColor: transportMode === 'walk' ? '#10b981' : '#f59e0b'
            }).addTo(mapInstance.current);

            mapInstance.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
        }
    }, [activeRoute, transportMode]);

    // AI Logs Logic
    useEffect(() => {
        const id = setInterval(() => {
            setLogs(p => [{ ...AGENT_MOCK_LOGS[Math.floor(Math.random() * 4)], id: Date.now() }, ...p].slice(0, 8));
        }, 4000);
        return () => clearInterval(id);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.toLowerCase();
        if (ROUTES[q]) {
            setActiveRoute(q);
        } else {
            setActiveRoute(null);
        }
    };

    const buy = (item: any) => {
        const type = item.type as "blue" | "red";
        if (coins[type] >= item.cost) {
            setCoins(p => ({ ...p, [type]: p[type] - item.cost }));
            alert(`${item.name} unlocked!`);
        } else {
            alert("Insufficient coins.");
        }
    };

    const aqiValue = Math.max(22, 115 - optimization);
    const aqiColor = aqiValue < 60 ? "#10b981" : aqiValue < 90 ? "#f59e0b" : "#ef4444";

    return (
        <div className="min-h-screen bg-[#030712] text-neutral-100 flex overflow-hidden font-sans selection:bg-emerald-500/30">

            {/* SIDEBAR */}
            <aside className="w-[300px] shrink-0 hidden lg:flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-3xl z-30 p-7 gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <Leaf className="text-black" size={22} />
                    </div>
                    <div>
                        <h1 className="font-black text-lg text-white">GREEN STEP</h1>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Baku Eco-OS</p>
                    </div>
                </div>

                <GlassCard className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-white/10 flex items-center justify-center font-black">EM</div>
                        <div className="overflow-hidden">
                            <SectionLabel>Elite Citizen</SectionLabel>
                            <p className="font-bold text-sm text-white truncate">Elgün Məmmədov</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-white/5 mt-4 pt-4">
                        <div><SectionLabel>Rank</SectionLabel><p className="text-2xl font-black text-emerald-400">#04</p></div>
                        <div><SectionLabel>Impact</SectionLabel><p className="text-2xl font-black text-white">1450</p></div>
                    </div>
                </GlassCard>

                <div className="space-y-4">
                    <SectionLabel>Wallets</SectionLabel>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex justify-between items-center group cursor-default">
                        <div className="flex items-center gap-3"><Bike size={18} className="text-blue-400" /><span className="text-xs font-bold text-neutral-400">Active</span></div>
                        <span className="font-black text-blue-400 text-lg group-hover:scale-110 transition-transform">{coins.blue}</span>
                    </div>
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex justify-between items-center group cursor-default">
                        <div className="flex items-center gap-3"><Car size={18} className="text-rose-400" /><span className="text-xs font-bold text-neutral-400">Drive</span></div>
                        <span className="font-black text-rose-400 text-lg group-hover:scale-110 transition-transform">{coins.red}</span>
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <GlassCard onClick={() => setShowMarket(true)} className="p-4 flex items-center justify-between border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3"><ShoppingBag size={18} className="text-emerald-400" /><span className="text-xs font-black uppercase italic">Marketplace</span></div>
                        <ChevronRight size={14} className="opacity-40" />
                    </GlassCard>
                    <GlassCard onClick={() => setShowLeaderboard(true)} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Trophy size={18} className="text-yellow-500" /><span className="text-xs font-black uppercase italic">Leaderboard</span></div>
                        <ChevronRight size={14} className="opacity-40" />
                    </GlassCard>
                </div>
            </aside>

            {/* CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-[72px] px-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl z-40">
                    <div className="flex items-center gap-8">
                        <form onSubmit={handleSearch} className="flex bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 w-[340px] items-center gap-3 focus-within:border-emerald-500/50 transition-colors">
                            <Search size={16} className="opacity-40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search destination (Sahil, Nizami, Port)..."
                                className="bg-transparent text-sm outline-none w-full text-white placeholder:text-neutral-600"
                            />
                        </form>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right"><SectionLabel>AQI INDEX</SectionLabel><p className="font-black text-xl transition-colors duration-500" style={{ color: aqiColor }}>{aqiValue}</p></div>
                        <div className="w-[1px] h-8 bg-white/10 mx-2" />
                        <button onClick={() => setOptimization(p => Math.min(100, p + 20))} className="px-6 py-2.5 bg-emerald-500 rounded-2xl text-xs font-black text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] uppercase tracking-tighter hover:brightness-110 active:scale-95 transition-all">Deploy Agents</button>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-hidden relative">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
                        <GlassCard className="xl:col-span-2 overflow-hidden relative shadow-2xl">
                            <div ref={mapRef} className="absolute inset-0 z-0 grayscale-[0.2]" />

                            {/* Route HUD */}
                            <AnimatePresence>
                                {activeRoute && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute top-6 left-6 z-20 space-y-3">
                                        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl w-[260px]">
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                                <SectionLabel>Transport Mode</SectionLabel>
                                                <div className="flex bg-white/5 rounded-lg p-1">
                                                    <button
                                                        onClick={() => setTransportMode("walk")}
                                                        className={`p-1.5 rounded-md transition-all ${transportMode === 'walk' ? 'bg-emerald-500 text-black shadow-lg' : 'text-neutral-500'}`}
                                                    >
                                                        <Footprints size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setTransportMode("drive")}
                                                        className={`p-1.5 rounded-md transition-all ${transportMode === 'drive' ? 'bg-rose-500 text-white shadow-lg' : 'text-neutral-500'}`}
                                                    >
                                                        <Car size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[8px] font-bold text-neutral-500 uppercase">Est. Reward</p>
                                                        <p className={`text-xl font-black ${transportMode === 'walk' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                            +{transportMode === 'walk' ? '150' : '45'} {transportMode === 'walk' ? 'Blue' : 'Red'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-bold text-neutral-500 uppercase">Route AQI</p>
                                                        <p className="text-sm font-black text-white">Excellent</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setActiveRoute(null); setSearchQuery(""); }} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase text-neutral-300 rounded-xl transition-all active:scale-[0.98]">Cancel Trip</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="absolute bottom-8 left-8 right-8 z-10 bg-black/80 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                                <div className="flex justify-between items-center mb-5">
                                    <SectionLabel>City Optimization</SectionLabel>
                                    <p className="text-3xl font-black text-emerald-400 tracking-tighter">{optimization}%</p>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" animate={{ width: `${optimization}%` }} />
                                </div>
                            </div>
                        </GlassCard>

                        <div className="flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                            <GlassCard className="p-7 h-[300px] flex flex-col">
                                <SectionLabel>Live Signals</SectionLabel>
                                <div className="mt-5 flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {logs.map(l => (
                                        <div key={l.id} className="text-[10px] font-mono border-l-2 pl-4 py-1.5 animate-in slide-in-from-left-2 duration-300" style={{ borderColor: l.type === 'traffic' ? '#f59e0b' : '#60a5fa' }}>
                                            <p className="opacity-50 uppercase font-bold tracking-widest">{l.agent}</p>
                                            <p className="text-neutral-200 mt-1">{l.msg}</p>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                            <GlassCard className="p-7">
                                <SectionLabel>Active Protocols</SectionLabel>
                                <div className="mt-5 space-y-3">
                                    {['Baku City Cycling Path', 'Electric Metro Sync', 'Parks expansion'].map((p, i) => (
                                        <div key={p} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                            <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{p}</span>
                                            <CheckCircle2 size={16} className="text-emerald-400" />
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODALS */}
            <Modal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} title="Citizen Board">
                <div className="space-y-3">
                    {LEADERBOARD_DATA.map(user => (
                        <div key={user.rank} className={`p-5 rounded-2xl border flex justify-between items-center transition-all ${user.rank === 4 ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black opacity-30">#{user.rank}</span>
                                <p className="font-bold text-sm text-white">{user.name} {user.medal}</p>
                            </div>
                            <p className="font-black text-emerald-400 uppercase tracking-widest">{user.score} pt</p>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={showMarket} onClose={() => setShowMarket(false)} title="Eco Shop">
                <div className="grid grid-cols-1 gap-4">
                    {MARKETPLACE_ITEMS.map(item => (
                        <GlassCard key={item.id} className="p-5 flex items-center justify-between border-white/5 hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl bg-white/5 ${item.color} shadow-inner`}>{item.icon}</div>
                                <div><p className="font-black text-sm italic text-white tracking-tight">{item.name}</p><p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{item.cost} {item.type} coins</p></div>
                            </div>
                            <button onClick={() => buy(item)} className="px-6 py-2 bg-white/10 hover:bg-emerald-500 hover:text-black transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">Unseal</button>
                        </GlassCard>
                    ))}
                </div>
            </Modal>

            <AnimatePresence>
                {optimization >= 100 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/60 backdrop-blur-2xl">
                        <GlassCard className="relative w-full max-w-sm p-12 flex flex-col items-center text-center shadow-2xl border-emerald-500/30 bg-[#050505]">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20">
                                <ShieldCheck size={56} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            </div>
                            <h3 className="text-3xl font-black italic tracking-tighter text-white">OS SYNCHRONIZED</h3>
                            <p className="text-[11px] text-neutral-400 mt-4 leading-relaxed font-bold uppercase tracking-widest px-4">Baku Ecological Systems at 100% Efficiency</p>
                            <button onClick={() => setOptimization(0)} className="mt-8 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95">Re-initialize Environment</button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
