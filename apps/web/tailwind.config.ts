import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: '#39FF6A',
        'accent-hover': '#2EE55A',
        background: '#0A0A0A',
        surface: '#111111',
        'surface-2': '#1A1A1A',
        border: '#2A2A2A',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
