import React from "react";
import { motion } from "framer-motion";
import { getGradientColor } from "../lib/colorUtils";

const PulseCalendar = ({ history, selectedDate, onSelect }) => {
  // Generate last 7 days before today for the grid
  const dates = [];
  for (let i = 7; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  const historyMap = history.reduce((acc, p) => {
    const dateStr = p.date.split("T")[0];
    acc[dateStr] = p;
    return acc;
  }, {});

  return (
    <div className="h-full bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-cyan-400/20 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-cyan-400/20 px-6 py-4 bg-black/40">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-medium tracking-[0.3em] text-cyan-400/70 uppercase">
            Timeline
          </h2>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-cyan-400/50"></div>
            <div className="w-1 h-1 rounded-full bg-cyan-400/30"></div>
            <div className="w-1 h-1 rounded-full bg-cyan-400/10"></div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        <div className="space-y-3">
          {dates.map((dateStr, index) => {
            const data = historyMap[dateStr];
            const isSelected = selectedDate && selectedDate.startsWith(dateStr);
            const dateObj = new Date(dateStr);
            const dayName = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dayNum = dateObj.getDate();
            const color = data ? getGradientColor(data.score) : "#333";

            return (
              <motion.button
                key={dateStr}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => data && onSelect(data.date)}
                disabled={!data}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-sm border transition-all duration-300
                  ${!data ? "cursor-not-allowed opacity-30" : "cursor-pointer"}
                  ${
                    isSelected
                      ? "bg-white/10 border-cyan-400/60 shadow-lg shadow-cyan-400/20"
                      : "bg-white/[0.02] border-white/5 hover:border-cyan-400/30 hover:bg-white/[0.04]"
                  }
                `}
              >
                {/* Date Circle */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 transition-all"
                    style={{
                      borderColor: isSelected ? color : color + "40",
                      backgroundColor: isSelected
                        ? color + "20"
                        : "transparent",
                    }}
                  >
                    <span className="text-[10px] font-mono text-neutral-500 leading-none">
                      {dayName.toUpperCase()}
                    </span>
                    <span
                      className="text-lg font-bold leading-none mt-0.5"
                      style={{ color }}
                    >
                      {dayNum}
                    </span>
                  </div>

                  {/* Pulse indicator for active item */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: color }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </div>

                {/* Score Bar */}
                {data ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-neutral-400">
                        SCORE
                      </span>
                      <span
                        className="text-lg font-bold font-mono tracking-tight"
                        style={{
                          color,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {data.score.toFixed(1)}
                      </span>
                    </div>

                    {/* Visual bar */}
                    <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.score / 10) * 100}%` }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.05 + 0.2,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center">
                    <span className="text-xs font-mono text-neutral-700 tracking-wider">
                      NO DATA
                    </span>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-neutral-600 tracking-wider">
              0.0
            </span>
            <div className="flex-1 mx-3 h-1.5 rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 opacity-40"></div>
            <span className="text-[9px] font-mono text-neutral-600 tracking-wider">
              10.0
            </span>
          </div>
          <div className="text-center mt-2">
            <span className="text-[8px] font-mono text-neutral-700 tracking-widest uppercase">
              Humanity Index Scale
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulseCalendar;
