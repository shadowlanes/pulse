import React from "react";
import { motion } from "framer-motion";

const PulseMetrics = ({ score }) => {
    const getVibe = (s) => {
        if (s >= 8.0) return { label: "Peak Humanity", color: "text-emerald-400" };
        if (s >= 6.0) return { label: "Steady & Calm", color: "text-sky-400" };
        if (s >= 4.0) return { label: "Mixed Bag", color: "text-amber-400" };
        if (s >= 2.0) return { label: "Rough Patch", color: "text-slate-400" };
        return { label: "Chaos Theory", color: "text-red-500" };
    };

    const vibe = getVibe(score);

    return (
        <div className="flex flex-col items-center text-center">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2"
            >
                <span className="text-[10px] font-bold tracking-[0.4em] text-neutral-500 uppercase">Current Climate</span>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-2 mb-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl sm:text-9xl font-black tracking-tighter leading-none"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    {score.toFixed(1)}
                </motion.div>

                <div className="flex flex-col items-center sm:items-start">
                    <motion.div
                        key={vibe.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-6xl sm:text-7xl font-black tracking-tighter leading-none italic ${vibe.color}`}
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        {vibe.label}
                    </motion.div>
                    <div className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mt-2">
                        7-Day Rolling Average
                    </div>
                </div>
            </div>

            <div className="max-w-xl text-neutral-400 text-lg leading-relaxed opacity-80">
                Analyzing the world’s most significant headlines every 24 hours to track the rhythm of our civilization.
            </div>
        </div>
    );
};

export default PulseMetrics;
