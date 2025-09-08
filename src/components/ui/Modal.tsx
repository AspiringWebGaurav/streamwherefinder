'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'responsive-card';
type ModalVariant = 'default' | 'compact' | 'horizontal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  size?: ModalSize;
  variant?: ModalVariant;
  showHeader?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  maxHeight?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'w-[calc(100vw-2rem)] max-w-sm',
  md: 'w-[calc(100vw-2rem)] max-w-md',
  lg: 'w-[calc(100vw-2rem)] max-w-lg',
  xl: 'w-[calc(100vw-2rem)] max-w-xl',
  'responsive-card': 'w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl'
};

const variantClasses: Record<ModalVariant, string> = {
  default: 'max-h-[85vh] sm:max-h-[90vh] overflow-y-auto',
  compact: 'max-h-[75vh] sm:max-h-[80vh] overflow-hidden',
  horizontal: 'max-h-[80vh] sm:max-h-[85vh] md:max-h-[60vh] lg:max-h-[70vh] overflow-hidden'
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
  size = 'md',
  variant = 'default',
  showHeader = true,
  showCloseButton = true,
  preventScroll = true,
  maxHeight,
  closeOnBackdropClick = true,
  closeOnEscape = true
}: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Screen size detection
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Enhanced close handler with animation
  const handleClose = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    // Small delay to allow exit animation
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 150);
  }, [onClose, isAnimating]);

  // Enhanced keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          if (closeOnEscape) {
            e.preventDefault();
            handleClose();
          }
          break;
        case 'Tab':
          // Trap focus within modal
          const modal = document.querySelector('[role="dialog"]');
          if (!modal) return;
          
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Enhanced scroll prevention
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = getScrollbarWidth() + 'px';
      }
      
      // Auto-focus first focusable element
      setTimeout(() => {
        const modal = document.querySelector('[role="dialog"]');
        const firstFocusable = modal?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (preventScroll) {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '0px';
      }
    };
  }, [isOpen, handleClose, closeOnEscape, preventScroll]);

  // Get scrollbar width for layout shift prevention
  const getScrollbarWidth = () => {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  };

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center",
        // Mobile-first padding with safe areas
        "p-0 sm:p-4 md:p-6 lg:p-8",
        // Animation classes
        isAnimating ? "animate-out fade-out-0 duration-150" : "animate-in fade-in-0 duration-200"
      )}
      style={{
        // Handle safe areas on mobile devices
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {/* Enhanced Backdrop */}
      <div
        className={cn(
          "fixed inset-0 transition-all duration-300",
          "bg-black/50 sm:bg-black/40",
          // Mobile-optimized backdrop blur
          screenSize === 'mobile' ? 'backdrop-blur-sm' : 'backdrop-blur-md'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Enhanced Modal Container - Mobile First */}
      <div
        className={cn(
          // Base modal styles with mobile-first approach
          'relative bg-white/98 sm:bg-white/95 backdrop-blur-xl shadow-2xl',
          'border-t sm:border border-white/20',
          // Mobile: bottom sheet style, Desktop: centered modal
          'w-full sm:rounded-2xl',
          'rounded-t-2xl sm:rounded-2xl',
          // Dynamic sizing based on size prop
          sizeClasses[size],
          // Variant-specific constraints
          variantClasses[variant],
          // Custom max height if provided
          maxHeight && `max-h-[${maxHeight}]`,
          // Mobile-first animation classes
          isAnimating
            ? screenSize === 'mobile'
              ? "animate-out slide-out-to-bottom-full duration-200"
              : "animate-out zoom-out-95 slide-out-to-bottom-2 duration-150"
            : screenSize === 'mobile'
              ? "animate-in slide-in-from-bottom-full duration-300"
              : "animate-in zoom-in-95 slide-in-from-bottom-2 duration-200",
          // Responsive modal adjustments
          size === 'responsive-card' && cn(
            // Mobile: bottom sheet style
            "h-fit max-h-[90vh]",
            // Tablet and up: traditional modal
            "sm:mx-4 sm:my-8 sm:h-fit",
            "md:mx-8 md:my-12",
            "lg:mx-auto lg:my-16"
          ),
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        style={{
          // Ensure modal never exceeds viewport with safe areas
          maxWidth: size === 'responsive-card'
            ? screenSize === 'mobile' ? '100vw'
              : screenSize === 'tablet' ? 'calc(100vw - 2rem)'
              : '800px'
            : undefined,
          maxHeight: variant === 'horizontal'
            ? screenSize === 'mobile' ? 'calc(90vh - env(safe-area-inset-top))'
              : screenSize === 'tablet' ? '70vh'
              : '60vh'
            : screenSize === 'mobile' ? 'calc(90vh - env(safe-area-inset-top))' : '90vh'
        }}
      >
        {/* Mobile Handle Bar */}
        <div className="sm:hidden flex justify-center py-2 px-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Conditional Header - Mobile Optimized */}
        {showHeader && (title || showCloseButton) && (
          <div className={cn(
            "flex items-center justify-between",
            "p-4 sm:p-5 md:p-6",
            title ? "border-b border-gray-200/50" : "",
            // Mobile-first header adjustments
            "min-h-[60px] sm:min-h-[auto]"
          )}>
            {title && (
              <h2
                id="modal-title"
                className={cn(
                  "font-semibold text-gray-900 leading-tight",
                  // Mobile-first title sizing
                  "text-lg sm:text-xl md:text-2xl",
                  "pr-4" // Space for close button on mobile
                )}
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={handleClose}
                className={cn(
                  "p-2 sm:p-2.5 hover:bg-gray-100/80 active:bg-gray-200/80 rounded-xl transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "text-gray-400 hover:text-gray-600",
                  // Mobile-optimized touch target
                  "min-w-[44px] min-h-[44px] flex items-center justify-center",
                  !title && "ml-auto"
                )}
                aria-label="Close modal"
                type="button"
              >
                <X className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content Container - Mobile Optimized */}
        <div
          className={cn(
            // Mobile-first padding with touch-friendly spacing
            showHeader && title ? "p-4 sm:p-5 md:p-6" : "p-4 sm:p-5 md:p-8",
            // Responsive content spacing
            "space-y-4 sm:space-y-5 md:space-y-6",
            // Ensure content is scrollable on mobile
            "overflow-y-auto overscroll-contain",
            // Add bottom padding for mobile safe area
            "pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 md:pb-6"
          )}
          style={{
            // Custom scrollbar for better mobile experience
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Render portal only on client side
  if (typeof window === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}