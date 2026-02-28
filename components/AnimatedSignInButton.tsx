'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionInterval } from '@/hooks/useMotionInterval';
import { fadeInOutBreathing } from '@/lib/motion';
import { buildContextualBag } from '@/lib/phrases';

interface Props {
    searchHistoryCount: number;
}

export function AnimatedSignInButton({ searchHistoryCount }: Props) {
    // Rotation state: Primary -> Secondary -> Primary -> Secondary...
    const [cycleTick, setCycleTick] = useState(0);

    // Determines contextual category
    const contextType = useMemo(() => {
        if (searchHistoryCount > 0) return 'history';
        return 'default';
        // Note: For 'session' and 'sync' we would need a context provider or global state.
        // For now, history trigger pushes context. Otherwise default randomize.
    }, [searchHistoryCount]);

    const bag = useMemo(() => buildContextualBag(contextType), [contextType]);

    // Memory constraints
    const recentPhrases = useRef<string[]>([]);

    const [currentText, setCurrentText] = useState('Sign in');

    // Breathing Logic (Target: 280ms Out -> 150ms Gap -> 280ms In)
    // Primary gets 3000ms total loop. Secondary gets 2700ms total loop.
    const isPrimaryState = cycleTick % 2 === 0;
    const intervalDelay = isPrimaryState ? 3000 : 2700;

    useMotionInterval(() => {
        setCycleTick((prev) => prev + 1);

        const nextIsPrimary = (cycleTick + 1) % 2 === 0;

        if (nextIsPrimary) {
            // Alternate primary actions
            const nextPrimary = ((cycleTick + 1) / 2) % 2 === 0 ? 'Sign in' : 'Log in';
            setCurrentText(nextPrimary);
        } else {
            // Pick a secondary phrase safely avoiding the last 10 terms
            let candidate = '';
            let pool = (cycleTick < 10 && bag.priority.length > 0) ? bag.priority : bag.fallback;

            for (let i = 0; i < 20; i++) { // Max 20 attempts to find un-used phrase
                const test = pool[Math.floor(Math.random() * pool.length)];
                if (!recentPhrases.current.includes(test)) {
                    candidate = test;
                    break;
                }
            }

            // If the pool is somehow entirely exhausted within 10 bounds, pick randomly
            if (!candidate) candidate = pool[Math.floor(Math.random() * pool.length)];

            // Manage memory
            recentPhrases.current.push(candidate);
            if (recentPhrases.current.length > 10) {
                recentPhrases.current.shift();
            }

            setCurrentText(candidate);
        }
    }, intervalDelay);

    return (
        <Link
            href="/login"
            className="btn-primary flex items-center justify-center px-4 h-10 w-[180px] relative overflow-hidden group"
        >
            <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={currentText}
                        variants={fadeInOutBreathing}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-x-0 mx-auto flex items-center justify-center text-sm font-semibold whitespace-nowrap text-center"
                    >
                        {currentText}
                    </motion.span>
                </AnimatePresence>
            </div>
        </Link>
    );
}
