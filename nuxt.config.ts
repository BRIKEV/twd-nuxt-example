import tailwindcss from '@tailwindcss/vite';
import { twd } from 'twd-js/vite-plugin';
import { twdRemote } from 'twd-relay/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Global stylesheet that pulls in Tailwind (see app/assets/css/main.css).
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      // Tailwind v4 integrates via its Vite plugin — no tailwind.config.js needed.
      tailwindcss(),
      twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' }),
      twdRemote({ autoConnect: false }) as Plugin,
    ],
  },
})
