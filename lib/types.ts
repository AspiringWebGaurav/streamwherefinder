// Shared types for StreamWhereFinder

export interface PopularMovie {
    id: number;
    title: string;
    slug: string;
    posterPath: string | null;
    releaseDate: string;
    rating: number;
}

export interface Movie extends PopularMovie {
    overview: string;
    backdropPath: string | null;
    runtime?: number;
    genres: string[];
    trailerKey?: string;
    watchProviders?: {
        link?: string;
        streaming?: WatchProvider[];
        rent?: WatchProvider[];
        buy?: WatchProvider[];
    };
}

export interface WatchProvider {
    display_priority?: number;
    logo_path: string;
    provider_id?: number;
    provider_name: string;
}

export interface SearchApiResponse {
    movies: PopularMovie[];
    isClientSide?: boolean;
    totalResults?: number;
    query?: string;
    page?: number;
    totalPages?: number;
    didYouMean?: string | null;
}

export interface ScoredMovie extends PopularMovie {
    score: number;
    genres: string[];
    overview: string;
    popularity?: number;
}

export interface RecommendationResult {
    becauseYouLiked: ScoredMovie[];
    similarGenre: ScoredMovie[];
    trendingInCategory: ScoredMovie[];
}
