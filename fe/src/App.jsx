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
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch last 7 days data from the API
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/api/pulse/last-7-days`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setHistory(data);
        if (data.length > 0) {
          const latest = data[data.length - 1];
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
      <div className="min-h-screen flex items-center justify-center text-neutral-50">
        <div className="text-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse mx-auto mb-4"></div>
          <p className="text-sm font-bold tracking-widest text-neutral-500 uppercase">
            Loading Pulse Data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-50 bg-black">
        <div className="text-center max-w-md px-4">
          <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-black tracking-tighter mb-2">
            Connection Error
          </h2>
          <p className="text-sm text-neutral-400 mb-6">
            Failed to fetch pulse data from API: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold tracking-widest transition-all"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

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
                        <span
                          className="text-2xl font-black tracking-tighter"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {details.score.toFixed(1)}
                        </span>
                        <span
                          className={`text-xs font-bold uppercase tracking-widest ${
                            details.status === "Good"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {details.status === "Good" ? "Steady" : "Arrythmia"}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        {selectedDate.split("T")[0]}
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3
                          className="text-3xl font-black tracking-tighter uppercase"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          Daily Archive
                        </h3>
                        <div className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
                          Status:{" "}
                          {details.status === "Good" ? "OPTIMAL" : "DISTRESSED"}
                        </div>
                      </div>

                      <div
                        className="mb-10 text-neutral-200 leading-relaxed text-xl font-medium"
                        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                      >
                        "{details.rationale}"
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase mb-4">
                          Headline Ledger
                        </h4>
                        {details.headlines.map((h, i) => (
                          <a
                            key={i}
                            href={h.url}
                            target="_blank"
                            className="block p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.05]"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                                {h.source.name}
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                            </div>
                            <div
                              className="font-bold text-neutral-100 text-lg leading-snug"
                              style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                              {h.title}
                            </div>
                            <p className="mt-2 text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                              {h.description}
                            </p>
                          </a>
                        ))}
                      </div>

                      <div className="mt-12 pt-6 border-t border-white/5">
                        <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                          Archive ID: {details.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <footer className="mt-24 pt-12 border-t border-white/5 text-center text-neutral-600 text-[10px] font-bold tracking-widest uppercase">
          <p>
            &copy; {new Date().getFullYear()} Pulse. A historical archive for
            humanity.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
