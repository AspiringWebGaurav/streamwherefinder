'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, History, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hybridSearch } from '@/lib/search';
import { PopularMovie } from '@/types/tmdb';
import { useAuth } from '@/app/providers/FirebaseProvider';
import { saveSearch, getSearchHistory, SearchHistoryItem } from '@/lib/searchHistory';
import Link from 'next/link';
import { SearchResultItem } from '@/components/search/SearchResultItem';

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

  // Sizes are now handled by responsive CSS classes
  const sizes = {
    sm: 'search-input-symmetric',
    md: 'search-input-symmetric',
    lg: 'search-input-symmetric',
    xl: 'search-input-symmetric',
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
    <div className={cn('search-container-symmetric', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 search-icon-left-symmetric flex items-center pointer-events-none">
          <Search className="h-5 w-5" style={{color: 'var(--cinema-cream)'}} aria-hidden="true" />
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
            'block w-full search-input-symmetric cinema-focus',
            'transition-all duration-300'
          )}
          aria-label="Search movies"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {isLoading && (
            <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            </div>
          )}
          
          {query && (
            <button
              onClick={handleClear}
              className="absolute clear-btn-symmetric flex items-center justify-center cinema-focus"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className={cn(
              'absolute search-btn-symmetric flex items-center justify-center cinema-focus',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Search"
          >
            <span className="hidden xs:inline">Search</span>
            <Search className="h-4 w-4 xs:hidden" />
          </button>
        </div>
      </div>

      {/* Search History & Suggestions Dropdown - Glassmorphism Style */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 w-full mt-2 dropdown-cinema rounded-xl shadow-2xl overflow-y-auto',
            // Mobile-first sizing
            'max-h-[50vh] sm:max-h-80',
            // Better mobile touch scrolling
            'overscroll-contain'
          )}
          style={{
            WebkitOverflowScrolling: 'touch',
            // Ensure proper positioning on mobile
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 9999
          }}
        >
          {/* Search History Section - Glassmorphism Style */}
          {showHistoryOnly && searchHistory.length > 0 && (
            <>
              <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs font-medium uppercase tracking-wide sticky top-0 z-10 glass-cinema-secondary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <History className="w-3 h-3 mr-1 flex-shrink-0" style={{color: 'var(--cinema-gold)'}} />
                    <span className="truncate" style={{color: 'var(--cinema-cream)'}}>Recent Searches</span>
                  </div>
                  {!user && (
                    <Link
                      href="/profile"
                      className="normal-case font-normal text-xs whitespace-nowrap ml-2 transition-colors hover:opacity-80"
                      style={{color: 'var(--cinema-gold)'}}
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
                    'w-full flex items-center px-3 sm:px-4 py-3 sm:py-4 transition-colors text-left cinema-focus',
                    'min-h-[48px] sm:min-h-[56px]', // Touch-friendly height
                    'hover:bg-black/10 active:bg-black/20',
                    selectedIndex === index && 'bg-black/10'
                  )}
                >
                  <Clock className="w-4 h-4 mr-3 flex-shrink-0" style={{color: 'var(--cinema-gold)'}} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base truncate font-medium" style={{color: 'var(--cinema-white)'}}>
                      {item.query}
                    </div>
                    <div className="text-xs sm:text-sm mt-0.5" style={{color: 'var(--cinema-cream)'}}>
                      {item.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Movie Suggestions Section - Glassmorphism Style */}
          {!showHistoryOnly && suggestions.length > 0 && (
            <>
              {suggestions.map((movie, index) => (
                <SearchResultItem
                  key={movie.id}
                  movie={movie}
                  query={query}
                  isSelected={selectedIndex === index}
                  onClick={() => {
                    console.log('🎬 SEARCH BAR: Movie suggestion clicked, saving search history');
                    saveSearch(user, query.trim()).catch(error => {
                      console.error('❌ Failed to save search history for suggestion click:', error);
                    });
                  }}
                />
              ))}
              
              <div className="px-3 sm:px-4 py-3 sm:py-4 sticky bottom-0 glass-cinema-secondary" style={{borderTop: '1px solid rgba(30, 39, 66, 0.3)'}}>
                <button
                  onClick={handleSearch}
                  className="text-sm sm:text-base font-medium w-full text-center py-2 min-h-[44px] rounded-lg transition-colors cinema-focus hover:bg-black/10 active:bg-black/20"
                  style={{color: 'var(--cinema-gold)'}}
                >
                  See all results for "{query}"
                </button>
              </div>
            </>
          )}

          {/* Sign-in Prompt for Anonymous Users - Glassmorphism Style */}
          {!user && (searchHistory.length > 0 || showHistoryOnly) && (
            <div className="px-3 sm:px-4 py-3 sm:py-4 sticky bottom-0 glass-cinema-accent" style={{borderTop: '1px solid rgba(30, 39, 66, 0.3)'}}>
              <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-medium leading-tight" style={{color: 'var(--cinema-white)'}}>
                    Save searches across devices
                  </div>
                  <div className="text-xs sm:text-sm mt-0.5" style={{color: 'var(--cinema-cream)'}}>
                    Sign in to sync your search history
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center px-4 py-2.5 btn-cinema-gold text-sm font-medium min-h-[44px] whitespace-nowrap cinema-focus"
                >
                  <User className="w-4 h-4 mr-2" />
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