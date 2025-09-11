'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Shuffle, RefreshCw, Sparkles, X, Search, ChevronLeft, ExternalLink, Play, Clock, Star, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PosterImage } from '@/components/ui/ImageWithFallback';
import { WatchProviders } from '@/components/movie/WatchProviders';
import { SearchBar } from '@/components/search/SearchBar';
import { useLoader, useAsyncTask } from '@/app/providers/LoaderProvider';
import { useAuth } from '@/app/providers/FirebaseProvider';
import { tmdbClient } from '@/lib/tmdb';
import { Movie, PopularMovie } from '@/types/tmdb';
import { trackRandomSpin, trackOutboundClick } from '@/lib/analytics';
import { formatRating, formatReleaseDate, formatRuntime, cn } from '@/lib/utils';
import Link from 'next/link';

interface SpinTonightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MovieCache {
  [key: string]: {
    data: Movie;
    timestamp: number;
  };
}

interface SpinHistory {
  movie: Movie;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_SPIN_HISTORY = 10;

// Enhanced spinning animation with glassmorphism
function SpinAnimation({ 
  isSpinning, 
  size = 'lg',
  className 
}: { 
  isSpinning: boolean; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  return (
    <div className={cn(
      'relative mx-auto mb-6',
      sizes[size],
      className
    )}>
      {/* Outer animated ring */}
      <div className={cn(
        'absolute inset-0 rounded-full border-4 border-dashed',
        'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
        'backdrop-filter backdrop-blur-sm',
        isSpinning ? 'animate-spin border-purple-400/60' : 'border-purple-300/40 animate-pulse'
      )} />
      
      {/* Inner circle with glassmorphism */}
      <div className="absolute inset-4 rounded-full glass-dark flex items-center justify-center">
        <Shuffle className={cn(
          'w-10 h-10 lg:w-12 lg:h-12 text-white transition-all duration-500 ease-out',
          isSpinning 
            ? 'rotate-180 scale-110 animate-pulse' 
            : 'rotate-0 scale-100'
        )} />
      </div>
      
      {/* Animated sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles className={cn(
          'absolute top-2 right-6 w-4 h-4 text-yellow-400',
          'animate-bounce delay-100'
        )} />
        <Sparkles className={cn(
          'absolute bottom-6 left-2 w-3 h-3 text-pink-400',
          'animate-bounce delay-300'
        )} />
        <Sparkles className={cn(
          'absolute top-8 left-8 w-4 h-4 text-blue-400',
          'animate-bounce delay-500'
        )} />
      </div>

      {/* Glow effect */}
      {isSpinning && (
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-xl animate-pulse" />
      )}
    </div>
  );
}

// Enhanced loading skeleton with glassmorphism
function MovieLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Poster skeleton */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <div className="w-32 h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mx-auto lg:mx-0" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto lg:mx-0" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <div className="h-10 bg-gray-200 rounded-lg w-32" />
              <div className="h-10 bg-gray-200 rounded-lg w-28" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Watch providers skeleton */}
      <div className="glass rounded-xl p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Error boundary component
function SpinTonightError({ 
  error, 
  onRetry, 
  onClose 
}: { 
  error: string; 
  onRetry: () => void; 
  onClose: () => void;
}) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-red-500" />
      </div>
      
      <h3 className="modal-heading-secondary text-gray-900 mb-4">
        Oops! Something went wrong
      </h3>
      
      <p className="modal-text-body text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
        {error}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onRetry}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again
        </Button>
        
        <Button
          onClick={onClose}
          variant="outline"
          size="lg"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

