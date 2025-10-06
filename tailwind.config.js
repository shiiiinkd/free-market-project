/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: "#3B82F6",
          "blue-dark": "#2563EB",
          "blue-light": "#DBEAFE",
          "blue-hover": "#60A5FA",
        },
      },
    },
  },
  plugins: [],
};
