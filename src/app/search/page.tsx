'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Search, ArrowLeft, Shuffle, AlertCircle } from 'lucide-react';
import { comprehensiveSearch, findTypoMatches } from '@/lib/search';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/MovieCard';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { saveSearch } from '@/lib/searchHistory';
import Link from 'next/link';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

// Note: generateMetadata removed because this is a client component
// SEO will be handled by the document head in the component

// Loading component for search results
function SearchResultsLoading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }, (_, i) => (
        <MovieCardSkeleton key={i} size="sm" />
      ))}
    </div>
  );
}

// No results component
function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        No results found for "{query}"
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        We couldn't find any movies matching your search. Try checking your spelling or searching for a different movie.
      </p>

      <div className="space-y-4">
        <div className="max-w-lg mx-auto">
          <SearchBar placeholder="Try a different search..." />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Link href="/random-movie">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Shuffle className="w-4 h-4 mr-2" />
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
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-blue-900 font-medium mb-2">
            Did you mean one of these?
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <Link
                key={suggestion.id}
                href={`/search?q=${encodeURIComponent(suggestion.title)}`}
                className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition-colors"
              >
                {suggestion.title}
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
    <div className="flex justify-center items-center space-x-2 mt-12">
      {/* Previous button */}
      {currentPage > 1 && (
        <Link
          href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Previous
        </Link>
      )}
      
      {/* Page numbers */}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
        const pageNum = startPage + i;
        return (
          <Link
            key={pageNum}
            href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
            className={`px-4 py-2 rounded-lg transition-colors ${
              pageNum === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </Link>
        );
      })}
      
      {/* Next button */}
      {currentPage < totalPages && (
        <Link
          href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Next
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
    <div>
      {/* Results summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <p className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{results.totalResults.toLocaleString()}</span> results for 
            <span className="font-semibold text-gray-900"> "{query}"</span>
          </p>
          {!results.isClientSide && (
            <p className="text-sm text-gray-500 mt-1">
              Showing page {results.page} of {results.totalPages}
            </p>
          )}
        </div>
        
        {results.isClientSide && (
          <div className="mt-2 sm:mt-0">
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Instant Results
            </span>
          </div>
        )}
      </div>

      {/* Movies grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {results.movies.map((movie: any) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            size="sm"
            priority={results.movies.indexOf(movie) < 6}
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || '';
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Search Movies
            </h1>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Search for any movie and find where to watch it legally. Our search works even with typos!
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar 
                placeholder="Search for any movie..."
                autoFocus={true}
              />
            </div>

            <div className="flex justify-center">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex-1 max-w-2xl">
              <SearchBar 
                placeholder="Search for movies..."
                showSuggestions={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Typo suggestions */}
        <TypoSuggestions query={query} />

        {/* Search Results */}
        <Suspense fallback={<SearchResultsLoading />}>
          <SearchResults query={query} page={page} />
        </Suspense>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": `Search results for "${query}"`,
            "description": `Find where to watch "${query}" and similar movies online legally.`,
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/search?q=${encodeURIComponent(query)}`,
            "mainEntity": {
              "@type": "ItemList",
              "name": `Movies matching "${query}"`,
              "description": "Search results for movies with legal streaming information"
            }
          })
        }}
      />
    </div>
  );
}