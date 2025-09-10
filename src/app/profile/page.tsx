'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, History, Trash2, Search, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/providers/FirebaseProvider';
import {
  getSearchHistory,
  deleteSearchFromFirestore,
  clearUserSearchHistory,
  clearLocalSearchHistory,
  SearchHistoryItem
} from '@/lib/searchHistory';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/search/SearchBar';
import { ProfilePicture } from '@/components/ui/ProfilePicture';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  // Load search history
  useEffect(() => {
    loadSearchHistory();
  }, [user]);

  const loadSearchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getSearchHistory(user);
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteSearch = async (item: SearchHistoryItem) => {
    try {
      if (user && item.id) {
        await deleteSearchFromFirestore(item.id);
      }
      
      // Remove from local state
      setSearchHistory(prev => prev.filter(h => 
        user ? h.id !== item.id : h.query !== item.query || h.timestamp !== item.timestamp
      ));
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleClearAllHistory = async () => {
    setIsClearing(true);
    try {
      if (user) {
        await clearUserSearchHistory(user.uid);
      } else {
        clearLocalSearchHistory();
      }
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Show loading state
  if (loading || isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-8" />
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center">
            <ProfilePicture user={user} size="lg" className="mr-4" />
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user ? `Welcome, ${user.displayName || 'User'}!` : 'Your Profile'}
              </h1>
              <p className="text-gray-600">
                {user ? user.email : 'Anonymous user - searches saved locally'}
              </p>
            </div>

            {user && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Signed in</div>
                <div className="text-xs text-gray-400">Auto-logout in 5min of inactivity</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Search */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <SearchBar placeholder="Search for movies..." />
          </div>
        </div>

        {/* Search History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <History className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {user ? 'Your Search History' : 'Recent Searches'}
              </h2>
            </div>

            {searchHistory.length > 0 && (
              <Button
                onClick={handleClearAllHistory}
                disabled={isClearing}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isClearing ? 'Clearing...' : 'Clear All'}
              </Button>
            )}
          </div>

          {searchHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No searches yet</h3>
              <p className="text-gray-600 mb-6">
                {user 
                  ? 'Start searching for movies to see your history here!'
                  : 'Your recent searches will appear here. Sign in to sync across devices.'
                }
              </p>
              <Link href="/">
                <Button>Start Searching</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {searchHistory.map((item, index) => (
                <div
                  key={user ? item.id : `${item.query}-${item.timestamp.getTime()}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center flex-1">
                    <Search className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <Link
                        href={`/search?q=${encodeURIComponent(item.query)}`}
                        className="text-gray-900 hover:text-blue-600 font-medium"
                      >
                        {item.query}
                      </Link>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSearch(item)}
                    className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete this search"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!user && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 text-sm">
                <strong>Want to save your searches across devices?</strong>
                <br />
                Sign in to sync your search history and never lose track of what you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {user 
              ? 'Your search history is securely stored and only visible to you. We automatically delete searches after 50 entries.'
              : 'Your searches are stored locally in your browser. Clear your browser data to remove them.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}