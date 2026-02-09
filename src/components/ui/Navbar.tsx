'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, History, ChevronDown, Clock, Menu, X, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/providers/FirebaseProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/Button';
import { ProfilePicture } from '@/components/ui/ProfilePicture';
import { getSearchHistory } from '@/lib/searchHistory';
import { cn } from '@/lib/utils';
import { isAdminUser } from '@/lib/admin-shared';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchHistoryCount, setSearchHistoryCount] = useState(0);

  const isAdmin = isAdminUser(user?.email);

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
      <nav className="glass-cinema-navbar navbar-stable sticky top-0 z-40 transition-all duration-300 ease-in-out">
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
                    className="btn-cinema-glass flex items-center space-x-3 px-4 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg cinema-focus"
                  >
                    <ProfilePicture user={user} size="sm" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold" style={{ color: 'var(--cinema-white)' }}>
                        {user?.displayName || 'User'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--cinema-cream)' }}>Signed in</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      showUserMenu && "rotate-180"
                    )} style={{ color: 'var(--cinema-cream)' }} />
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10 backdrop-blur-sm bg-black/20"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-3 w-64 dropdown-cinema rounded-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="p-2">
                          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--cinema-slate)' }}>
                            <p className="text-sm font-semibold" style={{ color: 'var(--cinema-white)' }}>
                              {user?.displayName || 'User'}
                            </p>
                            <p className="text-sm truncate" style={{ color: 'var(--cinema-cream)' }}>
                              {user?.email || ''}
                            </p>
                          </div>
                          <div className="py-2">
                            <Link
                              href="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group hover:bg-black/10 cinema-focus"
                              style={{ color: 'var(--cinema-cream)' }}
                            >
                              <History className="w-4 h-4 mr-3 transition-colors duration-200" style={{ color: 'var(--cinema-gold)' }} />
                              <span className="transition-colors duration-200">Search History</span>
                            </Link>
                            {isAdmin && (
                              <Link
                                href="/admin"
                                target="_blank"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group hover:bg-purple-500/10 cinema-focus"
                                style={{ color: 'var(--cinema-cream)' }}
                              >
                                <Settings className="w-4 h-4 mr-3 transition-colors duration-200" style={{ color: 'var(--cinema-violet)' }} />
                                <span className="transition-colors duration-200">Admin Panel</span>
                              </Link>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group hover:bg-red-500/10 cinema-focus"
                              style={{ color: 'var(--cinema-cream)' }}
                            >
                              <LogOut className="w-4 h-4 mr-3 transition-colors duration-200" style={{ color: 'var(--cinema-error)' }} />
                              <span className="transition-colors duration-200">Sign Out</span>
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
                      <button className="btn-cinema-glass px-4 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg group flex items-center space-x-3 cinema-focus" aria-label={`Search history with ${searchHistoryCount} items`}>
                        <div className="flex items-center space-x-2">
                          <History className="w-4 h-4 transition-colors duration-200" style={{ color: 'var(--cinema-gold)' }} />
                          <span className="text-sm font-medium transition-colors duration-200" style={{ color: 'var(--cinema-white)' }}>History</span>
                        </div>
                        <div className="px-2 py-1 rounded-full min-w-[24px] flex items-center justify-center border glass-cinema-accent" style={{ backgroundColor: 'var(--cinema-gold)', borderColor: 'var(--cinema-amber)' }}>
                          <span className="text-xs font-bold leading-none" style={{ color: 'var(--cinema-midnight)' }}>
                            {searchHistoryCount > 99 ? '99+' : searchHistoryCount}
                          </span>
                        </div>
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn-google-signin px-6 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg group cinema-focus"
                    aria-label="Sign in with Google to save search history"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--cinema-white)' }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--cinema-white)' }}>One-Click Login to Save History</span>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="btn-cinema-glass p-2 rounded-lg glow transition-all duration-200 cinema-focus"
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" style={{ color: 'var(--cinema-white)' }} />
                ) : (
                  <Menu className="w-6 h-6" style={{ color: 'var(--cinema-white)' }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 z-30 lg:hidden"
              style={{ backgroundColor: 'rgba(11, 13, 26, 0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Mobile Menu Panel */}
            <div className={cn(
              "fixed top-0 right-0 h-full w-80 max-w-[85vw] z-40 lg:hidden",
              "glass-cinema-navbar transform transition-transform duration-300 ease-in-out",
              showMobileMenu ? "translate-x-0" : "translate-x-full"
            )} style={{ borderLeft: '1px solid var(--cinema-slate)' }}>
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--cinema-slate)' }}>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--cinema-white)' }}>Menu</h2>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="btn-cinema-glass p-2 rounded-lg cinema-focus"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" style={{ color: 'var(--cinema-white)' }} />
                  </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 p-4 space-y-4">
                  {user ? (
                    <>
                      <div className="glass-cinema-primary p-4 rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <ProfilePicture user={user} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--cinema-white)' }}>
                              {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--cinema-cream)' }}>
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link
                          href="/profile"
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center w-full p-3 rounded-xl transition-colors hover:bg-black/10 cinema-focus"
                          style={{ color: 'var(--cinema-white)' }}
                        >
                          <History className="w-5 h-5 mr-3" style={{ color: 'var(--cinema-gold)' }} />
                          <span>Search History</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            target="_blank"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center w-full p-3 rounded-xl transition-colors hover:bg-purple-500/10 cinema-focus"
                            style={{ color: 'var(--cinema-white)' }}
                          >
                            <Settings className="w-5 h-5 mr-3" style={{ color: 'var(--cinema-violet)' }} />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            handleLogout();
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center w-full p-3 rounded-xl transition-colors hover:bg-red-500/10 cinema-focus"
                          style={{ color: 'var(--cinema-white)' }}
                        >
                          <LogOut className="w-5 h-5 mr-3" style={{ color: 'var(--cinema-error)' }} />
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
                          className="flex items-center justify-between w-full p-3 glass-cinema-primary rounded-xl cinema-focus"
                        >
                          <div className="flex items-center">
                            <History className="w-5 h-5 mr-3" style={{ color: 'var(--cinema-gold)' }} />
                            <span style={{ color: 'var(--cinema-white)' }}>Search History</span>
                          </div>
                          <div className="px-3 py-1 rounded-full min-w-[28px] flex items-center justify-center border glass-cinema-accent" style={{ backgroundColor: 'var(--cinema-gold)', borderColor: 'var(--cinema-amber)' }}>
                            <span className="text-sm font-bold leading-none" style={{ color: 'var(--cinema-midnight)' }}>
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
                        className="w-full btn-google-signin p-4 rounded-xl glow transition-all duration-300 cinema-focus"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <User className="w-6 h-6" style={{ color: 'var(--cinema-white)' }} />
                          <span className="text-base font-semibold" style={{ color: 'var(--cinema-white)' }}>Sign In with Google</span>
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