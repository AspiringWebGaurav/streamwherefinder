'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseEnabled } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-logout after 5 minutes of inactivity
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

  // Track user activity
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
  }, [user]);

  // Auth state listener
  useEffect(() => {
    if (!auth || !isFirebaseEnabled) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Debug logging for user data
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth State Changed:', {
          hasUser: !!user,
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          providerData: user?.providerData
        });
      }
      
      setUser(user);
      setLoading(false);
      
      if (!user && inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
    });

    return unsubscribe;
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!auth || !isFirebaseEnabled) {
      throw new Error('Authentication is not available. Please check your configuration.');
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Debug logging for Google sign-in result
      if (process.env.NODE_ENV === 'development') {
        console.log('Google Sign-In Result:', {
          user: {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            emailVerified: result.user.emailVerified,
            providerId: result.user.providerId,
            providerData: result.user.providerData
          }
        });
      }
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    if (!auth || !isFirebaseEnabled) {
      return; // No-op if Firebase not configured
    }
    
    try {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}