import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080c10',
          2: '#0d1117',
          3: '#161b22',
          4: '#1c2230',
        },
        border: {
          DEFAULT: '#21262d',
          2: '#30363d',
        },
        accent: {
          DEFAULT: '#00d4aa',
        },
        profit: '#00d4aa',
        loss: '#f85149',
        warning: '#f0c040',
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
