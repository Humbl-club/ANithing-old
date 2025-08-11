import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { constants } from 'zlib';

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
    react({
      // Enable additional SWC optimizations
      jsxImportSource: undefined, // Use automatic runtime
      plugins: []
    }),
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
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      // Pre-bundle critical dependencies
      'react', 'react-dom', 'react-router-dom',
      '@tanstack/react-query', '@supabase/supabase-js',
      'zustand', 'date-fns'
    ],
    exclude: [
      // Don't pre-bundle heavy libraries that should be lazy loaded
      'recharts', 'framer-motion', '@sentry/react',
      'zxcvbn', 'validator', 'bad-words'
    ],
    // Force optimization for better tree shaking
    force: mode === 'production'
  },
  build: {
    target: 'esnext', // Modern target for better tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        module: true,
        toplevel: true,
        unused: true,
        dead_code: true
      },
      mangle: {
        toplevel: true,
        module: true
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        // Aggressive chunk splitting for optimal caching and loading
        manualChunks: (id) => {
          // Critical React core - must be small and loaded first
          if (id.includes('node_modules')) {
            // Core React - keep together for efficiency
            if (id.includes('react/index') || id.includes('react-dom/client') || id.includes('scheduler')) {
              return 'react-core';
            }
            
            // React Router - separate from core
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // Essential UI components - small, frequently used
            if (id.includes('@radix-ui/react-slot') || id.includes('@radix-ui/react-tooltip') || 
                id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-button')) {
              return 'ui-core';
            }
            
            // Heavy UI components - lazy load
            if (id.includes('@radix-ui')) {
              return 'ui-components';
            }
            
            // Icons - separate chunk
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // Query client - core functionality
            if (id.includes('@tanstack/react-query') && !id.includes('persist')) {
              return 'react-query';
            }
            
            // Query persistence - can be lazy
            if (id.includes('@tanstack/react-query-persist') || id.includes('@tanstack/query-sync-storage')) {
              return 'query-persist';
            }
            
            // Supabase client - essential
            if (id.includes('@supabase/supabase-js') || id.includes('@supabase/postgrest-js')) {
              return 'supabase-core';
            }
            
            // Supabase auth - can be separate
            if (id.includes('@supabase/auth-js') || id.includes('@supabase/gotrue-js')) {
              return 'supabase-auth';
            }
            
            // State management - small and fast
            if (id.includes('zustand')) {
              return 'zustand';
            }
            
            // Essential utilities - keep small
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils-core';
            }
            
            // Heavy validation libraries - LAZY LOAD ONLY
            if (id.includes('zxcvbn') || id.includes('bad-words') || id.includes('validator')) {
              return 'validation-heavy';
            }
            
            // Charts - LAZY LOAD ONLY
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            
            // Animations - LAZY LOAD ONLY
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            
            // Forms - moderate priority
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'forms';
            }
            
            // GraphQL - LAZY LOAD ONLY
            if (id.includes('@apollo/client') || id.includes('graphql')) {
              return 'graphql';
            }
            
            // Monitoring - LAZY LOAD ONLY
            if (id.includes('@sentry')) {
              return 'monitoring';
            }
            
            // Virtual scrolling - moderate priority
            if (id.includes('@tanstack/react-virtual')) {
              return 'virtual';
            }
            
            // DnD - LAZY LOAD ONLY
            if (id.includes('@dnd-kit')) {
              return 'dnd';
            }
            
            // Date utilities - moderate priority
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            
            // Storage - moderate priority
            if (id.includes('idb')) {
              return 'storage';
            }
            
            // Markdown - LAZY LOAD ONLY
            if (id.includes('react-markdown') || id.includes('markdown')) {
              return 'markdown';
            }
            
            // Carousel - LAZY LOAD ONLY
            if (id.includes('embla-carousel')) {
              return 'carousel';
            }
            
            // Theme system
            if (id.includes('next-themes')) {
              return 'theme';
            }
            
            // Everything else - keep minimal
            return 'vendor-misc';
          }
          
          // Application chunks - aggressive splitting by route/feature
          if (id.includes('/pages/')) {
            if (id.includes('Index') || id.includes('Auth') || id.includes('NotFound')) {
              return 'pages-critical';
            }
            if (id.includes('Dashboard')) {
              return 'pages-dashboard';
            }
            if (id.includes('Anime') || id.includes('Manga') || id.includes('Content')) {
              return 'pages-content';
            }
            if (id.includes('Settings') || id.includes('Profile') || id.includes('Analytics')) {
              return 'pages-user';
            }
            if (id.includes('Admin')) {
              return 'pages-admin';
            }
            return 'pages-other';
          }
          
          // Feature-based splitting
          if (id.includes('/features/')) {
            if (id.includes('/auth/') || id.includes('/user/')) {
              return 'features-auth';
            }
            if (id.includes('/anime/') || id.includes('/manga/') || id.includes('/content/')) {
              return 'features-content';
            }
            if (id.includes('/social/') || id.includes('/lists/') || id.includes('/reviews/')) {
              return 'features-social';
            }
            if (id.includes('/search/') || id.includes('/filtering/') || id.includes('/advanced/')) {
              return 'features-search';
            }
            if (id.includes('/gamification/') || id.includes('/achievements/')) {
              return 'features-gamification';
            }
            if (id.includes('/admin/')) {
              return 'features-admin';
            }
            return 'features-other';
          }
          
          // Services and utilities
          if (id.includes('/services/')) {
            if (id.includes('supabase') || id.includes('api')) {
              return 'services-api';
            }
            return 'services-other';
          }
          
          // Shared components - split by complexity
          if (id.includes('/shared/components/')) {
            if (id.includes('Advanced') || id.includes('Recommendation') || id.includes('Character')) {
              return 'components-advanced';
            }
            return 'components-shared';
          }
          
          // Basic components
          if (id.includes('/components/')) {
            if (id.includes('/ui/')) {
              return 'components-ui';
            }
            return 'components-common';
          }
        },
        // Enhanced chunk optimization
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2/.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Optimize imports
        hoistTransitiveImports: true,
        // Ensure proper externalization
        external: [],
        // Better module format for modern browsers
        format: 'es',
        // Compact output
        compact: true
      },
      // Enhanced tree shaking
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false
      },
      // Optimize external dependencies
      external: (id) => {
        // Don't externalize anything - bundle everything for better control
        return false;
      }
    },
    // Aggressive chunk size limits
    chunkSizeWarningLimit: 250, // Even stricter
    sourcemap: false, // Disable sourcemaps in production
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 1024, // Only inline very small assets
    // Enable compression
    reportCompressedSize: true,
  },
}));