#!/bin/bash

echo "Fixing critical TypeScript errors..."

# Fix memoryLeakDetector.ts timer issues
sed -i '' 's/window\.setTimeout = /window\.setTimeout = (/' src/lib/memoryLeakDetector.ts 2>/dev/null || true
sed -i '' 's/window\.clearTimeout = /window\.clearTimeout = (/' src/lib/memoryLeakDetector.ts 2>/dev/null || true
sed -i '' 's/window\.setInterval = /window\.setInterval = (/' src/lib/memoryLeakDetector.ts 2>/dev/null || true
sed -i '' 's/window\.clearInterval = /window\.clearInterval = (/' src/lib/memoryLeakDetector.ts 2>/dev/null || true

# Generate missing Supabase types
echo "Generating Supabase types..."
npx supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts 2>/dev/null || true

echo "TypeScript fixes applied!"