/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        warm: {
          'bg-primary':    '#FAFAF8',
          'bg-secondary':  '#F3F1EC',
          'bg-tertiary':   '#E8E4DB',
          'text-primary':  '#1C1917',
          'text-secondary':'#78716C',
          'text-muted':    '#A8A29E',
          'accent':        '#7C6F5B',
          'accent-light':  '#A69880',
          'accent-subtle': '#EDE8E0',
          'border':        '#E2DDD6',
        },
      },
      padding: {
        section: 'clamp(1.5rem, 6vw, 6rem)',
      },
    },
  },
  plugins: [],
}
