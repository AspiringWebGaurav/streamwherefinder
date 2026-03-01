'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PopularMovie } from '@/lib/types';
import { MovieCard, MovieCardSkeleton } from '@/components/MovieCard';
import { fadeUp, staggerContainer, inViewProps } from '@/lib/motion';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';
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
                                modules={[Autoplay, FreeMode]}
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
                                className="!py-2 !px-1 swiper-linear"
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
