import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#2563eb',
        light: '#3b82f6',
        dark: '#1d4ed8',
      },
      danger: '#ef4444',
      warn: '#f59e0b',
      success: '#22c55e',
      surface: '#f8fafc',
      border: '#e2e8f0',
      text: {
        DEFAULT: '#1e293b',
        muted: '#64748b',
      },
      sidebar: {
        bg: '#1e293b',
        text: '#cbd5e1',
        active: '#2563eb',
      },
    },
  },
  shortcuts: {
    'btn-primary': 'bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer border-none',
    'btn-danger': 'bg-danger text-white px-4 py-2 rounded hover:opacity-90 transition-colors cursor-pointer border-none',
    'btn-ghost': 'bg-transparent text-text px-4 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer border border-border',
    'card': 'bg-white rounded-lg border border-border p-4 shadow-sm',
    'input-base': 'border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary w-full',
  },
  preflights: [
    {
      getCSS: () => `
        :root {
          --color-primary: #2563eb;
          --color-primary-light: #3b82f6;
          --color-primary-dark: #1d4ed8;
          --color-danger: #ef4444;
          --color-warn: #f59e0b;
          --color-success: #22c55e;
          --color-surface: #f8fafc;
          --color-border: #e2e8f0;
          --color-text: #1e293b;
          --color-text-muted: #64748b;
          --color-sidebar-bg: #1e293b;
          --color-sidebar-text: #cbd5e1;
          --space-1: 0.25rem;
          --space-2: 0.5rem;
          --space-3: 0.75rem;
          --space-4: 1rem;
          --space-6: 1.5rem;
          --space-8: 2rem;
          --text-xs: 0.75rem;
          --text-sm: 0.875rem;
          --text-base: 1rem;
          --text-lg: 1.125rem;
          --text-xl: 1.25rem;
          --z-sidebar: 100;
          --z-topbar: 200;
          --z-modal: 1000;
          --z-toast: 2000;
          --sidebar-width: 240px;
          --topbar-height: 56px;
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: var(--color-text); background: var(--color-surface); }
      `,
    },
  ],
})
