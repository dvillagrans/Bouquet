import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "albescent-white": {
          50: "hsl(33 65% 93%)",
          100: "hsl(35 64% 89%)",
          200: "hsl(36 69% 80%)",
          300: "hsl(38 57% 69%)",
          400: "hsl(38 39% 60%)",
          500: "hsl(38 27% 50%)",
          600: "hsl(38 27% 40%)",
          700: "hsl(38 29% 30%)",
          800: "hsl(39 31% 20%)",
          900: "hsl(38 36% 10%)",
          950: "hsl(37 45% 6%)",
        },
        pink: {
          50: "hsl(351 100% 96%)",
          100: "hsl(350 100% 89%)",
          200: "hsl(350 100% 85%)",
          300: "hsl(348 100% 78%)",
          400: "hsl(346 100% 70%)",
          500: "hsl(335 100% 50%)",
          600: "hsl(336 100% 41%)",
          700: "hsl(336 100% 31%)",
          800: "hsl(338 100% 22%)",
          900: "hsl(340 100% 13%)",
          950: "hsl(344 100% 9%)",
        },
        "coral-tree": {
          50: "hsl(350 23% 95%)",
          100: "hsl(356 24% 89%)",
          200: "hsl(358 25% 79%)",
          300: "hsl(356 27% 71%)",
          400: "hsl(356 29% 64%)",
          500: "hsl(355 32% 56%)",
          600: "hsl(355 26% 48%)",
          700: "hsl(355 26% 38%)",
          800: "hsl(355 27% 26%)",
          900: "hsl(355 32% 14%)",
          950: "hsl(353 40% 8%)",
        },
        buccaneer: {
          50: "hsl(0 39% 95%)",
          100: "hsl(358 41% 89%)",
          200: "hsl(356 44% 78%)",
          300: "hsl(355 48% 69%)",
          400: "hsl(354 52% 60%)",
          500: "hsl(354 39% 50%)",
          600: "hsl(354 40% 40%)",
          700: "hsl(354 41% 31%)",
          800: "hsl(354 43% 23%)",
          900: "hsl(355 49% 14%)",
          950: "hsl(355 58% 8%)",
        },
        lynch: {
          50: "hsl(216 38% 95%)",
          100: "hsl(215 39% 88%)",
          200: "hsl(214 41% 77%)",
          300: "hsl(213 42% 68%)",
          400: "hsl(213 32% 58%)",
          500: "hsl(213 24% 49%)",
          600: "hsl(213 24% 42%)",
          700: "hsl(212 25% 33%)",
          800: "hsl(214 26% 23%)",
          900: "hsl(212 30% 12%)",
          950: "hsl(214 39% 7%)",
        },
      },
      fontFamily: {
        script: ["'Brush Script MT'", "cursive"],
        elegant: ["'Georgia'", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
