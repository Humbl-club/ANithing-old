#!/usr/bin/env node

/**
 * Git Auto-Sync Tool
 * Automatically commits and pushes changes to GitHub
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  syncInterval: 5 * 60 * 1000, // 5 minutes
  debounceDelay: 10000, // 10 seconds
  branch: 'main',
  commitPrefix: 'Auto-sync:',
  ignorePaths: [
    '.git',
    'node_modules',
    'dist',
    '.DS_Store',
    '*.log',
    'package-lock.json',
    '.env.local'
  ],
  maxRetries: 3,
  retryDelay: 5000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Logging functions
const log = {
  info: (msg) => console.log(`${colors.green}[INFO]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.cyan}✓${colors.reset} ${msg}`)
};

class GitAutoSync {
  constructor() {
    this.issyncing = false;
    this.pendingSync = null;
    this.syncTimer = null;
    this.watcher = null;
  }

  /**
   * Execute git command
   */
  async gitCommand(command) {
    try {
      const { stdout, stderr } = await execAsync(`git ${command}`, {
        cwd: process.cwd()
      });
      if (stderr && !stderr.includes('warning')) {
        log.warn(`Git warning: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * Check if there are uncommitted changes
   */
  async hasChanges() {
    const status = await this.gitCommand('status --porcelain');
    return status.length > 0;
  }

  /**
   * Get list of changed files
   */
  async getChangedFiles() {
    const status = await this.gitCommand('status --porcelain');
    return status.split('\n').filter(line => line.length > 0);
  }

  /**
   * Generate commit message
   */
  generateCommitMessage(changedFiles) {
    const timestamp = new Date().toISOString();
    const fileCount = changedFiles.length;
    
    // Categorize changes
    const added = changedFiles.filter(f => f.startsWith('??')).length;
    const modified = changedFiles.filter(f => f.startsWith(' M')).length;
    const deleted = changedFiles.filter(f => f.startsWith(' D')).length;
    
    let details = [];
    if (added > 0) details.push(`${added} added`);
    if (modified > 0) details.push(`${modified} modified`);
    if (deleted > 0) details.push(`${deleted} deleted`);
    
    return `${CONFIG.commitPrefix} ${timestamp}

Automated sync - ${fileCount} file${fileCount !== 1 ? 's' : ''} (${details.join(', ')})

🤖 Auto-synced with git-auto-sync.js`;
  }

  /**
   * Sync changes to GitHub
   */
  async syncToGitHub() {
    if (this.issyncing) {
      log.warn('Sync already in progress, skipping...');
      return;
    }

    this.issyncing = true;

    try {
      // Check for changes
      if (!(await this.hasChanges())) {
        log.info('No changes to sync');
        return;
      }

      log.info('Starting sync to GitHub...');

      // Get changed files
      const changedFiles = await this.getChangedFiles();
      log.info(`Found ${changedFiles.length} changed file(s)`);

      // Stage all changes
      await this.gitCommand('add -A');
      log.success('Changes staged');

      // Commit changes
      const commitMessage = this.generateCommitMessage(changedFiles);
      await this.gitCommand(`commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
      log.success('Changes committed');

      // Pull latest changes
      log.info('Pulling latest changes...');
      try {
        await this.gitCommand(`pull origin ${CONFIG.branch} --rebase`);
        log.success('Pulled latest changes');
      } catch (error) {
        log.warn('Pull failed, attempting to continue...');
      }

      // Push with retries
      let pushed = false;
      for (let i = 0; i < CONFIG.maxRetries; i++) {
        try {
          log.info(`Pushing to GitHub (attempt ${i + 1}/${CONFIG.maxRetries})...`);
          await this.gitCommand(`push origin ${CONFIG.branch}`);
          pushed = true;
          break;
        } catch (error) {
          log.warn(`Push failed: ${error.message}`);
          if (i < CONFIG.maxRetries - 1) {
            log.info(`Retrying in ${CONFIG.retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
          }
        }
      }

      if (pushed) {
        log.success('Successfully synced to GitHub!');
        this.logSyncStats();
      } else {
        throw new Error('Failed to push after all retries');
      }

    } catch (error) {
      log.error(`Sync failed: ${error.message}`);
    } finally {
      this.issyncing = false;
    }
  }

  /**
   * Log sync statistics
   */
  async logSyncStats() {
    try {
      const lastCommit = await this.gitCommand('log -1 --oneline');
      const branch = await this.gitCommand('branch --show-current');
      const remote = await this.gitCommand('config --get remote.origin.url');
      
      console.log('');
      console.log(`${colors.bright}=== Sync Stats ===${colors.reset}`);
      console.log(`Branch: ${colors.cyan}${branch}${colors.reset}`);
      console.log(`Last commit: ${lastCommit}`);
      console.log(`Remote: ${remote}`);
      console.log('');
    } catch (error) {
      // Ignore stats errors
    }
  }

  /**
   * Start interval-based syncing
   */
  startIntervalSync() {
    log.info(`Starting interval sync (every ${CONFIG.syncInterval / 1000} seconds)`);
    
    // Initial sync
    this.syncToGitHub();
    
    // Set up interval
    this.syncTimer = setInterval(() => {
      this.syncToGitHub();
    }, CONFIG.syncInterval);
  }

  /**
   * Start file watcher
   */
  startWatcher() {
    log.info('Starting file watcher...');
    
    this.watcher = chokidar.watch('.', {
      ignored: CONFIG.ignorePaths,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', path => this.handleFileChange('added', path))
      .on('change', path => this.handleFileChange('modified', path))
      .on('unlink', path => this.handleFileChange('deleted', path));

    log.success('File watcher started');
  }

  /**
   * Handle file change event
   */
  handleFileChange(event, filePath) {
    log.info(`File ${event}: ${filePath}`);
    
    // Clear existing timeout
    if (this.pendingSync) {
      clearTimeout(this.pendingSync);
    }
    
    // Debounce sync
    this.pendingSync = setTimeout(() => {
      this.syncToGitHub();
    }, CONFIG.debounceDelay);
  }

  /**
   * Stop all sync operations
   */
  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    
    if (this.pendingSync) {
      clearTimeout(this.pendingSync);
      this.pendingSync = null;
    }
    
    log.info('Auto-sync stopped');
  }
}

// CLI Interface
async function main() {
  const syncer = new GitAutoSync();
  
  // Check if git is initialized
  try {
    await syncer.gitCommand('status');
  } catch (error) {
    log.error('Not a git repository. Please initialize git first.');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const mode = args[0] || 'interactive';

  switch (mode) {
    case 'once':
      // One-time sync
      await syncer.syncToGitHub();
      break;
      
    case 'interval':
      // Interval-based sync
      syncer.startIntervalSync();
      break;
      
    case 'watch':
      // File watcher mode
      syncer.startWatcher();
      syncer.startIntervalSync(); // Also run interval sync as backup
      break;
      
    case 'interactive':
    default:
      // Interactive mode
      console.log(`
${colors.bright}Git Auto-Sync Tool${colors.reset}
==================
1. One-time sync
2. Interval sync (every ${CONFIG.syncInterval / 60000} minutes)
3. Watch mode (sync on file change)
4. Watch + Interval mode
5. Exit
==================
      `);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Select option (1-5): ', async (answer) => {
        switch (answer) {
          case '1':
            await syncer.syncToGitHub();
            process.exit(0);
            break;
          case '2':
            syncer.startIntervalSync();
            break;
          case '3':
            syncer.startWatcher();
            break;
          case '4':
            syncer.startWatcher();
            syncer.startIntervalSync();
            break;
          case '5':
            process.exit(0);
            break;
          default:
            log.error('Invalid option');
            process.exit(1);
        }
        readline.close();
      });
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('');
    log.info('Shutting down...');
    syncer.stop();
    process.exit(0);
  });
}

// Check if chokidar is installed
try {
  require('chokidar');
} catch (error) {
  log.warn('Installing required dependency: chokidar');
  require('child_process').execSync('npm install chokidar', { stdio: 'inherit' });
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = GitAutoSync;