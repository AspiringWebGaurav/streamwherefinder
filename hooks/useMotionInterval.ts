import { useEffect, useRef, useCallback } from 'react';

/**
 * A robust, context-aware motion interval orchestrator.
 * Designed to prevent interval stacking, memory leaks, and respect
 * the Page Visibility API (pauses motion when tab is inactive).
 */
export function useMotionInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);
    const intervalId = useRef<NodeJS.Timeout | null>(null);

    // Remember the latest callback if it changes.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    const tick = useCallback(() => {
        savedCallback.current();
    }, []);

    useEffect(() => {
        // If delay is null or zero, don't set up the interval.
        if (delay === null || delay <= 0) {
            if (intervalId.current) {
                clearInterval(intervalId.current);
                intervalId.current = null;
            }
            return;
        }

        const startInterval = () => {
            if (!intervalId.current) {
                intervalId.current = setInterval(tick, delay);
            }
        };

        const stopInterval = () => {
            if (intervalId.current) {
                clearInterval(intervalId.current);
                intervalId.current = null;
            }
        };

        // Initial setup
        startInterval();

        // Page Visibility API to prevent interval execution when tab is hidden
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopInterval();
            } else {
                startInterval();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup on unmount or delay change
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopInterval();
        };
    }, [delay, tick]);
}
