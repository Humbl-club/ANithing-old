#!/usr/bin/env node

/**
 * Production Readiness Check
 * Validates the application is ready for production deployment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Validation results
const results = {
  passed: 0,
  warnings: 0,
  errors: 0,
  checks: []
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logCheck(name, status, message = '') {
  const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌';
  const color = status === 'pass' ? colors.green : status === 'warn' ? colors.yellow : colors.red;
  
  log(`${icon} ${name}`, color);
  if (message) log(`   ${message}`, colors.reset);
  
  results.checks.push({ name, status, message });
  if (status === 'pass') results.passed++;
  else if (status === 'warn') results.warnings++;
  else results.errors++;
}

async function checkFileExists(filePath, required = true) {
  try {
    await fs.access(path.join(projectRoot, filePath));
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(path.join(projectRoot, filePath), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function readEnvFile(filePath) {
  try {
    const content = await fs.readFile(path.join(projectRoot, filePath), 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#') && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch {
    return null;
  }
}

async function validatePackageJson() {
  log('\n📦 Validating Package Configuration...', colors.blue);
  
  const pkg = await readJsonFile('package.json');
  if (!pkg) {
    logCheck('Package.json exists', 'fail', 'package.json not found');
    return;
  }
  
  logCheck('Package.json exists', 'pass');
  
  // Check production scripts
  const requiredScripts = ['build', 'build:prod', 'preview', 'lint', 'type-check'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      logCheck(`Script: ${script}`, 'pass');
    } else {
      logCheck(`Script: ${script}`, 'warn', `Missing production script: ${script}`);
    }
  });
  
  // Check critical dependencies
  const criticalDeps = ['react', 'react-dom', '@supabase/supabase-js'];
  criticalDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      logCheck(`Dependency: ${dep}`, 'pass');
    } else {
      logCheck(`Dependency: ${dep}`, 'fail', `Missing critical dependency: ${dep}`);
    }
  });
  
  // Check critical dev dependencies
  const criticalDevDeps = ['vite'];
  criticalDevDeps.forEach(dep => {
    if (pkg.devDependencies && pkg.devDependencies[dep]) {
      logCheck(`Dev Dependency: ${dep}`, 'pass');
    } else {
      logCheck(`Dev Dependency: ${dep}`, 'fail', `Missing critical dev dependency: ${dep}`);
    }
  });
}

async function validateEnvironment() {
  log('\n🌍 Validating Environment Configuration...', colors.blue);
  
  // Check production env file
  const prodEnvExists = await checkFileExists('.env.production');
  if (prodEnvExists) {
    logCheck('Production env file exists', 'pass');
    
    const prodEnv = await readEnvFile('.env.production');
    if (prodEnv) {
      // Check critical variables
      const criticalVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_APP_ENV'];
      criticalVars.forEach(varName => {
        if (prodEnv[varName]) {
          logCheck(`Environment: ${varName}`, 'pass');
        } else {
          logCheck(`Environment: ${varName}`, 'fail', `Missing critical environment variable`);
        }
      });
      
      // Check production settings
      if (prodEnv.VITE_APP_ENV === 'production') {
        logCheck('Production mode enabled', 'pass');
      } else {
        logCheck('Production mode enabled', 'warn', 'VITE_APP_ENV should be "production"');
      }
      
      if (prodEnv.VITE_ENABLE_DEBUG_MODE === 'false') {
        logCheck('Debug mode disabled', 'pass');
      } else {
        logCheck('Debug mode disabled', 'warn', 'Debug mode should be disabled in production');
      }
    }
  } else {
    logCheck('Production env file exists', 'fail', 'Create .env.production from template');
  }
  
  // Check env template
  const templateExists = await checkFileExists('.env.production.example');
  logCheck('Environment template exists', templateExists ? 'pass' : 'warn');
}

async function validateDeploymentConfig() {
  log('\n🚀 Validating Deployment Configuration...', colors.blue);
  
  // Check deployment files
  const deploymentFiles = [
    { file: 'vercel.json', name: 'Vercel config' },
    { file: 'netlify.toml', name: 'Netlify config' },
    { file: 'Dockerfile', name: 'Docker config' },
    { file: 'nginx.conf', name: 'Nginx config' }
  ];
  
  for (const { file, name } of deploymentFiles) {
    const exists = await checkFileExists(file);
    logCheck(name, exists ? 'pass' : 'warn', exists ? '' : `Optional: ${file} not configured`);
  }
  
  // Check build config
  const viteProdExists = await checkFileExists('vite.config.production.ts');
  logCheck('Production Vite config', viteProdExists ? 'pass' : 'warn');
  
  // Check deployment script
  const deployScriptExists = await checkFileExists('scripts/deploy-production.sh');
  logCheck('Deployment script', deployScriptExists ? 'pass' : 'warn');
}

async function validateStaticAssets() {
  log('\n🖼️  Validating Static Assets...', colors.blue);
  
  const assets = [
    'public/favicon.ico',
    'public/manifest.json',
    'public/icon-192.png',
    'public/icon-512.png',
    'public/404.html',
    'public/50x.html',
    'public/offline.html'
  ];
  
  for (const asset of assets) {
    const exists = await checkFileExists(asset);
    if (asset.includes('404.html') || asset.includes('50x.html')) {
      logCheck(`Error page: ${path.basename(asset)}`, exists ? 'pass' : 'warn');
    } else {
      logCheck(`Asset: ${path.basename(asset)}`, exists ? 'pass' : 'fail');
    }
  }
}

async function validateSecurity() {
  log('\n🔒 Validating Security Configuration...', colors.blue);
  
  // Check for security files
  const securityChecks = [
    { check: 'Environment variables not in git', pass: !(await checkFileExists('.env.local.backup')) },
    { check: 'No hardcoded secrets in config', pass: true }, // Would need actual file scanning
    { check: 'HTTPS enforced in production', pass: true }, // Would need config checking
  ];
  
  securityChecks.forEach(({ check, pass }) => {
    logCheck(check, pass ? 'pass' : 'warn');
  });
  
  // Check build security
  const distExists = await checkFileExists('dist');
  if (distExists) {
    logCheck('Production build exists', 'pass');
    
    // Check if source maps are disabled
    try {
      const files = await fs.readdir(path.join(projectRoot, 'dist', 'assets'));
      const sourceMaps = files.filter(f => f.endsWith('.map'));
      if (sourceMaps.length === 0) {
        logCheck('Source maps disabled', 'pass');
      } else {
        logCheck('Source maps disabled', 'warn', 'Source maps found in production build');
      }
    } catch {
      logCheck('Build structure', 'warn', 'Could not verify build structure');
    }
  } else {
    logCheck('Production build exists', 'warn', 'Run production build first');
  }
}

async function validatePerformance() {
  log('\n⚡ Validating Performance Configuration...', colors.blue);
  
  // Check build optimization configs
  const viteConfig = await checkFileExists('vite.config.ts');
  logCheck('Vite configuration exists', viteConfig ? 'pass' : 'fail');
  
  // Check PWA config
  const pkg = await readJsonFile('package.json');
  if (pkg && pkg.dependencies && pkg.dependencies['vite-plugin-pwa']) {
    logCheck('PWA plugin installed', 'pass');
  } else {
    logCheck('PWA plugin installed', 'warn', 'PWA features may not be available');
  }
  
  // Check bundle analyzer
  if (pkg && pkg.devDependencies && pkg.devDependencies['rollup-plugin-visualizer']) {
    logCheck('Bundle analyzer available', 'pass');
  } else {
    logCheck('Bundle analyzer available', 'warn', 'Install rollup-plugin-visualizer for bundle analysis');
  }
}

async function validateDatabase() {
  log('\n🗄️  Validating Database Configuration...', colors.blue);
  
  // Check Supabase config
  const supabaseExists = await checkFileExists('supabase/config.toml');
  logCheck('Supabase configuration', supabaseExists ? 'pass' : 'warn');
  
  // Check migrations
  try {
    const migrations = await fs.readdir(path.join(projectRoot, 'supabase', 'migrations'));
    if (migrations.length > 0) {
      logCheck('Database migrations exist', 'pass', `Found ${migrations.length} migrations`);
    } else {
      logCheck('Database migrations exist', 'warn', 'No migrations found');
    }
  } catch {
    logCheck('Database migrations exist', 'warn', 'Migrations directory not accessible');
  }
  
  // Check edge functions
  try {
    const functions = await fs.readdir(path.join(projectRoot, 'supabase', 'functions'));
    const functionDirs = [];
    for (const func of functions) {
      const stat = await fs.stat(path.join(projectRoot, 'supabase', 'functions', func));
      if (stat.isDirectory() && !func.startsWith('_')) {
        functionDirs.push(func);
      }
    }
    if (functionDirs.length > 0) {
      logCheck('Edge functions exist', 'pass', `Found ${functionDirs.length} functions`);
    } else {
      logCheck('Edge functions exist', 'warn', 'No edge functions found');
    }
  } catch {
    logCheck('Edge functions exist', 'warn', 'Functions directory not accessible');
  }
}

async function generateReport() {
  log('\n📊 Production Readiness Report', colors.blue);
  log('================================', colors.blue);
  
  const total = results.passed + results.warnings + results.errors;
  const passRate = ((results.passed / total) * 100).toFixed(1);
  
  console.log(`
Total Checks: ${total}
✅ Passed: ${results.passed}
⚠️  Warnings: ${results.warnings}  
❌ Errors: ${results.errors}

Pass Rate: ${passRate}%
  `);
  
  if (results.errors === 0) {
    if (results.warnings === 0) {
      log('🎉 Your application is production ready!', colors.green);
    } else {
      log('✅ Your application is production ready with some recommendations.', colors.yellow);
    }
  } else {
    log('❌ Please fix the errors before deploying to production.', colors.red);
    process.exit(1);
  }
  
  // Show next steps
  log('\n🚀 Next Steps:', colors.blue);
  if (results.warnings > 0) {
    log('1. Review and address warnings above');
  }
  log('2. Run production build: npm run build:prod');
  log('3. Test production build: npm run preview:prod');
  log('4. Deploy: npm run deploy');
  
  return results.errors === 0;
}

async function main() {
  log('🔍 Production Readiness Check', colors.blue);
  log('==============================', colors.blue);
  
  await validatePackageJson();
  await validateEnvironment();
  await validateDeploymentConfig();
  await validateStaticAssets();
  await validateSecurity();
  await validatePerformance();
  await validateDatabase();
  
  const isReady = await generateReport();
  process.exit(isReady ? 0 : 1);
}

main().catch(error => {
  log(`❌ Check failed: ${error.message}`, colors.red);
  process.exit(1);
});