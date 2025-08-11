#!/bin/bash

# Auto-sync script for GitHub
# This script automatically commits and pushes changes to GitHub

# Configuration
REPO_PATH="/Users/max/Downloads/star-dust-anime-main 2"
COMMIT_PREFIX="Auto-sync:"
BRANCH="main"
SYNC_INTERVAL=300 # 5 minutes in seconds
MAX_RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to check if git is initialized
check_git() {
    if [ ! -d "$REPO_PATH/.git" ]; then
        print_error "Git repository not initialized!"
        print_status "Initializing git repository..."
        cd "$REPO_PATH"
        git init
        git remote add origin $(git config --get remote.origin.url 2>/dev/null || echo "https://github.com/your-username/your-repo.git")
    fi
}

# Function to sync with GitHub
sync_to_github() {
    cd "$REPO_PATH"
    
    # Check for changes
    if [ -z "$(git status --porcelain)" ]; then
        print_status "No changes to commit"
        return 0
    fi
    
    print_status "Changes detected, preparing to sync..."
    
    # Stage all changes
    git add -A
    
    # Generate commit message with timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    COMMIT_MSG="$COMMIT_PREFIX Updates from $TIMESTAMP

Automated sync of project changes
Files modified: $(git diff --cached --numstat | wc -l | tr -d ' ')

🤖 Auto-synced with GitHub"
    
    # Commit changes
    git commit -m "$COMMIT_MSG"
    
    if [ $? -eq 0 ]; then
        print_status "Changes committed successfully"
    else
        print_error "Failed to commit changes"
        return 1
    fi
    
    # Pull latest changes to avoid conflicts
    print_status "Pulling latest changes from remote..."
    git pull origin $BRANCH --rebase
    
    # Push to GitHub with retries
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        print_status "Pushing to GitHub (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."
        
        if git push origin $BRANCH; then
            print_status "Successfully pushed to GitHub!"
            return 0
        else
            print_warning "Push failed, retrying..."
            RETRY_COUNT=$((RETRY_COUNT + 1))
            sleep 5
        fi
    done
    
    print_error "Failed to push after $MAX_RETRIES attempts"
    return 1
}

# Function to run continuous sync
continuous_sync() {
    print_status "Starting continuous auto-sync to GitHub"
    print_status "Sync interval: $SYNC_INTERVAL seconds"
    print_status "Press Ctrl+C to stop"
    
    while true; do
        sync_to_github
        print_status "Waiting $SYNC_INTERVAL seconds until next sync..."
        sleep $SYNC_INTERVAL
    done
}

# Function to sync on file change
watch_and_sync() {
    print_status "Watching for file changes..."
    
    # Check if fswatch is installed
    if ! command -v fswatch &> /dev/null; then
        print_warning "fswatch not found. Installing..."
        if command -v brew &> /dev/null; then
            brew install fswatch
        else
            print_error "Please install fswatch manually"
            exit 1
        fi
    fi
    
    # Watch for changes and sync
    fswatch -o "$REPO_PATH" \
        --exclude "\.git" \
        --exclude "node_modules" \
        --exclude "dist" \
        --exclude ".DS_Store" \
        --exclude "*.log" | while read change
    do
        print_status "File change detected"
        sync_to_github
    done
}

# Main script
main() {
    print_status "GitHub Auto-Sync Tool"
    echo "========================"
    echo "1. One-time sync"
    echo "2. Continuous sync (every $SYNC_INTERVAL seconds)"
    echo "3. Watch mode (sync on file change)"
    echo "4. Setup as background service"
    echo "5. Exit"
    echo "========================"
    
    read -p "Select option (1-5): " option
    
    check_git
    
    case $option in
        1)
            sync_to_github
            ;;
        2)
            continuous_sync
            ;;
        3)
            watch_and_sync
            ;;
        4)
            setup_service
            ;;
        5)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
}

# Function to setup as a service
setup_service() {
    print_status "Setting up auto-sync as a background service..."
    
    # Create launch agent plist for macOS
    PLIST_PATH="$HOME/Library/LaunchAgents/com.stardust.autosync.plist"
    
    cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.stardust.autosync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$REPO_PATH/auto-sync.sh</string>
        <string>--daemon</string>
    </array>
    <key>StartInterval</key>
    <integer>$SYNC_INTERVAL</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$REPO_PATH/auto-sync.log</string>
    <key>StandardErrorPath</key>
    <string>$REPO_PATH/auto-sync-error.log</string>
</dict>
</plist>
EOF
    
    # Load the service
    launchctl load "$PLIST_PATH"
    
    print_status "Service installed and started!"
    print_status "To stop: launchctl unload $PLIST_PATH"
    print_status "To remove: launchctl unload $PLIST_PATH && rm $PLIST_PATH"
}

# Handle daemon mode
if [ "$1" == "--daemon" ]; then
    check_git
    sync_to_github
    exit 0
fi

# Run main function
main