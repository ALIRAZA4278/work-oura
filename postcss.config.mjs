/**
 * File: postcss.config.mjs
 *
 * PostCSS config. Loads the Tailwind CSS v4 plugin so Tailwind classes
 * in the components are turned into real CSS at build time.
 */
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
