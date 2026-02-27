'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { PopularMovie } from '@/lib/types';
import { MovieCard, MovieCardSkeleton } from '@/components/MovieCard';
import { fadeUp, staggerContainer, inViewProps } from '@/lib/motion';

interface Props {
    title: string;
    badge?: string;
    movies: PopularMovie[];
    isLoading?: boolean;
    seeMoreHref?: string;
    autoSlideDirection?: 'left' | 'right';
}

export function MovieCarousel({ title, badge, movies, isLoading, seeMoreHref, autoSlideDirection }: Props) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Duplicate movies for seamless infinite scrolling
    const doubledMovies = [...movies, ...movies];

    // ── Auto-scroll Effect ────────────────────────────────────────────────────
    useEffect(() => {
        if (!autoSlideDirection || isHovered || isLoading || movies.length === 0) return;

        // Ensure we don't start at 0 if scrolling backwards (right)
        if (trackRef.current && autoSlideDirection === 'right' && trackRef.current.scrollLeft <= 0) {
            trackRef.current.scrollLeft = trackRef.current.scrollWidth / 2;
        }

        const interval = setInterval(() => {
            if (trackRef.current) {
                const scrollAmount = autoSlideDirection === 'left' ? 1.5 : -1.5;
                trackRef.current.scrollLeft += scrollAmount;

                const halfWidth = trackRef.current.scrollWidth / 2;

                // Seamlessly jump to the other half when hitting a boundary
                if (autoSlideDirection === 'left' && trackRef.current.scrollLeft >= halfWidth) {
                    trackRef.current.scrollLeft -= halfWidth;
                } else if (autoSlideDirection === 'right' && trackRef.current.scrollLeft <= 0) {
                    trackRef.current.scrollLeft += halfWidth;
                }
            }
        }, 30);

        return () => clearInterval(interval);
    }, [autoSlideDirection, isHovered, isLoading, movies.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (trackRef.current) {
            const width = trackRef.current.clientWidth;
            trackRef.current.scrollBy({ left: direction === 'left' ? -width : width, behavior: 'smooth' });
        }
    };

    return (
        <motion.section
            variants={staggerContainer}
            {...inViewProps}
            className="space-y-4"
        >
            {/* Section header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    {badge && <span className="saas-badge">{badge}</span>}
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--saas-text-primary)] tracking-tight">
                        {title}
                    </h2>
                </div>
                {seeMoreHref && (
                    <Link
                        href={seeMoreHref}
                        className="flex items-center gap-1 text-sm font-bold text-[var(--saas-accent)] hover:text-[var(--saas-accent-hover)] transition-colors group"
                    >
                        See all
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                )}
            </motion.div>

            {/* Track Container */}
            <div className="relative group/carousel">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute z-10 left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[var(--saas-border)] text-[var(--saas-text-primary)] hover:text-[var(--saas-accent)] transition-all hover:scale-105 active:scale-95"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-6 h-6 ml-[-2px]" />
                </button>

                {/* Main scrollable track */}
                <div
                    ref={trackRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={() => setIsHovered(true)}
                    onTouchEnd={() => setIsHovered(false)}
                    className="carousel-track overflow-x-auto overflow-y-hidden scrollbar-hide py-2 flex gap-4 pr-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div key="skeletons" className="flex gap-4 px-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} className="snap-start shrink-0">
                                        <MovieCardSkeleton />
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div key="cards" className="flex gap-4 px-1" variants={staggerContainer} initial="hidden" animate="visible">
                                {doubledMovies.map((m, i) => (
                                    <div key={`${m.id}-${i}`} className="snap-start shrink-0">
                                        <MovieCard movie={m} priority={i < 3} />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute z-10 right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[var(--saas-border)] text-[var(--saas-text-primary)] hover:text-[var(--saas-accent)] transition-all hover:scale-105 active:scale-95"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-6 h-6 mr-[-2px]" />
                </button>
            </div>
        </motion.section>
    );
}
