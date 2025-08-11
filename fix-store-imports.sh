#!/bin/bash

# Fix import paths from @/stores/ to @/store/
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/stores/|@/store/|g'

echo "Fixed store import paths"