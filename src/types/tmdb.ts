export interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  genre_ids: number[];
  genres?: Genre[];
  adult: boolean;
  popularity: number;
  video?: boolean;
  original_language: string;
}

export interface TMDbSearchResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDbMovie[];
}

export interface TMDbMovieDetails extends TMDbMovie {
  runtime: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  imdb_id: string;
  belongs_to_collection?: Collection;
  videos?: {
    results: Video[];
  };
  similar?: {
    results: TMDbMovie[];
  };
  'watch/providers'?: {
    results: {
      [countryCode: string]: WatchProviders;
    };
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface WatchProviders {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
}

export interface WatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface TMDbTrendingResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDbMovie[];
}

export interface TMDbDiscoverResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDbMovie[];
}

// Simplified Movie type for the application
export interface Movie {
  id: number;
  title: string;
  slug: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  rating: number;
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

export interface PopularMovie {
  id: number;
  title: string;
  slug: string;
  posterPath: string | null;
  releaseDate: string;
  rating: number;
}