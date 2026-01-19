import React from "react";
import { motion } from "framer-motion";
import { getVibeLabel, getGradientColor } from "../lib/colorUtils";

const PulseMetrics = ({ score }) => {
    const { label } = getVibeLabel(score);
    const textColor = getGradientColor(score);

    // ECG-style pulse line path (simple heartbeat pattern)
    const pulsePath = "M 0 50 L 20 50 L 25 20 L 30 80 L 35 40 L 40 50 L 60 50 L 65 30 L 70 70 L 75 50 L 100 50";

    return (
        <div className="relative">
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            <div className="relative flex flex-col items-center text-center py-12">
                {/* Label */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center gap-3"
                >
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-400/50"></div>
                    <span className="text-[10px] font-mono font-medium tracking-[0.4em] text-cyan-400/70 uppercase">
                        System Status
                    </span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-400/50"></div>
                </motion.div>

                {/* Main Score Display - Hospital Monitor Style */}
                <div className="relative mb-12">
                    {/* Glow effect behind number */}
                    <div className="absolute inset-0 blur-3xl opacity-30" style={{ backgroundColor: textColor }}></div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        {/* Score Number */}
                        <div className="flex items-center justify-center gap-6">
                            {/* Pulse line animation before */}
                            <svg width="120" height="60" viewBox="0 0 100 100" className="hidden lg:block">
                                <motion.path
                                    d={pulsePath}
                                    stroke={textColor}
                                    strokeWidth="2"
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        duration: 2,
                                        ease: "linear",
                                        repeat: Infinity
                                    }}
                                />
                            </svg>

                            <div className="flex flex-col items-center">
                                <div
                                    className="text-[8rem] sm:text-[10rem] lg:text-[12rem] font-bold leading-none tracking-tight"
                                    style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: textColor,
                                        textShadow: `0 0 20px ${textColor}40, 0 0 40px ${textColor}20`
                                    }}
                                >
                                    {score.toFixed(1)}
                                </div>
                                <div className="text-xs font-mono text-neutral-600 tracking-[0.3em] mt-2">
                                    VITALS / 10.0
                                </div>
                            </div>

                            {/* Pulse line animation after */}
                            <svg width="120" height="60" viewBox="0 0 100 100" className="hidden lg:block">
                                <motion.path
                                    d={pulsePath}
                                    stroke={textColor}
                                    strokeWidth="2"
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        duration: 2,
                                        ease: "linear",
                                        repeat: Infinity,
                                        delay: 0.5
                                    }}
                                />
                            </svg>
                        </div>
                    </motion.div>
                </div>

                {/* Status Label */}
                <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="inline-block px-8 py-4 bg-black/40 border rounded-sm relative overflow-hidden"
                        style={{ borderColor: textColor + '40' }}>
                        {/* Animated border glow */}
                        <div className="absolute inset-0 opacity-50">
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background: `linear-gradient(90deg, transparent, ${textColor}40, transparent)`
                                }}
                                animate={{
                                    x: ['-100%', '200%']
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        </div>

                        <h2
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight relative z-10"
                            style={{
                                fontFamily: "'Syne', sans-serif",
                                color: textColor
                            }}
                        >
                            {label}
                        </h2>
                    </div>
                    <div className="text-[9px] font-mono text-neutral-600 tracking-[0.3em] uppercase mt-3">
                        7-Day Rolling Average
                    </div>
                </motion.div>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-2xl text-neutral-400 text-base sm:text-lg leading-relaxed px-4"
                >
                    Real-time analysis of global news headlines, measuring humanity's collective vital signs every 24 hours.
                </motion.p>

                {/* Decorative elements */}
                <div className="flex gap-2 mt-8">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="w-1 rounded-full"
                            style={{
                                height: `${12 + Math.random() * 16}px`,
                                backgroundColor: textColor,
                                opacity: 0.3
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PulseMetrics;
