'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Shuffle, RefreshCw, Star, Calendar, Clock, ExternalLink, Play } from 'lucide-react';
import { tmdbClient } from '@/lib/tmdb';
import { Movie } from '@/types/tmdb';
import { cn, formatRating, formatReleaseDate, formatRuntime } from '@/lib/utils';
import Link from 'next/link';
import { PosterImage } from '@/components/ui/ImageWithFallback';
import { WatchProviders } from '@/components/movie/WatchProviders';

interface SpinTonightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Spinning animation component
function SpinLoader({ isSpinning }: { isSpinning: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      <div className="relative">
        <div className={cn(
          "w-16 h-16 rounded-full border-4 border-dashed border-purple-400",
          "flex items-center justify-center",
          isSpinning ? "animate-spin" : "animate-pulse"
        )}>
          <Shuffle className={cn(
            "w-8 h-8 text-purple-600",
            isSpinning ? "animate-pulse" : ""
          )} />
        </div>
        {isSpinning && (
          <div className="absolute inset-0 rounded-full bg-purple-400/20 blur-xl animate-pulse" />
        )}
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {isSpinning ? "Finding your perfect movie..." : "Ready to spin!"}
        </h3>
        <p className="text-sm text-gray-600">
          {isSpinning ? "Spinning the wheel of cinema magic!" : "Click the button below to discover something amazing"}
        </p>
      </div>
    </div>
  );
}

// Movie display component
function MovieDisplay({ movie }: { movie: Movie }) {
  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="text-center">
        <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
          <Star className="w-4 h-4 mr-2 fill-current" />
          Your movie tonight!
        </div>
      </div>

      {/* Movie details */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Movie poster */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <div className="relative group">
              <PosterImage
                src={movie.posterPath}
                alt={`${movie.title} poster`}
                title={movie.title}
                className="w-32 h-48 rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
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
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                {movie.title}
              </h3>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-600 mb-4">
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
            
            {movie.overview && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Synopsis</h4>
                <p className="text-gray-700 leading-relaxed">
                  {movie.overview}
                </p>
              </div>
            )}
            
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Genres</h4>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
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
            </div>
          </div>
        </div>
      </div>

      {/* Where to Watch section */}
      {movie.watchProviders && (
        <WatchProviders
          movieId={movie.id}
          watchProviders={movie.watchProviders}
          movieTitle={movie.title}
        />
      )}
    </div>
  );
}

// Error component
function SpinError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-red-500" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 mb-4">
          {error}
        </p>
      </div>
      
      <Button onClick={onRetry} variant="primary" size="lg">
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}

export function SpinTonightModal({ isOpen, onClose }: SpinTonightModalProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch random movie
  const fetchRandomMovie = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get either trending or popular movies
      const usePopular = Math.random() > 0.5;
      const response = usePopular
        ? await tmdbClient.getPopularMovies()
        : await tmdbClient.getTrendingMovies();
      
      if (response.results.length === 0) {
        throw new Error('No movies found. Please try again!');
      }
      
      // Pick a random movie from the first 15 results
      const randomIndex = Math.floor(Math.random() * Math.min(response.results.length, 15));
      const randomMovieData = response.results[randomIndex];
      
      // Fetch full details
      const movieDetails = await tmdbClient.getMovieDetails(randomMovieData.id);
      const transformedMovie = tmdbClient.transformMovie(movieDetails);
      
      setMovie(transformedMovie);
      
    } catch (err) {
      console.error('Failed to fetch random movie:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movie. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Spin again handler
  const handleSpin = useCallback(() => {
    fetchRandomMovie();
  }, [fetchRandomMovie]);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setMovie(null);
    setError(null);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  // Auto-spin when modal first opens
  useEffect(() => {
    if (isOpen && !movie && !isLoading && !error) {
      fetchRandomMovie();
    }
  }, [isOpen, movie, isLoading, error, fetchRandomMovie]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🎲 Spin Tonight"
      size="responsive-card"
      variant="default"
      className="modal-glass border-0"
    >
      <div className="min-h-[300px] space-y-6">
        {/* Content based on state */}
        {error ? (
          <SpinError error={error} onRetry={handleSpin} />
        ) : isLoading && !movie ? (
          <SpinLoader isSpinning={true} />
        ) : movie ? (
          <MovieDisplay movie={movie} />
        ) : (
          <SpinLoader isSpinning={false} />
        )}

        {/* Spin Again Button - Always visible if we have a movie */}
        {movie && !error && (
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <Button
              onClick={handleSpin}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="px-6"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shuffle className="w-4 h-4 mr-2" />
              )}
              Spin Again
            </Button>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500 pt-2">
          💡 <strong>Tip:</strong> Press ESC to close
        </div>
      </div>
    </Modal>
  );
}