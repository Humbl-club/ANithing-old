import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

/**
 * Brotli & Gzip compression configuration
 * Reduces bundle size by 70-85%
 */
export const compressionConfig = {
  plugins: [
    // Brotli compression (better than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10kb
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      compressionOptions: {
        level: 11, // Max compression
      },
    }),
    
    // Gzip fallback for older browsers
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      compressionOptions: {
        level: 9,
      },
    }),
  ],
  
  build: {
    // Advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack') || id.includes('react-query')) {
              return 'query-vendor';
            }
            if (id.includes('supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            return 'vendor';
          }
        },
        
        // Use content hash for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    
    // Enable source maps for debugging
    sourcemap: 'hidden',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096,
  },
};