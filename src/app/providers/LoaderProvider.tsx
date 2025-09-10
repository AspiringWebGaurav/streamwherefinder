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
  
  // Update retry handler ref when it changes
  useEffect(() => {
    retryHandlerRef.current = onRetry;
  }, [onRetry]);

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
      console.warn(`LoaderProvider: Task with key "${taskKey}" already exists`);
      return;
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

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoaderProvider] Started task "${taskKey}" (${newCount} active)`);
    }
  }, [generateTaskKey, startGlobalTimeout]);

  // End a loading task
  const endTask = useCallback((key?: string) => {
    // If no key provided, remove the oldest task
    let taskKey = key;
    if (!taskKey && tasksRef.current.size > 0) {
      taskKey = Array.from(tasksRef.current.keys())[0];
    }
    
    if (!taskKey || !tasksRef.current.has(taskKey)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[LoaderProvider] Attempted to end non-existent task "${taskKey}"`);
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

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoaderProvider] Ended task "${taskKey}" (${newCount} active)`);
    }
  }, [clearGlobalTimeout]);

  // Handle retry callback
  const handleRetry = useCallback(() => {
    // Clear current timeout and reset state
    clearGlobalTimeout();
    
    // Call external retry handler if provided
    if (retryHandlerRef.current) {
      retryHandlerRef.current();
    } else {
      // Default retry behavior: restart all tasks
      const activeTasks = Array.from(tasksRef.current.keys());
      
      // Clear all tasks
      tasksRef.current.clear();
      setTaskCount(0);
      
      // Restart tasks after a brief delay
      setTimeout(() => {
        activeTasks.forEach(taskKey => startTask(taskKey));
      }, 100);
    }
  }, [clearGlobalTimeout, startTask]);

  // Use the global loader visibility hook
  const isLoaderVisible = useGlobalLoader(taskCount, debounceDelay);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearGlobalTimeout();
      tasksRef.current.clear();
    };
  }, [clearGlobalTimeout]);

  // Context value with stable references
  const contextValue: LoaderContextType = {
    startTask,
    endTask,
    isLoading: taskCount > 0,
    taskCount,
    timeoutMessage: showTimeoutMessage ? timeoutMessage : undefined,
    onRetry: showTimeoutMessage ? handleRetry : undefined
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