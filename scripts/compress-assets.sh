#!/bin/bash
# Compress assets with gzip and brotli for optimal delivery
# Usage: bash scripts/compress-assets.sh

set -e

echo "🗜️  Starting asset compression..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for processed files
count=0

# Find and compress JS and CSS files in dist directories
find docs/assets/dist -type f \( -name "*.js" -o -name "*.css" \) ! -name "*.gz" ! -name "*.br" | while read file; do
  echo -e "${BLUE}Compressing:${NC} $file"

  # Gzip compression (level 9 = maximum)
  if command -v gzip &> /dev/null; then
    gzip -9 -k -f "$file"
    size_original=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    size_gz=$(stat -f%z "$file.gz" 2>/dev/null || stat -c%s "$file.gz" 2>/dev/null)
    savings=$(awk "BEGIN {printf \"%.1f\", (1 - $size_gz / $size_original) * 100}")
    echo -e "  ${GREEN}✓${NC} gzip:   ${size_original} → ${size_gz} bytes (${savings}% smaller)"
  else
    echo "  ⚠️  gzip not found, skipping"
  fi

  # Brotli compression (level 11 = maximum, but we use 9 for speed)
  if command -v brotli &> /dev/null; then
    brotli -9 -k -f "$file"
    size_br=$(stat -f%z "$file.br" 2>/dev/null || stat -c%s "$file.br" 2>/dev/null)
    savings=$(awk "BEGIN {printf \"%.1f\", (1 - $size_br / $size_original) * 100}")
    echo -e "  ${GREEN}✓${NC} brotli: ${size_original} → ${size_br} bytes (${savings}% smaller)"
  else
    echo "  ⚠️  brotli not found, skipping"
  fi

  count=$((count + 1))
  echo ""
done

echo -e "${GREEN}✅ Compression complete!${NC}"
echo "Processed $count files"

# Summary
echo ""
echo "📊 Summary:"
find docs/assets/dist -name "*.gz" | wc -l | xargs echo "  - .gz files created:"
find docs/assets/dist -name "*.br" | wc -l | xargs echo "  - .br files created:"
