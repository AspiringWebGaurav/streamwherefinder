import { Variants } from 'framer-motion';

/**
 * Cinematic Motion Architecture
 * Physics-based feel with ease-out curves.
 * GPU-accelerated transforms only. No layout shift.
 * Consistent 150–350ms durations.
 */

// ── Cinematic Easing Curves ──────────────────────────────────────────────────
const EASE_CINEMATIC = [0.25, 0.1, 0.25, 1] as const;
const EASE_OUT = [0.0, 0.0, 0.2, 1] as const;
const EASE_DECEL = [0.0, 0.0, 0.05, 1] as const;

// ── Fade Up: Content blocks entry ────────────────────────────────────────────
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: EASE_OUT },
    },
};

// ── Fade In: Overlays, backgrounds ───────────────────────────────────────────
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
};

// ── Cinematic Scale: Card mount animation ────────────────────────────────────
export const subtleScale: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.4, ease: EASE_CINEMATIC },
    },
};

// ── Cinematic Card Reveal: staggered with slight vertical slide ──────────────
export const cardReveal: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: EASE_DECEL },
    },
};

// ── Slide Down: Dropdowns, alerts ────────────────────────────────────────────
export const slideDown: Variants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: {
        opacity: 0,
        y: -4,
        transition: { duration: 0.2, ease: 'easeIn' },
    },
};

// ── Stagger Container: Lists, grids ─────────────────────────────────────────
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.08,
        },
    },
    exit: {
        opacity: 0,
        transition: { staggerChildren: 0.03, staggerDirection: -1 },
    },
};

// ── Cinematic Stagger: Slower, more dramatic ─────────────────────────────────
export const cinematicStagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.15,
        },
    },
};

// ── In-view trigger props ────────────────────────────────────────────────────
export const inViewProps = {
    initial: 'hidden' as const,
    whileInView: 'visible' as const,
    viewport: { once: true, margin: '-60px' },
};

// ── Page Transition: Clean route transitions ─────────────────────────────────
export const pageTransition: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: EASE_OUT },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2, ease: 'easeIn' },
    },
};

// ── Hover transition config ──────────────────────────────────────────────────
export const subtleHoverTransition = {
    duration: 0.25,
    ease: EASE_CINEMATIC,
};

// ── Cinematic hover for cards ────────────────────────────────────────────────
export const cinematicHover = {
    y: -6,
    transition: {
        duration: 0.3,
        ease: EASE_OUT,
    },
};

// ── Scale on tap ─────────────────────────────────────────────────────────────
export const tapScale = {
    scale: 0.97,
    transition: { duration: 0.1 },
};
