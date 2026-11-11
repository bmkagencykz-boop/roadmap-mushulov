/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: ['./index.html', './src/**/*.{ts,tsx}'],
  },
  theme: {
    // Только фирменные цвета Smile Sales. Другие цвета Tailwind намеренно отключены.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      navy: '#2D3E50',
      pink: '#F0366A',
      ink: '#1A1A1A',
      white: '#FFFFFF',
      greyl: '#DDE6ED',
      greyt: '#9AAAB6',
      red: '#E53935',
    },
    fontFamily: {
      sans: ['Montserrat', 'system-ui', 'sans-serif'],
      // Days One: только латиница капсом (AUDIT ROADMAP и т. п.)
      latin: ['"Days One"', 'Montserrat', 'sans-serif'],
    },
    boxShadow: { none: 'none' },
    extend: {
      keyframes: {
        ring: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.8)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        halo: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      },
      animation: {
        ring: 'ring 1.6s ease-out infinite',
        marquee: 'marquee 28s linear infinite',
        blink: 'blink 1.2s ease-in-out infinite',
        halo: 'halo 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}
