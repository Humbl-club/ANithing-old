import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression';

// Mobile-optimized Vite configuration
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
      // Enable React Fast Refresh for better development experience
      fastRefresh: true,
      // Optimize JSX for production
      jsxImportSource: mode === 'production' ? '@emotion/react' : 'react'
    }),
    mode === 'development' && componentTagger(),
    
    // Enhanced PWA configuration for mobile
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      workbox: {
        // More aggressive caching for mobile
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp,avif}'],
        maximumFileSizeToCacheInBytes: 3000000, // 3MB limit
        runtimeCaching: [
          // API responses - NetworkFirst for real-time data
          {
            urlPattern: /^https:\/\/axtpbgsjbmhbuqomarcr\.supabase\.co\/functions\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 2 // 2 hours
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                // Remove auth headers from cache key for better hit rate
                const url = new URL(request.url);
                return url.toString();
              },
              networkTimeoutSeconds: 3 // Fast timeout on mobile
            }
          },
          
          // Supabase REST API - StaleWhileRevalidate for better UX
          {
            urlPattern: /^https:\/\/axtpbgsjbmhbuqomarcr\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          },
          
          // Images - CacheFirst with size limits for mobile
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 300, // Reduced for mobile
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                // Normalize image URLs for better caching
                const url = new URL(request.url);
                url.searchParams.delete('t'); // Remove timestamp params
                return url.toString();
              }
            }
          },
          
          // External anime images
          {
            urlPattern: /^https:\/\/(s4\.anilist\.co|media\.kitsu\.io).*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-images',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return request.url;
              }
            }
          },
          
          // Static assets - CacheFirst
          {
            urlPattern: /\.(?:js|css|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        
        // Custom service worker with mobile optimizations
        additionalManifestEntries: [
          { url: '/offline.html', revision: null }
        ]
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
        lang: 'en',
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Desktop view of the anime browser'
          },
          {
            src: '/screenshot-narrow.png',
            sizes: '640x1136',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile view of the anime browser'
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
        ],
        shortcuts: [
          {
            name: 'Browse Anime',
            short_name: 'Anime',
            description: 'Browse trending anime',
            url: '/anime',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Browse Manga',
            short_name: 'Manga',
            description: 'Browse trending manga',
            url: '/manga',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          }
        ]
      }
    }),
    
    // Bundle analyzer - only in analysis mode
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    
    // Compression for production
    mode === 'production' && compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    mode === 'production' && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
      }
    },
    
    rollupOptions: {
      output: {
        // Mobile-optimized chunking strategy
        manualChunks: (id) => {
          // Vendor chunks - optimized for mobile loading
          if (id.includes('node_modules')) {
            // Core React ecosystem - essential, load first
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // UI libraries - commonly used
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // State management - load early
            if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
              return 'state-management';
            }
            
            // Database clients - load on demand
            if (id.includes('@supabase') || id.includes('@apollo/client') || id.includes('graphql')) {
              return 'database-clients';
            }
            
            // Heavy libraries - lazy load
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms';
            }
            
            // Utilities - small, can be bundled together
            if (id.includes('clsx') || id.includes('class-variance-authority') || 
                id.includes('tailwind-merge') || id.includes('date-fns') || 
                id.includes('use-debounce')) {
              return 'utilities';
            }
            
            // Everything else
            return 'vendor-misc';
          }
          
          // App code chunks - feature-based
          if (id.includes('/src/pages/')) {
            const pageName = id.split('/pages/')[1].split('/')[0].split('.')[0];
            if (['Index', 'Dashboard'].includes(pageName)) {
              return 'page-home';
            }
            if (['AnimeDetail', 'MangaDetail', 'ContentDetail'].includes(pageName)) {
              return 'page-detail';
            }
            if (['Auth', 'Settings', 'UserProfile'].includes(pageName)) {
              return 'page-user';
            }
            return `page-${pageName.toLowerCase()}`;
          }
          
          if (id.includes('/src/features/')) {
            const featureName = id.split('/features/')[1].split('/')[0];
            return `feature-${featureName}`;
          }
          
          if (id.includes('/src/shared/') || id.includes('/src/components/')) {
            return 'shared-components';
          }
          
          if (id.includes('/src/hooks/')) {
            return 'hooks';
          }
          
          if (id.includes('/src/services/')) {
            return 'services';
          }
          
          if (id.includes('/src/utils/')) {
            return 'utilities';
          }
        },
        
        // Optimize chunk loading for mobile
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || 'chunk';
          return `assets/${name}-[hash].js`;
        },
        
        // Add module preload for critical chunks
        generatedCode: 'es2015'
      }
    },
    
    chunkSizeWarningLimit: 300, // Smaller chunks for mobile
    sourcemap: false, // Disable source maps in production for smaller bundles
    reportCompressedSize: false, // Disable for faster builds
    
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand'
    ],
    exclude: [
      // Large libraries that should be loaded on demand
      'recharts',
      'framer-motion',
      '@apollo/client'
    ]
  },
  
  // Enable esbuild optimizations
  esbuild: {
    legalComments: 'none',
    minifyIdentifiers: mode === 'production',
    minifySyntax: mode === 'production',
    minifyWhitespace: mode === 'production',
    treeShaking: true
  }
}));