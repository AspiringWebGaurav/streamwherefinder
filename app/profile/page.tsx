'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, History, Trash2, Search, Calendar, User, AlertTriangle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/FirebaseProvider';
import {
    getSearchHistory,
    deleteSearchFromFirestore,
    clearUserSearchHistory,
    clearLocalSearchHistory,
    SearchHistoryItem
} from '@/lib/searchHistory';
import { deleteAllUserData } from '@/lib/deleteUserData';
import { EnterpriseSearchBar } from '@/components/EnterpriseSearchBar';
import { ProfilePicture } from '@/components/ProfilePicture';
import { Navbar } from '@/components/Navbar';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isClearing, setIsClearing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
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
        loadSearchHistory();
    }, [user]);

    const handleDeleteSearch = async (item: SearchHistoryItem) => {
        try {
            if (user && item.id) {
                await deleteSearchFromFirestore(item.id);
            }
            setSearchHistory(prev => prev.filter(h =>
                user ? h.id !== item.id : h.query !== item.query || h.timestamp.getTime() !== item.timestamp.getTime()
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

    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsDeleting(true);
        setDeleteError(null);

        try {
            const result = await deleteAllUserData(user.uid);

            if (!result.success) {
                setDeleteError(result.error || 'Failed to delete data');
                return;
            }

            clearLocalSearchHistory();

            try {
                localStorage.removeItem('captcha_verified');
            } catch (e) { }

            await logout();
            window.location.href = '/';
        } catch (error) {
            console.error('Error deleting account:', error);
            setDeleteError('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
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

    if (loading || isLoadingHistory) {
        return (
            <div className="min-h-screen bg-[var(--saas-bg)] pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl w-48 mb-8" />
                        <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-8 mb-8 h-32" />
                        <div className="space-y-4">
                            {Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="h-16 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--saas-bg)] pb-16">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* User Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        <ProfilePicture user={user} size="xl" className="flex-shrink-0" />

                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--saas-text-primary)] tracking-tight mb-1.5">
                                {user ? `Welcome, ${user.displayName || 'User'}!` : 'Your Profile'}
                            </h1>
                            <p className="text-[var(--saas-text-secondary)] font-medium">
                                {user ? user.email : 'Anonymous Mode — searches saved locally in browser'}
                            </p>

                            {!user && (
                                <div className="mt-4 inline-flex items-center bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2">
                                    <span className="text-sm font-semibold text-blue-700">Save and see history anywhere? <Link href="/login" className="underline hover:text-blue-900 ml-1">Sign in</Link></span>
                                </div>
                            )}
                        </div>

                        {user && (
                            <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                <div className="bg-[var(--saas-bg)] px-4 py-2 rounded-lg border border-[var(--saas-border)] inline-flex flex-col items-center sm:items-end">
                                    <span className="text-sm font-bold text-emerald-600 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                        Signed in
                                    </span>
                                    <span className="text-xs font-semibold text-[var(--saas-text-muted)] mt-0.5">Auto-logout on inactivity</span>
                                </div>
                                <button onClick={() => logout()} className="btn-secondary w-full sm:w-auto justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Search */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-[var(--saas-text-primary)] mb-4">Quick Search</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-1.5">
                        <EnterpriseSearchBar placeholder="Find a movie..." />
                    </div>
                </div>

                {/* Search History */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--saas-border-light)]">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-[var(--saas-bg)] rounded-xl border border-[var(--saas-border)] flex items-center justify-center mr-3 hidden sm:flex">
                                <History className="w-5 h-5 text-[var(--saas-text-secondary)]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--saas-text-primary)]">
                                    {user ? 'Your Search History' : 'Recent Searches'}
                                </h2>
                                <p className="text-xs font-medium text-[var(--saas-text-muted)] mt-0.5">
                                    {user ? 'Securely stored on our servers' : 'Stored locally in your browser'}
                                </p>
                            </div>
                        </div>

                        {searchHistory.length > 0 && (
                            <button
                                onClick={handleClearAllHistory}
                                disabled={isClearing}
                                className="btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 w-full sm:w-auto justify-center truncate"
                            >
                                <Trash2 className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">{isClearing ? 'Clearing...' : 'Clear All'}</span>
                            </button>
                        )}
                    </div>

                    {searchHistory.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-[var(--saas-text-muted)]" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--saas-text-primary)] mb-2">No searches yet</h3>
                            <p className="text-[var(--saas-text-secondary)] font-medium mb-6">
                                Start searching for movies to see your history appear right here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {searchHistory.map((item, index) => (
                                <div
                                    key={user ? item.id : `${item.query}-${item.timestamp.getTime()}`}
                                    className="flex items-center justify-between p-4 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl hover:border-[var(--saas-border-light)] hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center flex-1 min-w-0 pr-4">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-[var(--saas-border)] flex flex-shrink-0 items-center justify-center mr-3">
                                            <Search className="w-3.5 h-3.5 text-[var(--saas-text-secondary)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/search?q=${encodeURIComponent(item.query)}`}
                                                className="text-[var(--saas-text-primary)] hover:text-[var(--saas-accent)] font-bold truncate block"
                                            >
                                                {item.query}
                                            </Link>
                                            <div className="flex items-center text-xs font-medium text-[var(--saas-text-secondary)] mt-0.5">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {formatDate(item.timestamp)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteSearch(item)}
                                        className="p-2 text-[var(--saas-text-muted)] hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                        title="Delete this search"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Account Section - Only for logged in users */}
                {user && (
                    <div className="mt-8 bg-white border border-rose-200 shadow-sm rounded-2xl p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-rose-600" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-lg font-bold text-rose-900">Danger Zone: Delete Account & Data</h3>
                                <p className="text-sm font-medium text-rose-800/80 mt-1 mb-4 sm:mb-0 max-w-xl">
                                    Permanently delete all your data from our servers. This includes search history and any saved preferences. This action cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="btn-secondary h-11 text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 hover:border-rose-300 w-full sm:w-auto flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <>
                        <div
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => !isDeleting && setShowDeleteModal(false)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-[var(--saas-border-light)] transform transition-all animate-in zoom-in-95 duration-200">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="w-8 h-8 text-rose-600" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-[var(--saas-text-primary)] tracking-tight">Delete All Data?</h3>
                                    <p className="text-sm font-semibold text-[var(--saas-text-secondary)] mt-1">This action cannot be undone.</p>
                                </div>

                                <div className="bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl p-5 mb-8 text-left">
                                    <p className="text-sm font-bold text-[var(--saas-text-primary)] mb-2">
                                        The following will be permanently deleted:
                                    </p>
                                    <ul className="text-sm font-medium text-[var(--saas-text-secondary)] list-disc list-outside ml-4 space-y-1">
                                        <li>All search history from our database</li>
                                        <li>Any saved preferences or settings</li>
                                        <li>Your account connection</li>
                                    </ul>
                                </div>

                                {deleteError && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
                                        <p className="text-sm font-bold text-rose-800 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> {deleteError}</p>
                                    </div>
                                )}

                                <div className="flex flex-col-reverse sm:flex-row gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isDeleting}
                                        className="btn-secondary w-full justify-center h-12"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        className="btn-primary w-full justify-center h-12 bg-rose-600 hover:bg-rose-700 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Yes, Delete Everything
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
