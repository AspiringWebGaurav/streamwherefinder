'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clapperboard, Flame } from 'lucide-react';
import { ScoredMovie, Movie } from '@/lib/types';
import { buildRecommendations } from '@/services/recommendationEngine';
import { MovieCard } from '@/components/MovieCard';
import { MovieCarousel } from '@/components/MovieCarousel';
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

    // We map ScoredMovie to pass as PopularMovie since the interfaces are highly structurally compatible
    // and MovieCarousel treats it agnostically.
    return (
        <div className="pt-2">
            <MovieCarousel
                title={title}
                movies={movies as any}
            // Optional: We can pass the icon as a badge or just use the title 
            // in the MovieCarousel natively. We'll rely on MovieCarousel's standard styling.
            />
        </div>
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
