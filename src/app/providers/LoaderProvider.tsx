'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import GlobalLoader, { useGlobalLoader } from '@/components/GlobalLoader';
import type { LoaderContextType, LoaderProviderProps, LoaderTask } from '@/types/loader';

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

/**
 * Enterprise LoaderProvider with advanced task management
 * Features:
 * - Task counter system with unique keys
 * - 150ms debounce to prevent micro-navigation flashes
 * - 15s timeout with retry mechanism
 * - Full accessibility support
 * - Performance optimized with minimal re-renders
 */
export function LoaderProvider({
  children,
  timeoutDuration = 15000, // 15 seconds
  debounceDelay = 150,     // 150ms debounce
  timeoutMessage = "Still working...",
  onRetry
}: LoaderProviderProps) {
  // Task management state
  const [taskCount, setTaskCount] = useState(0);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  
  // Refs for stable references
  const tasksRef = useRef<Map<string, LoaderTask>>(new Map());
  const taskCounterRef = useRef(0);
  const globalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryHandlerRef = useRef(onRetry);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Constants for fail-safe mechanisms
  const MAX_TASK_DURATION = 30000; // 30 seconds max per task
  const CLEANUP_INTERVAL = 5000;   // Check every 5 seconds
  const MAX_TOTAL_TASKS = 10;      // Maximum concurrent tasks
  
  // Update retry handler ref when it changes
  useEffect(() => {
    retryHandlerRef.current = onRetry;
  }, [onRetry]);
  
  // Periodic cleanup of stuck tasks
  useEffect(() => {
    const cleanupStuckTasks = () => {
      const now = Date.now();
      const tasksToCleanup: string[] = [];
      
      tasksRef.current.forEach((task, key) => {
        const taskAge = now - task.startTime;
        if (taskAge > MAX_TASK_DURATION) {
          tasksToCleanup.push(key);
          
          if (process.env.NODE_ENV === 'development') {
            console.warn(`🚨 [LoaderProvider] Task "${key}" stuck for ${taskAge}ms, cleaning up`);
          }
        }
      });
      
      // Clean up stuck tasks
      tasksToCleanup.forEach(key => {
        tasksRef.current.delete(key);
      });
      
      if (tasksToCleanup.length > 0) {
        const newCount = tasksRef.current.size;
        setTaskCount(newCount);
        
        // Clear global timeout if no tasks remain
        if (newCount === 0) {
          clearGlobalTimeout();
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🧹 [LoaderProvider] Cleaned up ${tasksToCleanup.length} stuck tasks`);
        }
      }
    };
    
    // Start periodic cleanup
    cleanupIntervalRef.current = setInterval(cleanupStuckTasks, CLEANUP_INTERVAL);
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // Generate unique task key
  const generateTaskKey = useCallback(() => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Start global timeout when first task begins
  const startGlobalTimeout = useCallback(() => {
    if (globalTimeoutRef.current) {
      return; // Already started
    }

    globalTimeoutRef.current = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, timeoutDuration);
  }, [timeoutDuration]);

  // Clear global timeout
  const clearGlobalTimeout = useCallback(() => {
    if (globalTimeoutRef.current) {
      clearTimeout(globalTimeoutRef.current);
      globalTimeoutRef.current = null;
    }
    setShowTimeoutMessage(false);
  }, []);

  // Start a loading task
  const startTask = useCallback((key?: string) => {
    const taskKey = key || generateTaskKey();
    const now = Date.now();
    
    // Don't add duplicate tasks
    if (tasksRef.current.has(taskKey)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[LoaderProvider] Task with key "${taskKey}" already exists, refreshing timestamp`);
      }
      // Update existing task timestamp instead of ignoring
      const existingTask = tasksRef.current.get(taskKey)!;
      existingTask.startTime = now;
      return taskKey;
    }
    
    // Fail-safe: prevent too many concurrent tasks
    if (tasksRef.current.size >= MAX_TOTAL_TASKS) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[LoaderProvider] Maximum task limit reached (${MAX_TOTAL_TASKS}), forcing cleanup`);
      }
      
      // Remove oldest tasks to make room
      const oldestTasks = Array.from(tasksRef.current.entries())
        .sort(([, a], [, b]) => a.startTime - b.startTime)
        .slice(0, Math.floor(MAX_TOTAL_TASKS / 2))
        .map(([key]) => key);
      
      oldestTasks.forEach(oldKey => {
        tasksRef.current.delete(oldKey);
      });
    }

    // Add task to map
    const task: LoaderTask = {
      key: taskKey,
      startTime: now
    };
    
    tasksRef.current.set(taskKey, task);
    
    // Update counter and state
    const newCount = tasksRef.current.size;
    setTaskCount(newCount);
    
    // Start global timeout for first task
    if (newCount === 1) {
      startGlobalTimeout();
    }

    // Enhanced debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🟡 [LoaderProvider] Started task "${taskKey}" (${newCount} active)`, {
        taskKey,
        totalTasks: newCount,
        activeTasks: Array.from(tasksRef.current.keys()),
        timestamp: new Date().toISOString()
      });
    }
    
    return taskKey;
  }, [generateTaskKey, startGlobalTimeout]);

  // End a loading task
  const endTask = useCallback((key?: string) => {
    // If no key provided, remove the oldest task
    let taskKey = key;
    if (!taskKey && tasksRef.current.size > 0) {
      taskKey = Array.from(tasksRef.current.keys())[0];
      if (process.env.NODE_ENV === 'development') {
        console.log(`[LoaderProvider] No key provided, ending oldest task: ${taskKey}`);
      }
    }
    
    if (!taskKey) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[LoaderProvider] No task key to end and no active tasks`);
      }
      return;
    }
    
    if (!tasksRef.current.has(taskKey)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[LoaderProvider] Attempted to end non-existent task "${taskKey}"`);
        console.log(`[LoaderProvider] Active tasks:`, Array.from(tasksRef.current.keys()));
      }
      return;
    }

    // Remove task from map
    tasksRef.current.delete(taskKey);
    
    // Update counter and state
    const newCount = tasksRef.current.size;
    setTaskCount(newCount);
    
    // Clear global timeout when no tasks remain
    if (newCount === 0) {
      clearGlobalTimeout();
    }

    // Enhanced debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🟢 [LoaderProvider] Ended task "${taskKey}" (${newCount} active)`, {
        taskKey,
        totalTasks: newCount,
        activeTasks: Array.from(tasksRef.current.keys()),
        timestamp: new Date().toISOString()
      });
    }
  }, [clearGlobalTimeout]);

  // Emergency cleanup function
  const forceCleanupAllTasks = useCallback(() => {
    const taskCount = tasksRef.current.size;
    
    // Clear all tasks
    tasksRef.current.clear();
    setTaskCount(0);
    
    // Clear all timeouts
    clearGlobalTimeout();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚨 [LoaderProvider] Emergency cleanup: removed ${taskCount} tasks`);
    }
    
    return taskCount;
  }, [clearGlobalTimeout]);
  
  // Handle retry callback
  const handleRetry = useCallback(() => {
    // Clear current timeout and reset state
    clearGlobalTimeout();
    
    // Call external retry handler if provided
    if (retryHandlerRef.current) {
      retryHandlerRef.current();
    } else {
      // Default retry behavior: clear all tasks and restart cleanly
      const activeTasks = Array.from(tasksRef.current.keys());
      
      // Force cleanup
      forceCleanupAllTasks();
      
      // Restart essential tasks after a brief delay
      setTimeout(() => {
        // Only restart non-router tasks to prevent double-loading
        const essentialTasks = activeTasks.filter(key =>
          !key.includes('router_') &&
          !key.includes('navigation')
        );
        essentialTasks.forEach(taskKey => startTask(taskKey));
      }, 100);
    }
  }, [clearGlobalTimeout, startTask, forceCleanupAllTasks]);

  // Use the global loader visibility hook
  const isLoaderVisible = useGlobalLoader(taskCount, debounceDelay);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearGlobalTimeout();
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
      tasksRef.current.clear();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🧹 [LoaderProvider] Component unmounted, cleaned up all tasks`);
      }
    };
  }, [clearGlobalTimeout]);
  
  // Add emergency cleanup to window for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).__debugLoader = {
        getTasks: () => Array.from(tasksRef.current.entries()),
        getTaskCount: () => tasksRef.current.size,
        forceCleanup: forceCleanupAllTasks,
        startTask,
        endTask
      };
    }
    
    return () => {
      if (process.env.NODE_ENV === 'development') {
        delete (window as any).__debugLoader;
      }
    };
  }, [forceCleanupAllTasks, startTask, endTask]);

  // Context value with stable references
  const contextValue: LoaderContextType = {
    startTask,
    endTask,
    isLoading: taskCount > 0,
    taskCount,
    timeoutMessage: showTimeoutMessage ? timeoutMessage : undefined,
    onRetry: showTimeoutMessage ? handleRetry : undefined,
    // Add emergency cleanup for debugging
    ...(process.env.NODE_ENV === 'development' && {
      _forceCleanup: forceCleanupAllTasks
    })
  };

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
      
      {/* Global Loader Portal */}
      <GlobalLoader
        isVisible={isLoaderVisible}
        timeoutMessage={showTimeoutMessage ? timeoutMessage : undefined}
        onRetry={showTimeoutMessage ? handleRetry : undefined}
      />
    </LoaderContext.Provider>
  );
}

