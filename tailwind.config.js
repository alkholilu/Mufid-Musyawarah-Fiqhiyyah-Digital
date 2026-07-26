/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./dashboard/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6F3EC',
          100: '#CAD5E2',
          500: '#006432',
          600: '#004A23',
          700: '#003d1c',
        },
        dark: {
          DEFAULT: '#161C27',
          muted: '#3F4940',
        },
        light: {
          bg: '#F7FAFC',
          border: '#EDF2F7',
          accent: '#E8EEFF',
        },
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#022c22',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pageTransition: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeInLeft: 'fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeInRight: 'fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scaleUp: 'scaleUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pageTransition: 'pageTransition 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
