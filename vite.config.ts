import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { fileURLToPath } from 'node:url'

// Дата сборки по времени Алматы. Подставляется в подвал, если в roadmap.ts поле updated пустое.
const buildDate = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Asia/Almaty',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date())

export default defineConfig({
  // относительные пути: сайт работает и на Vercel, и на GitHub Pages (/roadmap-mushulov/)
  base: './',
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)) }),
        autoprefixer(),
      ],
    },
  },
})
