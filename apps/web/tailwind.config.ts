import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf2ff',
          100: '#dbe4ff',
          500: '#4c6ef5',
          600: '#364fc7',
          900: '#1c2751'
        }
      }
    }
  },
  plugins: []
};

export default config;
