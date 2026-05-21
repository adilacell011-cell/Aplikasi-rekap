import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        manifest: {
          name: 'AlfathPulsa',
          short_name: 'Alfath',
          description: 'Sistem Rekapitulasi AlfathPulsa',
          id: '/?source=pwa',
          theme_color: '#0B111D',
          background_color: '#0B111D',
          display: 'standalone',
          start_url: '/',
          orientation: 'portrait',
          dir: 'ltr',
          lang: 'id-ID',
          categories: [
            'finance',
            'business'
          ],
          icons: [
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: '/screenshot-mobile.png',
              sizes: '540x960',
              type: 'image/png',
              form_factor: 'narrow'
            },
            {
              src: '/screenshot-desktop.png',
              sizes: '960x540',
              type: 'image/png',
              form_factor: 'wide'
            }
          ],
          shortcuts: [
            {
              name: 'Rekap Setoran',
              short_name: 'Setoran',
              description: 'Buka pencatatan setoran uang hari ini',
              url: '/?shortcut=deposits',
              icons: [
                {
                  src: '/icon-192.png',
                  sizes: '192x192'
                }
              ]
            },
            {
              name: 'Catat Piutang & Bon',
              short_name: 'Piutang',
              description: 'Kelola rekapitulasi utang & bon karyawan',
              url: '/?shortcut=debts',
              icons: [
                {
                  src: '/icon-192.png',
                  sizes: '192x192'
                }
              ]
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
