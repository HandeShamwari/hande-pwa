/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Hande Brand Colors
        primary: '#7ED957',
        'primary-dark': '#6BC548',
        accent: '#FFB800',
        'accent-dark': '#E5A600',
        danger: '#FF4C4C',
        info: '#4DA6FF',
        dark: '#333333',
        'gray-bg': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
