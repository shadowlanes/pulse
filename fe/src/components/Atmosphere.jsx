import React from 'react';
import { motion } from 'framer-motion';
import { getGradientColor } from '../lib/colorUtils';

const Atmosphere = ({ score }) => {
    const accentColor = getGradientColor(score);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,255,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,255,0.06),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(204,255,0,0.04),transparent_50%)]" />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '80px 80px'
                }}
            />

            {/* Scanline effect */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
                }}
                animate={{
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Floating particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: Math.random() * 3 + 1 + 'px',
                            height: Math.random() * 3 + 1 + 'px',
                            backgroundColor: i % 3 === 0 ? 'rgb(0, 255, 255)' : i % 3 === 1 ? 'rgb(255, 0, 255)' : 'rgb(204, 255, 0)',
                            boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`
                        }}
                        initial={{
                            x: Math.random() * 100 + 'vw',
                            y: Math.random() * 100 + 'vh',
                            opacity: 0
                        }}
                        animate={{
                            y: [null, (Math.random() - 0.5) * 200 + 'vh'],
                            opacity: [0, 0.6, 0]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 20,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 10
                        }}
                    />
                ))}
            </div>

            {/* Animated light beams */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-full w-px"
                        style={{
                            left: `${20 + i * 30}%`,
                            background: `linear-gradient(to bottom, transparent, ${i % 2 === 0 ? 'rgb(0, 255, 255)' : 'rgb(255, 0, 255)'}, transparent)`
                        }}
                        animate={{
                            opacity: [0.2, 0.5, 0.2],
                            scaleY: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                    />
                ))}
            </div>

            {/* Pulsing glow based on score */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${accentColor}15, transparent 70%)`
                }}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

            {/* Noise texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}
            />
        </div>
    );
};

export default Atmosphere;
