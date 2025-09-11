'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { GlobalLoaderProps } from '@/types/loader';

/**
 * SWF Logomark with film reel icon - inline SVG under 4KB
 * Accessible with proper ARIA labels and semantic structure
 */
function SWFLogomark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="StreamWhereFinder Logo"
    >
      {/* Film reel background circle */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="rgba(255, 255, 255, 0.1)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
      />
      
      {/* Film reel holes */}
      <circle cx="18" cy="18" r="3" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="46" cy="18" r="3" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="18" cy="46" r="3" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="46" cy="46" r="3" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="32" cy="14" r="2" fill="rgba(255, 255, 255, 0.6)" />
      <circle cx="50" cy="32" r="2" fill="rgba(255, 255, 255, 0.6)" />
      <circle cx="32" cy="50" r="2" fill="rgba(255, 255, 255, 0.6)" />
      <circle cx="14" cy="32" r="2" fill="rgba(255, 255, 255, 0.6)" />
      
      {/* Center hub */}
      <circle
        cx="32"
        cy="32"
        r="8"
        fill="rgba(255, 255, 255, 0.2)"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="1"
      />
      
      {/* SWF Text */}
      <text
        x="32"
        y="37"
        textAnchor="middle"
        className="text-white font-bold text-xs fill-current"
        style={{ fontSize: '9px', fontFamily: 'system-ui, sans-serif' }}
      >
        SWF
      </text>
      
      {/* Play button indicator */}
      <path
        d="M28 28 L38 32 L28 36 Z"
        fill="rgba(255, 255, 255, 0.7)"
        stroke="none"
      />
      
      {/* Film strip decorative elements */}
      <path
        d="M8 28 L8 36 L56 36 L56 28"
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    </svg>
  );
}

/**
 * Enterprise GlobalLoader component with portal rendering
 * Features timeout handling, retry mechanism, and full accessibility
 */
export function GlobalLoader({
  isVisible,
  timeoutMessage,
  onRetry
}: GlobalLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  // Handle client-side mounting for SSR compatibility
  useEffect(() => {
    setMounted(true);
    
    // Ensure portal target exists
    let portalRoot = document.getElementById('__global_loader_root');
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = '__global_loader_root';
      document.body.appendChild(portalRoot);
    }
    
    return () => {
      // Cleanup on unmount
      const existingPortal = document.getElementById('__global_loader_root');
      if (existingPortal && existingPortal.children.length === 0) {
        document.body.removeChild(existingPortal);
      }
    };
  }, []);

  // Handle animation classes
  useEffect(() => {
    if (isVisible) {
      setAnimationClass('loader-enter');
    } else if (animationClass === 'loader-enter') {
      setAnimationClass('loader-exit');
    }
  }, [isVisible, animationClass]);

  // Don't render on server or if not mounted
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  // Don't render if not visible and no exit animation
  if (!isVisible && animationClass !== 'loader-exit') {
    return null;
  }

  const portalRoot = document.getElementById('__global_loader_root');
  if (!portalRoot) {
    return null;
  }

  const loaderContent = (
    <div
      className={cn(
        'global-loader-backdrop',
        // Add dark mode class based on current theme
        document.documentElement.classList.contains('dark') && 'dark'
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading StreamWhereFinder"
      {...(!isVisible && { 'aria-hidden': 'true' })}
      style={{
        display: isVisible || animationClass === 'loader-exit' ? 'grid' : 'none'
      }}
    >
      <div className={cn('global-loader-content', animationClass)}>
        {/* SWF Logomark */}
        <SWFLogomark className="global-loader-logo" />
        
        {/* Loading text */}
        <div className="global-loader-text">
          Loading StreamWhereFinder...
        </div>
        
        {/* Timeout message and retry */}
        {timeoutMessage && (
          <div className="global-loader-timeout">
            <div className="global-loader-timeout-text">
              {timeoutMessage}
            </div>
            {onRetry && (
              <button
                className="global-loader-retry-button"
                onClick={onRetry}
                type="button"
                aria-label="Retry loading"
              >
                Try Again
              </button>
            )}
          </div>
        )}
        
        {/* Screen reader text */}
        <div className="sr-only">
          {timeoutMessage ? timeoutMessage : 'Loading content, please wait...'}
        </div>
      </div>
    </div>
  );

  return createPortal(loaderContent, portalRoot);
}

/**
 * Hook for managing global loader visibility with debounce
 * Used internally by LoaderProvider
 */
export function useGlobalLoader(
  taskCount: number,
  debounceDelay: number = 150
) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Enhanced debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 [GlobalLoader] Task count changed to ${taskCount}, current visibility: ${isVisible}`, {
        taskCount,
        isVisible,
        hasTimeout: !!timeoutId,
        debounceDelay,
        timestamp: new Date().toISOString()
      });
    }

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    if (taskCount > 0) {
      // Show loader after debounce delay
      const newTimeoutId = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔵 [GlobalLoader] SHOWING loader (debounce completed)`, {
            taskCount,
            debounceDelay,
            timestamp: new Date().toISOString()
          });
        }
        setIsVisible(true);
        setTimeoutId(null);
      }, debounceDelay);
      setTimeoutId(newTimeoutId);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ [GlobalLoader] Debounce timer started (${debounceDelay}ms)`, {
          taskCount,
          debounceDelay,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // Hide loader immediately when no tasks
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ [GlobalLoader] HIDING loader (no tasks)`, {
          taskCount,
          wasVisible: isVisible,
          timestamp: new Date().toISOString()
        });
      }
      setIsVisible(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [taskCount, debounceDelay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return isVisible;
}

export default GlobalLoader;