/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        'twitter-blue': '#1DA1F2',
        'twitter-dark-blue': '#1A91DA',
        'twitter-light-gray': '#F7F9FA',
        'twitter-dark-gray': '#657786',
        'twitter-extra-light-gray': '#E1E8ED',
        'twitter-black': '#14171A',
      }
    },
  },
  plugins: [],
}