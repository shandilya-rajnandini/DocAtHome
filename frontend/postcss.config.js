/* eslint-env node */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Add CSS optimization for production
    ...(process.env.NODE_ENV === 'production' ? { // eslint-disable-line no-undef
      cssnano: {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: false
        }]
      }
    } : {})
  },
}
