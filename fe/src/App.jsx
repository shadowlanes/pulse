import React, { useEffect, useState } from "react";
import PulseCalendar from "./components/PulseCalendar";
import PulseMetrics from "./components/PulseMetrics";
import Atmosphere from "./components/Atmosphere";
import { motion, AnimatePresence } from "framer-motion";

function App() {
    const [history, setHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);

        fetch(`${import.meta.env.VITE_API_URL}/api/pulse/history?start=${start.toISOString()}&end=${end.toISOString()}`)
            .then(res => res.json())
            .then(data => {
                setHistory(data);
                if (data.length > 0) {
                    const latest = data[data.length - 1];
                    setSelectedDate(latest.date);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch history", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!selectedDate) return;
        fetch(`${import.meta.env.VITE_API_URL}/api/pulse/details/${selectedDate.split('T')[0]}`)
            .then(res => res.json())
            .then(data => setDetails(data))
            .catch(err => console.error("Failed to fetch details", err));
    }, [selectedDate]);

    const rollingAverage = history.length > 0
        ? history.reduce((acc, p) => acc + p.score, 0) / history.length
        : 5;

    if (loading) return null;

    return (
        <div className="min-h-screen text-neutral-50 selection:bg-primary/30 relative">
            <Atmosphere score={rollingAverage} />

            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <h1 className="text-xl font-black tracking-tighter">PULSE</h1>
                    </div>
                    <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                        Current Climate: {rollingAverage.toFixed(1)}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-20">
                    <PulseMetrics score={rollingAverage} />
                    <div className="mt-12 flex flex-col md:flex-row gap-12 items-start">
                        <div className="w-full md:w-1/3">
                            <PulseCalendar
                                history={history}
                                selectedDate={selectedDate}
                                onSelect={(d) => setSelectedDate(d)}
                            />
                        </div>
                        <div className="w-full md:w-2/3">
                            <AnimatePresence mode="wait">
                                {details && (
                                    <motion.div
                                        key={selectedDate}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl relative"
                                    >
                                        {/* Sticky Score Context */}
                                        <div className="sticky top-0 z-20 px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/10 rounded-t-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-black tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    {details.score.toFixed(1)}
                                                </span>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${details.status === 'Good' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {details.status === 'Good' ? 'Steady' : 'Arrythmia'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                                {selectedDate.split('T')[0]}
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-3xl font-black tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    Daily Archive
                                                </h3>
                                                <div className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
                                                    Status: {details.status === 'Good' ? 'OPTIMAL' : 'DISTRESSED'}
                                                </div>
                                            </div>

                                            <div className="mb-10 text-neutral-200 leading-relaxed text-xl font-medium" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                                                "{details.rationale}"
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase mb-4">Headline Ledger</h4>
                                                {details.headlines.map((h, i) => (
                                                    <a
                                                        key={i}
                                                        href={h.url}
                                                        target="_blank"
                                                        className="block p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.05]"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{h.source.name}</div>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                                        </div>
                                                        <div className="font-bold text-neutral-100 text-lg leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>{h.title}</div>
                                                        <p className="mt-2 text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                                                            {h.description}
                                                        </p>
                                                    </a>
                                                ))}
                                            </div>

                                            <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center">
                                                <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                                                    Archive ID: {details.id.slice(0, 8)}
                                                </div>
                                                <a
                                                    href={`/pulse/${new Date(selectedDate).getFullYear()}/${(new Date(selectedDate).getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.split('T')[0]}.html`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black tracking-widest text-primary transition-all"
                                                >
                                                    VIEW FULL REPORT ↗
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <footer className="mt-24 pt-12 border-t border-white/5 text-center text-neutral-600 text-[10px] font-bold tracking-widest uppercase">
                    <p>&copy; {new Date().getFullYear()} Pulse. A historical archive for humanity.</p>
                </footer>
            </main>
        </div>
    );
}

export default App;
