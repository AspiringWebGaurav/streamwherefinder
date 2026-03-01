import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, TrendingUp, Star, Calendar, Award } from 'lucide-react';
import { tmdbClient } from '@/lib/tmdb';
import { MovieCardSkeleton } from '@/components/MovieCard';
import { MovieCarousel } from '@/components/MovieCarousel';
import { EnterpriseSearchBar } from '@/components/EnterpriseSearchBar';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

interface CollectionPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        page?: string;
    }>;
}

const COLLECTIONS = {
    'trending': {
        title: 'Trending Movies',
        description: 'The hottest movies trending right now in India',
        icon: TrendingUp,
        color: 'bg-rose-50 text-rose-600 border-rose-100',
        fetchData: () => tmdbClient.getTrendingMovies('week').then(r => ({ ...r, page: 1, total_pages: 1 })),
    },
    'popular': {
        title: 'Popular Movies',
        description: 'Most popular movies loved by audiences worldwide',
        icon: Star,
        color: 'bg-amber-50 text-amber-600 border-amber-100',
        fetchData: (page: number) => tmdbClient.getPopularMovies(page),
    },
    'upcoming': {
        title: 'Coming Soon',
        description: 'Upcoming movie releases to watch out for',
        icon: Calendar,
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        fetchData: (page: number) => tmdbClient.getUpcomingMovies(page),
    },
    'best-of-2024': {
        title: 'Best of 2024',
        description: 'Highest rated movies from 2024 that you cannot miss',
        icon: Award,
        color: 'bg-purple-50 text-purple-600 border-purple-100',
        fetchData: () => tmdbClient.getBestOfLastYear().then(r => ({ ...r, page: 1, total_pages: 1 })),
    },
} as const;

type CollectionSlug = keyof typeof COLLECTIONS;

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
    const { slug } = await params;
    const collection = COLLECTIONS[slug as CollectionSlug];

    if (!collection) {
        return {
            title: 'Collection Not Found',
        };
    }

    return {
        title: `${collection.title} | StreamWhere`,
        description: collection.description,
    };
}

function CollectionLoading() {
    return (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {Array.from({ length: 14 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
            ))}
        </div>
    );
}


async function CollectionContent({ slug, page }: { slug: CollectionSlug; page: number }) {
    const collection = COLLECTIONS[slug];
    let response;

    try {
        response = await collection.fetchData(page);
    } catch {
        return (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[var(--cinema-border)] shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                    <collection.icon className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Failed to load movies</h2>
                <p className="text-slate-600 mb-8">We&apos;re having trouble loading this collection. Please try again later.</p>
                <Link href="/" className="btn-secondary inline-flex px-6 h-11">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Explore
                </Link>
            </div>
        );
    }

    const movies = response.results.map(movie => tmdbClient.transformPopularMovie(movie));

    if (movies.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[var(--cinema-border)] shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-50 border border-[var(--cinema-border)] rounded-full flex items-center justify-center">
                    <collection.icon className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">No movies found</h2>
                <p className="text-slate-600 mb-8">We couldn&apos;t find any movies for this collection right now.</p>
                <Link href="/" className="btn-secondary inline-flex px-6 h-11">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Explore
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-4">
            <MovieCarousel movies={movies} />
        </div>
    );
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || '1', 10);
    const collection = COLLECTIONS[slug as CollectionSlug];

    if (!collection) {
        notFound();
    }

    const IconComponent = collection.icon;

    return (
        <div className="min-h-[100dvh] flex flex-col bg-[var(--cinema-bg)]">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 mt-2">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl border flex-shrink-0 shadow-sm ${collection.color}`}>
                            <IconComponent className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {collection.title}
                            </h1>
                            <p className="text-sm font-medium text-slate-600 mt-1.5 line-clamp-2">
                                {collection.description}
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:max-w-md shrink-0 relative z-40">
                        <EnterpriseSearchBar placeholder="Search within collection..." />
                    </div>
                </div>

                <Suspense fallback={<CollectionLoading />}>
                    <CollectionContent slug={slug as CollectionSlug} page={page} />
                </Suspense>
            </main>
        </div>
    );
}

export function generateStaticParams() {
    return Object.keys(COLLECTIONS).map((slug) => ({ slug }));
}
