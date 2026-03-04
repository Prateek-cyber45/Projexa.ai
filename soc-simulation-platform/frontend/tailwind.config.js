/** @type {import('tailwindcss').Config} */
export default {
  // Scan all component and page files
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      // JetBrains Mono as default mono font
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Cascadia Code"',
          'Consolas',
          'ui-monospace',
          'monospace',
        ],
        sans: [
          '"JetBrains Mono"',
          'ui-monospace',
          'monospace',
        ],
      },

      // Add the very dark gray-950 shade (not in Tailwind v3 by default)
      colors: {
        gray: {
          950: '#030712',
        },
      },

      // Custom keyframe animations
      keyframes: {
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.55' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
      },
      animation: {
        'fade-slide-in': 'fadeSlideIn 0.2s ease-out',
        'pulse-slow':    'pulseSlow 3s ease-in-out infinite',
        'blink':         'blink 1s step-end infinite',
      },

      // Box shadows for glow effects
      boxShadow: {
        'glow-green':  '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-red':    '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-yellow': '0 0 20px rgba(234, 179, 8, 0.3)',
        'glow-blue':   '0 0 20px rgba(59, 130, 246, 0.3)',
      },
    },
  },

  plugins: [],
}
