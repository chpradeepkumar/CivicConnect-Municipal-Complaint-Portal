/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f2f6fc',
          100: '#e2ecf7',
          200: '#c5d8ef',
          300: '#9cbce2',
          400: '#6b96d0',
          500: '#4676b9',
          600: '#345c9b',
          700: '#2b4a7d',
          800: '#1b2f52',
          900: '#0f2038',
          950: '#0a1626',
        },
        civic: {
          50: '#eff5ff',
          100: '#dbe8fe',
          200: '#bfd7fe',
          300: '#93bbfd',
          400: '#6096fa',
          500: '#3b76f6',
          600: '#2557eb',
          700: '#1d43d8',
          800: '#1e39af',
          900: '#1e348a',
          950: '#172254',
        },
        saffron: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc271',
          400: '#ff9e38',
          500: '#ff9933',
          600: '#e97a12',
          700: '#c15c0f',
          800: '#994914',
          900: '#7b3d13',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Merriweather', 'Noto Serif Devanagari', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,32,56,0.08), 0 1px 2px rgba(15,32,56,0.06)',
        'card-hover': '0 10px 25px -5px rgba(15,32,56,0.15), 0 8px 10px -6px rgba(15,32,56,0.1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
