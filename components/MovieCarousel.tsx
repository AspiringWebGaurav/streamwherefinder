'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { PopularMovie } from '@/lib/types';
import { MovieCard, MovieCardSkeleton } from '@/components/MovieCard';
import { fadeUp, staggerContainer, inViewProps } from '@/lib/motion';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface Props {
    title?: string;
    badge?: string;
    movies: PopularMovie[];
    isLoading?: boolean;
    seeMoreHref?: string;
    autoSlideDirection?: 'left' | 'right'; // Preserved prop for backward compatibility
}

export function MovieCarousel({ title, badge, movies, isLoading, seeMoreHref }: Props) {
    const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
    const [isManualSliding, setIsManualSliding] = useState(false);

    const handleSlide = (direction: 'prev' | 'next') => {
        if (!swiperRef) return;

        setIsManualSliding(true);
        swiperRef.autoplay.stop();

        // Temporarily change speed for the manual slide feel
        swiperRef.params.speed = 500;

        if (direction === 'prev') swiperRef.slidePrev();
        else swiperRef.slideNext();

        // Restore cinematic speed after slide animation completes
        setTimeout(() => {
            if (swiperRef && !swiperRef.destroyed) {
                swiperRef.params.speed = 8000;
                swiperRef.autoplay.start();
                setIsManualSliding(false);
            }
        }, 550); // Slightly longer than transition speed to ensure clean handoff
    };

    // Duplicate movies array to ensure seamless infinite looping without gaps
    const doubledMovies = [...movies, ...movies, ...movies];

    return (
        <motion.section
            variants={staggerContainer}
            {...inViewProps}
            className="space-y-4"
        >
            {(title || badge || seeMoreHref) && (
                <motion.div variants={fadeUp} className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        {badge && <span className="saas-badge">{badge}</span>}
                        {title && (
                            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--cinema-text-primary)] tracking-tight">
                                {title}
                            </h2>
                        )}
                    </div>
                    {seeMoreHref && (
                        <Link
                            href={seeMoreHref}
                            className="flex items-center gap-1 text-sm font-bold text-[var(--cinema-accent)] hover:text-[var(--cinema-accent-hover)] transition-colors group"
                        >
                            See all
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                </motion.div>
            )}

            <div className="relative group/carousel cursor-grab active:cursor-grabbing">
                {/* Manual Navigation Arrows - Fixed Glass UI */}
                <button
                    onClick={() => handleSlide('prev')}
                    className="absolute z-20 left-1 sm:left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-xl shadow-sm border border-white/30 text-white/90 hover:bg-white/40 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto mix-blend-luminosity"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                    onClick={() => handleSlide('next')}
                    className="absolute z-20 right-1 sm:right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-xl shadow-sm border border-white/30 text-white/90 hover:bg-white/40 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto mix-blend-luminosity"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Edge gradients for cinema-style fade masking */}
                <div className="absolute inset-y-0 left-0 w-12 sm:w-16 bg-gradient-to-r from-[var(--cinema-bg)] to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-l from-[var(--cinema-bg)] to-transparent pointer-events-none z-10" />

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div key="skeletons" className="flex gap-3 sm:gap-4 px-1 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-[140px] sm:w-[180px] lg:w-[200px] shrink-0">
                                    <MovieCardSkeleton />
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="cards" variants={staggerContainer} initial="hidden" animate="visible" className="relative z-0">
                            <Swiper
                                onSwiper={setSwiperRef}
                                modules={[Autoplay, FreeMode, Navigation]}
                                loop={true}
                                freeMode={true}
                                speed={8000} // Calibrated continuous fluid glide speed (cinematic)
                                autoplay={{
                                    delay: 0,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true, // Pauses cleanly when user hovers over a card
                                }}
                                allowTouchMove={true} // Allow manual sweeping with grab cursor
                                slidesPerView={1.8}
                                spaceBetween={12}
                                breakpoints={{
                                    480: { slidesPerView: 2.2, spaceBetween: 16 },
                                    640: { slidesPerView: 3.5, spaceBetween: 16 },
                                    1024: { slidesPerView: 5.5, spaceBetween: 16 },
                                    1280: { slidesPerView: 6.5, spaceBetween: 16 }
                                }}
                                className={`!py-2 !px-1 ${isManualSliding ? 'swiper-standard-ease' : 'swiper-linear'}`}
                            >
                                {doubledMovies.map((m, i) => (
                                    <SwiperSlide key={`${m.id}-${i}`} className="!h-auto flex">
                                        <div className="w-full h-full flex flex-col justify-between">
                                            <MovieCard movie={m} priority={i < 3} />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    );
}
