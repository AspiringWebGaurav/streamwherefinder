'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, History, ChevronDown, Clock, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/providers/FirebaseProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/Button';
import { ProfilePicture } from '@/components/ui/ProfilePicture';
import { getSearchHistory } from '@/lib/searchHistory';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
        <div className="navbar-edge-to-edge w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20 w-full">
            {/* Logo - Enhanced Brand */}
            <div className="brand-container flex-shrink-0">
              <Link href="/" className="flex items-center glow group">
                <div className="brand-enhanced">
                  <span className="hidden sm:inline brand-text-full">StreamWhereFinder</span>
                  <span className="sm:hidden brand-text-compact">SWF</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on Mobile */}
            <div className="hidden lg:flex nav-items-container flex-shrink-0 ml-auto pr-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="btn-glass flex items-center space-x-3 px-4 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg"
                  >
                    <ProfilePicture user={user} size="sm" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-white">
                        {user?.displayName || 'User'}
                      </span>
                      <span className="text-xs text-white/80">Signed in</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-white/80 transition-transform duration-200",
                      showUserMenu && "rotate-180"
                    )} />
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10 backdrop-blur-sm bg-black/20"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-3 w-64 dropdown-glass rounded-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="p-2">
                          <div className="px-4 py-4 border-b border-white/10">
                            <p className="text-sm font-semibold text-gray-800">
                              {user?.displayName || 'User'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
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
                <>
                  {searchHistoryCount > 0 && (
                    <Link href="/profile">
                      <button className="btn-glass px-4 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg group flex items-center space-x-3" aria-label={`Search history with ${searchHistoryCount} items`}>
                        <div className="flex items-center space-x-2">
                          <History className="w-4 h-4 text-white group-hover:text-cyan-200 transition-colors duration-200" />
                          <span className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors duration-200">History</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full min-w-[24px] flex items-center justify-center border border-white/30">
                          <span className="text-xs font-bold text-white leading-none">
                            {searchHistoryCount > 99 ? '99+' : searchHistoryCount}
                          </span>
                        </div>
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn-google-signin gradient-hover px-6 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg group"
                    aria-label="Sign in with Google to save search history"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm font-semibold text-white">One-Click Login to Save History</span>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="btn-glass p-2 rounded-lg glow transition-all duration-200"
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            
            {/* Mobile Menu Panel */}
            <div className={cn(
              "fixed top-0 right-0 h-full w-80 max-w-[85vw] z-40 lg:hidden",
              "glass-navbar border-l border-white/20 transform transition-transform duration-300 ease-in-out",
              showMobileMenu ? "translate-x-0" : "translate-x-full"
            )}>
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Menu</h2>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="btn-glass p-2 rounded-lg"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 p-4 space-y-4">
                  {user ? (
                    <>
                      <div className="glass p-4 rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <ProfilePicture user={user} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-white/80 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link
                          href="/profile"
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center w-full p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <History className="w-5 h-5 mr-3" />
                          <span>Search History</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center w-full p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {searchHistoryCount > 0 && (
                        <Link
                          href="/profile"
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center justify-between w-full p-3 glass rounded-xl"
                        >
                          <div className="flex items-center">
                            <History className="w-5 h-5 mr-3 text-white" />
                            <span className="text-white">Search History</span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full min-w-[28px] flex items-center justify-center border border-white/30">
                            <span className="text-sm font-bold text-white leading-none">
                              {searchHistoryCount > 99 ? '99+' : searchHistoryCount}
                            </span>
                          </div>
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full btn-google-signin gradient-hover p-4 rounded-xl glow transition-all duration-300"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <User className="w-6 h-6 text-white" />
                          <span className="text-base font-semibold text-white">Sign In with Google</span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}