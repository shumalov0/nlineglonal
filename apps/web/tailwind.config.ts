import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565C0',
          hover: '#0D47A1',
          light: '#E3F2FD',
        },
        accent: {
          DEFAULT: '#2196F3',
          hover: '#1976D2',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          2: '#16213E',
        },
        surface: {
          DEFAULT: '#F4F7FB',
          2: '#EBF2FF',
        },
        nline: {
          'blue-deep': '#1565C0',
          'blue-bright': '#2196F3',
          dark: '#1A1A2E',
          gray: '#607080',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(21,101,192,0.08), 0 1px 2px rgba(21,101,192,0.06)',
        'card-lg': '0 10px 30px rgba(21,101,192,0.12)',
        primary: '0 4px 14px rgba(21,101,192,0.35)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
