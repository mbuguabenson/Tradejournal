/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        tp: 'var(--text-primary)',
        ts: 'var(--text-secondary)',
        tm: 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-light': 'var(--accent-light)',
        'accent-dark': 'var(--accent-dark)',
        'accent-soft': 'var(--accent-soft)',
        success: 'var(--success)',
        'success-light': 'var(--success-light)',
        'success-soft': 'var(--success-soft)',
        danger: 'var(--danger)',
        'danger-light': 'var(--danger-light)',
        'danger-soft': 'var(--danger-soft)',
        warning: 'var(--warning)',
        'warning-light': 'var(--warning-light)',
        'warning-soft': 'var(--warning-soft)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-glass': 'var(--surface-glass)',
        border: 'var(--border)',
      },
      boxShadow: {
        'glow-primary': '0 10px 25px -4px rgba(0, 150, 255, 0.45)',
        'glow-cyan': '0 8px 20px -3px rgba(6, 182, 212, 0.4)',
        'glass-card': '0 20px 45px -15px rgba(24, 76, 160, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
        'glass-card-dark': '0 20px 45px -15px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
        'neomorph-raised': '0 12px 28px -6px rgba(0, 75, 180, 0.12), inset 0 2px 3px rgba(255, 255, 255, 0.95)',
        'neomorph-inset': 'inset 0 2px 4px rgba(15, 23, 42, 0.06), inset 0 -1px 2px rgba(255, 255, 255, 0.8)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
