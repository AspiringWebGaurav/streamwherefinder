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
    const handleNavigationStart = (event: CustomEvent) => {
      const { href, taskKey } = event.detail || {};
      const key = taskKey || `router_${href || 'navigation'}`;
      
      // Start loading for navigation
      loader.startTask(key);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[RouterLoadingManager] Navigation started: ${href || 'unknown'}`);
      }
    };
    
    const handleNavigationEnd = (event: CustomEvent) => {
      const { taskKey } = event.detail || {};
      const key = taskKey || 'router_navigation';
      
      // End loading for navigation
      loader.endTask(key);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[RouterLoadingManager] Navigation ended`);
      }
    };
    
    // Add event listeners for custom navigation events
    window.addEventListener('navigation-start', handleNavigationStart as EventListener);
    window.addEventListener('navigation-end', handleNavigationEnd as EventListener);
    
    return () => {
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