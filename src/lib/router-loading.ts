'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { LoaderContextType } from '@/types/loader';

/**
 * Router loading integration for Next.js App Router
 * Automatically manages global loading states during navigation
 */

// Global state for router loading - improved synchronization
let currentRouterTaskKey: string | null = null;
let routerStartTime = 0;
let routerGraceTimer: NodeJS.Timeout | null = null;
let routerDebounceTimer: NodeJS.Timeout | null = null;
let isNavigating = false;

/**
 * Hook to integrate router events with LoaderProvider
 * Automatically shows/hides global loader during navigation
 */
export function useRouterLoading(loaderContext: LoaderContextType) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startTask, endTask } = loaderContext;
  
  // Track previous values to detect changes
  const prevPathnameRef = useRef<string>(pathname);
  const prevSearchParamsRef = useRef<string>(searchParams?.toString() || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Constants
  const DEBOUNCE_DELAY = 150; // Only show loader for navigations > 150ms
  const GRACE_PERIOD = 100;   // Grace period before hiding loader
  
  useEffect(() => {
    const currentPathname = pathname;
    const currentSearchParams = searchParams?.toString() || '';
    
    // Check if navigation actually occurred
    const pathnameChanged = prevPathnameRef.current !== currentPathname;
    const searchParamsChanged = prevSearchParamsRef.current !== currentSearchParams;
    
    if (pathnameChanged || searchParamsChanged) {
      // Navigation completed - end any active router loading
      if (isNavigating && currentRouterTaskKey) {
        // Add grace period to prevent flicker on fast navigations
        if (routerGraceTimer) {
          clearTimeout(routerGraceTimer);
        }
        
        const taskKeyToEnd = currentRouterTaskKey;
        routerGraceTimer = setTimeout(() => {
          endTask(taskKeyToEnd);
          isNavigating = false;
          currentRouterTaskKey = null;
          routerGraceTimer = null;
          
          // Enhanced debug logging
          if (process.env.NODE_ENV === 'development') {
            const duration = Date.now() - routerStartTime;
            console.log(`🚀 [RouterLoading] Navigation completed in ${duration}ms`, {
              taskKey: taskKeyToEnd,
              duration,
              pathname: currentPathname,
              searchParams: currentSearchParams,
              timestamp: new Date().toISOString()
            });
          }
        }, GRACE_PERIOD);
      } else if (currentRouterTaskKey) {
        // Force end any orphaned router tasks immediately
        endTask(currentRouterTaskKey);
        currentRouterTaskKey = null;
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔧 [RouterLoading] Cleaned up orphaned router task`, {
            taskKey: currentRouterTaskKey,
            pathname: currentPathname,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Update refs for next comparison
      prevPathnameRef.current = currentPathname;
      prevSearchParamsRef.current = currentSearchParams;
    }
    
    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (routerGraceTimer) {
        clearTimeout(routerGraceTimer);
      }
      if (routerDebounceTimer) {
        clearTimeout(routerDebounceTimer);
      }
      
      // Clean up any remaining router task
      if (currentRouterTaskKey && isNavigating) {
        endTask(currentRouterTaskKey);
        currentRouterTaskKey = null;
        isNavigating = false;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🧹 [RouterLoading] Cleaned up router task on hook cleanup`);
        }
      }
    };
  }, [pathname, searchParams, endTask]);
  
  // Return function to manually start router loading
  const startRouterLoading = (customKey?: string) => {
    // Generate unique task key
    const taskKey = customKey || `router_navigation_${Date.now()}`;
    
    // Clear any existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (routerGraceTimer) {
      clearTimeout(routerGraceTimer);
    }
    if (routerDebounceTimer) {
      clearTimeout(routerDebounceTimer);
    }
    
    // End any previous navigation task
    if (currentRouterTaskKey && isNavigating) {
      endTask(currentRouterTaskKey);
    }
    
    // Start loading with debounce
    routerDebounceTimer = setTimeout(() => {
      if (!isNavigating || currentRouterTaskKey !== taskKey) {
        startTask(taskKey);
        currentRouterTaskKey = taskKey;
        isNavigating = true;
        routerStartTime = Date.now();
        
        // Enhanced debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 [RouterLoading] Started navigation loading`, {
            taskKey,
            isNavigating,
            routerStartTime: routerStartTime,
            timestamp: new Date().toISOString()
          });
        }
      }
      routerDebounceTimer = null;
    }, DEBOUNCE_DELAY);
  };
  
  return { startRouterLoading };
}

