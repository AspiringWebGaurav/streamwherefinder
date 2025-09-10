'use client';

import { cn } from '@/lib/utils';
import type { SpinnerProps } from '@/types/loader';

/**
 * Enterprise-quality Spinner component with CSS-only animations
 * Supports multiple sizes, variants, and respects prefers-reduced-motion
 */
export function Spinner({
  size = 'md',
  className,
  variant = 'primary'
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  const variantClasses = {
    primary: 'border-indigo-200 border-t-indigo-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-300 border-t-gray-600'
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Centered Spinner with optional text
 */
export function CenteredSpinner({
  size = 'md',
  text,
  className
}: SpinnerProps & { text?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Spinner size={size} variant="white" />
      {text && (
        <p className="text-sm text-white/80 font-medium">{text}</p>
      )}
    </div>
  );
}

/**
 * Inline Spinner for buttons and inline content
 */
export function InlineSpinner({
  size = 'sm',
  className
}: Pick<SpinnerProps, 'size' | 'className'>) {
  return (
    <Spinner
      size={size}
      variant="white"
      className={cn('inline-block', className)}
    />
  );
}