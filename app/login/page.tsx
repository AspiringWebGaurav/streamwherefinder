'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, ArrowLeft, Loader2, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/FirebaseProvider';
import { Navbar } from '@/components/Navbar';

function LoginContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const { user, signInWithGoogle } = useAuth();

    useEffect(() => {
        // If already logged in, redirect
        if (user) {
            router.push(returnUrl);
        }
    }, [user, router, returnUrl]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');

        try {
            await signInWithGoogle();
            router.push(returnUrl);
        } catch (err: any) {
            console.error('Sign-in error:', err);
            setError(err.message || 'Failed to sign in. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-8 sm:p-10">
                <div className="text-center mb-10">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--saas-text-primary)] mb-3 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-[var(--saas-text-secondary)] font-medium">
                        Sign in to save your search history and get personalized recommendations.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-start">
                        <ShieldCheck className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className={`w-full relative flex items-center justify-center h-12 px-6 bg-white border border-[var(--saas-border)] hover:bg-[var(--saas-bg)] text-[var(--saas-text-primary)] font-semibold rounded-xl transition-all shadow-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:border-[var(--saas-border-light)] hover:shadow-md'
                        }`}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[var(--saas-text-secondary)]" />
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <div className="mt-8 pt-8 border-t border-[var(--saas-border-light)]">
                    <ul className="space-y-4 text-sm font-medium text-[var(--saas-text-secondary)]">
                        <li className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3 border border-emerald-100/50">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                            Secure, one-click authentication
                        </li>
                        <li className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mr-3 border border-amber-100/50">
                                <Zap className="w-4 h-4 text-amber-600" />
                            </div>
                            Save and access your search history anywhere
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--saas-bg)]">
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-4">
                <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--saas-text-muted)]" /></div>}>
                    <LoginContent />
                </Suspense>
            </main>
        </div>
    );
}
