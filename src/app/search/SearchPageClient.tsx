'use client';

import { Suspense, useEffect, useState } from 'react';
import { Search, ArrowLeft, ArrowRight, Shuffle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comprehensiveSearch, findTypoMatches } from '@/lib/search';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/MovieCard';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { saveSearch } from '@/lib/searchHistory';
import Link from 'next/link';

interface SearchPageClientProps {
  initialQuery: string;
  initialPage: number;
}

// Loading component for search results
function SearchResultsLoading() {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
      {Array.from({ length: 16 }, (_, i) => (
        <MovieCardSkeleton key={i} size="sm" />
      ))}
    </div>
  );
}

// No results component
function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-12 sm:py-16 px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
      </div>
      
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
        No results found for "{query}"
      </h2>
      
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
        We couldn't find any movies matching your search. Try checking your spelling or searching for a different movie.
      </p>

      <div className="space-y-4 sm:space-y-6">
        <div className="max-w-lg mx-auto">
          <SearchBar placeholder="Try a different search..." size="md" />
        </div>
        
        <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link href="/" className="w-full xs:w-auto">
            <Button variant="outline" className="w-full xs:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
              Back to Home
            </Button>
          </Link>
          
          <Link href="/random-movie" className="w-full xs:w-auto">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full xs:w-auto">
              <Shuffle className="w-4 h-4 mr-2 flex-shrink-0" />
              Spin Tonight
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Typo suggestions component
function TypoSuggestions({ query }: { query: string }) {
  const suggestions = findTypoMatches(query, 0.7);
  
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 mx-4 sm:mx-0">
      <div className="flex items-start">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-blue-900 font-medium mb-2 text-sm sm:text-base">
            Did you mean one of these?
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <Link
                key={suggestion.id}
                href={`/search?q=${encodeURIComponent(suggestion.title)}`}
                className="inline-flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-800 text-sm rounded-full transition-colors min-h-[36px]"
              >
                <span className="truncate max-w-[200px]">{suggestion.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Pagination component
function Pagination({ 
  currentPage, 
  totalPages, 
  query 
}: { 
  currentPage: number; 
  totalPages: number; 
  query: string; 
}) {
  if (totalPages <= 1) return null;

  const showPages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  const endPage = Math.min(totalPages, startPage + showPages - 1);
  
  return (
    <div className="flex justify-center items-center flex-wrap gap-2 mt-8 sm:mt-12 px-4">
      {/* Previous button */}
      {currentPage > 1 && (
        <Link
          href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
          className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base min-h-[40px] flex items-center"
        >
          <span className="hidden xs:inline">Previous</span>
          <ArrowLeft className="w-4 h-4 xs:hidden" />
        </Link>
      )}
      
      {/* Page numbers - Responsive display */}
      <div className="flex items-center gap-1 sm:gap-2">
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
          const pageNum = startPage + i;
          return (
            <Link
              key={pageNum}
              href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
              className={cn(
                'px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base min-h-[40px] min-w-[40px] flex items-center justify-center',
                pageNum === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
              )}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>
      
      {/* Next button */}
      {currentPage < totalPages && (
        <Link
          href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
          className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base min-h-[40px] flex items-center"
        >
          <span className="hidden xs:inline">Next</span>
          <ArrowRight className="w-4 h-4 xs:hidden" />
        </Link>
      )}
    </div>
  );
}

// Main search results component
function SearchResults({ query, page }: { query: string; page: number }) {
  const { user } = useAuth();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      console.log('🔍 SEARCH PAGE: Fetching results and saving search history');
      setLoading(true);
      
      try {
        // Save search history when search is performed
        if (query.trim()) {
          console.log('💾 SEARCH PAGE: Saving search to history');
          await saveSearch(user, query.trim());
          console.log('✅ SEARCH PAGE: Search history saved successfully');
        }
        
        // Fetch search results
        const searchResults = await comprehensiveSearch(query, page, 20);
        setResults(searchResults);
      } catch (error) {
        console.error('❌ SEARCH PAGE ERROR:', error);
        // Still show results even if history saving fails
        const searchResults = await comprehensiveSearch(query, page, 20);
        setResults(searchResults);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query, page, user]);

  if (loading) {
    return <SearchResultsLoading />;
  }

  if (!results || results.totalResults === 0) {
    return <NoResults query={query} />;
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Results summary - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Found <span className="font-semibold text-gray-900">{results.totalResults.toLocaleString()}</span> results for
            <span className="font-semibold text-gray-900 block xs:inline"> "{query}"</span>
          </p>
          {!results.isClientSide && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing page {results.page} of {results.totalPages}
            </p>
          )}
        </div>
        
        {results.isClientSide && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Instant Results
            </span>
          </div>
        )}
      </div>

      {/* Movies grid - Mobile first responsive */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {results.movies.map((movie: any, index: number) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            size="sm"
            priority={index < 8} // Prioritize first 8 images for mobile
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={results.page}
        totalPages={results.totalPages}
        query={query}
      />
    </div>
  );
}

export function SearchPageClient({ initialQuery, initialPage }: SearchPageClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header - Mobile First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 active:text-gray-700 transition-colors text-sm sm:text-base min-h-[40px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
              Back to Home
            </Link>
            
            <div className="w-full max-w-2xl sm:mx-0">
              <SearchBar
                placeholder="Search for movies..."
                showSuggestions={false}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Typo suggestions */}
        <TypoSuggestions query={initialQuery} />

        {/* Search Results */}
        <Suspense fallback={<SearchResultsLoading />}>
          <SearchResults query={initialQuery} page={initialPage} />
        </Suspense>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": `Search results for "${initialQuery}"`,
            "description": `Find where to watch "${initialQuery}" and similar movies online legally.`,
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/search?q=${encodeURIComponent(initialQuery)}`,
            "mainEntity": {
              "@type": "ItemList",
              "name": `Movies matching "${initialQuery}"`,
              "description": "Search results for movies with legal streaming information"
            }
          })
        }}
      />
    </div>
  );
}