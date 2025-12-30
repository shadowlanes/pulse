import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Atmosphere = ({ score }) => {
    // score is 0-10
    const getAtmosphereConfig = (s) => {
        if (s >= 8.0) return {
            id: 'peak',
            color: 'from-emerald-900 via-emerald-950 to-black',
            accent: 'text-emerald-400',
            glow: 'bg-emerald-500/10',
            label: 'Peak Humanity',
            effect: 'dust'
        };
        if (s >= 6.0) return {
            id: 'steady',
            color: 'from-sky-900 via-sky-950 to-black',
            accent: 'text-sky-400',
            glow: 'bg-sky-500/10',
            label: 'Steady & Calm',
            effect: 'drifts'
        };
        if (s >= 4.0) return {
            id: 'mixed',
            color: 'from-amber-900 via-amber-950 to-black',
            accent: 'text-amber-400',
            glow: 'bg-amber-500/10',
            label: 'Mixed Bag',
            effect: 'pulse'
        };
        if (s >= 2.0) return {
            id: 'rough',
            color: 'from-slate-900 via-slate-950 to-black',
            accent: 'text-slate-400',
            glow: 'bg-slate-500/10',
            label: 'Rough Patch',
            effect: 'shadows'
        };
        return {
            id: 'chaos',
            color: 'from-rose-950 via-red-950 to-black',
            accent: 'text-red-500',
            glow: 'bg-red-500/20',
            label: 'Chaos Theory',
            effect: 'glitch'
        };
    };

    const config = getAtmosphereConfig(score);

    return (
        <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${config.color} transition-colors duration-1000 overflow-hidden`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={config.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Effect layers */}
                    {config.effect === 'dust' && <GoldDust />}
                    {config.effect === 'drifts' && <LightDrifts />}
                    {config.effect === 'pulse' && <SlowPulse />}
                    {config.effect === 'shadows' && <FallingShadows />}
                    {config.effect === 'glitch' && <GlitchOverlay />}
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
    );
};

const GoldDust = () => (
    <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
                initial={{
                    x: Math.random() * 100 + 'vw',
                    y: Math.random() * 100 + 'vh',
                    scale: Math.random() * 2
                }}
                animate={{
                    y: [null, '-20vh'],
                    opacity: [0, 1, 0]
                }}
                transition={{
                    duration: 5 + Math.random() * 10,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 10
                }}
            />
        ))}
    </div>
);

const LightDrifts = () => (
    <div className="absolute inset-0 flex flex-col justify-around">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="w-full h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"
                animate={{
                    x: ['-100%', '100%']
                }}
                transition={{
                    duration: 10 + Math.random() * 20,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 2
                }}
            />
        ))}
    </div>
);

const SlowPulse = () => (
    <motion.div
        className="absolute inset-0 bg-amber-500/5"
        animate={{
            opacity: [0, 0.2, 0]
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

const FallingShadows = () => (
    <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-px h-64 bg-gradient-to-b from-transparent via-slate-500/10 to-transparent"
                initial={{
                    x: Math.random() * 100 + 'vw',
                    y: -200
                }}
                animate={{
                    y: '120vh'
                }}
                transition={{
                    duration: 3 + Math.random() * 5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 5
                }}
            />
        ))}
    </div>
);

const GlitchOverlay = () => (
    <div className="absolute inset-0 overflow-hidden">
        <motion.div
            className="absolute inset-0 bg-red-500/5"
            animate={{
                opacity: [0, 0.1, 0, 0.2, 0],
                x: [0, -5, 5, -2, 0]
            }}
            transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2
            }}
        />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] pointer-events-none" />
    </div>
);

export default Atmosphere;
