/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        forest:   '#1B4332',
        sage:     '#52796F',
        mist:     '#F0F4F1',
        sand:     '#E9C46A',
        charcoal: '#1A1A2E',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"Inter Mono"', 'monospace'],
      },
      boxShadow: {
        'card':       '0 2px 12px 0 rgba(27,67,50,0.08)',
        'card-hover': '0 8px 32px 0 rgba(27,67,50,0.16)',
        'float':      '0 20px 60px 0 rgba(27,67,50,0.22)',
      },
    },
  },
  plugins: [],
};
