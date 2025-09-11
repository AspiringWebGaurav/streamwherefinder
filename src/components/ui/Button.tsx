import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 cinema-focus disabled:pointer-events-none disabled:opacity-50 select-none touch-manipulation';
    
    const variants = {
      primary: 'btn-cinema-primary active:scale-95',
      secondary: 'active:scale-95',
      outline: 'border-2 hover:bg-black/10 active:bg-black/20 active:scale-95',
      ghost: 'hover:bg-black/10 active:bg-black/20 active:scale-95',
      destructive: 'active:scale-95',
    };
    
    const getVariantStyles = (variant: string): React.CSSProperties => {
      switch (variant) {
        case 'secondary':
          return { backgroundColor: 'var(--cinema-slate)', color: 'var(--cinema-white)' };
        case 'outline':
          return { borderColor: 'var(--cinema-violet)', color: 'var(--cinema-violet)' };
        case 'ghost':
          return { color: 'var(--cinema-cream)' };
        case 'destructive':
          return { backgroundColor: 'var(--cinema-error)', color: 'var(--cinema-white)' };
        default:
          return {};
      }
    };
    
    const sizes = {
      sm: 'min-h-[40px] px-3 text-sm gap-2', // Increased from h-8 to min-h-[40px]
      md: 'min-h-[44px] px-4 text-sm gap-2', // Increased from h-10 to min-h-[44px]
      lg: 'min-h-[48px] px-6 text-base gap-3', // Increased from h-12 to min-h-[48px]
      xl: 'min-h-[52px] px-8 text-lg gap-3', // Increased from h-14 to min-h-[52px]
    };

    const variantStyles = getVariantStyles(variant);
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        style={variantStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <span className="flex items-center justify-center gap-2">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };