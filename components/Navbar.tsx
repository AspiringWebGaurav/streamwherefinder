'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Search, Menu, X, ChevronRight, User, LogOut, History, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fadeIn } from '@/lib/motion';
import { useAuth } from '@/components/FirebaseProvider';
import { getSearchHistory } from '@/lib/searchHistory';
import { ProfilePicture } from '@/components/ProfilePicture';
import { useLanguage } from '@/components/LanguageProvider';
import { AnimatedSignInButton } from '@/components/AnimatedSignInButton';

export function Navbar() {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchHistoryCount, setSearchHistoryCount] = useState(0);
    const { language, setLanguage } = useLanguage();

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

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [mobileOpen]);

    return (
        <>
            <motion.header
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
                    ? 'shadow-[var(--cinema-shadow-sm)] bg-white/95 backdrop-blur-xl'
                    : 'bg-white/80 backdrop-blur-xl'
                    }`}
                style={{ borderBottom: '1px solid var(--cinema-border)' }}
            >
                <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-[var(--cinema-text-primary)] group">
                            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_2px_12px_rgba(37,99,235,0.25)] group-hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)] transition-shadow duration-300">
                                <Film className="w-4 h-4" />
                            </span>
                            <span className="hidden sm:block">StreamWhere</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-8">
                            <NavLink href="/collections/trending">Trending Now</NavLink>
                            <NavLink href="/collections/popular">Popular Movies</NavLink>
                            <NavLink href="/collections/upcoming">Upcoming Releases</NavLink>
                            <NavLink href="/about">About Us</NavLink>
                        </nav>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center mr-2 bg-[var(--cinema-bg)] border border-[var(--cinema-border)] p-1 rounded-full text-xs font-semibold">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${language === 'en' ? 'bg-[var(--cinema-accent)] text-white shadow-sm' : 'text-[var(--cinema-text-muted)] hover:text-[var(--cinema-text-primary)]'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLanguage('hi')}
                                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${language === 'hi' ? 'bg-[var(--cinema-accent)] text-white shadow-sm' : 'text-[var(--cinema-text-muted)] hover:text-[var(--cinema-text-primary)]'}`}
                            >
                                हिंदी
                            </button>
                            <button
                                onClick={() => setLanguage('mr')}
                                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${language === 'mr' ? 'bg-[var(--cinema-accent)] text-white shadow-sm' : 'text-[var(--cinema-text-muted)] hover:text-[var(--cinema-text-primary)]'}`}
                            >
                                मराठी
                            </button>
                        </div>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-[var(--cinema-border)] bg-[var(--cinema-bg)] hover:border-[var(--cinema-accent)] hover:bg-white transition-all text-left"
                                >
                                    <ProfilePicture user={user} size="sm" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-[var(--cinema-text-primary)] leading-none">
                                            {user.displayName?.split(' ')[0] || 'User'}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-[var(--cinema-text-muted)] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-3 w-64 bg-white border border-[var(--cinema-border)] rounded-2xl shadow-[var(--cinema-shadow-xl)] z-20 overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-[var(--cinema-border-subtle)] bg-slate-50">
                                                    <p className="text-sm font-bold text-[var(--cinema-text-primary)] truncate">
                                                        {user.displayName || 'User'}
                                                    </p>
                                                    <p className="text-xs text-[var(--cinema-text-secondary)] truncate mt-0.5">
                                                        {user.email || ''}
                                                    </p>
                                                </div>
                                                <div className="p-2 flex flex-col gap-1">
                                                    <Link
                                                        href="/profile"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--cinema-text-secondary)] hover:text-[var(--cinema-text-primary)] hover:bg-[var(--cinema-bg)] rounded-xl transition-colors font-medium group"
                                                    >
                                                        <History className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                                                        <span>Search History</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors font-medium group w-full text-left"
                                                    >
                                                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                {searchHistoryCount > 0 && (
                                    <Link href="/profile" className="flex items-center gap-2 group mr-3">
                                        <div className="w-9 h-9 rounded-full bg-[var(--cinema-bg)] border border-[var(--cinema-border)] flex items-center justify-center group-hover:border-[var(--cinema-accent)] transition-colors relative">
                                            <History className="w-4 h-4 text-[var(--cinema-text-secondary)] group-hover:text-[var(--cinema-accent)] transition-colors" />
                                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--cinema-accent)] px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                                                {searchHistoryCount > 99 ? '99+' : searchHistoryCount}
                                            </span>
                                        </div>
                                    </Link>
                                )}
                                <AnimatedSignInButton searchHistoryCount={searchHistoryCount} />
                            </div>
                        )}
                    </div>

                    <button
                        className="md:hidden p-2 -mr-2 text-[var(--cinema-text-primary)] flex items-center justify-center rounded-md hover:bg-[var(--cinema-bg)] transition-colors"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </motion.header>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm md:hidden"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }}
                            exit={{ x: '100%', transition: { duration: 0.2, ease: 'easeIn' } }}
                            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm bg-white shadow-2xl flex flex-col md:hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-[var(--cinema-border)]">
                                <span className="font-bold text-lg text-[var(--cinema-text-primary)]">Menu</span>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="p-2 -mr-2 text-[var(--cinema-text-secondary)] hover:bg-[var(--cinema-bg)] rounded-md transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center p-2 mb-4 bg-[var(--cinema-bg)] border border-[var(--cinema-border)] rounded-full text-sm font-semibold">
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`flex-1 py-1.5 rounded-full transition-all duration-200 ${language === 'en' ? 'bg-[var(--cinema-accent)] text-white shadow-sm' : 'text-[var(--cinema-text-muted)] hover:text-[var(--cinema-text-primary)]'}`}
                                        >
                                            EN
                                        </button>
                                        <button
                                            onClick={() => setLanguage('hi')}
                                            className={`flex-1 py-1.5 rounded-full transition-all duration-200 ${language === 'hi' ? 'bg-[var(--cinema-accent)] text-white shadow-sm' : 'text-[var(--cinema-text-muted)] hover:text-[var(--cinema-text-primary)]'}`}
                                        >
                                            हिंदी
                                        </button>
                                        <button
                                            onClick={() => setLanguage('mr')}
                                            className={`flex-1 py-1.5 rounded-full transition-all duration-200 ${language === 'mr' ? 'bg-[var(--cinema-accent)] text-white shadow-sm' : 'text-[var(--cinema-text-muted)] hover:text-[var(--cinema-text-primary)]'}`}
                                        >
                                            मराठी
                                        </button>
                                    </div>
                                    <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
                                    <MobileNavLink href="/collections/trending" onClick={() => setMobileOpen(false)}>Trending Now</MobileNavLink>
                                    <MobileNavLink href="/collections/popular" onClick={() => setMobileOpen(false)}>Popular</MobileNavLink>
                                    <MobileNavLink href="/about" onClick={() => setMobileOpen(false)}>About Us</MobileNavLink>
                                </div>
                            </div>

                            <div className="p-4 border-t border-[var(--cinema-border)] flex flex-col gap-3 bg-[var(--cinema-bg)]">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-2 p-3 rounded-xl bg-white border border-[var(--cinema-border-subtle)] shadow-sm">
                                            <ProfilePicture user={user} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-[var(--cinema-text-primary)] truncate">
                                                    {user.displayName || 'User'}
                                                </p>
                                                <p className="text-xs text-[var(--cinema-text-secondary)] truncate mt-0.5">
                                                    {user.email || ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-between w-full p-3 rounded-xl bg-white border border-[var(--cinema-border)] text-sm font-medium text-[var(--cinema-text-secondary)] hover:text-[var(--cinema-text-primary)]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <History className="w-4 h-4 text-emerald-600" />
                                                Search History
                                            </div>
                                            {searchHistoryCount > 0 && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--cinema-bg)] px-1.5 text-xs font-bold text-[var(--cinema-text-primary)] border border-[var(--cinema-border)]">
                                                    {searchHistoryCount > 99 ? '99+' : searchHistoryCount}
                                                </span>
                                            )}
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileOpen(false);
                                            }}
                                            className="flex items-center gap-3 w-full p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm font-medium text-rose-600"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {searchHistoryCount > 0 && (
                                            <Link
                                                href="/profile"
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center justify-between w-full p-3 rounded-xl bg-white border border-[var(--cinema-border)] text-sm font-medium text-[var(--cinema-text-secondary)] mb-1"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <History className="w-4 h-4 text-[var(--cinema-text-secondary)]" />
                                                    Recent Searches
                                                </div>
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--cinema-bg)] px-1.5 text-xs font-bold text-[var(--cinema-text-primary)] border border-[var(--cinema-border)]">
                                                    {searchHistoryCount > 99 ? '99+' : searchHistoryCount}
                                                </span>
                                            </Link>
                                        )}
                                        <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Sign In to Save History
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="relative text-sm font-semibold text-[var(--cinema-text-secondary)] hover:text-slate-900 transition-all duration-300 py-2 group"
        >
            {children}
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[var(--cinema-accent)] rounded-full transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
        </Link>
    );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center justify-between py-3 px-2 text-[var(--cinema-text-primary)] font-medium active:bg-[var(--cinema-bg)] rounded-md transition-colors"
        >
            {children}
            <ChevronRight className="w-4 h-4 text-[var(--cinema-text-muted)]" />
        </Link>
    );
}
