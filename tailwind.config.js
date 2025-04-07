module.exports = {
  theme: {
    extend: {
      animation: {
        'text-shimmer': 'text-shimmer 2.5s ease-out infinite alternate',
        'shiny-text': 'shiny-text 1s cubic-bezier(.6,.6,0,1) infinite',
      },
      keyframes: {
        'text-shimmer': {
          '0%': { backgroundPosition: '100% center' },
          '100%': { backgroundPosition: '0% center' },
        },
        'shiny-text': {
          from: { backgroundPosition: '0% 0%' },
          to: { backgroundPosition: '100% 0%' },
        },
      },
    },
  },
} 