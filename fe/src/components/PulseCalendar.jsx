import React from "react";
import { motion } from "framer-motion";
import { getGradientColor, getGlowShadow } from "../lib/colorUtils";

const PulseCalendar = ({ history, selectedDate, onSelect }) => {
  // history is already limited to last 7 days from App.jsx

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

  const getTint = (index) => {
    // Just a fun way to tint inactive squares based on their position if no data
    const tints = [
      "bg-emerald-500/10",
      "bg-sky-500/10",
      "bg-amber-500/10",
      "bg-slate-500/10",
      "bg-rose-600/10",
    ];
    return tints[index % tints.length];
  };

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
      <div className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">
          Week View
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {dates.map((dateStr) => {
          const data = historyMap[dateStr];
          const isSelected = selectedDate && selectedDate.startsWith(dateStr);

          return (
            <div key={dateStr} className="flex flex-col items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => data && onSelect(data.date)}
                className={`
                                    w-full aspect-square rounded-lg transition-all duration-300
                                    ${
                                      !data
                                        ? getTint(dates.indexOf(dateStr))
                                        : ""
                                    }
                                    ${
                                      isSelected
                                        ? "ring-2 ring-white ring-offset-4 ring-offset-black/50"
                                        : "opacity-80 hover:opacity-100"
                                    }
                                    ${
                                      !data
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer"
                                    }
                                `}
                style={
                  data
                    ? {
                        backgroundColor: getGradientColor(data.score),
                        boxShadow: getGlowShadow(data.score),
                      }
                    : undefined
                }
              >
                {isSelected && (
                  <motion.div
                    layoutId="active"
                    className="absolute inset-0 rounded-lg border-2 border-white pointer-events-none"
                  />
                )}
              </motion.button>
              <span className="text-[10px] font-bold text-neutral-600 uppercase">
                {new Date(dateStr).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex justify-between items-center text-[8px] font-bold text-neutral-500 tracking-widest uppercase">
          <span>Chaos</span>
          <div className="flex gap-1 px-4">
            <div className="w-2 h-2 rounded-full bg-rose-600"></div>
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
          <span>Peak</span>
        </div>
      </div>
    </div>
  );
};

export default PulseCalendar;
