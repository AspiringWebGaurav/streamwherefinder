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
      <nav className="glass-navbar navbar-stable sticky top-0 z-40 transition-all duration-300 ease-in-out">
        <div className="navbar-edge-to-edge">
          <div className="flex justify-between items-center h-20 w-full">
            {/* Logo - Completely Left Aligned */}
            <div className="brand-container flex-shrink-0">
              <Link href="/" className="flex items-center glow">
                <div className="text-2xl brand-text font-extrabold tracking-tight">
                  StreamWhereFinder
                </div>
              </Link>
            </div>

            {/* Auth Section - Completely Right Aligned */}
            <div className="nav-items-container flex-shrink-0 ml-auto">
              {user ? (
                /* User Menu */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="btn-glass flex items-center space-x-3 px-4 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg"
                  >
                    <ProfilePicture user={user} size="sm" />
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-semibold text-white">
                        {user.displayName || 'User'}
                      </span>
                      <span className="text-xs text-white/80">Signed in</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-white/80 transition-transform duration-200",
                      showUserMenu && "rotate-180"
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10 backdrop-blur-sm bg-black/20"
                        onClick={() => setShowUserMenu(false)}
                      />
                      
                      {/* Menu */}
                      <div className="absolute right-0 mt-3 w-64 dropdown-glass rounded-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="p-2">
                          {/* User Info */}
                          <div className="px-4 py-4 border-b border-white/10">
                            <p className="text-sm font-semibold text-gray-800">
                              {user.displayName || 'User'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {user.email}
                            </p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              href="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                            >
                              <History className="w-4 h-4 mr-3 group-hover:text-purple-600 transition-colors duration-200" />
                              <span className="group-hover:text-purple-600 transition-colors duration-200">Search History</span>
                            </Link>

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50/50 rounded-xl transition-all duration-200 group"
                            >
                              <LogOut className="w-4 h-4 mr-3 group-hover:text-red-600 transition-colors duration-200" />
                              <span className="group-hover:text-red-600 transition-colors duration-200">Sign Out</span>
                            </button>
                          </div>
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
                    <Link href="/profile" className="badge-container">
                      <button className="btn-glass px-4 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg group" aria-label={`Search history with ${searchHistoryCount} items`}>
                        <div className="flex items-center space-x-2">
                          <History className="w-4 h-4 text-white group-hover:text-cyan-200 transition-colors duration-200" />
                          <span className="hidden sm:inline text-sm font-medium text-white group-hover:text-cyan-200 transition-colors duration-200">History</span>
                          <span className="sm:hidden">
                            <Clock className="w-4 h-4 text-white group-hover:text-cyan-200 transition-colors duration-200" />
                          </span>
                        </div>
                        <span className="badge-positioned gradient-dynamic-badge" aria-hidden="true">
                          {searchHistoryCount > 99 ? '99+' : searchHistoryCount > 9 ? '9+' : searchHistoryCount}
                        </span>
                      </button>
                    </Link>
                  )}
                  
                  {/* Login Button */}
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn-google-signin gradient-hover px-6 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg group"
                    aria-label="Sign in with Google to save search history"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                      <span className="hidden sm:inline text-sm font-semibold text-white">One-Click Login to Save History</span>
                      <span className="sm:hidden text-sm font-semibold text-white">Login</span>
                    </div>
                  </button>
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