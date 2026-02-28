/**
 * TMDB API Client — Self-contained, no external backend needed.
 * Reads keys from .env.local (NEXT_PUBLIC_TMDB_API_KEY, NEXT_PUBLIC_TMDB_READ_TOKEN).
 */

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/* ─── Raw TMDB types (minimal) ─────────────────────────────────────────────── */
export interface TMDbMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    original_language: string;
    genre_ids?: number[];
    genres?: { id: number; name: string }[];
    runtime?: number;
    videos?: { results: { key: string; type: string; site: string }[] };
}

interface TMDbPagedResponse {
    results: TMDbMovie[];
    total_results: number;
    total_pages: number;
    page: number;
}

/* ─── Transformed types (what the UI uses) ─────────────────────────────────── */
export interface PopularMovie {
    id: number;
    title: string;
    slug: string;
    posterPath: string | null;
    releaseDate: string;
    rating: number;
    popularity?: number;
    voteCount?: number;
    originalLanguage?: string;
}

export interface Movie extends PopularMovie {
    overview: string;
    backdropPath: string | null;
    runtime?: number;
    genres: string[];
    trailerKey?: string;
}

/* ─── Client ───────────────────────────────────────────────────────────────── */
class TMDbClient {
    private apiKey: string;
    private readToken: string;

    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
        this.readToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN || '';
    }

    private async fetchWithAuth(endpoint: string, params?: Record<string, string>) {
        if (!this.apiKey || !this.readToken) {
            throw new Error(
                `TMDB API keys not configured. Check .env.local for NEXT_PUBLIC_TMDB_API_KEY and NEXT_PUBLIC_TMDB_READ_TOKEN.`
            );
        }

        const url = new URL(`${TMDB_API_BASE}${endpoint}`);
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('language', 'en-US');
        if (params) {
            Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
        }

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${this.readToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`TMDB API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    // ── Data fetchers ─────────────────────────────────────────────────────────

    async searchMovies(query: string, page = 1): Promise<TMDbPagedResponse> {
        return this.fetchWithAuth('/search/movie', {
            query: encodeURIComponent(query),
            page: page.toString(),
            include_adult: 'false',
        });
    }

    async getMovieDetails(movieId: number): Promise<TMDbMovie> {
        return this.fetchWithAuth(`/movie/${movieId}`, {
            append_to_response: 'videos,similar',
        });
    }

    async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDbPagedResponse> {
        return this.fetchWithAuth(`/trending/movie/${timeWindow}`, { region: 'IN' });
    }

    async getPopularMovies(page = 1): Promise<TMDbPagedResponse> {
        return this.fetchWithAuth('/movie/popular', { page: page.toString(), region: 'IN' });
    }

    async getUpcomingMovies(page = 1): Promise<TMDbPagedResponse> {
        return this.fetchWithAuth('/movie/upcoming', { page: page.toString(), region: 'IN' });
    }

    async getBestOfLastYear(): Promise<TMDbPagedResponse> {
        const lastYear = new Date().getFullYear() - 1;
        return this.fetchWithAuth('/discover/movie', {
            'primary_release_year': lastYear.toString(),
            'vote_average.gte': '7.0',
            'vote_count.gte': '100',
            'sort_by': 'vote_average.desc',
        });
    }



    async getDiscoverMovies(params: Record<string, string>, page = 1): Promise<TMDbPagedResponse> {
        return this.fetchWithAuth('/discover/movie', {
            page: page.toString(),
            ...params,
        });
    }

    // ── Image helpers ─────────────────────────────────────────────────────────

    getPosterUrl(path: string | null): string | null {
        return path ? `${TMDB_IMAGE_BASE}/w500${path.startsWith('/') ? path : `/${path}`}` : null;
    }

    getBackdropUrl(path: string | null): string | null {
        return path ? `${TMDB_IMAGE_BASE}/w1280${path.startsWith('/') ? path : `/${path}`}` : null;
    }

    // ── Transformers ──────────────────────────────────────────────────────────

    transformPopularMovie(raw: TMDbMovie): PopularMovie {
        return {
            id: raw.id,
            title: raw.title,
            slug: this.createSlug(raw.title, raw.id),
            posterPath: this.getPosterUrl(raw.poster_path),
            releaseDate: raw.release_date,
            rating: Math.round(raw.vote_average * 10) / 10,
            popularity: raw.popularity,
            voteCount: raw.vote_count,
            originalLanguage: raw.original_language,
        };
    }

    transformMovie(raw: TMDbMovie): Movie {
        const movie: Movie = {
            id: raw.id,
            title: raw.title,
            slug: this.createSlug(raw.title, raw.id),
            overview: raw.overview,
            posterPath: this.getPosterUrl(raw.poster_path),
            backdropPath: this.getBackdropUrl(raw.backdrop_path),
            releaseDate: raw.release_date,
            rating: Math.round(raw.vote_average * 10) / 10,
            runtime: raw.runtime,
            genres: raw.genres ? raw.genres.map((g) => g.name) : [],
            popularity: raw.popularity,
            voteCount: raw.vote_count,
            originalLanguage: raw.original_language,
        };

        if (raw.videos?.results) {
            const trailer = raw.videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) movie.trailerKey = trailer.key;
        }

        return movie;
    }

    extractIdFromSlug(slug: string): number {
        const parts = slug.split('-');
        return parseInt(parts[parts.length - 1], 10);
    }

    private createSlug(title: string, id: number): string {
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        return `${slug}-${id}`;
    }
}

export const tmdbClient = new TMDbClient();