/**
 * Enhanced router loading hook with programmatic navigation support
 * Integrates with Next.js router.push/replace methods
 */
export function useEnhancedRouterLoading(loaderContext: LoaderContextType) {
  const { startRouterLoading } = useRouterLoading(loaderContext);
  
  // Wrapper for router.push that triggers loading
  const navigateWithLoader = (url: string, options?: { replace?: boolean }) => {
    startRouterLoading();
    
    // Import router dynamically to avoid SSR issues
    import('next/navigation').then(({ useRouter }) => {
      // Note: This approach has limitations with hooks
      // For programmatic navigation, use the manual startRouterLoading function
      console.warn('[RouterLoading] For programmatic navigation, use startRouterLoading() before router.push()');
    });
  };
  
  return {
    startRouterLoading,
    navigateWithLoader
  };
}

/**
 * Client-side script for intercepting navigation events
 * Should be included in layout or root component
 */
export function RouterLoadingScript() {
  useEffect(() => {
    // Intercept Link clicks and form submissions
    const handleLinkClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Only handle internal links
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      // Dispatch custom event for router loading
      const navigationEvent = new CustomEvent('navigation-start', {
        detail: { href }
      });
      window.dispatchEvent(navigationEvent);
    };
    
    // Listen for form submissions that might cause navigation
    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (!form) return;
      
      const action = form.getAttribute('action');
      const method = form.getAttribute('method');
      
      // Only handle GET forms that navigate
      if (method?.toLowerCase() !== 'get') return;
      
      const navigationEvent = new CustomEvent('navigation-start', {
        detail: { href: action || window.location.pathname }
      });
      window.dispatchEvent(navigationEvent);
    };
    
    // Add event listeners
    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('submit', handleFormSubmit, true);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, []);
  
  return null; // This is a behavior-only component
}

/**
 * Higher-order component that adds router loading to any component
 * Note: For now, we recommend using the hooks directly in components
 */
export function withRouterLoading<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent: React.ComponentType<P> = (props: P) => {
    // This would need to be implemented if needed
    // For now, we recommend using the hooks directly
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withRouterLoading(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Utility functions for manual router loading management
 */
export const RouterLoadingUtils = {
  /**
   * Start router loading manually (for programmatic navigation)
   */
  startLoading: (customKey?: string) => {
    const taskKey = customKey || `router_navigation_${Date.now()}`;
    const event = new CustomEvent('navigation-start', {
      detail: { taskKey }
    });
    window.dispatchEvent(event);
    return taskKey; // Return the key so caller can use it for ending
  },
  
  /**
   * End router loading manually
   */
  endLoading: (taskKey?: string) => {
    const keyToUse = taskKey || currentRouterTaskKey;
    if (keyToUse) {
      const event = new CustomEvent('navigation-end', {
        detail: { taskKey: keyToUse }
      });
      window.dispatchEvent(event);
    }
  },
  
  /**
   * Force end all router loading (emergency cleanup)
   */
  forceEndAll: () => {
    if (currentRouterTaskKey) {
      const event = new CustomEvent('navigation-end', {
        detail: { taskKey: currentRouterTaskKey }
      });
      window.dispatchEvent(event);
    }
    
    // Clean up global state
    isNavigating = false;
    currentRouterTaskKey = null;
    if (routerGraceTimer) {
      clearTimeout(routerGraceTimer);
      routerGraceTimer = null;
    }
    if (routerDebounceTimer) {
      clearTimeout(routerDebounceTimer);
      routerDebounceTimer = null;
    }
  },
  
  /**
   * Check if router is currently loading
   */
  isLoading: () => isNavigating,
  
  /**
   * Get current task key
   */
  getCurrentTaskKey: () => currentRouterTaskKey
};

export default useRouterLoading;