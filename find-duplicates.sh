#!/bin/bash

echo "🔍 Finding duplicate hooks and components..."

echo "=== V2/Versioned Files ==="
find ./src -name "*V2*" -o -name "*v2*" | grep -E '\.(ts|tsx)$'

echo -e "\n=== Deprecated/Old Files ==="
find ./src -name "*Deprecated*" -o -name "*deprecated*" -o -name "*Old*" -o -name "*old*" | grep -E '\.(ts|tsx)$'

echo -e "\n=== Test/Debug Components ==="
find ./src -name "*Test*" -o -name "*Debug*" -o -name "*Mock*" | grep -E '\.(ts|tsx)$'

echo -e "\n=== Re-export Files (Potential Duplicates) ==="
find ./src -name "*.ts" -o -name "*.tsx" | xargs grep -l "Re-export\|re-export" | head -10

echo -e "\n=== Multiple Hook Implementations ==="
echo "Search hooks:"
find ./src -name "*search*" | grep -E 'hook|use' | grep -E '\.(ts|tsx)$'

echo -e "\nUser list hooks:"
find ./src -name "*user*" | grep -E 'list|hook' | grep -E '\.(ts|tsx)$'

echo -e "\nContent hooks:"
find ./src -name "*content*" | grep -E 'hook|use' | grep -E '\.(ts|tsx)$'

echo -e "\n=== Files with TODO/FIXME (potential cleanup candidates) ==="
find ./src -name "*.ts" -o -name "*.tsx" | xargs grep -l "TODO\|FIXME\|@deprecated" | head -10