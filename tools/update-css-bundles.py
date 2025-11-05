#!/usr/bin/env python3
"""
CSS Bundle Updater - Phase 2 Implementation
Updates HTML files to use bundled CSS files instead of individual ones

Strategy:
- Replace core CSS files with core.bundle.css
- Replace layout CSS files with layout.bundle.css
- Replace features CSS files with features.bundle.css
- Keep page-specific CSS files as-is
"""

import os
import re
import glob
from pathlib import Path

# Define bundle mappings
CORE_FILES = [
    '/assets/css/tailwind.css',
    '/assets/css/base.css',
    '/assets/css/responsive-baseline.css',
    '/assets/css/tokens.css',
    '/assets/css/design-tokens.css',
]

LAYOUT_FILES = [
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
    '/assets/css/inline-migration.css',
]

FEATURES_FILES = [
    '/assets/css/color-system.css',
    '/assets/css/ui-enhancements.css',
]

def normalize_path(href):
    """Normalize CSS path for comparison"""
    # Remove leading dots and multiple slashes
    path = href.strip()
    path = path.replace('../', '/').replace('./', '/')
    # Normalize multiple slashes
    while '//' in path:
        path = path.replace('//', '/')
    return path

def should_replace_with_core(href):
    """Check if this CSS should be replaced with core bundle"""
    norm = normalize_path(href)
    return any(normalize_path(f) == norm for f in CORE_FILES)

def should_replace_with_layout(href):
    """Check if this CSS should be replaced with layout bundle"""
    norm = normalize_path(href)
    return any(normalize_path(f) == norm for f in LAYOUT_FILES)

def should_replace_with_features(href):
    """Check if this CSS should be replaced with features bundle"""
    norm = normalize_path(href)
    return any(normalize_path(f) == norm for f in FEATURES_FILES)

def update_html_file(file_path, dry_run=False):
    """Update a single HTML file to use CSS bundles"""
    print(f"\n📄 Processing: {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  ❌ Error reading file: {e}")
        return False

    original_content = content

    # Find all CSS link tags
    css_pattern = r'<link\s+rel="stylesheet"\s+href="([^"]+)"[^>]*>'
    css_links = re.findall(css_pattern, content)

    if not css_links:
        print(f"  ℹ️  No CSS links found")
        return False

    # Track replacements
    core_found = []
    layout_found = []
    features_found = []

    for href in css_links:
        if should_replace_with_core(href):
            core_found.append(href)
        elif should_replace_with_layout(href):
            layout_found.append(href)
        elif should_replace_with_features(href):
            features_found.append(href)

    # Perform replacements
    changes_made = False

    # Add bundles at the beginning of <head>
    head_pattern = r'(<head[^>]*>)'

    bundle_links = []
    if core_found:
        bundle_links.append('  <link rel="stylesheet" href="/assets/css-bundles-dist/core.bundle.css">')
    if layout_found:
        bundle_links.append('  <link rel="stylesheet" href="/assets/css-bundles-dist/layout.bundle.css">')
    if features_found:
        bundle_links.append('  <link rel="stylesheet" href="/assets/css-bundles-dist/features.bundle.css">')

    if bundle_links:
        bundle_section = '\n' + '\n'.join(bundle_links) + '\n'
        content = re.sub(head_pattern, r'\1' + bundle_section, content, count=1)
        changes_made = True

        # Remove old individual CSS files
        for href in core_found + layout_found + features_found:
            # Escape special regex characters
            escaped_href = re.escape(href)
            pattern = r'\s*<link\s+rel="stylesheet"\s+href="' + escaped_href + r'"[^>]*>\s*'
            content = re.sub(pattern, '', content)

    # Print summary
    if changes_made:
        print(f"  ✅ Changes:")
        if core_found:
            print(f"     • Core bundle: replacing {len(core_found)} files")
        if layout_found:
            print(f"     • Layout bundle: replacing {len(layout_found)} files")
        if features_found:
            print(f"     • Features bundle: replacing {len(features_found)} files")

        if not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  💾 File updated")
        else:
            print(f"  🔍 DRY RUN - No changes written")
    else:
        print(f"  ℹ️  No bundleable CSS files found")

    return changes_made

def main():
    """Main function to update all HTML files"""
    print("🚀 CSS Bundle Updater - Phase 2")
    print("=" * 60)

    # Find all HTML files
    html_files = []
    for pattern in ['docs/**/*.html', 'docs/*.html']:
        html_files.extend(glob.glob(pattern, recursive=True))

    # Filter out partials and templates
    html_files = [f for f in html_files if 'partials' not in f and 'templates' not in f]

    print(f"\n📊 Found {len(html_files)} HTML files to process")

    # Ask for confirmation
    response = input("\n⚠️  This will modify HTML files. Continue? (y/N): ")
    if response.lower() != 'y':
        print("❌ Aborted")
        return

    # Process files
    updated_count = 0
    for html_file in sorted(html_files):
        if update_html_file(html_file, dry_run=False):
            updated_count += 1

    print("\n" + "=" * 60)
    print(f"✨ Complete! Updated {updated_count}/{len(html_files)} files")
    print("\n📋 Next steps:")
    print("  1. Run: npm run bundle:css")
    print("  2. Test a few pages in browser")
    print("  3. Commit changes")

if __name__ == '__main__':
    main()
