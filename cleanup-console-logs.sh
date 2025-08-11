#!/bin/bash

echo "🧹 Removing console statements from production code..."
echo ""

# Count console statements before
BEFORE_COUNT=$(grep -r "console\." src --include="*.ts" --include="*.tsx" | wc -l)
echo "📊 Found $BEFORE_COUNT console statements"

# Backup first (optional)
# cp -r src src.backup

# Remove console.log, console.error, console.warn, console.debug
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' '/console\.\(log\|error\|warn\|debug\|info\)/d' {} \;

# Count after
AFTER_COUNT=$(grep -r "console\." src --include="*.ts" --include="*.tsx" | wc -l)

echo "✅ Removed $(($BEFORE_COUNT - $AFTER_COUNT)) console statements"
echo "📊 Remaining: $AFTER_COUNT (these might be necessary)"

# Show remaining console statements (if any)
if [ $AFTER_COUNT -gt 0 ]; then
    echo ""
    echo "⚠️  Remaining console statements (review these):"
    grep -r "console\." src --include="*.ts" --include="*.tsx" | head -10
fi

echo ""
echo "✨ Console cleanup complete!"