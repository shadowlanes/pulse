import React, { useEffect, useState } from "react";
import PulseCalendar from "./components/PulseCalendar";
import PulseMetrics from "./components/PulseMetrics";
import Atmosphere from "./components/Atmosphere";
import MarketCorrelation from "./components/MarketCorrelation";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch last 30 days data from the API
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/api/pulse/last-7-days`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Filter out today's data to show only last 30 days before today
        const todayStr = new Date().toISOString().split("T")[0];
        const filteredData = data.filter(
          (item) => !item.date.startsWith(todayStr)
        );

        setHistory(filteredData);
        if (filteredData.length > 0) {
          const latest = filteredData[filteredData.length - 1];
          setSelectedDate(latest.date);
          setDetails(latest);
        }
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch pulse data from API:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedDate || !history.length) return;
    const selected = history.find((h) => h.date === selectedDate);
    if (selected) {
      setDetails(selected);
    }
  }, [selectedDate, history]);

  const rollingAverage =
    history.length > 0
      ? history.reduce((acc, p) => acc + p.score, 0) / history.length
      : 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          {/* Animated pulse circles */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-magenta-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs font-mono tracking-[0.3em] text-cyan-400/70 uppercase">
            Initializing Vitals Monitor
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-red-500/30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-3xl text-red-500">!</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3 text-red-400" style={{ fontFamily: 'Syne, sans-serif' }}>
            Connection Failed
          </h2>
          <p className="text-sm text-neutral-500 mb-8 font-mono">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-sm text-xs font-mono font-bold tracking-wider text-red-400 transition-all duration-300"
          >
            RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-neutral-50 selection:bg-cyan-400/30 relative overflow-x-hidden">
      <Atmosphere score={rollingAverage} />

      {/* Art Deco Header */}
      <nav className="border-b border-cyan-400/20 bg-black/60 backdrop-blur-xl sticky top-0 z-50 deco-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-cyan-400 heartbeat"></div>
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-400 opacity-40 blur-md glow-pulse"></div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight neon-cyan" style={{ fontFamily: 'Syne, sans-serif' }}>
                PULSE
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-black/40 px-4 py-2 rounded-sm border border-cyan-400/30">
              <span className="text-[10px] font-mono font-medium tracking-wider text-cyan-400/70">
                VITALS
              </span>
              <span className="text-lg font-bold font-mono text-cyan-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {rollingAverage.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Score Section */}
        <div className="mb-20">
          <PulseMetrics score={rollingAverage} />
        </div>

        {/* Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Calendar - Left Column */}
          <div className="lg:col-span-5">
            <PulseCalendar
              history={history}
              selectedDate={selectedDate}
              onSelect={(d) => setSelectedDate(d)}
            />
          </div>

          {/* Market Chart - Right Column */}
          <div className="lg:col-span-7">
            <MarketCorrelation history={history} />
          </div>
        </div>

        {/* Detail Panel */}
        {details && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Decorative corner elements */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyan-400/50"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-magenta-400/50"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-magenta-400/50"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyan-400/50"></div>

              <div className="bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden">
                {/* Header Bar */}
                <div className="sticky top-20 z-20 px-8 py-5 bg-black/80 backdrop-blur-xl border-b border-cyan-400/20 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-cyan-400/70 tracking-wider">SCORE</span>
                      <span
                        className="text-4xl font-bold tracking-tight text-cyan-400"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {details.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <span
                      className={`text-xs font-bold uppercase tracking-[0.2em] ${
                        details.status === "Good"
                          ? "text-lime-400 neon-lime"
                          : "text-magenta-400 neon-magenta"
                      }`}
                    >
                      {details.status === "Good" ? "● STABLE" : "● UNSTABLE"}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-500 tracking-wider">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }).toUpperCase()}
                  </div>
                </div>

                <div className="p-8 lg:p-12">
                  {/* Analysis Section */}
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                      <h3 className="text-xs font-bold tracking-[0.3em] text-cyan-400/70 uppercase">
                        AI Analysis
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                    </div>
                    <blockquote className="text-xl leading-relaxed text-neutral-300 italic border-l-4 border-cyan-400/30 pl-6 py-2">
                      {details.rationale}
                    </blockquote>
                  </div>

                  {/* Headlines Grid */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-magenta-400/50 to-transparent"></div>
                      <h4 className="text-xs font-bold tracking-[0.3em] text-magenta-400/70 uppercase">
                        Source Material ({details.headlines.length})
                      </h4>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-magenta-400/50 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {details.headlines.map((h, i) => (
                        <motion.a
                          key={i}
                          href={h.url}
                          target="_blank"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="group relative p-6 rounded-sm bg-white/[0.02] border border-white/5 hover:border-cyan-400/40 transition-all duration-300 hover:bg-white/[0.04]"
                        >
                          {/* Index number */}
                          <div className="absolute top-3 right-3 text-[10px] font-mono font-bold text-white/10 group-hover:text-cyan-400/30 transition-colors">
                            {String(i + 1).padStart(2, '0')}
                          </div>

                          <div className="mb-3">
                            <span className="text-[9px] font-mono font-medium text-cyan-400/60 tracking-wider uppercase">
                              {h.source.name}
                            </span>
                          </div>
                          <h5 className="font-semibold text-base leading-snug text-neutral-100 mb-3 group-hover:text-cyan-400 transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {h.title}
                          </h5>
                          <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                            {h.description}
                          </p>

                          {/* Hover indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-magenta-400 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </motion.a>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center">
                    <div className="text-[10px] font-mono text-neutral-700 tracking-wider">
                      ARCHIVE_ID: {details.id.slice(0, 16).toUpperCase()}
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/30"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-magenta-400/30"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-lime-400/30"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-white/5">
          <div className="flex justify-center items-center gap-4 text-[10px] font-mono text-neutral-700 tracking-wider">
            <div className="w-2 h-2 border border-cyan-400/30"></div>
            <p>&copy; {new Date().getFullYear()} PULSE VITALS MONITOR</p>
            <div className="w-2 h-2 border border-magenta-400/30"></div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
