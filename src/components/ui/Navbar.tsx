'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, History, ChevronDown, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/Button';
import { ProfilePicture } from '@/components/ui/ProfilePicture';
import { getSearchHistory } from '@/lib/searchHistory';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchHistoryCount, setSearchHistoryCount] = useState(0);

  // Load search history count for anonymous users
  useEffect(() => {
    async function loadHistoryCount() {
      try {
        const history = await getSearchHistory(user);
        setSearchHistoryCount(history.length);
      } catch (error) {
        console.error('Failed to load search history count:', error);
      }
    }
    loadHistoryCount();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="text-xl font-bold text-blue-600">
                  StreamWhereFinder
                </div>
              </Link>
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {user ? (
                /* User Menu */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ProfilePicture user={user} size="sm" />
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900">
                        {user.displayName || 'User'}
                      </span>
                      <span className="text-xs text-gray-500">Signed in</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      
                      {/* Menu */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="py-2">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {user.displayName || 'User'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>

                          {/* Menu Items */}
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <History className="w-4 h-4 mr-3" />
                            Search History
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Anonymous User Section */
                <>
                  {/* Search History Button for Anonymous Users */}
                  {searchHistoryCount > 0 && (
                    <Link href="/profile">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 relative"
                      >
                        <History className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">History</span>
                        <span className="sm:hidden">
                          <Clock className="w-4 h-4" />
                        </span>
                        {searchHistoryCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {searchHistoryCount > 9 ? '9+' : searchHistoryCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                  )}
                  
                  {/* Login Button */}
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">One-Click Login to Save History</span>
                    <span className="sm:hidden">Login</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}