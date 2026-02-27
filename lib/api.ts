'use server';

import { Movie, PopularMovie, SearchApiResponse } from '@/lib/types';

/**
 * All fetchers call the app's own /api routes (which call TMDB directly).
 * No external backend server needed.
 */

function getOrigin(): string {
    // In server components / server actions, we need an absolute URL.
    // NEXT_PUBLIC_SITE_URL or Vercel's auto-injected VERCEL_URL work in prod.
    // Fallback to localhost:3000 for local dev.
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
}

export async function fetchTrending(): Promise<PopularMovie[]> {
    try {
        const res = await fetch(`${getOrigin()}/api/movies/trending`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.movies ?? data.results ?? [];
    } catch {
        return [];
    }
}

export async function fetchPopular(): Promise<PopularMovie[]> {
    try {
        const res = await fetch(`${getOrigin()}/api/movies/popular`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.movies ?? data.results ?? [];
    } catch {
        return [];
    }
}

export async function fetchUpcoming(): Promise<PopularMovie[]> {
    try {
        const res = await fetch(`${getOrigin()}/api/movies/upcoming`, {
            next: { revalidate: 7200 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.movies ?? data.results ?? [];
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
