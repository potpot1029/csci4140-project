/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./packages/renderer/src/*.{html,js,ts,jsx,tsx}",
    "./packages/renderer/src/**/*.{html,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("@tailwindcss/forms"),
    require("tailwind-nord"),
  ],
}

