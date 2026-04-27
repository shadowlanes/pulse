import React, { useEffect, useState } from "react";
import PulseCalendar from "./components/PulseCalendar";
import PulseMetrics from "./components/PulseMetrics";
import Atmosphere from "./components/Atmosphere";
import MarketCorrelation from "./components/MarketCorrelation";
import { motion, AnimatePresence } from "framer-motion";

function parseRationale(text, headlines) {
  // Replace patterns like "(Headlines 2, 3, 6, 14, 16)" or "(Headline 5)" or standalone "Headline 5"
  // with superscript linked numbers
  const parts = [];
  // Match: optional opening paren, "Headline(s)" + comma-separated numbers, optional closing paren
  const regex = /\(?\bHeadlines?\s+([\d]+(?:\s*,\s*\d+)*)\)?/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Parse the headline numbers
    const nums = match[1].split(/\s*,\s*/).map(Number);
    nums.forEach((num, i) => {
      const idx = num - 1;
      const h = headlines[idx];
      if (h) {
        parts.push(
          <a
            key={`${match.index}-${num}`}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            title={h.title}
            className="inline-flex items-center no-underline"
          >
            <sup className="text-[10px] font-mono font-bold text-cyan-400/70 hover:text-cyan-400 transition-colors cursor-pointer ml-[1px] mr-[1px] not-italic">
              [{num}]
            </sup>
          </a>
        );
      } else {
        parts.push(<sup key={`${match.index}-${num}`} className="text-[10px] font-mono text-white/30 ml-[1px] mr-[1px] not-italic">[{num}]</sup>);
      }
    });

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

const RANGE_OPTIONS = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
];

function App() {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangeDays, setRangeDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/api/pulse/last-7-days?days=${rangeDays}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Filter out today's data
        const todayStr = new Date().toISOString().split("T")[0];
        const filteredData = data.filter(
          (item) => !item.date.startsWith(todayStr)
        );

        setHistory(filteredData);
        if (filteredData.length > 0) {
          const latest = filteredData[filteredData.length - 1];
          setSelectedDate(latest.date);
          setDetails(latest);
        } else {
          setSelectedDate(null);
          setDetails(null);
        }
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch pulse data from API:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [rangeDays]);

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
        <div className="mb-12">
          <PulseMetrics score={rollingAverage} />
        </div>

        {/* Range Filter */}
        <div className="mb-6 flex justify-end">
          <div className="inline-flex items-center gap-1 bg-black/40 border border-cyan-400/20 rounded-sm p-1">
            <span className="text-[9px] font-mono text-white/30 tracking-[0.2em] uppercase px-2">
              Range
            </span>
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRangeDays(opt.value)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-sm transition-all duration-200 ${
                  rangeDays === opt.value
                    ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40"
                    : "text-white/40 hover:text-white/70 border border-transparent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Full-width Market Impact Chart */}
        <div className="mb-8">
          <MarketCorrelation history={history} />
        </div>

        {/* Timeline + Detail Panel side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline - Left Column */}
          <div className="lg:col-span-4">
            <PulseCalendar
              history={history}
              selectedDate={selectedDate}
              onSelect={(d) => setSelectedDate(d)}
              days={rangeDays}
            />
          </div>

          {/* Detail Panel - Right Column */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {details ? (
                <motion.div
                  key={selectedDate}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden h-full flex flex-col"
                >
                  {/* Header Bar */}
                  <div className="px-6 py-4 bg-black/60 border-b border-white/8 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/30 tracking-wider">SCORE</span>
                        <span
                          className="text-3xl font-bold tracking-tight"
                          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgb(34,211,238)' }}
                        >
                          {details.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-white/10"></div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                          details.status === "Good"
                            ? "text-lime-400"
                            : "text-rose-400"
                        }`}
                      >
                        {details.status === "Good" ? "● STABLE" : "● UNSTABLE"}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-white/30 tracking-wider">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }).toUpperCase()}
                    </div>
                  </div>

                  {/* Scrollable content */}
                  <div className="overflow-y-auto flex-1 p-6" style={{ maxHeight: "calc(100vh - 320px)" }}>
                    {/* Analysis */}
                    <div className="mb-8">
                      <p className="text-[9px] font-mono text-cyan-400/50 tracking-[0.3em] uppercase mb-3">AI Analysis</p>
                      <blockquote className="text-base leading-relaxed text-neutral-300 italic border-l-2 border-cyan-400/30 pl-4 py-1">
                        {parseRationale(details.rationale, details.headlines)}
                      </blockquote>
                    </div>

                    {/* Headlines */}
                    <div>
                      <p className="text-[9px] font-mono text-white/25 tracking-[0.3em] uppercase mb-4">
                        Source Material — {details.headlines.length} headlines
                      </p>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {details.headlines.map((h, i) => (
                          <motion.a
                            key={i}
                            href={h.url}
                            target="_blank"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="group relative p-4 rounded-sm bg-white/[0.02] border border-white/5 hover:border-cyan-400/30 transition-all duration-200 hover:bg-white/[0.04]"
                          >
                            <div className="absolute top-2 right-2 text-[9px] font-mono font-bold text-white/8 group-hover:text-cyan-400/20 transition-colors">
                              {String(i + 1).padStart(2, '0')}
                            </div>
                            <div className="mb-1.5">
                              <span className="text-[9px] font-mono font-medium text-cyan-400/50 tracking-wider uppercase">
                                {h.source.name}
                              </span>
                            </div>
                            <h5 className="font-semibold text-sm leading-snug text-neutral-200 group-hover:text-cyan-400 transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>
                              {h.title}
                            </h5>
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/40 to-cyan-400/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                          </motion.a>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5">
                      <div className="text-[9px] font-mono text-white/15 tracking-wider">
                        ARCHIVE_ID: {details.id.slice(0, 16).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-64 flex items-center justify-center border border-white/5 rounded-sm bg-white/[0.01]">
                  <p className="text-[10px] font-mono text-white/20 tracking-wider">SELECT A DATE</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

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
