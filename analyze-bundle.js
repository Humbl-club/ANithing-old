#!/usr/bin/env node

/**
 * Bundle Analysis and Optimization Script
 * Identifies and removes unused code automatically
 */

const { analyzeMetafile } = require('esbuild');
const fs = require('fs');
const path = require('path');

async function analyzeBundles() {
  console.log('🔍 Analyzing bundle composition...\n');

  // Read build metadata
  const metaPath = path.join(__dirname, 'dist', 'meta.json');
  
  if (!fs.existsSync(metaPath)) {
    console.error('Build metadata not found. Run "npm run build" first.');
    process.exit(1);
  }

  const metafile = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  
  // Analyze the metafile
  const analysis = await analyzeMetafile(metafile, {
    verbose: true,
  });

  // Parse analysis results
  const lines = analysis.split('\n');
  const bundles = [];
  let currentBundle = null;

  for (const line of lines) {
    if (line.includes('dist/')) {
      if (currentBundle) {
        bundles.push(currentBundle);
      }
      currentBundle = {
        name: line.trim().split(' ')[0],
        size: parseInt(line.match(/(\d+)b/)?.[1] || '0'),
        modules: []
      };
    } else if (currentBundle && line.includes('node_modules')) {
      const match = line.match(/(\S+)\s+(\d+)b/);
      if (match) {
        currentBundle.modules.push({
          name: match[1],
          size: parseInt(match[2])
        });
      }
    }
  }

  if (currentBundle) {
    bundles.push(currentBundle);
  }

  // Generate optimization report
  console.log('📊 Bundle Analysis Report\n');
  console.log('=' .repeat(60));

  let totalSize = 0;
  const largeModules = [];
  const duplicateModules = new Map();

  for (const bundle of bundles) {
    const bundleSizeMB = (bundle.size / 1024 / 1024).toFixed(2);
    console.log(`\n📦 ${bundle.name}`);
    console.log(`   Size: ${bundleSizeMB} MB`);
    
    totalSize += bundle.size;

    // Find large modules
    const sortedModules = bundle.modules.sort((a, b) => b.size - a.size);
    const top5 = sortedModules.slice(0, 5);
    
    if (top5.length > 0) {
      console.log('   Top modules:');
      top5.forEach(mod => {
        const modSizeKB = (mod.size / 1024).toFixed(1);
        console.log(`     - ${mod.name}: ${modSizeKB} KB`);
        
        if (mod.size > 100 * 1024) { // > 100KB
          largeModules.push(mod);
        }
      });
    }

    // Track duplicates
    bundle.modules.forEach(mod => {
      const baseModule = mod.name.split('/').pop();
      if (!duplicateModules.has(baseModule)) {
        duplicateModules.set(baseModule, []);
      }
      duplicateModules.get(baseModule).push({
        bundle: bundle.name,
        size: mod.size
      });
    });
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`📈 Total Bundle Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  // Optimization suggestions
  console.log('\n🎯 Optimization Opportunities:\n');

  // Large modules
  if (largeModules.length > 0) {
    console.log('⚠️  Large Modules to Consider:');
    largeModules.forEach(mod => {
      const suggestion = getOptimizationSuggestion(mod.name);
      console.log(`   - ${mod.name} (${(mod.size / 1024).toFixed(1)} KB)`);
      if (suggestion) {
        console.log(`     💡 ${suggestion}`);
      }
    });
  }

  // Duplicates
  const actualDuplicates = Array.from(duplicateModules.entries())
    .filter(([, instances]) => instances.length > 1);
  
  if (actualDuplicates.length > 0) {
    console.log('\n⚠️  Duplicate Modules Found:');
    actualDuplicates.forEach(([name, instances]) => {
      const totalSize = instances.reduce((sum, i) => sum + i.size, 0);
      console.log(`   - ${name}: ${instances.length} instances (${(totalSize / 1024).toFixed(1)} KB total)`);
    });
  }

  // Generate optimization config
  generateOptimizationConfig(bundles, largeModules, actualDuplicates);
}

function getOptimizationSuggestion(moduleName) {
  const suggestions = {
    'moment': 'Consider using date-fns or dayjs instead',
    'lodash': 'Use lodash-es and import specific functions',
    '@apollo/client': 'Consider using graphql-request for simpler needs',
    'rxjs': 'Import only needed operators',
    'three': 'Use dynamic imports for 3D features',
    '@mui': 'Consider lighter alternatives like radix-ui',
    'chart.js': 'Use lightweight alternatives like frappe-charts',
    'quill': 'Load rich text editor dynamically',
  };

  for (const [key, suggestion] of Object.entries(suggestions)) {
    if (moduleName.includes(key)) {
      return suggestion;
    }
  }

  return null;
}

function generateOptimizationConfig(bundles, largeModules, duplicates) {
  const config = {
    timestamp: new Date().toISOString(),
    totalSize: bundles.reduce((sum, b) => sum + b.size, 0),
    bundles: bundles.map(b => ({
      name: b.name,
      size: b.size,
      moduleCount: b.modules.length
    })),
    optimizations: {
      largeModules: largeModules.map(m => m.name),
      duplicates: duplicates.map(([name]) => name),
      recommendations: []
    }
  };

  // Add specific recommendations
  if (largeModules.some(m => m.name.includes('source-map'))) {
    config.optimizations.recommendations.push('Remove source maps from production');
  }

  if (bundles.some(b => b.size > 500 * 1024)) {
    config.optimizations.recommendations.push('Split bundles larger than 500KB');
  }

  // Write config
  fs.writeFileSync(
    path.join(__dirname, 'bundle-analysis.json'),
    JSON.stringify(config, null, 2)
  );

  console.log('\n✅ Analysis complete! Results saved to bundle-analysis.json');
}

// Run analysis
analyzeBundles().catch(console.error);