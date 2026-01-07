/**
 * Color utility functions for Pulse score visualization
 * Uses HSL color space for smooth gradients within score ranges
 */

/**
 * Linear interpolation helper
 * @param {number} score - Current score value
 * @param {number} min - Minimum value of range
 * @param {number} max - Maximum value of range
 * @param {number} valueStart - Start value to interpolate from
 * @param {number} valueEnd - End value to interpolate to
 * @returns {number} Interpolated value
 */
function interpolateInRange(score, min, max, valueStart, valueEnd) {
    const normalized = (score - min) / (max - min);
    return valueStart + normalized * (valueEnd - valueStart);
}

/**
 * Get gradient color for a given score
 * Returns HSL color string with smooth transitions within score ranges
 *
 * Score ranges and colors:
 * - 8.0-10.0: Emerald (Peak Humanity)
 * - 6.0-7.99: Sky Blue (Steady & Calm)
 * - 4.0-5.99: Amber (Mixed Bag)
 * - 2.0-3.99: Slate (Rough Patch)
 * - 0.0-1.99: Rose (Chaos Theory)
 *
 * @param {number} score - Score value (0-10)
 * @param {object} options - Optional configuration
 * @param {string} options.fallback - Fallback color for undefined scores
 * @returns {string} HSL color string
 */
export function getGradientColor(score, options = {}) {
    // Handle edge cases
    if (score === undefined || score === null) {
        return options.fallback || 'hsl(0, 0%, 5%)'; // Dark gray
    }

    // Clamp to valid range
    const clampedScore = Math.max(0, Math.min(10, score));

    let h, s, l;

    if (clampedScore >= 8.0) {
        // Emerald gradient (Peak Humanity)
        h = 160;
        s = 75;
        l = interpolateInRange(clampedScore, 8.0, 10.0, 45, 55);
    } else if (clampedScore >= 6.0) {
        // Sky blue gradient (Steady & Calm)
        h = 200;
        s = 80;
        l = interpolateInRange(clampedScore, 6.0, 8.0, 50, 60);
    } else if (clampedScore >= 4.0) {
        // Amber gradient (Mixed Bag)
        h = 40;
        s = 85;
        l = interpolateInRange(clampedScore, 4.0, 6.0, 50, 60);
    } else if (clampedScore >= 2.0) {
        // Slate gradient (Rough Patch)
        h = 220;
        s = 15;
        l = interpolateInRange(clampedScore, 2.0, 4.0, 45, 55);
    } else {
        // Rose gradient (Chaos Theory)
        h = 350;
        s = 70;
        l = interpolateInRange(clampedScore, 0.0, 2.0, 45, 55);
    }

    return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Get glow shadow effect for a given score
 * Returns box-shadow CSS string with color matching the score
 *
 * @param {number} score - Score value (0-10)
 * @param {number} intensity - Shadow opacity (0-1), defaults to 0.4
 * @returns {string} CSS box-shadow string
 */
export function getGlowShadow(score, intensity = 0.4) {
    if (score === undefined || score === null) {
        return 'none';
    }

    const color = getGradientColor(score);
    // Convert HSL to HSLA by replacing the closing parenthesis
    const hslaColor = color.replace('hsl(', 'hsla(').replace(')', `, ${intensity})`);

    return `0 0 15px ${hslaColor}`;
}

/**
 * Get vibe label for a given score
 * Returns label text and color
 *
 * @param {number} score - Score value (0-10)
 * @returns {object} Object with label and color properties
 */
export function getVibeLabel(score) {
    if (score === undefined || score === null) {
        return { label: 'Unknown', color: 'hsl(0, 0%, 50%)' };
    }

    const clampedScore = Math.max(0, Math.min(10, score));

    if (clampedScore >= 8.0) {
        return { label: 'Peak Humanity', color: getGradientColor(clampedScore) };
    }
    if (clampedScore >= 6.0) {
        return { label: 'Steady & Calm', color: getGradientColor(clampedScore) };
    }
    if (clampedScore >= 4.0) {
        return { label: 'Mixed Bag', color: getGradientColor(clampedScore) };
    }
    if (clampedScore >= 2.0) {
        return { label: 'Rough Patch', color: getGradientColor(clampedScore) };
    }
    return { label: 'Chaos Theory', color: getGradientColor(clampedScore) };
}

/**
 * Get atmosphere configuration for background gradient
 * Returns gradient stops, effect type, and label
 *
 * @param {number} score - Score value (0-10)
 * @returns {object} Configuration object with gradientStops, effect, label, and accentColor
 */
export function getAtmosphereConfig(score) {
    if (score === undefined || score === null) {
        return {
            gradientStops: ['hsl(0, 0%, 5%)', 'hsl(0, 0%, 2%)', 'hsl(0, 0%, 0%)'],
            effect: 'dust',
            label: 'Unknown',
            accentColor: 'hsl(0, 0%, 50%)',
            glowColor: 'hsl(0, 0%, 5%)'
        };
    }

    const clampedScore = Math.max(0, Math.min(10, score));
    const baseColor = getGradientColor(clampedScore);

    // Extract HSL values for gradient generation
    let h, s;
    if (clampedScore >= 8.0) {
        h = 160; s = 75;
        return {
            gradientStops: [
                `hsl(${h}, ${s}%, 15%)`,
                `hsl(${h}, ${s}%, 5%)`,
                'hsl(0, 0%, 0%)'
            ],
            effect: 'dust',
            label: 'Peak Humanity',
            accentColor: baseColor,
            glowColor: `hsl(${h}, ${s}%, 20%)`
        };
    } else if (clampedScore >= 6.0) {
        h = 200; s = 80;
        return {
            gradientStops: [
                `hsl(${h}, ${s}%, 15%)`,
                `hsl(${h}, ${s}%, 5%)`,
                'hsl(0, 0%, 0%)'
            ],
            effect: 'drift',
            label: 'Steady & Calm',
            accentColor: baseColor,
            glowColor: `hsl(${h}, ${s}%, 20%)`
        };
    } else if (clampedScore >= 4.0) {
        h = 40; s = 85;
        return {
            gradientStops: [
                `hsl(${h}, ${s}%, 15%)`,
                `hsl(${h}, ${s}%, 5%)`,
                'hsl(0, 0%, 0%)'
            ],
            effect: 'pulse',
            label: 'Mixed Bag',
            accentColor: baseColor,
            glowColor: `hsl(${h}, ${s}%, 20%)`
        };
    } else if (clampedScore >= 2.0) {
        h = 220; s = 15;
        return {
            gradientStops: [
                `hsl(${h}, ${s}%, 15%)`,
                `hsl(${h}, ${s}%, 5%)`,
                'hsl(0, 0%, 0%)'
            ],
            effect: 'shadows',
            label: 'Rough Patch',
            accentColor: baseColor,
            glowColor: `hsl(${h}, ${s}%, 20%)`
        };
    } else {
        h = 350; s = 70;
        return {
            gradientStops: [
                `hsl(${h}, ${s}%, 15%)`,
                `hsl(${h}, ${s}%, 5%)`,
                'hsl(0, 0%, 0%)'
            ],
            effect: 'glitch',
            label: 'Chaos Theory',
            accentColor: baseColor,
            glowColor: `hsl(${h}, ${s}%, 20%)`
        };
    }
}
