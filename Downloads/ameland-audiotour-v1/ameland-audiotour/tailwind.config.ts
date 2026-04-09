import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './middleware.ts',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sand: '#F6F1E8',
          dune: '#D9C7A0',
          sea: '#7CA9B8',
          night: '#18181B',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
