/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Platform colors
        'tiktok': '#FE2C55',
        'shopee': '#EE4D2D',
        'lazada': '#0F146D',
        // Status colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
    },
  },
  plugins: [],
}
