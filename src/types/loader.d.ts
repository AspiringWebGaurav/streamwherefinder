/**
 * Loader system type definitions
 * Provides types for global loading states and SmartImage components
 */

export interface LoaderContextType {
  /** Start a loading task with optional key for tracking */
  startTask: (key?: string) => void;
  /** End a loading task with optional key for tracking */
  endTask: (key?: string) => void;
  /** Current loading state - true when any tasks are active */
  isLoading: boolean;
  /** Number of active loading tasks */
  taskCount: number;
  /** Timeout message displayed after 15s */
  timeoutMessage?: string;
  /** Retry callback for timeout scenarios */
  onRetry?: () => void;
}

export interface LoaderProviderProps {
  children: React.ReactNode;
  /** Custom timeout duration in milliseconds (default: 15000) */
  timeoutDuration?: number;
  /** Custom debounce delay in milliseconds (default: 150) */
  debounceDelay?: number;
  /** Custom timeout message */
  timeoutMessage?: string;
  /** Global retry handler */
  onRetry?: () => void;
}

export interface GlobalLoaderProps {
  /** Whether the loader is visible */
  isVisible: boolean;
  /** Optional timeout message */
  timeoutMessage?: string;
  /** Retry callback */
  onRetry?: () => void;
}

export interface SmartImageProps extends Omit<React.ComponentProps<typeof import('next/image').default>, 'onLoad' | 'onError'> {
  /** Show loading spinner while loading (default: true) */
  spinner?: boolean;
  /** Show skeleton placeholder instead of spinner */
  skeleton?: boolean;
  /** Fallback image source on error */
  fallbackSrc?: string;
  /** Container class name for wrapper div */
  containerClassName?: string;
  /** Callback when image successfully loads */
  onLoadComplete?: () => void;
  /** Callback when image fails to load */
  onLoadError?: (error: any) => void;
}

export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export interface LoaderTask {
  key: string;
  startTime: number;
  timeout?: NodeJS.Timeout;
}

export interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Color variant */
  variant?: 'primary' | 'white' | 'gray';
}

export interface SkeletonProps {
  /** Width of skeleton */
  width?: string | number;
  /** Height of skeleton */
  height?: string | number;
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Custom className */
  className?: string;
  /** Number of lines for text skeleton */
  lines?: number;
}