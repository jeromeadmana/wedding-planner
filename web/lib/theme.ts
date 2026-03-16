/**
 * Saya Design Tokens
 * Central source of truth for all brand colors, typography, and spacing.
 * Change here → updates everywhere (Tailwind config + CSS variables).
 */

export const brand = {
  primary: {
    50:  "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },
  accent: {
    50:  "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
  },
  neutral: {
    50:  "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
  },
} as const

export const fonts = {
  sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
  display: ["Playfair Display", "Georgia", "serif"],
}

export const radius = {
  sm:  "0.375rem",
  md:  "0.5rem",
  lg:  "0.75rem",
  xl:  "1rem",
  "2xl": "1.5rem",
}
