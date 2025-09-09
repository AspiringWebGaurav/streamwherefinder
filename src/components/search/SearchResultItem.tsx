'use client';

import Link from 'next/link';
import { Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PopularMovie } from '@/types/tmdb';

interface SearchResultItemProps {
  movie: PopularMovie;
  query: string;
  isSelected?: boolean;
  onClick?: (movie: PopularMovie) => void;
  className?: string;
}

export function SearchResultItem({
  movie,
  query,
  isSelected = false,
  onClick,
  className,
}: SearchResultItemProps) {
  const handleClick = () => {
    onClick?.(movie);
  };

  return (
    <Link
      href={`/movies/${movie.slug}`}
      onClick={handleClick}
      className={cn(
        'flex items-center px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors',
        'min-h-[60px] sm:min-h-[72px]', // Touch-friendly height
        isSelected && 'bg-blue-50 hover:bg-blue-100',
        className
      )}
    >
      {/* Poster Image - Optimized for small size */}
      <div className="flex-shrink-0 w-10 h-14 sm:w-12 sm:h-16 rounded overflow-hidden bg-gray-200">
        <ImageWithFallback
          src={movie.posterPath}
          alt={`${movie.title} poster`}
          title={movie.title}
          width={48}
          height={64}
          aspectRatio="poster"
          className="w-full h-full"
          fallbackText=""
          sizes="48px"
        />
      </div>
      
      {/* Movie Details */}
      <div className="ml-3 flex-1 min-w-0">
        {/* Title with query highlighting */}
        <div className="text-sm sm:text-base font-medium text-gray-900 truncate leading-tight">
          <HighlightedText text={movie.title} query={query} />
        </div>
        
        {/* Release Year and Rating */}
        <div className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {movie.releaseDate.split('-')[0]}
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {movie.rating}
          </span>
        </div>
      </div>

      {/* Visual indicator for selected state */}
      {isSelected && (
        <div className="flex-shrink-0 w-2 h-8 bg-blue-600 rounded-full ml-2" />
      )}
    </Link>
  );
}

// Component to highlight search query in text
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) {
    return <span>{text}</span>;
  }

  // Create case-insensitive regex for highlighting
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        const isMatch = regex.test(part);
        return (
          <span
            key={index}
            className={isMatch ? 'bg-yellow-200 text-yellow-900 font-semibold' : ''}
          >
            {part}
          </span>
        );
      })}
    </span>
  );
}

// Skeleton loader for SearchResultItem
export function SearchResultItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'flex items-center px-3 sm:px-4 py-3 sm:py-4 animate-pulse',
      'min-h-[60px] sm:min-h-[72px]',
      className
    )}>
      {/* Skeleton poster */}
      <div className="flex-shrink-0 w-10 h-14 sm:w-12 sm:h-16 bg-gray-200 rounded" />
      
      {/* Skeleton content */}
      <div className="ml-3 flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

// Loading state for multiple search result items
export function SearchResultsLoading({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <SearchResultItemSkeleton key={i} />
      ))}
    </div>
  );
}

// No results component specifically for search suggestions
export function NoSearchResults({ query }: { query: string }) {
  return (
    <div className="px-4 py-8 text-center">
      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
        <svg 
          className="w-6 h-6 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      <p className="text-sm text-gray-500 mb-2">
        No movies found for "{query}"
      </p>
      <p className="text-xs text-gray-400">
        Try a different search term
      </p>
    </div>
  );
}