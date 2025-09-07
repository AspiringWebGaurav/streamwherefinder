import {
  TMDbMovie,
  TMDbMovieDetails,
  TMDbSearchResponse,
  TMDbTrendingResponse,
  TMDbDiscoverResponse,
  Movie,
  PopularMovie,
} from '@/types/tmdb';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

class TMDbClient {
  private apiKey: string;
  private readToken: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
    this.readToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN || '';
  }

  private async fetchWithAuth(endpoint: string, params?: Record<string, string>) {
    if (!this.apiKey || !this.readToken) {
      const missingKeys = [];
      if (!this.apiKey) missingKeys.push('NEXT_PUBLIC_TMDB_API_KEY');
      if (!this.readToken) missingKeys.push('NEXT_PUBLIC_TMDB_READ_TOKEN');
      
      const error = `TMDB API keys not configured: ${missingKeys.join(', ')}`;
      console.error(error);
      throw new Error(error);
    }

    const url = new URL(`${TMDB_API_BASE}${endpoint}`);
    
    // Add default parameters
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('language', 'en-US');
    
    // Add additional parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }


    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.readToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = `TMDB API error: ${response.status} ${response.statusText} - ${errorText}`;
        console.error(error);
        throw new Error(error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TMDB API fetch failed:', error);
      throw error;
    }
  }

  // Search movies with query
  async searchMovies(query: string, page: number = 1): Promise<TMDbSearchResponse> {
    return this.fetchWithAuth('/search/movie', {
      query: encodeURIComponent(query),
      page: page.toString(),
      include_adult: 'false',
    });
  }

  // Get movie details by ID
  async getMovieDetails(movieId: number): Promise<TMDbMovieDetails> {
    return this.fetchWithAuth(`/movie/${movieId}`, {
      append_to_response: 'videos,similar,watch/providers',
    });
  }

  // Get trending movies (for India region)
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDbTrendingResponse> {
    return this.fetchWithAuth(`/trending/movie/${timeWindow}`, {
      region: 'IN',
    });
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<TMDbDiscoverResponse> {
    return this.fetchWithAuth('/movie/popular', {
      page: page.toString(),
      region: 'IN',
    });
  }

  // Get upcoming movies
  async getUpcomingMovies(page: number = 1): Promise<TMDbDiscoverResponse> {
    return this.fetchWithAuth('/movie/upcoming', {
      page: page.toString(),
      region: 'IN',
    });
  }

  // Get movies from last year with high ratings
  async getBestOfLastYear(): Promise<TMDbDiscoverResponse> {
    const lastYear = new Date().getFullYear() - 1;
    return this.fetchWithAuth('/discover/movie', {
      'primary_release_year': lastYear.toString(),
      'vote_average.gte': '7.0',
      'vote_count.gte': '100',
      'sort_by': 'vote_average.desc',
    });
  }

  // Get movies by platform (using discover with watch providers)
  async getMoviesByProvider(providerId: number, page: number = 1): Promise<TMDbDiscoverResponse> {
    return this.fetchWithAuth('/discover/movie', {
      'with_watch_providers': providerId.toString(),
      'watch_region': 'IN',
      page: page.toString(),
      'sort_by': 'popularity.desc',
    });
  }

  // Get movies using discover with custom parameters
  async getDiscoverMovies(params: Record<string, string>, page: number = 1): Promise<TMDbDiscoverResponse> {
    return this.fetchWithAuth('/discover/movie', {
      page: page.toString(),
      ...params,
    });
  }

  // Utility functions
  getImageUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) {
      return null;
    }
    
    // Ensure path starts with / for proper URL construction
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const imageUrl = `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
    
    return imageUrl;
  }

  getPosterUrl(path: string | null): string | null {
    return this.getImageUrl(path, 'w500');
  }

  getBackdropUrl(path: string | null): string | null {
    return this.getImageUrl(path, 'w1280');
  }

  // Convert TMDb movie to simplified Movie type
  transformMovie(tmdbMovie: TMDbMovie | TMDbMovieDetails): Movie {
    const slug = this.createSlug(tmdbMovie.title, tmdbMovie.id);
    
    const movie: Movie = {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      slug,
      overview: tmdbMovie.overview,
      posterPath: this.getPosterUrl(tmdbMovie.poster_path),
      backdropPath: this.getBackdropUrl(tmdbMovie.backdrop_path),
      releaseDate: tmdbMovie.release_date,
      rating: Math.round(tmdbMovie.vote_average * 10) / 10,
      runtime: tmdbMovie.runtime,
      genres: tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : [],
    };

    // Add trailer if available
    if ('videos' in tmdbMovie && tmdbMovie.videos?.results) {
      const trailer = tmdbMovie.videos.results.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      );
      if (trailer) {
        movie.trailerKey = trailer.key;
      }
    }

    // Add watch providers if available
    if ('watch/providers' in tmdbMovie && tmdbMovie['watch/providers']?.results?.IN) {
      const providers = tmdbMovie['watch/providers'].results.IN;
      movie.watchProviders = {
        link: providers.link,
        streaming: providers.flatrate,
        rent: providers.rent,
        buy: providers.buy,
      };
    }

    return movie;
  }

  // Convert TMDb movie to PopularMovie (minimal data for search)
  transformPopularMovie(tmdbMovie: TMDbMovie): PopularMovie {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      slug: this.createSlug(tmdbMovie.title, tmdbMovie.id),
      posterPath: this.getPosterUrl(tmdbMovie.poster_path),
      releaseDate: tmdbMovie.release_date,
      rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    };
  }

  // Create URL-friendly slug from title and ID
  private createSlug(title: string, id: number): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
    
    return `${slug}-${id}`;
  }

  // Extract movie ID from slug
  extractIdFromSlug(slug: string): number {
    const parts = slug.split('-');
    const id = parts[parts.length - 1];
    return parseInt(id, 10);
  }
}

// Export singleton instance
export const tmdbClient = new TMDbClient();

// Provider IDs for popular streaming services in India
export const PROVIDER_IDS = {
  NETFLIX: 8,
  AMAZON_PRIME: 119,
  DISNEY_PLUS: 337,
  APPLE_TV: 350,
  YOUTUBE: 192,
  GOOGLE_PLAY: 3,
} as const;