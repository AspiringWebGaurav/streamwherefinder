import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';
import { Star, Calendar, Clock, Play, ArrowLeft } from 'lucide-react';
import { tmdbClient } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/MovieCarousel';
import { WatchProviders } from '@/components/WatchProviders';
import { Navbar } from '@/components/Navbar';
import {
    formatRuntime,
    formatReleaseDate,
    formatRating,
    truncateText,
    getYouTubeEmbedUrl,
    generateMetaDescription,
    generatePageTitle
} from '@/lib/utils';
import Link from 'next/link';
import type { Metadata } from 'next';

interface MoviePageProps {
    params: Promise<{
        slug: string;
    }>;
}

async function getMovieData(slug: string) {
    try {
        const movieId = tmdbClient.extractIdFromSlug(slug);
        if (!movieId || isNaN(movieId)) {
            return null;
        }

        const movieDetails = await tmdbClient.getMovieDetails(movieId);
        const transformedMovie = tmdbClient.transformMovie(movieDetails);

        return {
            movie: transformedMovie,
            raw: movieDetails,
        };
    } catch (error) {
        console.error('Failed to fetch movie data:', error);
        return null;
    }
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = await getMovieData(slug);

    if (!data) {
        return {
            title: 'Movie Not Found',
            description: 'The movie you are looking for could not be found.',
        };
    }

    const { movie } = data;
    const title = generatePageTitle(movie.title, `${formatReleaseDate(movie.releaseDate)} Movie`);
    const description = generateMetaDescription(movie.title, movie.overview);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'video.movie',
            images: movie.posterPath ? [
                {
                    url: movie.posterPath,
                    width: 500,
                    height: 750,
                    alt: `${movie.title} poster`,
                }
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: movie.posterPath ? [movie.posterPath] : [],
        },
    };
}

