import { Variants } from 'framer-motion';

/**
 * Enterprise Polish: Subtle, professional animations.
 * Removed bouncy springs and aggressive scales.
 * Focus is on crisp, smooth opacity fades and micro-translations.
 */

// Basic subtle fade-up for content blocks
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
};

// Subtle fade-in, mostly for background elements or overlays
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
};

// Extremely subtle scale-up for cards on mount, no spring
export const subtleScale: Variants = {
    hidden: { scale: 0.98, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
};

// Slide down for dropdowns or alerts
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

// Stagger for lists/grids, faster and tighter
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
    exit: {
        opacity: 0,
        transition: { staggerChildren: 0.03, staggerDirection: -1 },
    },
};

// Unified framer-motion props for scroll-triggered elements
export const inViewProps = {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, margin: '-40px' }, // Trigger slightly before it comes into view
};

// Clean page transition, no layout shift
export const pageTransition: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2, ease: 'easeIn' }
    },
};

// Used for interactions instead of whileHover prop directly (if manual control needed)
// Replace springHover with this subtle shift
export const subtleHoverTransition = {
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1] as const, // standard crisp curve
};
