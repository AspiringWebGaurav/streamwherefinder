import Link from 'next/link';
import { Star, Calendar } from 'lucide-react';
import { cn, formatRating, formatReleaseDate } from '@/lib/utils';
import { PopularMovie, Movie } from '@/types/tmdb';
import { PosterImage } from '@/components/ui/ImageWithFallback';

interface MovieCardProps {
  movie: PopularMovie | Movie;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
  priority?: boolean;
}

export function MovieCard({ 
  movie, 
  size = 'md', 
  showDetails = true,
  className,
  priority = false
}: MovieCardProps) {
  const sizes = {
    sm: {
      container: 'w-24 xs:w-28 sm:w-32',
      image: 'aspect-[2/3] h-auto',
      imageSize: { width: 128, height: 192 }
    },
    md: {
      container: 'w-28 xs:w-32 sm:w-36 md:w-40',
      image: 'aspect-[2/3] h-auto',
      imageSize: { width: 160, height: 240 }
    },
    lg: {
      container: 'w-32 xs:w-36 sm:w-40 md:w-44 lg:w-48',
      image: 'aspect-[2/3] h-auto',
      imageSize: { width: 192, height: 288 }
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={cn('group flex-shrink-0', currentSize.container, className)}>
      <Link href={`/movies/${movie.slug}`} className="block w-full">
        {/* Poster Container - Responsive with touch optimization */}
        <div className={cn(
          'relative overflow-hidden rounded-lg bg-gray-200 transition-all duration-300 ease-out',
          'group-hover:scale-105 group-active:scale-95',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
          currentSize.image
        )}>
          <PosterImage
            src={movie.posterPath}
            alt={`${movie.title} poster`}
            title={movie.title}
            className="w-full h-full"
            priority={priority}
          />
          
          {/* Rating Badge - Responsive */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded flex items-center gap-0.5 sm:gap-1">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{formatRating(movie.rating)}</span>
          </div>

          {/* Hover Overlay - Touch optimized */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
        </div>

        {/* Movie Details - Mobile optimized */}
        {showDetails && (
          <div className="mt-2 sm:mt-3 space-y-1">
            <h3 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-tight">
              {movie.title}
            </h3>
            
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{formatReleaseDate(movie.releaseDate)}</span>
            </div>

            {/* Genres for full Movie objects */}
            {'genres' in movie && movie.genres && movie.genres.length > 0 && (
              <div className="text-xs text-gray-500 line-clamp-1 leading-tight">
                {movie.genres.slice(0, 2).join(', ')}
              </div>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}

// Skeleton loader for MovieCard
export function MovieCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: {
      container: 'w-24 xs:w-28 sm:w-32',
      image: 'aspect-[2/3] h-auto'
    },
    md: {
      container: 'w-28 xs:w-32 sm:w-36 md:w-40',
      image: 'aspect-[2/3] h-auto'
    },
    lg: {
      container: 'w-32 xs:w-36 sm:w-40 md:w-44 lg:w-48',
      image: 'aspect-[2/3] h-auto'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={cn('animate-pulse flex-shrink-0', currentSize.container)}>
      <div className={cn('bg-gray-300 rounded-lg', currentSize.image)} />
      <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
        <div className="h-3 sm:h-4 bg-gray-300 rounded w-full" />
        <div className="h-2.5 sm:h-3 bg-gray-300 rounded w-3/4" />
        <div className="h-2.5 sm:h-3 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );
}