import { Movie, PopularMovie, SearchApiResponse } from '@/lib/types';
import { tmdbClient } from '@/lib/tmdb';

/**
 * Server-side data fetchers.
 * Homepage fetchers (trending, popular, upcoming) call tmdbClient directly
 * to avoid the self-referencing fetch anti-pattern that breaks on Vercel SSR.
 */

function getOrigin(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
}

export async function fetchTrending(): Promise<PopularMovie[]> {
    try {
        const response = await tmdbClient.getTrendingMovies('week');
        return response.results.slice(0, 20).map(m => tmdbClient.transformPopularMovie(m));
    } catch {
        return [];
    }
}

export async function fetchPopular(): Promise<PopularMovie[]> {
    try {
        const response = await tmdbClient.getPopularMovies();
        return response.results.slice(0, 20).map(m => tmdbClient.transformPopularMovie(m));
    } catch {
        return [];
    }
}

export async function fetchUpcoming(): Promise<PopularMovie[]> {
    try {
        const response = await tmdbClient.getUpcomingMovies();
        return response.results.slice(0, 20).map(m => tmdbClient.transformPopularMovie(m));
    } catch {
        return [];
    }
}

export async function fetchMovieDetails(slug: string): Promise<Movie | null> {
    try {
        const res = await fetch(`${getOrigin()}/api/movies/${slug}`, {
            next: { revalidate: 86400 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchSearch(query: string, limit = 10): Promise<SearchApiResponse> {
    const empty: SearchApiResponse = { movies: [], isClientSide: false, totalResults: 0, query };
    if (!query || query.length < 2) return empty;

    try {
        const url = new URL(`${getOrigin()}/api/search`);
        url.searchParams.set('q', query);
        url.searchParams.set('limit', limit.toString());

        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (!res.ok) return empty;
        return await res.json();
    } catch {
        return empty;
    }
}
