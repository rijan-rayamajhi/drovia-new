/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium Palette
        ivory: '#FAF9F7',
        surface: '#FFFFFF',
        accent: {
          DEFAULT: '#0F4C81', // Deep Blue
          dark: '#0A3A66',
          light: '#1769A7',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C866',
          dark: '#B8941F',
        },
        text: {
          primary: '#111827',
          muted: '#6B7280',
          light: '#9CA3AF',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#EF4444',
        // Legacy support
        primary: {
          DEFAULT: '#0F4C81',
          dark: '#0A3A66',
          light: '#1769A7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        serif: ['Playfair Display', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'luxury': '0 10px 30px rgba(16, 24, 40, 0.06)',
        'luxury-lg': '0 20px 40px rgba(16, 24, 40, 0.12)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'stagger': 'stagger 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      transitionDuration: {
        '350': '350ms',
        '500': '500ms',
        '700': '700ms',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.2, 0.9, 0.12, 1)',
      },
      transitionDuration: {
        '520': '520ms',
      },
    },
  },
  plugins: [],
}

