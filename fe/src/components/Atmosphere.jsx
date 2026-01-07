import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAtmosphereConfig } from '../lib/colorUtils';

const Atmosphere = ({ score }) => {
    const config = getAtmosphereConfig(score);

    return (
        <div
            className="fixed inset-0 -z-10 transition-all duration-1000 overflow-hidden"
            style={{
                background: `linear-gradient(to bottom right, ${config.gradientStops.join(', ')})`
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={config.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Effect layers */}
                    {config.effect === 'dust' && <GoldDust color={config.accentColor} />}
                    {config.effect === 'drift' && <LightDrifts color={config.accentColor} />}
                    {config.effect === 'pulse' && <SlowPulse color={config.accentColor} />}
                    {config.effect === 'shadows' && <FallingShadows color={config.accentColor} />}
                    {config.effect === 'glitch' && <GlitchOverlay color={config.accentColor} />}
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
    );
};

const GoldDust = ({ color }) => (
    <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                    backgroundColor: color.replace('hsl', 'hsla').replace(')', ', 0.4)')
                }}
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

const LightDrifts = ({ color }) => (
    <div className="absolute inset-0 flex flex-col justify-around">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="w-full h-px"
                style={{
                    background: `linear-gradient(to right, transparent, ${color.replace('hsl', 'hsla').replace(')', ', 0.2)')}, transparent)`
                }}
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

const SlowPulse = ({ color }) => (
    <motion.div
        className="absolute inset-0"
        style={{
            backgroundColor: color.replace('hsl', 'hsla').replace(')', ', 0.05)')
        }}
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

const FallingShadows = ({ color }) => (
    <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-px h-64"
                style={{
                    background: `linear-gradient(to bottom, transparent, ${color.replace('hsl', 'hsla').replace(')', ', 0.1)')}, transparent)`
                }}
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

const GlitchOverlay = ({ color }) => (
    <div className="absolute inset-0 overflow-hidden">
        <motion.div
            className="absolute inset-0"
            style={{
                backgroundColor: color.replace('hsl', 'hsla').replace(')', ', 0.05)')
            }}
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
