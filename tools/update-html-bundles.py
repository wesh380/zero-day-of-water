#!/usr/bin/env python3
"""
CSS Bundle Updater for HTML files - Phase 2
Updates all HTML files to use bundled CSS instead of individual files
"""

import os
import re
import glob
import sys
from pathlib import Path

# Define CSS files to be replaced by bundles
CORE_BUNDLE_FILES = {
    '/assets/css/tailwind.css',
    '/assets/css/base.css',
    '/assets/css/responsive-baseline.css',
    '/assets/css/tokens.css',
    '/assets/css/design-tokens.css',
}

LAYOUT_BUNDLE_FILES = {
    '/assets/css/header.css',
    '../assets/fonts.css',
    '/assets/fonts.css',
    './assets/fonts.css',
    '../assets/global-footer.css',
    '/assets/global-footer.css',
    './assets/global-footer.css',
    '../assets/unified-badge.css',
    '/assets/unified-badge.css',
    './assets/unified-badge.css',
    '../assets/inline-migration.css',
    '/assets/inline-migration.css',
    './assets/inline-migration.css',
}

FEATURES_BUNDLE_FILES = {
    '/assets/css/color-system.css',
    '/assets/css/ui-enhancements.css',
}

def normalize_href(href):
    """Normalize CSS href for comparison"""
    return href.strip()

def update_html_file(file_path, dry_run=False):
    """Update a single HTML file to use CSS bundles"""
    print(f"\n📄 {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
    except Exception as e:
        print(f"  ❌ Error reading: {e}")
        return False

    content = original_content

    # Find all CSS link tags with line preservation
    css_link_pattern = r'<link\s+rel="stylesheet"\s+href="([^"]+)"[^>]*>'

    # Track which bundles are needed
    needs_core = False
    needs_layout = False
    needs_features = False

    # Track removed files for reporting
    removed_files = []

    # Find and categorize all CSS links
    for match in re.finditer(css_link_pattern, content):
        href = normalize_href(match.group(1))

        if href in CORE_BUNDLE_FILES:
            needs_core = True
            removed_files.append(href)
        elif href in LAYOUT_BUNDLE_FILES:
            needs_layout = True
            removed_files.append(href)
        elif href in FEATURES_BUNDLE_FILES:
            needs_features = True
            removed_files.append(href)

    if not removed_files:
        print(f"  ℹ️  No bundleable CSS files found")
        return False

    # Remove old CSS links (preserve formatting)
    for css_file in removed_files:
        escaped = re.escape(css_file)
        # Match the full link tag including surrounding whitespace/newlines
        pattern = r'[ \t]*<link\s+rel="stylesheet"\s+href="' + escaped + r'"[^>]*>[ \t]*\n?'
        content = re.sub(pattern, '', content)

    # Prepare bundle links
    bundle_lines = []
    if needs_core or needs_layout or needs_features:
        bundle_lines.append('  <!-- CSS Bundles - Phase 2 Optimization -->')

    if needs_core:
        bundle_lines.append('  <link rel="stylesheet" href="/assets/css-bundles-dist/core.bundle.css">')
    if needs_layout:
        bundle_lines.append('  <link rel="stylesheet" href="/assets/css-bundles-dist/layout.bundle.css">')
    if needs_features:
        bundle_lines.append('  <link rel="stylesheet" href="/assets/css-bundles-dist/features.bundle.css">')

    bundle_section = '\n'.join(bundle_lines) + '\n'

    # Insert bundles after <head> tag
    head_pattern = r'(<head[^>]*>)\n'
    if re.search(head_pattern, content):
        content = re.sub(head_pattern, r'\1\n' + bundle_section, content, count=1)
    else:
        print(f"  ⚠️  Warning: Could not find <head> tag")
        return False

    # Report changes
    bundle_names = []
    if needs_core:
        bundle_names.append('core')
    if needs_layout:
        bundle_names.append('layout')
    if needs_features:
        bundle_names.append('features')

    print(f"  ✓ Removed {len(removed_files)} files → Added {len(bundle_names)} bundles ({', '.join(bundle_names)})")

    # Write changes
    if not dry_run:
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        else:
            print(f"  ⚠️  No changes made")
            return False
    else:
        print(f"  🔍 DRY RUN - no changes written")
        return True

def main():
    """Main function to update all HTML files"""
    print("=" * 70)
    print("🚀 CSS Bundle Updater - Phase 2")
    print("=" * 70)

    # Find all HTML files
    html_files = []
    for pattern in ['docs/**/*.html', 'docs/*.html']:
        html_files.extend(glob.glob(pattern, recursive=True))

    # Filter out test files and partials
    html_files = [
        f for f in html_files
        if 'partials' not in f
        and 'test-backup' not in f
        and 'backup' not in f
    ]

    html_files.sort()

    print(f"\n📊 Found {len(html_files)} HTML files")

    # Process files
    updated_count = 0
    skipped_count = 0

    for html_file in html_files:
        try:
            if update_html_file(html_file, dry_run=False):
                updated_count += 1
            else:
                skipped_count += 1
        except Exception as e:
            print(f"  ❌ Error processing {html_file}: {e}")
            skipped_count += 1

    print("\n" + "=" * 70)
    print(f"✨ Complete!")
    print(f"  • Updated: {updated_count} files")
    print(f"  • Skipped: {skipped_count} files")
    print(f"  • Total: {len(html_files)} files")
    print("=" * 70)

    if updated_count > 0:
        print("\n📋 Next steps:")
        print("  1. Review changes: git diff")
        print("  2. Test in browser")
        print("  3. Commit changes")

    return updated_count > 0

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
