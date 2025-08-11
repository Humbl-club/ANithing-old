import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// Production-optimized Vite configuration
export default defineConfig({
  plugins: [
    react({
      // Optimize React for production
      jsxImportSource: '@emotion/react',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/axtpbgsjbmhbuqomarcr\.supabase\.co\/functions\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?${Date.now()}`;
              }
            }
          },
          {
            urlPattern: /^https:\/\/axtpbgsjbmhbuqomarcr\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
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
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'AniThing - Ultimate Anime & Manga Tracker',
        short_name: 'AniThing',
        description: 'The ultimate anime and manga tracking platform with offline support',
        theme_color: '#8b5cf6',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: '/?source=pwa',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
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
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false, // Disable in production for security
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // 4kb
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks - optimized for CDN caching
          if (id.includes('node_modules')) {
            // Core React ecosystem - most stable
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            
            // React Router - fairly stable
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // UI component libraries - large but stable
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            
            // State management - small and stable
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'state-management';
            }
            
            // Database clients - larger, less frequently updated
            if (id.includes('@supabase') || id.includes('@apollo/client') || id.includes('graphql')) {
              return 'database-clients';
            }
            
            // Animation libraries - loaded on demand
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            
            // Form libraries - medium size, stable
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms';
            }
            
            // Charts - heavy, lazy loaded
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            
            // Utilities - small, frequently used
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) {
              return 'utilities';
            }
            
            // Everything else
            return 'vendor-misc';
          }
          
          // App chunks - organized by feature
          if (id.includes('/pages/')) {
            if (id.includes('Index') || id.includes('Dashboard')) {
              return 'page-home';
            }
            if (id.includes('Anime') || id.includes('Manga') || id.includes('ContentDetail')) {
              return 'page-content';
            }
            if (id.includes('Auth') || id.includes('Settings') || id.includes('Profile')) {
              return 'page-user';
            }
            return 'page-other';
          }
          
          if (id.includes('/features/')) {
            if (id.includes('/anime/') || id.includes('/manga/')) {
              return 'feature-content';
            }
            if (id.includes('/auth/')) {
              return 'feature-auth';
            }
            if (id.includes('/search/') || id.includes('/filtering/')) {
              return 'feature-search';
            }
            if (id.includes('/social/') || id.includes('/lists/')) {
              return 'feature-social';
            }
            return 'feature-misc';
          }
          
          if (id.includes('/shared/')) {
            return 'shared-components';
          }
        },
        
        // Optimize file naming for CDN caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(css)$/.test(assetInfo.name!)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name!)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name!)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          
          return `assets/[name]-[hash].${ext}`;
        }
      },
      
      // External dependencies for CDN
      external: [
        // Can be loaded from CDN if needed
      ]
    },
    
    // Production optimizations
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info']
      }
    }
  },
  
  // CDN and asset optimization
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
      // Use CDN for static assets in production
      const cdnUrl = process.env.VITE_CDN_URL;
      if (cdnUrl && (hostType === 'js' || hostType === 'css')) {
        return `${cdnUrl}/${filename}`;
      }
      return filename;
    }
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query'
    ],
    exclude: [
      'fsevents' // macOS specific, not needed in production
    ]
  },
  
  // Server configuration for production preview
  preview: {
    port: 3000,
    host: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  }
});