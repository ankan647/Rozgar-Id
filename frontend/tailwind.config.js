/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#1E3A5F',
          900: '#2A5278',
          800: '#336290',
          700: '#3B6FA0',
          600: '#4A80B0',
          500: '#7B9CC4',
          400: '#A7D8F0',
          300: '#BDE3F5',
          200: '#D9F0E5',
          100: '#EAF7F1',
          50: '#F0FAF6',
        },
        surface: '#F4FAFA',
        border: '#D6E4EC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(59, 111, 160, 0.08)',
        'glass-lg': '0 12px 40px rgba(59, 111, 160, 0.12)',
        'brand': '0 4px 14px rgba(59, 111, 160, 0.25)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3B6FA0 0%, #7B9CC4 50%, #A7D8F0 100%)',
        'hero-gradient': 'linear-gradient(135deg, #2A5278 0%, #3B6FA0 40%, #7B9CC4 100%)',
        'card-gradient': 'linear-gradient(135deg, #3B6FA0 0%, #2A5278 100%)',
        'mint-gradient': 'linear-gradient(180deg, #F4FAFA 0%, #D9F0E5 100%)',
      },
    },
  },
  plugins: [],
}
