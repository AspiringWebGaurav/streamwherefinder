import { Variants } from 'framer-motion';

/**
 * Unified Enterprise Motion Architecture
 * Strictly enforced 150–220ms durations. Opacity-primary.
 * NO bouncy curves. NO layout reflows. Max scale 1.02.
 */

// ── Strict Timing Constants ───────────────────────────────────────────────────
export const MOTION_TIMING = {
    duration: 0.18, // 180ms default fade
    durationSlow: 0.22, // 220ms for slightly larger objects
    durationFast: 0.15, // 150ms for instantaneous feedback
};

// ── Cinematic Easing Curves ──────────────────────────────────────────────────
// Non-bouncy, clean ease-out for enterprise feel
const EASE_OUT = [0.0, 0.0, 0.2, 1] as const;
const EASE_DECEL = [0.0, 0.0, 0.05, 1] as const;

// ── Fade Up: Content blocks entry ────────────────────────────────────────────
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 8 }, // Reduced from 16 to prevent visual jump
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: MOTION_TIMING.durationSlow, ease: EASE_OUT },
    },
};

// ── Fade In: Overlays, text swaps ───────────────────────────────────────────
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: MOTION_TIMING.durationFast, ease: EASE_OUT },
    },
    exit: {
        opacity: 0,
        transition: { duration: MOTION_TIMING.durationFast, ease: 'easeIn' },
    }
};

// ── Fade In Slow: For text rotation hold phases ─────────────────────────────
export const fadeInSlow: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: MOTION_TIMING.durationSlow, ease: EASE_OUT },
    },
    exit: {
        opacity: 0,
        transition: { duration: MOTION_TIMING.durationFast, ease: 'easeIn' },
    }
};

// ── Breathing Fade (Apple/Stripe 280ms) ──────────────────────────────────────
const BREATHE_IN = [0.4, 0.0, 0.2, 1] as const; // Soft ease-in-out emergence
const BREATHE_OUT = [0.4, 0.0, 0.2, 1] as const; // Soft ease-in-out dissolve

export const fadeInOutBreathing: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.28, ease: BREATHE_IN },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.28, ease: BREATHE_OUT },
    }
};

// ── Cinematic Scale: Card mount animation ────────────────────────────────────
export const subtleScale: Variants = {
    hidden: { scale: 0.98, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: MOTION_TIMING.durationSlow, ease: EASE_OUT },
    },
};

// ── Cinematic Card Reveal ────────────────────────────────────────────────────
export const cardReveal: Variants = {
    hidden: { opacity: 0, scale: 0.99 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: MOTION_TIMING.durationSlow, ease: EASE_DECEL },
    },
};

// ── Slide Down: Dropdowns, robust to no-layout-shift ───────────────────────
export const slideDown: Variants = {
    hidden: { opacity: 0, y: -4 }, // Very subtle slide
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: MOTION_TIMING.duration, ease: EASE_OUT },
    },
    exit: {
        opacity: 0,
        y: -4,
        transition: { duration: MOTION_TIMING.durationFast, ease: 'easeIn' },
    },
};

// ── Stagger Container ────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.05,
        },
    },
    exit: {
        opacity: 0,
        transition: { staggerChildren: 0.02, staggerDirection: -1 },
    },
};

// ── In-view trigger props ────────────────────────────────────────────────────
export const inViewProps = {
    initial: 'hidden' as const,
    whileInView: 'visible' as const,
    viewport: { once: true, margin: '-40px' },
};

// ── Page Transition: Clean route transitions ─────────────────────────────────
export const pageTransition: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: MOTION_TIMING.durationSlow, ease: EASE_OUT },
    },
    exit: {
        opacity: 0,
        transition: { duration: MOTION_TIMING.durationFast, ease: 'easeIn' },
    },
};

// ── Hover transition config ──────────────────────────────────────────────────
export const subtleHoverTransition = {
    duration: MOTION_TIMING.duration,
    ease: EASE_OUT,
};

// ── Cinematic hover for cards ────────────────────────────────────────────────
export const cinematicHover = {
    y: -2, // Reduced from -6
    scale: 1.02, // Max 1.02
    transition: {
        duration: MOTION_TIMING.duration,
        ease: EASE_OUT,
    },
};

// ── Scale on tap ─────────────────────────────────────────────────────────────
export const tapScale = {
    scale: 0.98,
    transition: { duration: MOTION_TIMING.durationFast, ease: EASE_OUT },
};
