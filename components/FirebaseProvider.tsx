'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isFirebaseEnabled } from '@/lib/firebase';
import { syncHistoryOnLogin, flushPendingSync } from '@/lib/searchHistory';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

    async function logout() {
        if (!auth || !isFirebaseEnabled) return;

        try {
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
                inactivityTimer.current = null;
            }
            // Flush any pending debounced history sync before signing out
            await flushPendingSync(user);
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    const resetInactivityTimer = () => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
        }

        if (user) {
            const timer = setTimeout(() => {
                logout();
            }, 5 * 60 * 1000); // 5 minutes

            inactivityTimer.current = timer;
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && user) {
            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

            const handleActivity = () => {
                resetInactivityTimer();
            };

            events.forEach(event => {
                document.addEventListener(event, handleActivity, true);
            });

            resetInactivityTimer();

            return () => {
                events.forEach(event => {
                    document.removeEventListener(event, handleActivity, true);
                });

                if (inactivityTimer.current) {
                    clearTimeout(inactivityTimer.current);
                }
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (!auth || !isFirebaseEnabled) {
            queueMicrotask(() => setLoading(false));
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (newUser) => {
            setUser(newUser);
            setLoading(false);

            if (newUser) {
                // One-time history merge on login
                syncHistoryOnLogin(newUser).catch(err =>
                    console.error('History sync on login failed:', err)
                );
            } else if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
                inactivityTimer.current = null;
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth || !isFirebaseEnabled) {
            throw new Error('Authentication is not available.');
        }

        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a FirebaseProvider');
    }
    return context;
}

export default FirebaseProvider;
