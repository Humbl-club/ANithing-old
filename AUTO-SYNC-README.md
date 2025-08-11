# Git Auto-Sync Documentation

This project includes an automated GitHub synchronization system that keeps your local changes synced with the remote repository.

## Features

- 🔄 **Automatic Commits**: Stages and commits all changes automatically
- 📡 **GitHub Push**: Pushes changes to remote repository with retry logic
- 👀 **File Watching**: Monitors file changes and syncs automatically
- ⏰ **Scheduled Sync**: Interval-based synchronization
- 🪝 **Git Hooks**: Pre-push hook for auto-committing
- 🤖 **GitHub Actions**: Scheduled workflow for repository maintenance

## Quick Start

### One-time Sync
```bash
npm run sync
```

### Watch Mode (Recommended)
Watches for file changes and syncs automatically:
```bash
npm run sync:watch
```

### Interval Mode
Syncs every 5 minutes:
```bash
npm run sync:interval
```

### Interactive Mode
```bash
node git-auto-sync.cjs
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run sync` | One-time sync to GitHub |
| `npm run sync:watch` | Watch files and sync on change |
| `npm run sync:interval` | Sync every 5 minutes |
| `npm run sync:auto` | Alias for sync:watch |

## Configuration

Edit `.autosyncrc.json` to customize:

```json
{
  "syncInterval": 300000,        // Sync interval in ms (5 minutes)
  "debounceDelay": 10000,       // Delay after file change (10 seconds)
  "branch": "main",              // Branch to sync
  "commitPrefix": "Auto-sync:",  // Commit message prefix
  "ignorePaths": [...]           // Paths to ignore
}
```

## Shell Script Usage

For Unix-based systems, you can also use the shell script:

```bash
# Make executable
chmod +x auto-sync.sh

# Run
./auto-sync.sh
```

Options:
1. One-time sync
2. Continuous sync (every 5 minutes)
3. Watch mode (sync on file change)
4. Setup as background service (macOS)

## Git Hooks

The project includes a pre-push hook that automatically commits any uncommitted changes before pushing.

To enable:
```bash
git config core.hooksPath .githooks
```

## GitHub Actions

The repository includes a GitHub Actions workflow that runs every 6 hours to:
- Check for uncommitted changes
- Auto-commit if needed
- Push to repository

Located at `.github/workflows/auto-sync.yml`

## VS Code Integration

If using VS Code, tasks are configured to start/stop auto-sync:

- **Ctrl/Cmd + Shift + P** → "Tasks: Run Task"
- Select "Start Auto Sync" or "Sync Once"

## Manual Sync Commands

If you prefer manual git commands:

```bash
# Quick sync (stages all, commits, and pushes)
git add -A && git commit -m "Quick update" && git push

# With pull first (recommended)
git pull --rebase && git add -A && git commit -m "Update" && git push
```

## Troubleshooting

### Sync not working?
1. Check git status: `git status`
2. Ensure you're on the correct branch: `git branch`
3. Verify remote is set: `git remote -v`

### Permission denied on push?
1. Check GitHub authentication: `git config --list`
2. Update credentials if needed

### File watcher not detecting changes?
1. Check if chokidar is installed: `npm list chokidar`
2. Verify ignored paths in `.autosyncrc.json`

### Process already running?
Kill existing process:
```bash
pkill -f 'node git-auto-sync'
```

## Best Practices

1. **Use Watch Mode** for active development
2. **Configure .gitignore** properly to avoid syncing unnecessary files
3. **Review commits** periodically as auto-sync creates many small commits
4. **Pull before starting** work to avoid conflicts
5. **Use meaningful branch names** when working on features

## Security Notes

- Never commit sensitive data (API keys, passwords)
- Review `.gitignore` to ensure secrets are excluded
- Use environment variables for sensitive configuration

## Disable Auto-Sync

To temporarily disable:
1. Stop the running process (Ctrl+C)
2. Or set `"enabled": false` in `.autosyncrc.json`

To permanently disable:
1. Remove scripts from `package.json`
2. Delete `git-auto-sync.cjs` and `auto-sync.sh`
3. Remove GitHub Actions workflow

## Support

For issues or questions, check:
1. Git status and logs
2. Node.js console output
3. GitHub Actions logs (in repository Actions tab)