/**
 * Hook to access the LoaderContext
 * Provides startTask, endTask, and loading state
 */
export function useLoader(): LoaderContextType {
  const context = useContext(LoaderContext);
  
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  
  return context;
}

/**
 * Convenience hook for automatic task management
 * Returns start/end functions and loading state
 */
export function useTask(taskKey?: string) {
  const { startTask, endTask, isLoading } = useLoader();
  
  const start = useCallback(() => {
    startTask(taskKey);
  }, [startTask, taskKey]);
  
  const end = useCallback(() => {
    endTask(taskKey);
  }, [endTask, taskKey]);
  
  return {
    start,
    end,
    isLoading
  };
}

/**
 * Hook for async operations with automatic loading management
 * Automatically manages task lifecycle for promises
 */
export function useAsyncTask<T = any>(taskKey?: string) {
  const { startTask, endTask, isLoading } = useLoader();
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  const execute = useCallback(async (asyncOperation: () => Promise<T>) => {
    const key = taskKey || `async_${Date.now()}`;
    
    try {
      setError(null);
      startTask(key);
      
      const result = await asyncOperation();
      setData(result);
      return result;
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
      
    } finally {
      endTask(key);
    }
  }, [startTask, endTask, taskKey]);
  
  return {
    execute,
    isLoading,
    error,
    data,
    clearError: () => setError(null)
  };
}

export default LoaderProvider;