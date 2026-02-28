'use client';

import { useState, useEffect } from 'react';
import { Shuffle, RefreshCw, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { tmdbClient } from '@/lib/tmdb';
import { Movie } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';

interface RandomMovieState {
    movie: Movie | null;
    isLoading: boolean;
    isAnimating: boolean;
    error: string | null;
}

function SpinAnimation({ isSpinning }: { isSpinning: boolean }) {
    return (
        <div className={cn(
            'relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-8 sm:mb-12 transition-all duration-700',
            isSpinning && 'scale-110'
        )}>
            {/* Outer ring */}
            <div className={cn(
                "absolute inset-0 rounded-full border-[6px] border-dashed border-[var(--saas-accent)]/20 transition-all duration-1000",
                isSpinning ? "animate-[spin_3s_linear_infinite]" : ""
            )} />

            {/* Inner circle */}
            <div className="absolute inset-4 sm:inset-6 rounded-full bg-[var(--saas-accent)] flex items-center justify-center shadow-lg shadow-[var(--saas-accent)]/20">
                <Shuffle className={cn(
                    'w-12 h-12 sm:w-16 sm:h-16 text-white transition-transform duration-700',
                    isSpinning ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                )} />
            </div>

            {/* Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
                <Sparkles className={cn("absolute top-2 sm:top-4 right-4 sm:right-8 w-5 h-5 sm:w-6 sm:h-6 text-amber-400 transition-opacity duration-300", isSpinning ? "animate-bounce opacity-100" : "opacity-0")} style={{ animationDelay: '100ms' }} />
                <Sparkles className={cn("absolute bottom-6 sm:bottom-8 left-2 sm:left-4 w-4 h-4 text-emerald-400 transition-opacity duration-300", isSpinning ? "animate-bounce opacity-100" : "opacity-0")} style={{ animationDelay: '300ms' }} />
                <Sparkles className={cn("absolute top-10 sm:top-12 left-10 sm:left-12 w-4 h-4 sm:w-5 sm:h-5 text-sky-400 transition-opacity duration-300", isSpinning ? "animate-bounce opacity-100" : "opacity-0")} style={{ animationDelay: '500ms' }} />
            </div>
        </div>
    );
}

function MovieLoadingSkeleton() {
    return (
        <div className="animate-pulse max-w-2xl mx-auto mt-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start bg-white p-6 sm:p-8 rounded-2xl border border-[var(--saas-border-light)] shadow-sm">
                <div className="w-48 h-72 bg-[var(--saas-bg)] rounded-xl border border-[var(--saas-border)]" />
                <div className="flex-1 space-y-4 w-full">
                    <div className="h-8 bg-[var(--saas-bg)] rounded-lg w-3/4" />
                    <div className="h-4 bg-[var(--saas-bg)] rounded-lg w-1/3" />
                    <div className="h-4 bg-[var(--saas-bg)] rounded-lg w-full mt-6" />
                    <div className="h-4 bg-[var(--saas-bg)] rounded-lg w-5/6" />
                    <div className="h-4 bg-[var(--saas-bg)] rounded-lg w-4/6" />
                </div>
            </div>
        </div>
    );
}

export default function RandomMoviePage() {
    const [state, setState] = useState<RandomMovieState>({
        movie: null,
        isLoading: false,
        isAnimating: false,
        error: null,
    });

    const getRandomMovie = async () => {
        setState(prev => ({ ...prev, isLoading: true, isAnimating: true, error: null }));

        try {
            // Add delay for animation effect
            await new Promise(resolve => setTimeout(resolve, 2000));

            const getSecureRandom = (): number => {
                const array = new Uint32Array(1);
                crypto.getRandomValues(array);
                return array[0] / (0xffffffff + 1);
            };

            const randomPage = Math.floor(getSecureRandom() * 3) + 1;

            const [popularResponse, trendingResponse] = await Promise.all([
                tmdbClient.getPopularMovies(randomPage),
                tmdbClient.getTrendingMovies('day'),
            ]);

            const trendingIds = new Set(trendingResponse.results.map(m => m.id));
            const allMovies = [
                ...trendingResponse.results,
                ...popularResponse.results.filter(m => !trendingIds.has(m.id)),
            ];

            if (allMovies.length === 0) {
                throw new Error('No movies found');
            }

            const randomIndex = Math.floor(getSecureRandom() * allMovies.length);
            const randomMovieData = allMovies[randomIndex];

            const movieDetails = await tmdbClient.getMovieDetails(randomMovieData.id);
            const movie = tmdbClient.transformMovie(movieDetails);

            setState(prev => ({
                ...prev,
                movie,
                isLoading: false,
                isAnimating: false
            }));

        } catch (error) {
            console.error('Failed to fetch random movie:', error);
            setState(prev => ({
                ...prev,
                error: 'Failed to find a movie. Please try again!',
                isLoading: false,
                isAnimating: false,
            }));
        }
    };

    useEffect(() => {
        getRandomMovie();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--saas-bg)] pb-16">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                {state.isAnimating || (state.isLoading && !state.movie) ? (
                    <div className="text-center">
                        <SpinAnimation isSpinning={state.isAnimating} />
                        <div className="space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--saas-text-primary)] tracking-tight">
                                Finding your perfect movie...
                            </h2>
                            <p className="text-[var(--saas-text-secondary)] font-medium text-lg">
                                {state.isAnimating ? "Spinning the wheel of cinema!" : "Almost there..."}
                            </p>
                        </div>
                        {state.isLoading && !state.isAnimating && <MovieLoadingSkeleton />}
                    </div>
                ) : state.error ? (
                    <div className="text-center max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-[var(--saas-border-light)]">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                            <RefreshCw className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--saas-text-primary)] mb-3">Oops!</h2>
                        <p className="text-[var(--saas-text-secondary)] mb-8 font-medium">{state.error}</p>
                        <button
                            onClick={getRandomMovie}
                            disabled={state.isLoading}
                            className="btn-primary w-full h-12 justify-center shadow-sm"
                        >
                            <Shuffle className="w-5 h-5 mr-2" />
                            Try Again
                        </button>
                    </div>
                ) : state.movie ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Result Header */}
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-4 py-1.5 rounded-full mb-6 shadow-sm">
                                <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
                                <span className="text-sm font-bold">Your movie tonight!</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--saas-text-primary)] mb-4 tracking-tight">
                                {state.movie.title}
                            </h2>
                            {state.movie.rating > 0 && (
                                <p className="text-[var(--saas-text-secondary)] font-medium text-lg">
                                    ⭐ <span className="text-[var(--saas-text-primary)] font-bold">{state.movie.rating.toFixed(1)}</span>/10 • Perfect for tonight!
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-6 sm:p-8 lg:p-10">
                            <div className="flex flex-col sm:flex-row gap-8 lg:gap-12 items-center sm:items-start">
                                {/* Movie Poster */}
                                <div className="w-[200px] sm:w-[240px] flex-shrink-0">
                                    <MovieCard
                                        movie={state.movie}
                                        priority
                                        className="w-full"
                                    />

                                    <div className="mt-6 flex flex-col gap-3">
                                        <button
                                            onClick={getRandomMovie}
                                            disabled={state.isLoading}
                                            className="btn-secondary w-full justify-center h-11 shadow-sm font-bold text-[var(--saas-accent)] hover:bg-[var(--saas-accent)] hover:text-white border-[var(--saas-accent)]"
                                        >
                                            {state.isLoading ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Shuffle className="w-4 h-4 mr-2" />
                                            )}
                                            Spin Again
                                        </button>
                                        <Link href={`/movies/${state.movie.slug}`} className="btn-primary w-full justify-center h-11 shadow-sm">
                                            View Full Details
                                        </Link>
                                    </div>
                                </div>

                                {/* Movie Info */}
                                <div className="flex-1 space-y-8 w-full">
                                    {state.movie.overview && (
                                        <div>
                                            <h3 className="text-lg font-bold text-[var(--saas-text-primary)] mb-3 border-b border-[var(--saas-border)] pb-2 inline-block">Synopsis</h3>
                                            <p className="text-[var(--saas-text-secondary)] leading-relaxed text-[15px]">
                                                {state.movie.overview}
                                            </p>
                                        </div>
                                    )}

                                    {state.movie.genres.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-[var(--saas-text-primary)] mb-3 text-opacity-70 uppercase tracking-wider">Genres</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {state.movie.genres.map((genre) => (
                                                    <span
                                                        key={genre}
                                                        className="px-3 py-1 bg-[var(--saas-bg)] border border-[var(--saas-border)] text-[var(--saas-text-secondary)] text-xs font-bold rounded-lg shadow-sm"
                                                    >
                                                        {genre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Fun Facts */}
                {!state.isAnimating && !state.isLoading && (
                    <div className="mt-16 bg-white rounded-2xl p-8 border border-[var(--saas-border-light)] shadow-sm">
                        <h3 className="text-xl font-bold text-[var(--saas-text-primary)] mb-8 flex items-center justify-center">
                            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 mr-3 flex items-center justify-center border border-amber-100/50">🎬</span>
                            Did you know?
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-6 text-center">
                            <div className="bg-[var(--saas-bg)] p-5 rounded-xl border border-[var(--saas-border)]">
                                <div className="text-3xl font-extrabold text-[var(--saas-text-primary)] mb-2">500+</div>
                                <div className="text-sm font-medium text-[var(--saas-text-secondary)]">Movies in our database</div>
                            </div>
                            <div className="bg-[var(--saas-bg)] p-5 rounded-xl border border-[var(--saas-border)]">
                                <div className="text-3xl font-extrabold text-[var(--saas-accent)] mb-2">24/7</div>
                                <div className="text-sm font-medium text-[var(--saas-text-secondary)]">Updated recommendations</div>
                            </div>
                            <div className="bg-[var(--saas-bg)] p-5 rounded-xl border border-[var(--saas-border)]">
                                <div className="text-3xl font-extrabold text-emerald-600 mb-2">100%</div>
                                <div className="text-sm font-medium text-[var(--saas-text-secondary)]">Legal streaming only</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
