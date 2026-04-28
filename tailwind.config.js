/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主背景 - 深邃暖灰
        bg: {
          base: '#0D0D0F',
          primary: '#141418',
          secondary: '#1C1C22',
          card: '#222228',
          elevated: '#2A2A32',
        },
        // 火系 - 温暖渐变
        fire: {
          spark: '#FFD93D',      // 火种 - 明亮金黄
          flame: '#FF6B35',      // 烈焰 - 温暖橙
          wildfire: '#E84A2F',   // 野火 - 深红橙
          ember: '#FF8C42',      // 余烬 - 琥珀
          coal: '#C73E1D',       // 炭火 - 深红
        },
        // 草原系 - 有机绿
        prairie: {
          light: '#4ADE80',      // 嫩绿
          primary: '#22C55E',    // 主绿
          dark: '#16A34A',       // 深绿
          muted: '#86EFAC',     // 淡绿
        },
        // 文字 - 确保对比度
        text: {
          primary: '#FFFFFF',
          secondary: '#C9C9D2',
          muted: '#8888A0',
          fire: '#FFD93D',
          inverse: '#0D0D0F',
        },
        // 边框
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          medium: 'rgba(255, 255, 255, 0.12)',
          strong: 'rgba(255, 255, 255, 0.20)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.6rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(255, 107, 53, 0.15)',
        'glow-md': '0 0 40px rgba(255, 107, 53, 0.25)',
        'glow-lg': '0 0 60px rgba(255, 107, 53, 0.35)',
        'glow-fire': '0 0 30px rgba(255, 107, 53, 0.4)',
        'glow-spark': '0 0 25px rgba(255, 217, 61, 0.5)',
        'inner-glow': 'inset 0 0 30px rgba(255, 107, 53, 0.1)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fire': 'pulse-fire 2s ease-in-out infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'pulse-fire': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.4)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [],
}