function TrailerEmbed({ trailerKey, title }: { trailerKey: string; title: string }) {
    return (
        <div className="relative w-full aspect-video bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl overflow-hidden shadow-sm">
            <iframe
                src={getYouTubeEmbedUrl(trailerKey)}
                title={`${title} trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
            />
        </div>
    );
}

export default async function MoviePage({ params }: MoviePageProps) {
    const { slug } = await params;
    const data = await getMovieData(slug);

    if (!data) {
        notFound();
    }

    const { movie, raw } = data;
    const year = formatReleaseDate(movie.releaseDate);
    const similarMovies = (raw as any).similar?.results?.slice(0, 10).map((m: any) => tmdbClient.transformPopularMovie(m)) || [];

    return (
        <main className="min-h-screen bg-[var(--saas-bg)] pb-16">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* Movie Details - Enterprise Layout */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-6xl mx-auto mb-8 lg:mb-12">
                    {/* Poster */}
                    <div className="w-full sm:max-w-[280px] lg:w-[320px] flex-shrink-0 mx-auto lg:mx-0">
                        <div className="relative w-full aspect-[2/3] bg-[var(--saas-bg)] rounded-xl overflow-hidden shadow-sm border border-[var(--saas-border-light)] transform transition-transform duration-300 hover:scale-[1.02]">
                            {movie.posterPath ? (
                                <Image
                                    src={movie.posterPath}
                                    alt={`${movie.title} poster`}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 320px"
                                    quality={100}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-[var(--saas-text-muted)]">
                                    <div className="text-center p-4">
                                        <div className="text-lg font-medium">No Image</div>
                                        <div className="text-sm mt-2 font-semibold">{movie.title}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Movie Information */}
                    <div className="flex-1 space-y-6 lg:space-y-8 flex flex-col justify-start">
                        {/* Title and Metadata */}
                        <div>
                            <h1 className="text-3xl lg:text-5xl font-extrabold text-[var(--saas-text-primary)] mb-4 tracking-tight">
                                {movie.title}
                                {year && <span className="text-[var(--saas-text-muted)] font-medium ml-3">({year})</span>}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-[var(--saas-text-secondary)] font-semibold text-sm">
                                {movie.rating > 0 && (
                                    <div className="flex items-center bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-200/50">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1.5" />
                                        <span>{formatRating(movie.rating)}</span>
                                        <span className="text-amber-700/60 ml-0.5">/10</span>
                                    </div>
                                )}

                                {movie.releaseDate && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1.5 text-[var(--saas-text-muted)]" />
                                        {year}
                                    </div>
                                )}

                                {movie.runtime && (
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1.5 text-[var(--saas-text-muted)]" />
                                        {formatRuntime(movie.runtime)}
                                    </div>
                                )}
                            </div>

                            {movie.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {movie.genres.map((genre) => (
                                        <span
                                            key={genre}
                                            className="px-3.5 py-1.5 bg-[var(--saas-bg)] text-[var(--saas-text-secondary)] font-semibold text-xs rounded-lg border border-[var(--saas-border-light)] shadow-sm"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Synopsis */}
                        {movie.overview && (
                            <div className="pt-1">
                                <h3 className="text-xs font-bold text-[var(--saas-text-muted)] mb-3 uppercase tracking-wider">Synopsis</h3>
                                <p className="text-[var(--saas-text-secondary)] leading-relaxed text-[15px] sm:text-base max-w-3xl line-clamp-3 hover:line-clamp-none transition-all duration-300">
                                    {movie.overview}
                                </p>
                            </div>
                        )}

                        {/* Where to Watch embedded directly inside the details column */}
                        <div className="pt-2 w-full max-w-3xl">
                            <WatchProviders
                                watchProviders={movie.watchProviders}
                                movieTitle={movie.title}
                                movieId={movie.id}
                                releaseDate={movie.releaseDate}
                            />
                        </div>
                    </div>
                </div>

                {/* Trailer Section */}
                {movie.trailerKey && (
                    <div className="mb-8 lg:mb-12 mt-10">
                        <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-5 lg:p-6 max-w-4xl mx-auto flex flex-col items-center">
                            <h3 className="text-lg font-bold text-[var(--saas-text-primary)] mb-5 flex items-center w-full justify-start border-b border-[var(--saas-border-light)]/50 pb-4">
                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3 shadow-sm border border-red-100">
                                    <Play className="w-4 h-4 text-red-500 ml-0.5" />
                                </div>
                                Official Trailer
                            </h3>
                            <div className="w-full max-w-3xl">
                                <Suspense fallback={
                                    <div className="w-full aspect-video bg-[var(--saas-bg)] rounded-xl flex items-center justify-center border border-[var(--saas-border-light)] shadow-inner">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full border-2 border-[var(--saas-accent)] border-t-transparent animate-spin mb-3"></div>
                                            <span className="text-xs font-semibold text-[var(--saas-text-muted)] tracking-wide">Loading Player...</span>
                                        </div>
                                    </div>
                                }>
                                    <TrailerEmbed trailerKey={movie.trailerKey} title={movie.title} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                )}

                {/* Similar Movies */}
                {similarMovies.length > 0 && (
                    <div className="mt-12 lg:mt-16 pt-6 lg:pt-8 border-t border-[var(--saas-border-light)] max-w-7xl mx-auto">
                        <MovieCarousel
                            title="Similar Movies"
                            movies={similarMovies}
                            badge="Recommended"
                            autoSlideDirection="left"
                        />
                    </div>
                )}
            </div>

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Movie",
                        "name": movie.title,
                        "description": movie.overview,
                        "datePublished": movie.releaseDate,
                        "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
                        "genre": movie.genres,
                        "aggregateRating": movie.rating > 0 ? {
                            "@type": "AggregateRating",
                            "ratingValue": movie.rating,
                            "ratingCount": 1000,
                            "bestRating": 10,
                            "worstRating": 0
                        } : undefined,
                        "image": movie.posterPath,
                        "trailer": movie.trailerKey ? {
                            "@type": "VideoObject",
                            "name": `${movie.title} Trailer`,
                            "embedUrl": getYouTubeEmbedUrl(movie.trailerKey),
                            "thumbnailUrl": movie.posterPath,
                            "uploadDate": movie.releaseDate
                        } : undefined
                    })
                }}
            />
        </main>
    );
}
