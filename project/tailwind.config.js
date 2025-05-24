/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2c",
        },
        status: {
          pending: "#FFA500",
          processing: "#3B82F6",
          resolved: "#10B981",
          closed: "#374151",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      transitionDuration: {
        250: "250ms",
      },
      boxShadow: {
        soft: "0 2px 10px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