export function SpinTonightModal({ isOpen, onClose }: SpinTonightModalProps) {
  const { user } = useAuth();
  const { startTask, endTask } = useLoader();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [spinHistory, setSpinHistory] = useState<SpinHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isFirstSpin, setIsFirstSpin] = useState(true);
  
  // Cache management
  const cacheRef = useRef<MovieCache>({});
  const taskKeyRef = useRef<string | null>(null);
  
  // Async task management with error handling
  const {
    execute: fetchRandomMovie,
    isLoading,
    error,
    clearError
  } = useAsyncTask('spin_tonight_fetch');

  // Enhanced random movie fetching with caching
  const getRandomMovie = useCallback(async (): Promise<Movie> => {
    // Check cache first
    const cacheKeys = Object.keys(cacheRef.current);
    const validCacheKeys = cacheKeys.filter(key => {
      const cached = cacheRef.current[key];
      return cached && (Date.now() - cached.timestamp < CACHE_DURATION);
    });

    // Use cached movie if available and not recently shown
    const recentMovieIds = spinHistory.slice(-3).map(h => h.movie.id);
    const availableCached = validCacheKeys.filter(key => {
      const movieId = parseInt(key);
      return !recentMovieIds.includes(movieId);
    });

    if (availableCached.length > 0 && Math.random() > 0.7) {
      const randomKey = availableCached[Math.floor(Math.random() * availableCached.length)];
      const cached = cacheRef.current[randomKey];
      return cached.data;
    }

    // Fetch new movie
    const usePopular = Math.random() > 0.5;
    const response = usePopular 
      ? await tmdbClient.getPopularMovies()
      : await tmdbClient.getTrendingMovies();
    
    if (response.results.length === 0) {
      throw new Error('No movies found. Please try again!');
    }
    
    // Filter out recently shown movies
    const availableMovies = response.results.filter(m => 
      !recentMovieIds.includes(m.id)
    );
    
    const moviesToChooseFrom = availableMovies.length > 0 ? availableMovies : response.results;
    const randomIndex = Math.floor(Math.random() * Math.min(moviesToChooseFrom.length, 15));
    const randomMovieData = moviesToChooseFrom[randomIndex];
    
    // Fetch full details
    const movieDetails = await tmdbClient.getMovieDetails(randomMovieData.id);
    const transformedMovie = tmdbClient.transformMovie(movieDetails);
    
    // Cache the movie
    cacheRef.current[transformedMovie.id.toString()] = {
      data: transformedMovie,
      timestamp: Date.now()
    };
    
    return transformedMovie;
  }, [spinHistory]);

  // Enhanced spin function with analytics and history
  const handleSpin = useCallback(async () => {
    if (isLoading) return;

    try {
      clearError();
      
      // Analytics tracking
      if (movie) {
        trackRandomSpin(movie.id, movie.title);
      }
      
      const newMovie = await fetchRandomMovie(getRandomMovie);
      
      // Update movie and history
      setMovie(newMovie);
      setSpinHistory(prev => {
        const newHistory = [{ movie: newMovie, timestamp: Date.now() }, ...prev];
        return newHistory.slice(0, MAX_SPIN_HISTORY);
      });
      setCurrentHistoryIndex(0);
      setIsFirstSpin(false);
      
      // Track successful spin
      trackRandomSpin(newMovie.id, newMovie.title);
      
    } catch (error) {
      console.error('Failed to fetch random movie:', error);
    }
  }, [isLoading, movie, fetchRandomMovie, getRandomMovie, clearError]);

  // History navigation
  const navigateHistory = useCallback((direction: 'prev' | 'next') => {
    if (spinHistory.length === 0) return;
    
    const newIndex = direction === 'prev' 
      ? Math.min(currentHistoryIndex + 1, spinHistory.length - 1)
      : Math.max(currentHistoryIndex - 1, 0);
    
    setCurrentHistoryIndex(newIndex);
    setMovie(spinHistory[newIndex].movie);
    
    trackOutboundClick('history_navigation', spinHistory[newIndex].movie.title, 'streaming');
  }, [spinHistory, currentHistoryIndex]);

  // Initial spin when modal opens
  useEffect(() => {
    if (isOpen && isFirstSpin && !movie && !isLoading) {
      handleSpin();
    }
  }, [isOpen, isFirstSpin, movie, isLoading, handleSpin]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
        case 'Enter':
          if (!e.shiftKey) {
            e.preventDefault();
            handleSpin();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateHistory('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateHistory('next');
          break;
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSearch(!showSearch);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSpin, navigateHistory, showSearch]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  // Cache cleanup
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      Object.keys(cacheRef.current).forEach(key => {
        const cached = cacheRef.current[key];
        if (now - cached.timestamp > CACHE_DURATION) {
          delete cacheRef.current[key];
        }
      });
    };

    const interval = setInterval(cleanup, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Enhanced backdrop with glassmorphism */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40 backdrop-filter backdrop-blur-md z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal with enhanced glassmorphism */}
      <div
        className={cn(
          'relative modal-glass w-full h-full sm:h-auto sm:rounded-2xl shadow-2xl z-20',
          'sm:max-w-5xl sm:max-h-[95vh] overflow-y-auto',
          'modal-performance-optimized'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="spin-tonight-title"
      >
        {/* Header with enhanced styling */}
        <div className="sticky top-0 glass-navbar rounded-t-2xl p-4 sm:p-6 border-b border-white/10 safe-area-inset-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Navigation history buttons */}
              {spinHistory.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateHistory('prev')}
                    disabled={currentHistoryIndex >= spinHistory.length - 1}
                    className={cn(
                      'p-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'hover:bg-white/20 active:bg-white/30 text-white'
                    )}
                    aria-label="Previous movie"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-sm text-white/80 px-2">
                    {currentHistoryIndex + 1} of {spinHistory.length}
                  </span>
                  
                  <button
                    onClick={() => navigateHistory('next')}
                    disabled={currentHistoryIndex <= 0}
                    className={cn(
                      'p-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'hover:bg-white/20 active:bg-white/30 text-white'
                    )}
                    aria-label="Next movie"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              )}
              
              <div className="text-center flex-1 min-w-0">
                <h2 id="spin-tonight-title" className="modal-heading-primary text-white leading-tight">
                  🎲 Spin Tonight
                </h2>
                <p className="modal-text-caption text-white/80 mt-1">
                  Discover your perfect movie match!
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Search toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center',
                  showSearch 
                    ? 'bg-blue-500/30 text-blue-200' 
                    : 'hover:bg-white/20 active:bg-white/30 text-white/80'
                )}
                aria-label="Toggle search"
                title="Search while browsing (Ctrl+S)"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 active:bg-white/30 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search bar */}
          {showSearch && (
            <div className="mt-4">
              <SearchBar
                placeholder="Search for movies while browsing..."
                size="md"
                showSuggestions={true}
                onSearch={(query) => {
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  onClose();
                }}
                className="max-w-none"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="modal-padding-responsive pb-safe">
          {error ? (
            <SpinTonightError
              error={error.message}
              onRetry={() => {
                clearError();
                handleSpin();
              }}
              onClose={onClose}
            />
          ) : isLoading && !movie ? (
            <div className="text-center py-12">
              <SpinAnimation isSpinning={true} />
              <div className="space-y-3">
                <h3 className="modal-heading-secondary text-gray-900">
                  Finding your perfect movie...
                </h3>
                <p className="modal-text-body text-gray-600">
                  Spinning the wheel of cinema magic!
                </p>
              </div>
            </div>
          ) : movie ? (
            <div className="modal-gap-responsive">
              {/* Movie result header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full mb-4 animate-in slide-in-from-top-2 duration-500">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {currentHistoryIndex === 0 ? 'Your movie tonight!' : 'From your spin history'}
                </div>
                
                <h3 className="modal-heading-primary text-gray-900 mb-2 animate-in slide-in-from-bottom-2 duration-700">
                  {movie.title}
                </h3>
                
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 animate-in slide-in-from-bottom-2 duration-1000">
                  {movie.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{formatRating(movie.rating)}/10</span>
                    </div>
                  )}
                  
                  {movie.releaseDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatReleaseDate(movie.releaseDate)}</span>
                    </div>
                  )}
                  
                  {movie.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Movie details card */}
              <div className="glass rounded-xl p-6 mb-6 animate-in slide-in-from-bottom-3 duration-1200">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Movie poster with enhanced image component */}
                  <div className="flex-shrink-0 mx-auto lg:mx-0">
                    <div className="relative group">
                      <PosterImage
                        src={movie.posterPath}
                        alt={`${movie.title} poster`}
                        title={movie.title}
                        className="w-40 h-60 rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                        priority
                      />
                      
                      {/* Rating overlay */}
                      {movie.rating > 0 && (
                        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {formatRating(movie.rating)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Movie information */}
                  <div className="flex-1 modal-gap-responsive text-center lg:text-left">
                    {movie.overview && (
                      <div>
                        <h4 className="modal-heading-secondary text-gray-900 mb-3 flex items-center justify-center lg:justify-start gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          Synopsis
                        </h4>
                        <p className="modal-text-body text-gray-700 leading-relaxed">
                          {movie.overview}
                        </p>
                      </div>
                    )}
                    
                    {movie.genres.length > 0 && (
                      <div>
                        <h4 className="modal-heading-secondary text-gray-900 mb-3">Genres</h4>
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                          {movie.genres.map((genre) => (
                            <span
                              key={genre}
                              className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm rounded-full font-medium"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <Link href={`/movies/${movie.slug}`}>
                        <Button 
                          variant="primary" 
                          size="lg" 
                          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Full Details
                        </Button>
                      </Link>
                      
                      <Button
                        onClick={handleSpin}
                        disabled={isLoading}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Shuffle className="w-4 h-4 mr-2" />
                        )}
                        Spin Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Where to Watch section */}
              <div className="animate-in slide-in-from-bottom-4 duration-1500">
                <WatchProviders
                  movieId={movie.id}
                  watchProviders={movie.watchProviders}
                  movieTitle={movie.title}
                />
              </div>
            </div>
          ) : (
            <MovieLoadingSkeleton />
          )}

          {/* Enhanced stats section */}
          <div className="mt-8 glass rounded-xl p-6 animate-in slide-in-from-bottom-5 duration-1800">
            <h4 className="modal-heading-secondary text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Spin Tonight Stats
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {spinHistory.length}
                </div>
                <div className="modal-text-caption text-gray-600">Movies Discovered</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {Object.keys(cacheRef.current).length}
                </div>
                <div className="modal-text-caption text-gray-600">Movies Cached</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  100%
                </div>
                <div className="modal-text-caption text-gray-600">Legal Sources Only</div>
              </div>
            </div>
            
            {/* Keyboard shortcuts hint */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="modal-text-caption text-gray-500 text-center">
                💡 <strong>Pro tip:</strong> Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> to spin, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">←→</kbd> to navigate history, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+S</kbd> to search
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}