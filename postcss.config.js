// PostCSS Configuration for WESH360
// این فایل تنظیمات پردازش و بهینه‌سازی CSS را مدیریت می‌کند

module.exports = {
  plugins: [
    // Import resolver - برای پردازش @import
    require('postcss-import')({
      path: ['docs/assets/css']
    }),

    // Autoprefixer - اضافه کردن vendor prefixes
    require('autoprefixer')({
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'not IE 11'
      ]
    }),

    // cssnano - فشرده‌سازی و بهینه‌سازی
    require('cssnano')({
      preset: ['default', {
        // حذف comments
        discardComments: {
          removeAll: true
        },
        // Normalize whitespace
        normalizeWhitespace: true,
        // Merge rules
        mergeRules: true,
        // Minify selectors
        minifySelectors: true,
        // Minify gradients
        minifyGradients: true,
        // Convert values
        convertValues: {
          length: true
        },
        // Discard overridden
        discardOverridden: true,
        // نگه داشتن calc() - مهم برای CSS variables
        calc: false,
        // نگه داشتن custom properties
        reduceIdents: false,
        // Z-index optimization
        zindex: false
      }]
    })
  ]
};
