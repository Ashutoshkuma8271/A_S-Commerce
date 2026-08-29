/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030E16',
          900: '#061A27', // Primary Dark Navy from reference
          850: '#092333', // Deep Navy
          800: '#0C2E43',
          700: '#13405B',
          600: '#1C5B82',
        },
        gold: {
          300: '#FFE599',
          400: '#FFD36A', // Light Gold
          500: '#F5B83D', // Primary Gold from reference
          600: '#D99B26',
          700: '#B87E14',
        },
        cream: {
          50: '#FDFCFA',
          100: '#FAF7F0', // Cream from reference
          200: '#F3EDE0',
          300: '#E8DEC9',
        },
        brand: {
          dark: '#101820',
          muted: '#6B7280',
          border: '#E5E7EB',
          lightBorder: '#233F54',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Cinzel"', '"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(245, 184, 61, 0.35)',
        'gold-sm': '0 2px 10px rgba(245, 184, 61, 0.2)',
        'navy-card': '0 10px 30px -5px rgba(6, 26, 39, 0.15)',
        'luxury': '0 20px 40px -15px rgba(6, 26, 39, 0.25)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD36A 0%, #F5B83D 50%, #D99B26 100%)',
        'navy-gradient': 'linear-gradient(145deg, #092333 0%, #061A27 100%)',
        'hero-radial': 'radial-gradient(circle at 75% 50%, #13405B 0%, #092333 45%, #061A27 100%)',
      }
    },
  },
  plugins: [],
}
