import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
// import { visualizer } from 'rollup-plugin-visualizer'; // Removed to avoid native deps

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
        '**/tests/**/*.spec.ts',
        '**/tests/**/*.test.ts',
        '**/supabase/migrations/**',
        '**/.cache/**',
        '**/tmp/**',
        '**/temp/**'
      ]
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/axtpbgsjbmhbuqomarcr\.supabase\.co\/functions\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/axtpbgsjbmhbuqomarcr\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 2 // 2 hours
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'maskable-icon-192.png', 'maskable-icon-512.png'],
      manifest: {
        name: 'AniThing - Ultimate Anime & Manga Tracker',
        short_name: 'AniThing',
        description: 'The ultimate anime and manga tracking platform with offline support',
        theme_color: '#8b5cf6',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/?source=pwa',
        categories: ['entertainment', 'lifestyle'],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshot-narrow.png',
            sizes: '640x1136',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        icons: [
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
            src: '/maskable-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    }),
    // visualizer removed to avoid native dependency issues
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('date-fns') || id.includes('date-fns-tz')) {
              return 'date-utils';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            // Group remaining node_modules into utils
            return 'utils-vendor';
          }
          
          // Feature-based chunks
          if (id.includes('/pages/') || id.includes('/layouts/')) {
            if (id.includes('Dashboard') || id.includes('Index')) {
              return 'pages-home';
            }
            if (id.includes('Anime') || id.includes('Manga')) {
              return 'pages-content';
            }
            if (id.includes('Settings') || id.includes('Profile')) {
              return 'pages-user';
            }
            return 'pages-other';
          }
          
          if (id.includes('/features/')) {
            if (id.includes('/anime/') || id.includes('/manga/')) {
              return 'features-content';
            }
            if (id.includes('/social/') || id.includes('/lists/')) {
              return 'features-social';
            }
            if (id.includes('/filtering/') || id.includes('/search/')) {
              return 'features-search';
            }
            return 'features-other';
          }
          
          if (id.includes('/services/')) {
            return 'services';
          }
          
          if (id.includes('/shared/') || id.includes('/components/')) {
            return 'shared-components';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500, // Lower threshold for better chunking
    sourcemap: false,
  },
}));
