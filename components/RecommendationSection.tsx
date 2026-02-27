'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clapperboard, Flame } from 'lucide-react';
import { ScoredMovie, Movie } from '@/lib/types';
import { buildRecommendations } from '@/services/recommendationEngine';
import { MovieCard } from '@/components/MovieCard';
import { staggerContainer, fadeUp, inViewProps } from '@/lib/motion';

interface Props {
    pool: ScoredMovie[];
    reference: Movie;
}

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    movies: ScoredMovie[];
}

function RecoSection({ icon, title, movies }: SectionProps) {
    if (!movies.length) return null;
    return (
        <motion.div
            variants={staggerContainer}
            {...inViewProps}
            className="space-y-4"
        >
            <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[var(--saas-accent-light)] text-[var(--saas-accent)] flex items-center justify-center">
                    {icon}
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[var(--saas-text-primary)]">
                    {title}
                </h3>
            </motion.div>

            <motion.div variants={staggerContainer} className="flex gap-4 overflow-x-auto pb-2 carousel-track">
                {movies.slice(0, 8).map((m) => (
                    <MovieCard key={m.id} movie={m} />
                ))}
            </motion.div>
        </motion.div>
    );
}

export function RecommendationSection({ pool, reference }: Props) {
    const recs = useMemo(() => buildRecommendations(pool, reference), [pool, reference]);

    return (
        <section className="space-y-10">
            <RecoSection
                icon={<Heart className="w-5 h-5" />}
                title={`Because you liked ${reference.title}`}
                movies={recs.becauseYouLiked}
            />
            <RecoSection
                icon={<Clapperboard className="w-5 h-5" />}
                title="Similar genre picks"
                movies={recs.similarGenre}
            />
            <RecoSection
                icon={<Flame className="w-5 h-5" />}
                title="Trending in this category"
                movies={recs.trendingInCategory}
            />
        </section>
    );
}
