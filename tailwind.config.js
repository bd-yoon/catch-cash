/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 캐치 캐쉬 팔레트
        bg: '#0D0D1A',
        surface: '#1A1A2E',
        surface2: '#16213E',
        'accent-gold': '#FFD700',
        'accent-mint': '#00E5CC',
        'cold': '#4A90E2',
        'warm': '#F5C842',
        'hot': '#FF8C42',
        'danger': '#E83D3D',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
