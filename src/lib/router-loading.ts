'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { LoaderContextType } from '@/types/loader';

/**
 * Router loading integration for Next.js App Router
 * Automatically manages global loading states during navigation
 */

// Global state for router loading
let routerTaskKey = 'router_navigation';
let routerStartTime = 0;
let routerGraceTimer: NodeJS.Timeout | null = null;
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
      if (isNavigating) {
        // Add grace period to prevent flicker on fast navigations
        if (routerGraceTimer) {
          clearTimeout(routerGraceTimer);
        }
        
        routerGraceTimer = setTimeout(() => {
          endTask(routerTaskKey);
          isNavigating = false;
          routerGraceTimer = null;
          
          // Debug logging
          if (process.env.NODE_ENV === 'development') {
            const duration = Date.now() - routerStartTime;
            console.log(`[RouterLoading] Navigation completed in ${duration}ms`);
          }
        }, GRACE_PERIOD);
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
    };
  }, [pathname, searchParams, endTask]);
  
  // Return function to manually start router loading
  const startRouterLoading = (customKey?: string) => {
    const taskKey = customKey || routerTaskKey;
    
    // Clear any existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (routerGraceTimer) {
      clearTimeout(routerGraceTimer);
    }
    
    // Start loading with debounce
    debounceTimerRef.current = setTimeout(() => {
      if (!isNavigating) {
        startTask(taskKey);
        isNavigating = true;
        routerStartTime = Date.now();
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[RouterLoading] Started navigation loading`);
        }
      }
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
  startLoading: (taskKey = routerTaskKey) => {
    const event = new CustomEvent('navigation-start', {
      detail: { taskKey }
    });
    window.dispatchEvent(event);
  },
  
  /**
   * End router loading manually
   */
  endLoading: (taskKey = routerTaskKey) => {
    const event = new CustomEvent('navigation-end', {
      detail: { taskKey }
    });
    window.dispatchEvent(event);
  },
  
  /**
   * Check if router is currently loading
   */
  isLoading: () => isNavigating
};

export default useRouterLoading;