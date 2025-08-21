/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./routes/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      display: [
        "clamp(2.75rem, 4.25vw, 4.5rem)",
        {
          lineHeight: "96.5%",
          letterSpacing: "-3.5%",
          fontWeight: "700",
        },
      ],
      h1: "3.5rem",
      h2: "3rem",
      h3: "2.5rem",
      h4: "2rem",
      h5: "1.5rem",
      h6: "1.25rem",
      base: "1.125rem",
      sm: "1rem",
      xs: "0.875rem",
      xxs: "0.75rem",
    },
    extend: {
      keyframes: {
        "toast-enter": {
          from: {
            opacity: "0",
            transform: "translateY(10px) scale(0.8)",
          },
          to: {
            opacity: "1",
            transform: "translateY(-10px) scale(1)",
          },
        },
        "toast-leave": {
          from: {
            opacity: "1",
            transform: "translateY(-10px) scale(1)",
          },
          to: {
            opacity: "0",
            transform: "translateY(10px) scale(0.8)",
          },
        },
      },
      animation: {
        "toast-enter": "toast-enter 0.2s ease-out forwards ",
        "toast-leave": "toast-leave 0.2s ease-in forwards ",
      },
    },
  },
  plugins: [],
};
