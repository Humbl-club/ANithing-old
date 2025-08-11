#\!/bin/bash
# Fix broken JSDoc comments

find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Fix broken multi-line JSDoc comments
  sed -i '' '
    # Match lines that start with /** followed by text (not on separate line)
    /^\/\*\* .*[^\/]$/ {
      # Read next line
      N
      # If next line also starts with /**, fix it
      s/^\/\*\* \(.*\)\n\/\*\* /\/\*\*\n * \1\n * /
    }
  ' "$file"
  
  # Fix lines that have double /** on same line
  sed -i '' 's/^\/\*\* /\/\*\*\n * /' "$file"
  
  # Ensure closing */ is on its own line
  sed -i '' 's/\([^*]\)\*\/$/\1\n \*\//' "$file"
done

echo "JSDoc comments fixed"
