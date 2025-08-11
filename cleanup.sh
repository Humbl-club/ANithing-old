#!/bin/bash

echo "Cleaning up repository..."

# Remove all .bak files
find . -name "*.bak" -type f -delete

# Remove all fix scripts
rm -f fix-*.sh comprehensive-fix.sh final-ci-fix.sh

# Clean up other temporary scripts
rm -f cleanup-console-logs.sh aggressive-cleanup.sh create-missing-hooks.sh
rm -f deploy-secure-function.sh find-duplicates.sh optimize-final.sh
rm -f remove-deprecated-hooks.sh update-imports.sh

# Remove CI/CD summary (no longer needed)
rm -f CI_CD_FIX_SUMMARY.md

echo "Cleanup complete!"
echo "Removed:"
echo "- All .bak files"
echo "- All temporary fix scripts"
echo "- CI/CD documentation"