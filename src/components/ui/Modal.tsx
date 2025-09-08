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
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  'responsive-card': 'w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl'
};

const variantClasses: Record<ModalVariant, string> = {
  default: 'max-h-[90vh] overflow-y-auto',
  compact: 'max-h-[80vh] overflow-hidden',
  horizontal: 'max-h-[85vh] md:max-h-[60vh] lg:max-h-[70vh] overflow-hidden'
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
        "fixed inset-0 z-50 flex items-center justify-center",
        // Responsive padding
        "p-4 sm:p-6 md:p-8",
        // Animation classes
        isAnimating ? "animate-out fade-out-0 duration-150" : "animate-in fade-in-0 duration-200"
      )}
    >
      {/* Enhanced Backdrop */}
      <div
        className={cn(
          "fixed inset-0 transition-all duration-300",
          "bg-black/40 backdrop-blur-md",
          // Improved backdrop blur based on screen size
          screenSize === 'mobile' ? 'backdrop-blur-sm' : 'backdrop-blur-md'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Enhanced Modal Container */}
      <div
        className={cn(
          // Base modal styles
          'relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl',
          'border border-white/20',
          // Dynamic sizing based on size prop
          sizeClasses[size],
          // Variant-specific constraints
          variantClasses[variant],
          // Custom max height if provided
          maxHeight && `max-h-[${maxHeight}]`,
          // Animation classes
          isAnimating
            ? "animate-out zoom-out-95 slide-out-to-bottom-2 duration-150"
            : "animate-in zoom-in-95 slide-in-from-bottom-2 duration-200",
          // Responsive modal adjustments
          size === 'responsive-card' && cn(
            // Mobile: full width with margins, vertical layout
            "mx-4 my-8 h-fit",
            // Tablet: wider with better proportions
            "md:mx-8 md:my-12",
            // Desktop: horizontal card layout with optimal dimensions
            "lg:mx-auto lg:my-16"
          ),
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        style={{
          // Ensure modal never exceeds viewport
          maxWidth: size === 'responsive-card'
            ? screenSize === 'mobile' ? 'calc(100vw - 2rem)'
              : screenSize === 'tablet' ? 'calc(100vw - 4rem)'
              : '800px'
            : undefined,
          maxHeight: variant === 'horizontal'
            ? screenSize === 'mobile' ? '85vh'
              : screenSize === 'tablet' ? '70vh'
              : '60vh'
            : '90vh'
        }}
      >
        {/* Conditional Header */}
        {showHeader && (title || showCloseButton) && (
          <div className={cn(
            "flex items-center justify-between",
            "p-4 sm:p-5 md:p-6",
            title ? "border-b border-gray-200/50" : ""
          )}>
            {title && (
              <h2
                id="modal-title"
                className={cn(
                  "font-semibold text-gray-900",
                  // Responsive title sizing
                  "text-lg sm:text-xl md:text-2xl"
                )}
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={handleClose}
                className={cn(
                  "p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  // Responsive close button sizing
                  "text-gray-400 hover:text-gray-600",
                  !title && "ml-auto"
                )}
                aria-label="Close modal"
                type="button"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content Container */}
        <div className={cn(
          // Remove default padding if header is hidden
          showHeader && title ? "p-4 sm:p-5 md:p-6" : "p-4 sm:p-5 md:p-8",
          // Responsive content spacing
          "space-y-4 sm:space-y-5 md:space-y-6"
        )}>
          {children}
        </div>
      </div>
    </div>
  );

  // Render portal only on client side
  if (typeof window === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}