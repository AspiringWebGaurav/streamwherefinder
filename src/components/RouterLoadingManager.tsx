'use client';

import { useEffect, Suspense } from 'react';
import { useLoader } from '@/app/providers/LoaderProvider';
import { useRouterLoading, RouterLoadingScript } from '@/lib/router-loading';

/**
 * Router Loading Manager Component
 * Wires Next.js App Router navigation events to the global LoaderProvider
 * Should be included in the root layout or app component
 */
function RouterLoadingManagerCore() {
  const loader = useLoader();
  
  // Initialize router loading integration
  useRouterLoading(loader);
  
  // Listen for custom navigation events
  useEffect(() => {
    // Keep track of active navigation task keys
    let currentNavigationKey: string | null = null;
    
    const handleNavigationStart = (event: CustomEvent) => {
      const { href, taskKey } = event.detail || {};
      
      // End any previous navigation task first
      if (currentNavigationKey) {
        loader.endTask(currentNavigationKey);
      }
      
      // Use consistent key format - prioritize custom taskKey, then use standardized key
      const key = taskKey || `router_navigation_${Date.now()}`;
      currentNavigationKey = key;
      
      // Start loading for navigation
      loader.startTask(key);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[RouterLoadingManager] Navigation started: ${href || 'unknown'} with key: ${key}`);
      }
    };
    
    const handleNavigationEnd = (event: CustomEvent) => {
      const { taskKey } = event.detail || {};
      
      // Use the same key that was used for starting, or the current tracked key
      const key = taskKey || currentNavigationKey;
      
      if (key) {
        loader.endTask(key);
        currentNavigationKey = null;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[RouterLoadingManager] Navigation ended with key: ${key}`);
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.warn(`[RouterLoadingManager] Navigation ended but no key to clean up`);
      }
    };
    
    // Add event listeners for custom navigation events
    window.addEventListener('navigation-start', handleNavigationStart as EventListener);
    window.addEventListener('navigation-end', handleNavigationEnd as EventListener);
    
    return () => {
      // Clean up any remaining navigation task on unmount
      if (currentNavigationKey) {
        loader.endTask(currentNavigationKey);
        currentNavigationKey = null;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[RouterLoadingManager] Cleaned up navigation task on unmount`);
        }
      }
      
      window.removeEventListener('navigation-start', handleNavigationStart as EventListener);
      window.removeEventListener('navigation-end', handleNavigationEnd as EventListener);
    };
  }, [loader]);
  
  return <RouterLoadingScript />;
}

/**
 * RouterLoadingManager wrapped in Suspense to handle useSearchParams() usage
 * This prevents build errors on statically generated pages like 404
 */
export function RouterLoadingManager() {
  return (
    <Suspense fallback={null}>
      <RouterLoadingManagerCore />
    </Suspense>
  );
}

export default RouterLoadingManager;