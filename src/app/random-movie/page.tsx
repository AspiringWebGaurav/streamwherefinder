'use client';

import { useState, useEffect } from 'react';
import { Shuffle, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MovieCard } from '@/components/movie/MovieCard';
import { WatchProviders } from '@/components/movie/WatchProviders';
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

// Animation component for the spinning effect
function SpinAnimation({ isSpinning }: { isSpinning: boolean }) {
  return (
    <div className={cn(
      'relative w-64 h-64 mx-auto mb-8',
      isSpinning && 'animate-spin'
    )}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-300 animate-pulse" />
      
      {/* Inner circle */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Shuffle className={cn(
          'w-16 h-16 text-white transition-transform duration-500',
          isSpinning ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
        )} />
      </div>
      
      {/* Sparkles */}
      <div className="absolute inset-0">
        <Sparkles className="absolute top-4 right-8 w-6 h-6 text-yellow-400 animate-bounce delay-100" />
        <Sparkles className="absolute bottom-8 left-4 w-4 h-4 text-pink-400 animate-bounce delay-300" />
        <Sparkles className="absolute top-12 left-12 w-5 h-5 text-blue-400 animate-bounce delay-500" />
      </div>
    </div>
  );
}

// Loading skeleton for movie card
function MovieLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="w-48 h-72 bg-gray-300 rounded-lg" />
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function RandomMoviePage() {
  const [state, setState] = useState<RandomMovieState>({
    movie: null,
    isLoading: false,
    isAnimating: false,
    error: null,
  });

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

  // Get initial random movie on component mount
  useEffect(() => {
    getRandomMovie();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Spin Tonight</h1>
              <p className="text-sm text-gray-600">Let us pick something great for you!</p>
            </div>
            
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Spinning Animation or Movie Result */}
        {state.isAnimating || (state.isLoading && !state.movie) ? (
          <div className="text-center">
            <SpinAnimation isSpinning={state.isAnimating} />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Finding your perfect movie...
              </h2>
              <p className="text-gray-600">
                {state.isAnimating ? "Spinning the wheel of cinema!" : "Almost there..."}
              </p>
            </div>
          </div>
        ) : state.error ? (
          /* Error State */
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
            <p className="text-gray-600 mb-8">{state.error}</p>
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
          <div className="space-y-8">
            {/* Result Header */}
            <div className="text-center">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Your movie tonight!
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {state.movie.title}
              </h2>
              {state.movie.rating > 0 && (
                <p className="text-gray-600">
                  ⭐ {state.movie.rating}/10 • Perfect for tonight!
                </p>
              )}
            </div>

            {/* Movie Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Movie Poster */}
                <div className="flex-shrink-0">
                  <MovieCard 
                    movie={state.movie} 
                    size="lg"
                    className="mx-auto"
                    priority
                  />
                </div>
                
                {/* Movie Info */}
                <div className="flex-1 space-y-6">
                  {state.movie.overview && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Synopsis</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {state.movie.overview}
                      </p>
                    </div>
                  )}
                  
                  {state.movie.genres.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Genres</h3>
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
                  
                  <div className="flex gap-4">
                    <Link href={`/movies/${state.movie.slug}`}>
                      <Button variant="primary">
                        View Full Details
                      </Button>
                    </Link>
                    
                    <Button
                      onClick={getRandomMovie}
                      disabled={state.isLoading}
                      variant="outline"
                      className="border-purple-200 hover:border-purple-300 hover:bg-purple-50"
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
            <WatchProviders
              movieId={state.movie.id}
              watchProviders={state.movie.watchProviders}
              movieTitle={state.movie.title}
            />
          </div>
        ) : (
          /* Initial Loading */
          <div className="text-center">
            <SpinAnimation isSpinning={true} />
            <MovieLoadingSkeleton />
          </div>
        )}

        {/* Fun Facts */}
        <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🎬 Did you know?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">500+</div>
              <div className="text-sm text-gray-600">Movies in our database</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">24/7</div>
              <div className="text-sm text-gray-600">Updated recommendations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Legal streaming only</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Note: This page is now primarily accessed via modal on the homepage
// Metadata is handled at the layout level for this client component