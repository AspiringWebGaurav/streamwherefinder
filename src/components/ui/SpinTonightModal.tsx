'use client';

import { useState, useEffect } from 'react';
import { Shuffle, RefreshCw, Sparkles, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MovieCard } from '@/components/movie/MovieCard';
import { WatchProviders } from '@/components/movie/WatchProviders';
import { SearchBar } from '@/components/search/SearchBar';
import { tmdbClient } from '@/lib/tmdb';
import { Movie } from '@/types/tmdb';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RandomMovieState {
  movie: Movie | null;
  isLoading: boolean;
  isAnimating: boolean;
  error: string | null;
}

interface SpinTonightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Animation component for the spinning effect
function SpinAnimation({ isSpinning }: { isSpinning: boolean }) {
  return (
    <div className={cn(
      'relative w-48 h-48 mx-auto mb-6',
      isSpinning && 'animate-spin'
    )}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-300 animate-pulse" />
      
      {/* Inner circle */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Shuffle className={cn(
          'w-12 h-12 text-white transition-transform duration-500',
          isSpinning ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
        )} />
      </div>
      
      {/* Sparkles */}
      <div className="absolute inset-0">
        <Sparkles className="absolute top-2 right-6 w-4 h-4 text-yellow-400 animate-bounce delay-100" />
        <Sparkles className="absolute bottom-6 left-2 w-3 h-3 text-pink-400 animate-bounce delay-300" />
        <Sparkles className="absolute top-8 left-8 w-4 h-4 text-blue-400 animate-bounce delay-500" />
      </div>
    </div>
  );
}

// Loading skeleton for movie card
function MovieLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="w-32 h-48 bg-gray-300 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-3 text-center lg:text-left">
          <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto lg:mx-0" />
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto lg:mx-0" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto lg:mx-0" />
        </div>
      </div>
    </div>
  );
}

export function SpinTonightModal({ isOpen, onClose }: SpinTonightModalProps) {
  const [state, setState] = useState<RandomMovieState>({
    movie: null,
    isLoading: false,
    isAnimating: false,
    error: null,
  });

  const [showSearch, setShowSearch] = useState(false);

  // Get random movie from trending or top rated
  const getRandomMovie = async () => {
    setState(prev => ({ ...prev, isLoading: true, isAnimating: true, error: null }));
    
    try {
      // Add delay for animation effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly choose between trending and popular movies
      const usePopular = Math.random() > 0.5;
      const response = usePopular 
        ? await tmdbClient.getPopularMovies()
        : await tmdbClient.getTrendingMovies();
      
      if (response.results.length === 0) {
        throw new Error('No movies found');
      }
      
      // Get random movie from results
      const randomIndex = Math.floor(Math.random() * Math.min(response.results.length, 15));
      const randomMovieData = response.results[randomIndex];
      
      // Fetch full details
      const movieDetails = await tmdbClient.getMovieDetails(randomMovieData.id);
      const movie = tmdbClient.transformMovie(movieDetails);
      
      setState(prev => ({ 
        ...prev, 
        movie, 
        isLoading: false, 
        isAnimating: false 
      }));
      
    } catch (error) {
      console.error('Failed to fetch random movie:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to find a movie. Please try again!',
        isLoading: false,
        isAnimating: false,
      }));
    }
  };

  // Get initial random movie when modal opens
  useEffect(() => {
    if (isOpen && !state.movie && !state.isLoading) {
      getRandomMovie();
    }
  }, [isOpen]);

  // Handle escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spin-tonight-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 id="spin-tonight-title" className="text-2xl font-bold text-gray-900">
                🎲 Spin Tonight
              </h2>
              <p className="text-sm text-gray-600">Let us pick something great for you!</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Toggle Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  showSearch ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'
                )}
                aria-label="Toggle search"
                title="Search while browsing"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Search Bar (shown when toggled) */}
          {showSearch && (
            <div className="mt-4">
              <SearchBar 
                placeholder="Search for movies while browsing..." 
                size="sm"
                onSearch={(query) => {
                  // Navigate to search page and close modal
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  onClose();
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Spinning Animation or Movie Result */}
          {state.isAnimating || (state.isLoading && !state.movie) ? (
            <div className="text-center py-8">
              <SpinAnimation isSpinning={state.isAnimating} />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Finding your perfect movie...
                </h3>
                <p className="text-gray-600">
                  {state.isAnimating ? "Spinning the wheel of cinema!" : "Almost there..."}
                </p>
              </div>
            </div>
          ) : state.error ? (
            /* Error State */
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Oops!</h3>
              <p className="text-gray-600 mb-6">{state.error}</p>
              <Button 
                onClick={getRandomMovie}
                disabled={state.isLoading}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Shuffle className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>
          ) : state.movie ? (
            /* Movie Result */
            <div className="space-y-6">
              {/* Result Header */}
              <div className="text-center">
                <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Your movie tonight!
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {state.movie.title}
                </h3>
                {state.movie.rating > 0 && (
                  <p className="text-gray-600">
                    ⭐ {state.movie.rating}/10 • Perfect for tonight!
                  </p>
                )}
              </div>

              {/* Movie Details Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0 mx-auto lg:mx-0">
                    <MovieCard 
                      movie={state.movie} 
                      size="md"
                      priority
                    />
                  </div>
                  
                  {/* Movie Info */}
                  <div className="flex-1 space-y-4">
                    {state.movie.overview && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Synopsis</h4>
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {state.movie.overview}
                        </p>
                      </div>
                    )}
                    
                    {state.movie.genres.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {state.movie.genres.map((genre) => (
                            <span
                              key={genre}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/movies/${state.movie.slug}`}>
                        <Button variant="primary" size="sm" className="w-full sm:w-auto">
                          View Full Details
                        </Button>
                      </Link>
                      
                      <Button
                        onClick={getRandomMovie}
                        disabled={state.isLoading}
                        variant="outline"
                        size="sm"
                        className="border-purple-200 hover:border-purple-300 hover:bg-purple-50 w-full sm:w-auto"
                      >
                        {state.isLoading ? (
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

              {/* Where to Watch */}
              <div className="bg-white rounded-xl border border-gray-200">
                <WatchProviders
                  movieId={state.movie.id}
                  watchProviders={state.movie.watchProviders}
                  movieTitle={state.movie.title}
                />
              </div>
            </div>
          ) : (
            /* Initial Loading */
            <div className="text-center py-8">
              <SpinAnimation isSpinning={true} />
              <div className="mt-6">
                <MovieLoadingSkeleton />
              </div>
            </div>
          )}

          {/* Fun Facts */}
          <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 text-center">
              🎬 Did you know?
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-xl font-bold text-purple-600">500+</div>
                <div className="text-xs text-gray-600">Movies in our database</div>
              </div>
              <div>
                <div className="text-xl font-bold text-pink-600">24/7</div>
                <div className="text-xs text-gray-600">Updated recommendations</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">100%</div>
                <div className="text-xs text-gray-600">Legal streaming only</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}