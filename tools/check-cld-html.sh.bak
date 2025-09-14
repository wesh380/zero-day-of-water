#!/usr/bin/env bash
set -euo pipefail

HTML="docs/test/water-cld.html"

red(){ printf "\033[31m%s\033[0m\n" "$*"; }
grn(){ printf "\033[32m%s\033[0m\n" "$*"; }

# 1) no direct bundle
if grep -q '/assets/dist/water-cld.bundle.js' "$HTML"; then
  red "❌ direct /assets/dist/water-cld.bundle.js found in $HTML"
  exit 1
fi

# 2) exactly one defer loader
DEFER='/assets/water-cld.defer.js'
count=$(grep -o "$DEFER" "$HTML" | wc -l | tr -d '[:space:]')
if [[ "$count" != "1" ]]; then
  red "❌ $DEFER occurs $count times (expected 1)"
  exit 1
fi
dline=$(nl -ba "$HTML" | grep "$DEFER" | awk '{print $1}' | head -1)

# 3) if guards are external, ensure order before defer
guards=(
  '/assets/graph-store.js'
  '/assets/water-cld.cy-collection-guard.js'
  '/assets/water-cld.cy-safe-add.js'
  '/assets/water-cld.runtime-guards.js'
  '/assets/water-cld.cy-alias.js'
)
last=0
for g in "${guards[@]}"; do
  if grep -q "$g" "$HTML"; then
    line=$(nl -ba "$HTML" | grep "$g" | awk '{print $1}' | head -1)
    if [[ -z "$line" || "$line" -ge "$dline" ]]; then
      red "❌ $g should appear before $DEFER"
      exit 1
    fi
    if [[ "$line" -lt "$last" ]]; then
      red "❌ guard order incorrect around $g"
      exit 1
    fi
    last=$line
  fi
done

grn "✅ CLD HTML checks passed"
