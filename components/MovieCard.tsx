'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Eye } from 'lucide-react';
import { PopularMovie } from '@/lib/types';
import { subtleScale, subtleHoverTransition } from '@/lib/motion';
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
            variants={subtleScale}
            whileHover={{ y: -4, transition: subtleHoverTransition }}
            className={cn('saas-card interactive group relative w-40 sm:w-44 flex flex-col', className)}
        >
            <Link href={`/movies/${movie.slug}`} className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--saas-accent)] rounded-lg">
                {/* Poster Area */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--saas-bg)] border-b border-[var(--saas-border)]">
                    {movie.posterPath ? (
                        <Image
                            src={movie.posterPath}
                            alt={movie.title}
                            fill
                            sizes="(max-width: 640px) 160px, 176px"
                            className="object-cover"
                            priority={priority}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Eye className="w-8 h-8 opacity-20" />
                        </div>
                    )}
                </div>

                {/* Card Content */}
                <div className="px-3 pt-3 pb-4 flex flex-col flex-1 bg-white">
                    <div className="flex items-center justify-between mb-1.5">
                        {year && (
                            <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-[var(--saas-bg)] text-[var(--saas-text-secondary)]">
                                {year}
                            </span>
                        )}
                        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[var(--saas-text-primary)]">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{movie.rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--saas-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--saas-accent)] transition-colors">
                        {movie.title}
                    </h3>
                </div>
            </Link>
        </motion.article>
    );
}

// ── SaaS Skeleton Card ────────────────────────────────────────────────────────
export function MovieCardSkeleton() {
    return (
        <div className="saas-card w-40 sm:w-44 flex flex-col" style={{ borderColor: 'var(--saas-border-light)' }}>
            <div className="skeleton aspect-[2/3] w-full border-b border-[var(--saas-border-light)]" />
            <div className="p-3 space-y-2.5 bg-white">
                <div className="flex justify-between">
                    <div className="skeleton h-4 w-10 rounded-sm" />
                    <div className="skeleton h-4 w-12 rounded-sm" />
                </div>
                <div className="skeleton h-4 w-full rounded-sm" />
                <div className="skeleton h-4 w-2/3 rounded-sm" />
            </div>
        </div>
    );
}
