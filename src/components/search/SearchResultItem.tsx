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
        'flex items-center px-3 sm:px-4 py-3 sm:py-4 transition-colors cinema-focus',
        'min-h-[60px] sm:min-h-[72px]', // Touch-friendly height
        'hover:bg-black/10 active:bg-black/20',
        isSelected && 'bg-black/10',
        className
      )}
    >
      {/* Poster Image - Optimized for small size */}
      <div className="flex-shrink-0 w-10 h-14 sm:w-12 sm:h-16 rounded overflow-hidden" style={{backgroundColor: 'var(--cinema-slate)'}}>
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
        <div className="text-sm sm:text-base font-medium truncate leading-tight" style={{color: 'var(--cinema-white)'}}>
          <HighlightedText text={movie.title} query={query} />
        </div>
        
        {/* Release Year and Rating */}
        <div className="text-xs sm:text-sm mt-1 flex items-center gap-2" style={{color: 'var(--cinema-cream)'}}>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" style={{color: 'var(--cinema-gold)'}} />
            {movie.releaseDate.split('-')[0]}
          </span>
          <span style={{color: 'var(--cinema-indigo)'}}>•</span>
          <span className="flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" style={{color: 'var(--cinema-amber)'}} />
            {movie.rating}
          </span>
        </div>
      </div>

      {/* Visual indicator for selected state */}
      {isSelected && (
        <div className="flex-shrink-0 w-2 h-8 rounded-full ml-2" style={{backgroundColor: 'var(--cinema-gold)'}} />
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
            className={isMatch ? 'font-semibold rounded px-1' : ''}
            style={isMatch ? {
              backgroundColor: 'var(--cinema-gold)',
              color: 'var(--cinema-midnight)'
            } : {}}
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
      <div className="flex-shrink-0 w-10 h-14 sm:w-12 sm:h-16 rounded" style={{backgroundColor: 'var(--cinema-slate)'}} />
      
      {/* Skeleton content */}
      <div className="ml-3 flex-1 min-w-0 space-y-2">
        <div className="h-4 rounded w-3/4" style={{backgroundColor: 'var(--cinema-indigo)'}} />
        <div className="h-3 rounded w-1/2" style={{backgroundColor: 'var(--cinema-navy)'}} />
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
      <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--cinema-slate)'}}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{color: 'var(--cinema-gold)'}}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <p className="text-sm mb-2" style={{color: 'var(--cinema-cream)'}}>
        No movies found for "{query}"
      </p>
      <p className="text-xs" style={{color: 'var(--cinema-indigo)'}}>
        Try a different search term
      </p>
    </div>
  );
}