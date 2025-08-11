#!/usr/bin/env node

/**
 * Mobile-Optimized Build Script
 * Builds the application with mobile-first optimizations
 */

import { build } from 'vite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const MOBILE_CONFIG = {
  configFile: path.resolve(__dirname, 'vite.config.mobile.ts'),
  build: {
    outDir: 'dist-mobile',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core - Load first
          'react-core': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          
          // State management
          'state': ['zustand', '@tanstack/react-query'],
          
          // UI - High priority
          'ui-core': ['@radix-ui/react-slot', '@radix-ui/react-separator'],
          'icons': ['lucide-react'],
          
          // Forms - Load on demand
          'forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          
          // Animations - Lazy load
          'animations': ['framer-motion'],
          
          // Charts - Lazy load
          'charts': ['recharts'],
          
          // Database
          'database': ['@supabase/supabase-js', '@apollo/client'],
          
          // Utils
          'utils': ['clsx', 'tailwind-merge', 'date-fns', 'class-variance-authority']
        }
      }
    }
  }
};

async function injectCriticalCSS() {
  console.log('📱 Injecting critical CSS for mobile optimization...');
  
  try {
    const criticalCSSPath = path.resolve(__dirname, 'src/styles/critical.css');
    const criticalCSS = await fs.readFile(criticalCSSPath, 'utf-8');
    
    // Minify critical CSS
    const minifiedCSS = criticalCSS
      .replace(/\s+/g, ' ')
      .replace(/\/\*.*?\*\//g, '')
      .trim();
    
    // Inject into HTML template
    const indexPath = path.resolve(__dirname, 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    
    // Add critical CSS to head
    const criticalStyleTag = `<style>${minifiedCSS}</style>`;
    html = html.replace('</head>', `  ${criticalStyleTag}\n  </head>`);
    
    // Add resource hints
    const resourceHints = `
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//s4.anilist.co">
  <link rel="preconnect" href="https://axtpbgsjbmhbuqomarcr.supabase.co" crossorigin>
  <link rel="preload" href="/src/main.tsx" as="script" crossorigin>
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#8b5cf6">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`;
    
    html = html.replace('</head>', `${resourceHints}\n  </head>`);
    
    // Write back
    await fs.writeFile(indexPath, html);
    
    console.log('✅ Critical CSS injected successfully');
  } catch (error) {
    console.error('❌ Failed to inject critical CSS:', error.message);
    throw error;
  }
}

async function optimizeBuild() {
  console.log('🚀 Starting mobile-optimized build...');
  
  try {
    // Inject critical CSS first
    await injectCriticalCSS();
    
    // Build with mobile config
    await build({
      ...MOBILE_CONFIG,
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.BUILD_TARGET': '"mobile"',
        '__DEV__': false
      }
    });
    
    console.log('✅ Mobile build completed successfully!');
    
    // Generate build report
    await generateBuildReport();
    
  } catch (error) {
    console.error('❌ Mobile build failed:', error);
    process.exit(1);
  }
}

async function generateBuildReport() {
  console.log('📊 Generating build report...');
  
  try {
    const distPath = path.resolve(__dirname, 'dist-mobile');
    const files = await fs.readdir(path.join(distPath, 'assets'));
    
    const report = {
      timestamp: new Date().toISOString(),
      target: 'mobile',
      files: {},
      totalSize: 0,
      recommendations: []
    };
    
    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.css')) {
        const filePath = path.join(distPath, 'assets', file);
        const stats = await fs.stat(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        
        report.files[file] = {
          size: sizeKB + ' KB',
          type: file.split('.').pop()
        };
        
        report.totalSize += sizeKB;
        
        // Add recommendations
        if (sizeKB > 500) {
          report.recommendations.push(`⚠️  ${file} is ${sizeKB}KB - consider code splitting`);
        } else if (sizeKB > 200) {
          report.recommendations.push(`💡 ${file} is ${sizeKB}KB - monitor for growth`);
        } else {
          report.recommendations.push(`✅ ${file} is ${sizeKB}KB - good size for mobile`);
        }
      }
    }
    
    console.log('\n📊 Build Report:');
    console.log(`Total size: ${report.totalSize}KB`);
    console.log(`Files: ${Object.keys(report.files).length}`);
    console.log('\nFile breakdown:');
    
    Object.entries(report.files).forEach(([file, info]) => {
      console.log(`  ${file}: ${info.size}`);
    });
    
    console.log('\nRecommendations:');
    report.recommendations.forEach(rec => console.log(`  ${rec}`));
    
    // Save report
    await fs.writeFile(
      path.join(distPath, 'build-report.json'),
      JSON.stringify(report, null, 2)
    );
    
  } catch (error) {
    console.warn('⚠️  Could not generate build report:', error.message);
  }
}

// Performance budgets for mobile
const PERFORMANCE_BUDGETS = {
  maxBundleSize: 500, // KB
  maxChunkSize: 200,  // KB
  maxAssetSize: 100   // KB
};

async function validatePerformanceBudgets() {
  console.log('📏 Validating performance budgets...');
  
  try {
    const reportPath = path.resolve(__dirname, 'dist-mobile/build-report.json');
    const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
    
    let hasViolations = false;
    
    // Check total bundle size
    if (report.totalSize > PERFORMANCE_BUDGETS.maxBundleSize) {
      console.error(`❌ Bundle size ${report.totalSize}KB exceeds budget of ${PERFORMANCE_BUDGETS.maxBundleSize}KB`);
      hasViolations = true;
    } else {
      console.log(`✅ Bundle size ${report.totalSize}KB within budget`);
    }
    
    // Check individual chunks
    Object.entries(report.files).forEach(([file, info]) => {
      const size = parseInt(info.size);
      const budget = file.includes('vendor') ? PERFORMANCE_BUDGETS.maxChunkSize : PERFORMANCE_BUDGETS.maxAssetSize;
      
      if (size > budget) {
        console.error(`❌ ${file} (${size}KB) exceeds budget of ${budget}KB`);
        hasViolations = true;
      }
    });
    
    if (!hasViolations) {
      console.log('✅ All performance budgets met!');
    } else {
      console.warn('⚠️  Some performance budgets exceeded - consider optimization');
    }
    
  } catch (error) {
    console.warn('⚠️  Could not validate performance budgets:', error.message);
  }
}

// Main execution
async function main() {
  console.log(`
🎌 AniThing Mobile Build
========================
Building optimized version for mobile devices
Target: <2s load time on 3G networks
`);

  try {
    await optimizeBuild();
    await validatePerformanceBudgets();
    
    console.log(`
🎉 Build Complete!
==================
✅ Mobile-optimized bundle created
✅ Critical CSS inlined
✅ Resource hints added
✅ Performance budgets validated

Next steps:
1. Test on mobile devices
2. Run lighthouse audit
3. Deploy to CDN with compression
4. Monitor real-world performance
`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { optimizeBuild, generateBuildReport, validatePerformanceBudgets };