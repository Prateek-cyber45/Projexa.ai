/**
 * postcss.config.js
 * PostCSS processes Tailwind directives and adds vendor prefixes.
 * Must be in the frontend root alongside tailwind.config.js.
 */
export default {
  plugins: {
    tailwindcss:  {},
    autoprefixer: {},
  },
}
