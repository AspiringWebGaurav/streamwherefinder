import { Search, ArrowLeft } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SearchPageClient } from './SearchPageClient';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || '';
  
  if (!query) {
    return {
      title: 'Search Movies | StreamWhereFinder',
      description: 'Search for any movie and find where to watch it legally. Our search works even with typos!',
    };
  }

  return {
    title: `Search results for "${query}" | StreamWhereFinder`,
    description: `Find where to watch "${query}" and similar movies online legally.`,
    openGraph: {
      title: `Search results for "${query}"`,
      description: `Find where to watch "${query}" and similar movies online legally.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Search results for "${query}"`,
      description: `Find where to watch "${query}" and similar movies online legally.`,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || '';
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-4xl">
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Search Movies
            </h1>
            
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4">
              Search for any movie and find where to watch it legally. Our search works even with typos!
            </p>

            <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
              <SearchBar
                placeholder="Search for any movie..."
                autoFocus={true}
                size="md"
              />
            </div>

            <div className="flex justify-center px-4">
              <Link href="/" className="w-full xs:w-auto">
                <Button variant="outline" className="w-full xs:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
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
    <SearchPageClient initialQuery={query} initialPage={page} />
  );
}