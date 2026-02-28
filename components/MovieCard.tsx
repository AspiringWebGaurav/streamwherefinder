'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Eye } from 'lucide-react';
import { PopularMovie } from '@/lib/types';
import { cardReveal, cinematicHover } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface Props {
    movie: PopularMovie;
    className?: string;
    priority?: boolean;
}

export function MovieCard({ movie, className, priority = false }: Props) {
    const year = movie.releaseDate?.slice(0, 4);

    return (
        <motion.article
            variants={cardReveal}
            whileHover={cinematicHover}
            className={cn(
                'group relative w-40 sm:w-44 flex flex-col rounded-xl overflow-hidden',
                'bg-white border border-[var(--cinema-border)]',
                'shadow-[var(--cinema-shadow-sm)] transition-shadow duration-300',
                'hover:shadow-[var(--cinema-shadow-md)] hover:border-[var(--cinema-border-hover)]',
                className
            )}
        >
            <Link
                href={`/movies/${movie.slug}`}
                className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cinema-accent)] rounded-xl"
            >
                {/* Poster Area */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--cinema-bg)] border-b border-[var(--cinema-border)]">
                    {movie.posterPath ? (
                        <Image
                            src={movie.posterPath}
                            alt={movie.title}
                            fill
                            sizes="(max-width: 640px) 160px, 176px"
                            className="object-cover card-poster-zoom"
                            priority={priority}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Eye className="w-8 h-8 opacity-20" />
                        </div>
                    )}

                    {/* Cinematic Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Rating Badge - Top Right on hover */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform-gpu">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{movie.rating.toFixed(1)}</span>
                    </div>

                    {/* Year reveal at bottom of poster on hover */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        {year && (
                            <span className="text-[10px] font-semibold text-white/70 tracking-wide uppercase">
                                {year}
                            </span>
                        )}
                    </div>
                </div>

                {/* Card Content */}
                <div className="px-3 pt-2.5 pb-3 flex flex-col flex-1 bg-white">
                    <div className="flex items-center justify-between mb-1">
                        {year && (
                            <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-[var(--cinema-bg)] text-[var(--cinema-text-secondary)]">
                                {year}
                            </span>
                        )}
                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[var(--cinema-text-primary)]">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{movie.rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--cinema-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--cinema-accent)] transition-colors duration-200">
                        {movie.title}
                    </h3>
                </div>
            </Link>
        </motion.article>
    );
}

// ── Skeleton Card ────────────────────────────────────────────────────────────
export function MovieCardSkeleton() {
    return (
        <div className="w-40 sm:w-44 flex flex-col rounded-xl overflow-hidden bg-white border border-[var(--cinema-border-subtle)]">
            <div className="skeleton aspect-[2/3] w-full border-b border-[var(--cinema-border-subtle)]" />
            <div className="p-3 space-y-2.5 bg-white">
                <div className="flex justify-between">
                    <div className="skeleton h-4 w-10 rounded" />
                    <div className="skeleton h-4 w-12 rounded" />
                </div>
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
            </div>
        </div>
    );
}
