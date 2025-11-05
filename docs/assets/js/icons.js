/**
 * WESH360 Icon System
 * SVG Icons Library
 */

const WESH360Icons = {
  // Water icon - droplet
  water: `
    <svg class="icon icon-water icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  `,

  // Electricity icon - zap/lightning
  electricity: `
    <svg class="icon icon-electricity icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
    </svg>
  `,

  // Gas icon - flame
  gas: `
    <svg class="icon icon-gas icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  `,

  // Environment icon - leaf
  environment: `
    <svg class="icon icon-environment icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  `,

  // Arrow up (for trends)
  arrowUp: `
    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  `,

  // Arrow down (for trends)
  arrowDown: `
    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 5v14M19 12l-7 7-7-7"/>
    </svg>
  `,

  // Info icon
  info: `
    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  `,

  // Check icon (success)
  check: `
    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  `,

  // Alert icon (warning)
  alert: `
    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <path d="M12 9v4M12 17h.01"/>
    </svg>
  `,

  // X icon (error/close)
  x: `
    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  `,

  // Chart icon
  chart: `
    <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>
  `,

  // Calendar icon
  calendar: `
    <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  `,

  // Users icon
  users: `
    <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  `,

  // Settings icon
  settings: `
    <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
    </svg>
  `,

  // Sun icon (solar/renewable)
  sun: `
    <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  `,

  // Badge/shield icon (security)
  badge: `
    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,
};

/**
 * Create an icon element from SVG string
 * @param {string} iconName - Name of the icon from WESH360Icons
 * @param {string} className - Additional CSS classes
 * @returns {string} - SVG icon HTML string
 */
function createIcon(iconName, className = '') {
  if (!WESH360Icons[iconName]) {
    console.warn(`Icon "${iconName}" not found`);
    return '';
  }

  let svg = WESH360Icons[iconName];

  // Add additional classes if provided
  if (className) {
    svg = svg.replace('class="', `class="${className} `);
  }

  return svg;
}

/**
 * Replace emoji icons with SVG icons in the page
 */
function replaceEmojiIcons() {
  // Replace water emoji
  document.querySelectorAll('.card.water .icon, [data-utility="water"] .icon').forEach(el => {
    if (el.textContent.includes('💧')) {
      el.innerHTML = WESH360Icons.water;
      el.classList.add('icon-container', 'icon-container-water');
    }
  });

  // Replace electricity emoji
  document.querySelectorAll('.card.electricity .icon, [data-utility="electricity"] .icon').forEach(el => {
    if (el.textContent.includes('⚡')) {
      el.innerHTML = WESH360Icons.electricity;
      el.classList.add('icon-container', 'icon-container-electricity');
    }
  });

  // Replace gas emoji
  document.querySelectorAll('.card.gas .icon, [data-utility="gas"] .icon').forEach(el => {
    if (el.textContent.includes('🔥')) {
      el.innerHTML = WESH360Icons.gas;
      el.classList.add('icon-container', 'icon-container-gas');
    }
  });

  // Replace environment emoji
  document.querySelectorAll('.card.environment .icon, [data-utility="environment"] .icon').forEach(el => {
    if (el.textContent.includes('🌿')) {
      el.innerHTML = WESH360Icons.environment;
      el.classList.add('icon-container', 'icon-container-environment');
    }
  });
}

// Auto-replace emojis on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', replaceEmojiIcons);
} else {
  replaceEmojiIcons();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WESH360Icons, createIcon };
}
