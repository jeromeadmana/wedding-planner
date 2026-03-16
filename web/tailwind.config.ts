import type { Config } from "tailwindcss"
import { brand, fonts } from "./lib/theme"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: brand.primary,
        accent: brand.accent,
        neutral: brand.neutral,
      },
      fontFamily: {
        sans: fonts.sans,
        display: fonts.display,
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
}

export default config
