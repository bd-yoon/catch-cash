/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:        '#1A0E00',
        surface:   '#2D1A00',
        surface2:  '#3D2500',
        gold:      '#FFD700',
        'gold-light': '#FFE566',
        sand:      '#C4963A',
        'text-warm': '#FFF8E7',
        'text-muted': '#A08060',
        // 유사도 온도계
        cold:      '#6BBFFF',
        warm:      '#FFD700',
        hot:       '#FF6B1A',
        danger:    '#FF2D2D',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
