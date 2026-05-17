/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 36px rgba(99,102,241,0.24)"
      }
    }
  },
  plugins: []
};

