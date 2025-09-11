'use client';

import { useState, useEffect } from 'react';
import { useLoader } from '@/app/providers/LoaderProvider';

/**
 * LoaderDebugMonitor - Real-time debugging component
 * Shows all active loader states and identifies conflicts
 */
export function LoaderDebugMonitor() {
  const { isLoading, taskCount } = useLoader();
  const [debugInfo, setDebugInfo] = useState({
    globalLoader: false,
    routerLoading: false,
    imageLoaders: 0,
    lastUpdate: new Date().toISOString()
  });

  // Monitor for stuck loaders
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for global loader backdrop
      const globalBackdrop = document.querySelector('.global-loader-backdrop');
      const isGlobalVisible = globalBackdrop && window.getComputedStyle(globalBackdrop).display !== 'none';
      
      // Check for active router loading
      const isRouterActive = (window as any).isNavigating || false;
      
      // Count image loaders
      const imageLoaders = document.querySelectorAll('.image-loading, [role="status"]').length;
      
      setDebugInfo({
        globalLoader: !!isGlobalVisible,
        routerLoading: isRouterActive,
        imageLoaders,
        lastUpdate: new Date().toISOString()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      id="loader-debug-monitor"
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        minWidth: '250px',
        maxWidth: '350px'
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', color: '#ff6b6b' }}>🐛 Loader Debug Monitor</h3>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>LoaderProvider State:</strong>
        <br />
        • Is Loading: <span style={{ color: isLoading ? '#ff6b6b' : '#51cf66' }}>
          {isLoading ? 'TRUE' : 'FALSE'}
        </span>
        <br />
        • Task Count: <span style={{ color: taskCount > 0 ? '#ff6b6b' : '#51cf66' }}>
          {taskCount}
        </span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Visual State:</strong>
        <br />
        • Global Backdrop: <span style={{ color: debugInfo.globalLoader ? '#ff6b6b' : '#51cf66' }}>
          {debugInfo.globalLoader ? 'VISIBLE' : 'HIDDEN'}
        </span>
        <br />
        • Router Loading: <span style={{ color: debugInfo.routerLoading ? '#ff6b6b' : '#51cf66' }}>
          {debugInfo.routerLoading ? 'ACTIVE' : 'IDLE'}
        </span>
        <br />
        • Image Loaders: <span style={{ color: debugInfo.imageLoaders > 0 ? '#ffd43b' : '#51cf66' }}>
          {debugInfo.imageLoaders}
        </span>
      </div>

      {/* Conflict Detection */}
      {(!isLoading && debugInfo.globalLoader) && (
        <div style={{ 
          background: '#ff6b6b', 
          color: 'white', 
          padding: '6px', 
          borderRadius: '4px',
          marginBottom: '8px'
        }}>
          ⚠️ CONFLICT: Global loader visible but no tasks active!
        </div>
      )}

      {(taskCount > 5) && (
        <div style={{ 
          background: '#ffd43b', 
          color: 'black', 
          padding: '6px', 
          borderRadius: '4px',
          marginBottom: '8px'
        }}>
          ⚠️ WARNING: High task count ({taskCount}) - possible leak
        </div>
      )}

      <div style={{ fontSize: '10px', color: '#999', marginTop: '8px' }}>
        Last Update: {new Date(debugInfo.lastUpdate).toLocaleTimeString()}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '8px' }}>
        <button
          onClick={() => {
            console.log('🔍 LOADER DEBUG DUMP:', {
              loaderProvider: { isLoading, taskCount },
              visualState: debugInfo,
              globalBackdrop: document.querySelector('.global-loader-backdrop'),
              activeTasks: (window as any).loaderTasks || 'No global tasks found',
              timestamp: new Date().toISOString()
            });
          }}
          style={{
            background: '#339af0',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer',
            marginRight: '4px'
          }}
        >
          Dump Debug Info
        </button>
        <button
          onClick={() => {
            // Force clear all loaders
            const backdrop = document.querySelector('.global-loader-backdrop') as HTMLElement;
            if (backdrop) {
              backdrop.style.display = 'none';
              console.log('🆘 Emergency: Forced global loader hidden');
            }
          }}
          style={{
            background: '#ff6b6b',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Emergency Hide
        </button>
      </div>
    </div>
  );
}

export default LoaderDebugMonitor;