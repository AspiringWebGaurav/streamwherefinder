import Fuse from 'fuse.js';
import { PopularMovie } from '@/types/tmdb';
import { POPULAR_MOVIES_DATASET } from '@/data/popular-movies';
import { tmdbClient } from '@/lib/tmdb';

// Configure Fuse.js for fuzzy search
const fuseOptions = {
  keys: ['title'],
  threshold: 0.4, // Lower is more strict (0.0 = perfect match, 1.0 = match anything)
  distance: 100,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

// Create Fuse instance for client-side search
const fuse = new Fuse(POPULAR_MOVIES_DATASET, fuseOptions);

export interface SearchResult {
  movies: PopularMovie[];
  isClientSide: boolean;
  totalResults: number;
  query: string;
}

export interface DetailedSearchResult {
  movies: any[];
  isClientSide: boolean;
  totalResults: number;
  query: string;
  page: number;
  totalPages: number;
}

/**
 * Hybrid search function that tries client-side first, then falls back to server-side
 */
export async function hybridSearch(query: string, limit: number = 10): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return {
      movies: [],
      isClientSide: true,
      totalResults: 0,
      query,
    };
  }

  // First try client-side fuzzy search for instant results
  const clientResults = await clientSideSearch(query, limit);
  
  // If we have good client-side results (more than 3), return them
  if (clientResults.movies.length >= 3) {
    return clientResults;
  }

  // Otherwise, try server-side search for comprehensive results
  try {
    const serverResults = await serverSideSearch(query, limit);
    
    // Merge results, prioritizing client-side matches
    const mergedMovies = [...clientResults.movies];
    const clientIds = new Set(clientResults.movies.map(m => m.id));
    
    // Add server results that aren't already in client results
    for (const movie of serverResults.movies) {
      if (!clientIds.has(movie.id) && mergedMovies.length < limit) {
        mergedMovies.push(movie);
      }
    }

    return {
      movies: mergedMovies,
      isClientSide: false,
      totalResults: Math.max(clientResults.totalResults, serverResults.totalResults),
      query,
    };
  } catch (error) {
    console.error('Server-side search failed, returning client results:', error);
    return clientResults;
  }
}

/**
 * Client-side fuzzy search using Fuse.js
 */
export async function clientSideSearch(query: string, limit: number = 10): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return {
      movies: [],
      isClientSide: true,
      totalResults: 0,
      query,
    };
  }

  const results = fuse.search(query, { limit });
  const movies = results.map(result => {
    const movie = result.item;
    // Transform the poster path to full TMDB URL
    return {
      ...movie,
      posterPath: tmdbClient.getPosterUrl(movie.posterPath)
    };
  });


  return {
    movies,
    isClientSide: true,
    totalResults: movies.length,
    query,
  };
}

/**
 * Server-side search using API route
 */
export async function serverSideSearch(query: string, limit: number = 10): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return {
      movies: [],
      isClientSide: false,
      totalResults: 0,
      query,
    };
  }

  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Server-side search not available');
    }
    
    const url = new URL('/api/search', window.location.origin);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', limit.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      movies: data.movies,
      isClientSide: false,
      totalResults: data.totalResults,
      query: data.query,
    };
  } catch (error) {
    console.error('Search API failed:', error);
    return {
      movies: [],
      isClientSide: false,
      totalResults: 0,
      query,
    };
  }
}

/**
 * Comprehensive search with pagination for search results page
 */
export async function comprehensiveSearch(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<DetailedSearchResult> {
  if (!query || query.length < 2) {
    return {
      movies: [],
      isClientSide: true,
      totalResults: 0,
      query,
      page: 1,
      totalPages: 1,
    };
  }

  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Server-side search not available');
    }
    
    const url = new URL('/api/search', window.location.origin);
    url.searchParams.set('q', query);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }
    
    const data = await response.json();

    return {
      movies: data.movies,
      isClientSide: false,
      totalResults: data.totalResults,
      query: data.query,
      page: data.page || page,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error('Comprehensive search failed:', error);
    
    // Fallback to client-side search for page 1
    if (page === 1) {
      const clientResults = await clientSideSearch(query, limit);
      return {
        movies: clientResults.movies.map(movie => ({
          ...movie,
          genres: [],
          runtime: undefined,
          trailerKey: undefined,
          watchProviders: undefined,
        })),
        isClientSide: true,
        totalResults: clientResults.totalResults,
        query,
        page: 1,
        totalPages: 1,
      };
    }

    return {
      movies: [],
      isClientSide: false,
      totalResults: 0,
      query,
      page,
      totalPages: 1,
    };
  }
}

/**
 * Get autocomplete suggestions for search input
 */
export function getSearchSuggestions(query: string, limit: number = 5): PopularMovie[] {
  if (!query || query.length < 2) {
    return [];
  }

  const results = fuse.search(query, { limit });
  return results.map(result => {
    const movie = result.item;
    // Transform the poster path to full TMDB URL
    return {
      ...movie,
      posterPath: tmdbClient.getPosterUrl(movie.posterPath)
    };
  });
}

/**
 * Clean search query for better matching
 */
export function cleanSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Check if a search query might be a typo of a popular movie
 */
export function findTypoMatches(query: string, threshold: number = 0.6): PopularMovie[] {
  const results = fuse.search(query, { limit: 5 });
  return results
    .filter(result => result.score && result.score <= threshold)
    .map(result => result.item);
}