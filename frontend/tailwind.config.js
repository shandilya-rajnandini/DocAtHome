/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary-dark": "#111827", // A slightly different dark
        "secondary-dark": "#1F2937", // For cards
        "accent-blue": "#3B82F6",
        "accent-blue-hover": "#2563EB",
        "primary-text": "#E5E7EB",
        "secondary-text": "#9CA3AF",
        "accent-cream": "#F5F5DC",
      },
    },
  },
  plugins: [],
};
