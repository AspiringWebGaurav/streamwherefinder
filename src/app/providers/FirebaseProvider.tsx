'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseEnabled } from '@/lib/firebase';
import { useLoader } from './LoaderProvider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Enhanced FirebaseProvider with LoaderProvider integration
 * Automatically manages global loading states during Firebase auth operations
 */
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const authTaskStarted = useRef<boolean>(false);
  
  // Integrate with global loader system
  const loader = useLoader();

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

  // Auth state listener with loader integration
  useEffect(() => {
    if (!auth || !isFirebaseEnabled) {
      setLoading(false);
      return;
    }

    // Start auth loading task only once
    if (!authTaskStarted.current) {
      loader.startTask('firebase_auth_init');
      authTaskStarted.current = true;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // End auth loading task only on first auth resolution and keep flag true to prevent restarts
      if (authTaskStarted.current) {
        loader.endTask('firebase_auth_init');
        // Don't reset the flag to prevent repeated start/end cycles
      }
      
      if (!user && inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
    });

    return () => {
      unsubscribe();
      // Only end task if it was actually started
      if (authTaskStarted.current) {
        loader.endTask('firebase_auth_init');
      }
    };
  }, [loader]);

  // Sign in with Google with loader integration
  const signInWithGoogle = async () => {
    if (!auth || !isFirebaseEnabled) {
      throw new Error('Authentication is not available. Please check your configuration.');
    }
    
    try {
      // Start sign-in loading task
      loader.startTask('firebase_signin');
      
      const result = await signInWithPopup(auth, googleProvider);
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      // Always end the loading task
      loader.endTask('firebase_signin');
    }
  };

  // Logout with loader integration
  const logout = async () => {
    if (!auth || !isFirebaseEnabled) {
      return; // No-op if Firebase not configured
    }
    
    try {
      // Start logout loading task
      loader.startTask('firebase_logout');
      
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      
      await signOut(auth);
      
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      // Always end the loading task
      loader.endTask('firebase_logout');
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

/**
 * Hook to access Firebase auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
}

/**
 * Hook for Firebase auth operations with enhanced loading states
 */
export function useFirebaseAuth() {
  const auth = useAuth();
  const loader = useLoader();
  
  // Enhanced sign-in with custom loading key
  const signInWithCustomLoader = async (taskKey?: string) => {
    const key = taskKey || 'custom_firebase_signin';
    
    try {
      loader.startTask(key);
      await auth.signInWithGoogle();
    } finally {
      loader.endTask(key);
    }
  };
  
  // Enhanced logout with custom loading key
  const logoutWithCustomLoader = async (taskKey?: string) => {
    const key = taskKey || 'custom_firebase_logout';
    
    try {
      loader.startTask(key);
      await auth.logout();
    } finally {
      loader.endTask(key);
    }
  };
  
  return {
    ...auth,
    signInWithCustomLoader,
    logoutWithCustomLoader
  };
}

export default FirebaseProvider;