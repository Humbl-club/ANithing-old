#\!/bin/bash
# Fix broken comment blocks

find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Fix standalone asterisks that should be part of comments
  sed -i '' 's/^[[:space:]]*\* /\/\*\* /g' "$file"
  
  # Fix closing comment blocks
  sed -i '' 's/^[[:space:]]*\*\/$/\*\//g' "$file"
  
  # Fix broken JSDoc comments
  sed -i '' '/^[[:space:]]*\*[[:space:]]/{ N; s/^\([[:space:]]*\)\*\(.*\)\n\([[:space:]]*\)\*\//\/\*\*\2\n\3\*\//; }' "$file"
done

echo "Comments fixed"
