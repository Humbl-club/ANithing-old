#!/bin/bash

# Script to remove all console.log, console.error, console.warn statements
# and replace with silent equivalents or comments

echo "🧹 Removing console statements from src/ directory..."

# Remove console.log statements
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.log([^;]*);*//g'

# Remove console.error statements and replace with comments
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.error([^;]*);*/\/\/ Error logged silently/g'

# Remove console.warn statements  
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.warn([^;]*);*/\/\/ Warning logged silently/g'

# Remove console.debug statements
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.debug([^;]*);*//g'

# Remove console.info statements
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.info([^;]*);*//g'

# Clean up any empty lines left behind
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' '/^[[:space:]]*$/d'

echo "✅ Console cleanup completed!"

# Count remaining console statements
remaining=$(find ./src -name "*.tsx" -o -name "*.ts" | xargs grep -c "console\." | awk -F: '{sum+=$2} END {print sum+0}')
echo "📊 Remaining console statements: $remaining"