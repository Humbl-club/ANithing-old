#!/bin/bash

echo "🚀 Starting final optimization pass..."

# Remove empty directories
echo "📁 Removing empty directories..."
find . -type d -empty -not -path "./node_modules/*" -not -path "./.git/*" -delete

# Remove backup files
echo "🗑️ Removing backup files..."
find . -name "*.backup" -o -name "*.bak" -o -name "*~" | grep -v node_modules | xargs rm -f

# Remove console.log statements in production code
echo "🔍 Removing console.log statements..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/console\.log/d' 2>/dev/null || true

# Remove unused imports (commented out lines)
echo "🧹 Removing commented imports..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/^\/\/ import/d' 2>/dev/null || true

# Remove TODO comments
echo "📝 Removing TODO comments..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/\/\/ TODO:/d' 2>/dev/null || true

# Remove empty comment blocks
echo "💬 Removing empty comment blocks..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/^\/\*\*$/,/^\*\/$/{ /^\/\*\*$/d; /^\*\/$/d; /^\s*\*\s*$/d; }' 2>/dev/null || true

# Remove duplicate newlines
echo "📐 Removing duplicate newlines..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/^$/N;/^\n$/d' 2>/dev/null || true

# Count final lines
echo ""
echo "📊 Final code statistics:"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "./node_modules/*" -not -path "./dist/*" | xargs wc -l | tail -1

echo "✅ Optimization complete!"