'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, History, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hybridSearch } from '@/lib/search';
import { PopularMovie } from '@/types/tmdb';
import { useAuth } from '@/lib/auth';
import { saveSearch, getSearchHistory, SearchHistoryItem } from '@/lib/searchHistory';
import Link from 'next/link';
import { TMDBImage } from '@/components/ui/TMDBImage';

interface SearchBarProps {
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSuggestions?: boolean;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Search for movies... (works even with typos!)",
  size = 'lg',
  showSuggestions = true,
  autoFocus = false,
  onSearch,
  className,
}: SearchBarProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PopularMovie[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizes = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg',
    xl: 'h-16 text-xl',
  };

  // Load search history on component mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getSearchHistory(user);
        setSearchHistory(history.slice(0, 5)); // Show only recent 5 searches
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
    loadHistory();
  }, [user]);

  // Debounced search for suggestions
  useEffect(() => {
    if (!query || query.length < 2 || !showSuggestions) {
      setSuggestions([]);
      if (!query) {
        // Show search history when input is empty and focused
        setShowHistoryOnly(true);
        setShowDropdown(searchHistory.length > 0);
      } else {
        setShowHistoryOnly(false);
        setShowDropdown(false);
      }
      return;
    }

    setShowHistoryOnly(false);
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await hybridSearch(query, 5);
        setSuggestions(results.movies);
        setShowDropdown(results.movies.length > 0);
      } catch (error) {
        console.error('Search failed:', error);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, showSuggestions, searchHistory.length]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && query) {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedMovie = suggestions[selectedIndex];
          // Save search history before navigation
          console.log('🎬 SEARCH BAR: Navigating to selected movie, saving search history');
          // Save search history asynchronously but don't wait for it
          saveSearch(user, query.trim()).catch(error => {
            console.error('❌ Failed to save search history for movie selection:', error);
          });
          window.location.href = `/movies/${selectedMovie.slug}`;
        } else if (query) {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = async () => {
    if (query.trim()) {
      // Save search to history
      try {
        await saveSearch(user, query.trim());
      } catch (error) {
        console.error('Error saving search history:', error);
        // Don't block the search even if history saving fails
      }

      if (onSearch) {
        onSearch(query.trim());
      } else {
        window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      }
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative w-full max-w-2xl mx-auto', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            } else if (searchHistory.length > 0 && !query) {
              setShowHistoryOnly(true);
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl',
            'bg-white text-gray-900 placeholder-gray-500',
            'focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
            'transition-colors duration-200',
            sizes[size]
          )}
          aria-label="Search movies"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {isLoading && (
            <div className="mr-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
          
          {query && (
            <button
              onClick={handleClear}
              className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className={cn(
              'mr-2 px-4 py-2 bg-blue-600 text-white rounded-lg',
              'hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </div>

      {/* Search History & Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {/* Search History Section */}
          {showHistoryOnly && searchHistory.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <History className="w-3 h-3 mr-1" />
                    Recent Searches
                  </div>
                  {!user && (
                    <Link
                      href="/profile"
                      className="text-blue-600 hover:text-blue-800 normal-case font-normal"
                    >
                      Sign in to sync
                    </Link>
                  )}
                </div>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={`${item.query}-${item.timestamp.getTime()}`}
                  onClick={() => {
                    setQuery(item.query);
                    handleSearch();
                  }}
                  className={cn(
                    'w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left',
                    selectedIndex === index && 'bg-blue-50'
                  )}
                >
                  <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">
                      {item.query}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Movie Suggestions Section */}
          {!showHistoryOnly && suggestions.length > 0 && (
            <>
              {suggestions.map((movie, index) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.slug}`}
                  onClick={(e) => {
                    // Save search history when clicking on suggestions
                    console.log('🎬 SEARCH BAR: Movie suggestion clicked, saving search history');
                    // Save search history asynchronously without blocking navigation
                    saveSearch(user, query.trim()).catch(error => {
                      console.error('❌ Failed to save search history for suggestion click:', error);
                    });
                  }}
                  className={cn(
                    'flex items-center px-4 py-3 hover:bg-gray-50 transition-colors',
                    selectedIndex === index && 'bg-blue-50'
                  )}
                >
                  <div className="flex-shrink-0 w-12 h-16 bg-gray-200 rounded overflow-hidden">
                    <TMDBImage
                      src={movie.posterPath}
                      alt={`${movie.title} poster`}
                      width={48}
                      height={64}
                      className="w-full h-full object-cover"
                      fallbackText="No Image"
                    />
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {movie.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {movie.releaseDate.split('-')[0]} • ★ {movie.rating}
                    </div>
                  </div>
                </Link>
              ))}
              
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  See all results for "{query}"
                </button>
              </div>
            </>
          )}

          {/* Sign-in Prompt for Anonymous Users */}
          {!user && (searchHistory.length > 0 || showHistoryOnly) && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-blue-900">
                    Save searches across devices
                  </div>
                  <div className="text-xs text-blue-700">
                    Sign in to sync your search history
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="ml-3 inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <User className="w-3 h-3 mr-1" />
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}