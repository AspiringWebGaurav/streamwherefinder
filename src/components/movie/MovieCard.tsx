import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar } from 'lucide-react';
import { cn, formatRating, formatReleaseDate } from '@/lib/utils';
import { PopularMovie, Movie } from '@/types/tmdb';

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
      container: 'w-32',
      image: 'h-48',
      imageSize: { width: 128, height: 192 }
    },
    md: {
      container: 'w-40',
      image: 'h-60',
      imageSize: { width: 160, height: 240 }
    },
    lg: {
      container: 'w-48',
      image: 'h-72',
      imageSize: { width: 192, height: 288 }
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={cn('group', currentSize.container, className)}>
      <Link href={`/movies/${movie.slug}`} className="block">
        {/* Poster Container */}
        <div className={cn(
          'relative overflow-hidden rounded-lg bg-gray-200 transition-transform group-hover:scale-105',
          currentSize.image
        )}>
          {movie.posterPath ? (
            <Image
              src={movie.posterPath}
              alt={`${movie.title} poster`}
              width={currentSize.imageSize.width}
              height={currentSize.imageSize.height}
              className="object-cover w-full h-full"
              priority={priority}
              unoptimized
              sizes={`${currentSize.imageSize.width}px`}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <div className="text-center p-4">
                <div className="text-xs">No Image</div>
                <div className="text-xs mt-1 break-words">{movie.title}</div>
              </div>
            </div>
          )}
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {formatRating(movie.rating)}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>

        {/* Movie Details */}
        {showDetails && (
          <div className="mt-3 space-y-1">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
              {movie.title}
            </h3>
            
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="w-3 h-3 mr-1" />
              {formatReleaseDate(movie.releaseDate)}
            </div>

            {/* Genres for full Movie objects */}
            {'genres' in movie && movie.genres && movie.genres.length > 0 && (
              <div className="text-xs text-gray-500 line-clamp-1">
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
    sm: { container: 'w-32', image: 'h-48' },
    md: { container: 'w-40', image: 'h-60' },
    lg: { container: 'w-48', image: 'h-72' }
  };

  const currentSize = sizes[size];

  return (
    <div className={cn('animate-pulse', currentSize.container)}>
      <div className={cn('bg-gray-300 rounded-lg', currentSize.image)} />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="h-3 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );
}