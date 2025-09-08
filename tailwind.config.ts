import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.9vw + 0.5rem, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 1vw + 0.6rem, 1rem)',
        'fluid-base': 'clamp(1rem, 1.2vw + 0.7rem, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1.4vw + 0.8rem, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.6vw + 0.9rem, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 2vw + 1rem, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 2.5vw + 1.2rem, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 3vw + 1.5rem, 3rem)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [
    // Tailwind CSS v4 has these features built-in
  ],
};

export default config;